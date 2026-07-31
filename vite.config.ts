// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Keep the embedded class-11 sample catalog synchronized with the downloadable
// workbook before Vite reads the application modules. The marker prevents a
// second config evaluation in the same checkout from applying the source patch twice.
const dashboardSource = readFileSync(new URL("./src/routes/index.tsx", import.meta.url), "utf8");
if (!dashboardSource.includes("todayQueueCompletion")) {
  execFileSync(process.execPath, ["scripts/sync-grade11-roadmap-and-study-streak.mjs"], {
    cwd: new URL(".", import.meta.url),
    stdio: "inherit",
  });
}

export default defineConfig({
  nitro: { preset: "vercel" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      host: true,
      port: 3000,
      strictPort: true,
      hmr: {
        clientPort: 443,
      },
    },
  },
});
