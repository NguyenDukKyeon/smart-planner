# P1E Forecast Clarity — Completion Evidence

## Status

`P1E IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED`

This document is implementation evidence only. It does not grant independent acceptance and does not authorize merge.

## Authority and exact topology

- Repository: `NguyenDukKyeon/smart-planner`
- Package: `P1E — Forecast clarity`
- Branch: `improve/p1e-forecast-clarity`
- Pull request: Draft PR #9, open and unmerged
- Exact predecessor / current PR base: `main@b981b8250adef717c1e9c9f4259a265316327b9a`
- Approved design commit: `7a0e4d3d34ab00a708245cbce6d0b1f98f6d3708`
- Final no-placeholder implementation plan commit: `26996b248ae7add868ed2b1fb900b3a14bf071d9`
- Literal final source/test head: `61035e89d5250c6120ce6e2ddaafaac150f02eb7`
- Source/test topology: 14 commits ahead of predecessor, 0 behind
- Source/test compare status: `ahead`
- `main` was fresh-read after source/test GREEN and remained exactly `b981b8250adef717c1e9c9f4259a265316327b9a`; no base drift was observed.

## Closed changed-file scope at literal source/test head

Exact predecessor → `61035e89d5250c6120ce6e2ddaafaac150f02eb7` changes exactly seven paths:

1. `docs/superpowers/specs/2026-08-08-smart-planner-p1e-forecast-clarity-design.md`
2. `docs/superpowers/plans/2026-08-08-smart-planner-p1e-forecast-clarity.md`
3. `src/components/ForecastCard.tsx`
4. `src/lib/forecast-view-model.ts`
5. `src/lib/forecast-clarity-regression.test.ts`
6. `src/lib/forecast-view-model.test.ts`
7. `src/lib/forecast-card-runtime.test.ts`

No route, Flexible Planner, Roadmap, Course Manager, persistence, transaction, package/lockfile, workflow, or deployment file changed. `src/lib/planner.ts` did not require the conditional scope expansion allowed by the design.

## TDD evidence

### Task 1 — Forecast completion independent of shifted schedule projection

Valid RED:

- RED head: `673963d419c4b5ed2ecd8ee97ac6f83abf570032`
- Build diagnostics run #309: `31245398802`
- job: `93073049253`
- checked PR merge ref: `771db128c421e703a430dff91013c659427598b6`
- install: PASS
- typecheck: PASS
- lint: PASS with the existing seven warnings
- tests: 54/55 files, 349/350 tests PASS
- sole failure: `src/lib/forecast-clarity-regression.test.ts`
- failure reason: predecessor `ForecastCard` rendered shifted date `31/12/2035` as Forecast completion
- build and clean-tree were skipped after the expected failing test gate.

Implementation commits:

- `879d9f3a68e78561e889125321084d14bc735e38` — add Forecast completion read model
- `8f6c39e8432c7576c8f72a5defe5e4d8f2579004` — route Forecast completion presentation through the read model

Run #311 `31245495280`, job `93073300283`, is explicitly **not** Task 1 GREEN: typecheck passed but lint stopped on three Prettier errors before tests.

Formatting-only forward commits:

- `6e658cdc5caa7376c500a9c55f319350e077c845`
- `bb4d21c422f41350f2192b0925a2c3b1eb387520`

Task 1 GREEN:

- exact head: `bb4d21c422f41350f2192b0925a2c3b1eb387520`
- Build diagnostics run #313: `31245583716`
- job: `93073526408`
- checked PR merge ref: `c90557794ec2eaa8a9c68f4a79f76a22f964e411`
- install/typecheck/lint: PASS; lint 0 errors / seven existing warnings
- tests: 55/55 files, 350/350 tests PASS
- `forecast-clarity-regression.test.ts`: PASS
- production build: PASS
- clean-tree: PASS
- conclusion: SUCCESS.

### Task 2 — horizon-aware pure Forecast read model

Test commit:

- `68dea050d7be12c0e9e0f6faa02da9da482e3c3c`

Run #314 `31245710043`, job `93073837001`, is explicitly **not** valid RED because one Prettier error in the new test stopped execution before the test gate.

Formatting-only test correction:

- `6bd8dee143b918295290ae9df4c73dcda9a9d794`

Valid RED:

