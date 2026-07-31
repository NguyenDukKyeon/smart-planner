import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

async function readSource(relativePath: string): Promise<string> {
  return readFile(new URL(relativePath, import.meta.url), "utf8");
}

describe("Pomodoro modal interaction safety", () => {
  test("keeps timer decision overlays clickable when another Radix dialog exists", async () => {
    const [dialogsSource, levelUpSource] = await Promise.all([
      readSource("../components/focus-timer/FocusTimerDialogs.tsx"),
      readSource("../components/LevelUpDialog.tsx"),
    ]);

    expect(dialogsSource.match(/pointer-events-auto/g)?.length).toBeGreaterThanOrEqual(5);
    expect(dialogsSource).toContain('type="button"');
    expect(levelUpSource).toContain("<Dialog modal={false}");
  });

  test("closes the notification center before starting a focus timer", async () => {
    const notificationSource = await readSource("../components/PushNotificationCenterModal.tsx");
    expect(notificationSource).toContain("onOpenChange(false);");
    expect(notificationSource).toContain("onStartFocus?.(...args);");
    expect(notificationSource.indexOf("onOpenChange(false);")).toBeLessThan(
      notificationSource.indexOf("onStartFocus?.(...args);"),
    );
  });
});
