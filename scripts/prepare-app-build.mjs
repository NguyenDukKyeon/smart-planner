import { readFileSync } from "node:fs";

const routeSource = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");

// A clean checkout still contains the source workbook and the pre-sync route.
// Run the generator exactly once in that checkout before Vite compiles the app.
if (!routeSource.includes("todayQueueCompletion")) {
  await import("./sync-grade11-roadmap-and-study-streak.mjs");
}