- exact RED head: `6bd8dee143b918295290ae9df4c73dcda9a9d794`
- Build diagnostics run #315: `31245792045`
- job: `93074040607`
- checked PR merge ref: `dd5bbe98e0394ad54d5dc8ec6480c510027ed752`
- install/typecheck/lint: PASS
- tests: 55/56 files, 356/357 tests PASS
- sole failure: `forecast-view-model.test.ts` because `selectForecastViewModel` did not yet exist
- build and clean-tree skipped after expected RED.

Implementation:

- `7d9f7cf06eb10712c9205f41e28e30904bb620dd` — compose `buildFlexiblePlan()` and `summarizeUnscheduledWork()` into the pure Forecast view model.

Task 2 GREEN:

- Build diagnostics run #316: `31245872822`
- job: `93074245889`
- checked PR merge ref: `d13a3111f23b6cf5f659b4ae5933fac83c550677`
- install/typecheck/lint: PASS; lint 0 errors / seven existing warnings
- tests: 56/56 files, 357/357 tests PASS
- `forecast-view-model.test.ts`: 7/7 PASS
- production build: PASS
- clean-tree: PASS
- conclusion: SUCCESS.

### Task 3 — user-visible Forecast clarity contract

Valid RED:

- RED head: `d077cf524d579380caac59fbc66a91ba189660d7`
- Build diagnostics run #317: `31245956256`
- job: `93074469428`
- checked PR merge ref: `48d2dda6696e8b257c847d5094b1fc6c0a22b113`
- install/typecheck/lint: PASS
- tests: 56/57 files, 357/358 tests PASS
- sole failure: `forecast-card-runtime.test.ts`
- failure reason: actual production Forecast UI did not yet expose the required explicit `Bài mới` clarity metric; the predecessor-like UI only had combined lower-case detail and lacked the full horizon/capacity/outside-horizon presentation.
- build and clean-tree skipped after expected RED.

Implementation:

- `1d6bc54dcc2101816268e38947fb9b33177d2c3c` — add the transient horizon selector and explicit Forecast clarity metrics.

Run #318 `31246068086`, job `93074771196`, is explicitly **not** Task 3 GREEN: typecheck passed but lint stopped on one import-formatting Prettier error before tests.

Formatting-only forward correction / literal final source-test head:

- `61035e89d5250c6120ce6e2ddaafaac150f02eb7` — `style: format forecast clarity UI`

## Final exact source/test GREEN gate

Build diagnostics run #319:

- run id: `31246177414`
- job id: `93075049165`
- literal final source/test head: `61035e89d5250c6120ce6e2ddaafaac150f02eb7`
- checked PR merge ref: `62f888a567258c2268e9e2ba1bbfce40623dffc4`
- `npm install`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS — 0 errors / seven known pre-existing warnings
- `npm test`: PASS — 57/57 test files, 358/358 tests
- `forecast-view-model.test.ts`: PASS — 7/7
- `forecast-card-runtime.test.ts`: PASS — 1/1
- `forecast-clarity-regression.test.ts`: PASS — 1/1
- `npm run build`: PASS — tests reran 57/57 files and 358/358 tests followed by client, SSR, Nitro/Vercel production builds
- `git diff --exit-code`: PASS
- job conclusion: SUCCESS.

## Final architecture implemented

`src/lib/forecast-view-model.ts` is the pure Forecast presentation boundary. It:

- reads canonical `defaultDailyHours` and normalizes it with `normalizeDailyStudyHours()`;
- uses existing `allRemainingLessonIds()` and `forecast()` for completion/workload/confidence/basis;
- classifies completion as `complete`, `no-capacity`, `date`, or `range`;
- maps Forecast horizons exactly as `2→14`, `4→28`, `8→56`, `12→84` rolling days;
- builds the selected visible plan with existing `buildFlexiblePlan()`;
- derives outside-horizon work with existing `summarizeUnscheduledWork()`;
- exposes a semantic `ForecastViewModel` without storage writes or React state.

`src/components/ForecastCard.tsx`:

- owns only transient `horizonWeeks` React state, defaulting to two weeks;
- offers exactly 2/4/8/12-week choices;
- does not persist horizon or call a schedule mutation for horizon changes;
- retains the existing `onSetDefaultDailyHours(normalizeDailyStudyHours(...))` hours mutation boundary;
- no longer consumes `shiftedDates` to derive completion text;
- visibly separates completion, remaining lessons, new-learning hours, review hours, total workload, daily-capacity assumption, visible horizon, confidence, and outside-horizon status;
- preserves the high-hours note and per-subject progress presentation.

## Acceptance criteria matrix

1. **PASS** — completion date/range comes from canonical `forecast()` through `selectForecastCompletion()` / `selectForecastViewModel()` only.
2. **PASS** — valid RED #309 proved predecessor shifted-date override; the regression is GREEN at #319.
3. **PASS** — production runtime renders explicit `Bài mới` and its hours.
4. **PASS** — production runtime renders explicit `Ôn tập` and its hours.
5. **PASS** — selector test proves one-decimal total equals new + review; production runtime renders `Tổng khối lượng`.
6. **PASS** — runtime renders `Quỹ giờ giả định`; value comes from canonical normalized default daily hours.
7. **PASS** — component owns a bounded 2/4/8/12-week local selector, default two weeks.
8. **PASS** — horizon is `useState` local to `ForecastCard`; compare proves no route, persistence, or Flexible Planner file changed.
9. **PASS** — implementation directly composes `buildFlexiblePlan()` plus `summarizeUnscheduledWork()`; pure tests exercise real plan output.
10. **PASS** — runtime test requires and receives explicit `Ngoài phạm vi` plus the exact outside-horizon lesson count.
11. **PASS** — production branch renders neutral `Trong phạm vi` copy when the outside count is zero.
12. **PASS** — runtime continues to render explicit `Mức tin cậy`.
13. **PASS** — production footer continues to expose planned/mixed/actual evidence basis; runtime requires `Ước tính dựa trên`.
14. **PASS** — pure test distinguishes unfinished zero-capacity state as `no-capacity`; UI renders `Chưa có quỹ giờ để dự báo`.
15. **PASS** — pure test verifies completed work produces `complete`; UI renders `Đã hoàn thành tất cả!`.
16. **PASS** — hours slider/input still call only `onSetDefaultDailyHours(normalizeDailyStudyHours(...))`.
17. **PASS** — exact compare contains only the seven closed-scope paths; no scheduler/persistence/transaction/Roadmap/Course Manager/dependency/workflow/deployment semantics changed.
18. **PASS** — valid RED evidence exists for all three implementation tasks before their corresponding production behavior.
19. **PASS** — exact source/test head full natural CI #319 is GREEN including build and clean-tree.
20. **PENDING INDEPENDENT REVIEW** — implementation evidence contains no unresolved Critical/Important issue found during implementer scope audit, but only a fresh Independent Reviewer may grant package acceptance.

## Known nonblocking repository observations

These are pre-existing and outside P1E scope:

- `npm install` reports one high-severity audit item; P1E changed no dependencies or lockfile.
- lint reports seven warnings: one existing `FocusTimerModal` hook-dependency warning and six existing UI Fast Refresh warnings; P1E adds no lint errors.
- TanStack Router warns that `src/routes/__root.test.tsx` is a route-shaped test file without a `Route` export.
- Vite reports existing deprecation notices including `vite-tsconfig-paths` guidance.
- GitHub Actions post-checkout cleanup reports the existing `smart-study-habit-planner-deploy` submodule-path / `.gitmodules` warning after repository gates; the job itself succeeds.
- GitHub Actions reports Node action deprecation notices.

## Independent Reviewer instructions

Review the exact P1E candidate rather than trusting this record. Fresh-read:

- current `main` and PR base/head;
- the approved P1E design and final implementation plan;
- all seven predecessor→source/test changed paths;
- Task 1 RED #309 and GREEN #313;
- Task 2 valid RED #315 and GREEN #316;
- Task 3 RED #317 and final source/test GREEN #319;
- evidence-head topology and its own natural CI after this document is committed.

Verify all 20 acceptance criteria independently, especially:

- shifted schedule dates cannot replace Forecast completion prediction;
- outside-horizon accounting uses the existing scheduler + visibility helpers rather than duplicate logic;
- Forecast horizon is transient and does not mutate/persist Flexible Schedule horizon state;
- daily-hours editing remains on the pre-existing normalization/persistence callback;
- no adjacent P2 or persistence/transaction/dependency scope entered the candidate;
- actual production `ForecastCard` is covered by runtime rendering.

Return exactly one disposition:

```text
P1E IMPLEMENTED / ACCEPTED / NOT_MERGED
```

or

```text
P1E IMPLEMENTED / REJECTED / NOT_MERGED
```

Do not mark the PR ready, enable auto-merge, merge, squash, rebase, force-push, or delete the branch. Merge requires a later separate authorization after independent acceptance.
