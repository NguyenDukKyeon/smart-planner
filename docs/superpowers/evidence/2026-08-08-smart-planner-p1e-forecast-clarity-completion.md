# P1E Forecast Clarity — Completion Evidence

## Status

`P1E IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED`

This document is implementation evidence only. It does not grant independent acceptance and does not authorize merge.

## Authority and exact topology

- Repository: `NguyenDukKyeon/smart-planner`
- Package: `P1E — Forecast clarity`
- Branch: `improve/p1e-forecast-clarity`
- Pull request: Draft PR #9, open and unmerged
- Exact predecessor / PR base: `main@b981b8250adef717c1e9c9f4259a265316327b9a`
- Approved design commit: `7a0e4d3d34ab00a708245cbce6d0b1f98f6d3708`
- Final no-placeholder implementation plan commit: `26996b248ae7add868ed2b1fb900b3a14bf071d9`
- Production behavior remained frozen after `61035e89d5250c6120ce6e2ddaafaac150f02eb7`.
- Literal final source/test head after independent-review recovery: `3b1dea89c47a3e6a377dcb1b308ae6f2df9343cc`
- First evidence head: `5df1890dee47ec4034155795bab5068885854ea3`
- Independent rejection comment: `5225149775`

## Closed package scope

The package remains confined to exactly these eight paths from predecessor through the refreshed evidence head:

1. `docs/superpowers/specs/2026-08-08-smart-planner-p1e-forecast-clarity-design.md`
2. `docs/superpowers/plans/2026-08-08-smart-planner-p1e-forecast-clarity.md`
3. `docs/superpowers/evidence/2026-08-08-smart-planner-p1e-forecast-clarity-completion.md`
4. `src/components/ForecastCard.tsx`
5. `src/lib/forecast-view-model.ts`
6. `src/lib/forecast-clarity-regression.test.ts`
7. `src/lib/forecast-view-model.test.ts`
8. `src/lib/forecast-card-runtime.test.ts`

No route, Flexible Planner, Roadmap, Course Manager, persistence, transaction, package/lockfile, workflow, deployment, or `src/lib/planner.ts` file changed.

## Original TDD evidence

### Task 1 — Forecast completion independent of shifted schedule projection

Valid RED:

- head: `673963d419c4b5ed2ecd8ee97ac6f83abf570032`
- run #309: `31245398802`
- job: `93073049253`
- checked merge ref: `771db128c421e703a430dff91013c659427598b6`
- install/typecheck/lint: PASS
- tests: 54/55 files, 349/350 tests PASS
- sole failure: `forecast-clarity-regression.test.ts` because predecessor rendered shifted date `31/12/2035` as Forecast completion.

Implementation:

- `879d9f3a68e78561e889125321084d14bc735e38` — add completion read model
- `8f6c39e8432c7576c8f72a5defe5e4d8f2579004` — integrate it into ForecastCard
- run #311 `31245495280`, job `93073300283` was not GREEN because Prettier stopped before tests
- formatting-only corrections: `6e658cdc5caa7376c500a9c55f319350e077c845`, `bb4d21c422f41350f2192b0925a2c3b1eb387520`

GREEN:

- head: `bb4d21c422f41350f2192b0925a2c3b1eb387520`
- run #313: `31245583716`
- job: `93073526408`
- merge ref: `c90557794ec2eaa8a9c68f4a79f76a22f964e411`
- 55/55 files, 350/350 tests PASS
- build/clean-tree PASS
- SUCCESS.

### Task 2 — horizon-aware pure Forecast read model

- test commit: `68dea050d7be12c0e9e0f6faa02da9da482e3c3c`
- run #314 `31245710043`, job `93073837001` was not valid RED because Prettier stopped before tests
- formatting-only correction: `6bd8dee143b918295290ae9df4c73dcda9a9d794`

Valid RED:

- head: `6bd8dee143b918295290ae9df4c73dcda9a9d794`
- run #315: `31245792045`
- job: `93074040607`
- merge ref: `dd5bbe98e0394ad54d5dc8ec6480c510027ed752`
- install/typecheck/lint: PASS
- tests: 55/56 files, 356/357 tests PASS
- sole failure: missing `selectForecastViewModel`.

Implementation / GREEN:

- head: `7d9f7cf06eb10712c9205f41e28e30904bb620dd`
- run #316: `31245872822`
- job: `93074245889`
- merge ref: `d13a3111f23b6cf5f659b4ae5933fac83c550677`
- 56/56 files, 357/357 tests PASS
- `forecast-view-model.test.ts`: 7/7 PASS
- build/clean-tree PASS
- SUCCESS.

### Task 3 — user-visible Forecast clarity contract

Valid RED:

- head: `d077cf524d579380caac59fbc66a91ba189660d7`
- run #317: `31245956256`
- job: `93074469428`
- merge ref: `48d2dda6696e8b257c847d5094b1fc6c0a22b113`
- install/typecheck/lint: PASS
- tests: 56/57 files, 357/358 tests PASS
- sole failure: production Forecast UI lacked the required explicit clarity presentation.

Implementation:

- `1d6bc54dcc2101816268e38947fb9b33177d2c3c` — add transient horizon selector and explicit clarity metrics
- run #318 `31246068086`, job `93074771196` was not GREEN because Prettier stopped before tests
- formatting-only final production correction: `61035e89d5250c6120ce6e2ddaafaac150f02eb7`

First source/test GREEN:

- run #319: `31246177414`
- job: `93075049165`
- merge ref: `62f888a567258c2268e9e2ba1bbfce40623dffc4`
- 57/57 files, 358/358 tests PASS
- build/clean-tree PASS
- SUCCESS.

First evidence head `5df1890dee47ec4034155795bab5068885854ea3` then passed run #320 `31246315530`, job `93075399603`, merge ref `c7cf55975eb5d5d244cda84def946925d117a1d0` with the same 57/57 files and 358/358 tests plus build/clean-tree PASS.

## Independent review rejection and recovery

Fresh independent review at first evidence head rejected acceptance with comment `5225149775` for a verification-only Important gap:

1. runtime coverage proved the `Dự kiến hoàn thành` label but did not assert the actual rendered Forecast date/range value required by design §8.3;
2. zero-outside-horizon behavior existed in production source but lacked direct selector/runtime regression proof required by design §8.1.

Production behavior was frozen. Recovery changed tests only:

- `ec5d95103ca357511245d85c0e500789e27be9d9` — runtime proof for exact Forecast completion date/range and zero-outside-horizon UI branch
- `c9d100aeade4655cc9e178f9272c513580d47607` — pure selector proof for zero outside-horizon work
- run #322 `31246539403`, job `93075979430` was not GREEN because one Prettier error stopped before tests
- `02eefe886052e3a0f25313dd18e176cd4edbdf3e` — formatting-only recovery
- run #323 `31246602632`, job `93076147511` reached the test gate: completion-value proof PASS and pure zero-outside proof PASS; the runtime zero fixture alone failed because it used an empty `scheduledDate`, so the scheduler correctly treated that fixture as outside the visible plan. This was a test-fixture defect, not a production defect.
- `3b1dea89c47a3e6a377dcb1b308ae6f2df9343cc` — test-only fixture correction using canonical `todayISO()`; no production source changed.

## Final exact source/test GREEN after review recovery

Build diagnostics run #324:

- exact source/test head: `3b1dea89c47a3e6a377dcb1b308ae6f2df9343cc`
- run id: `31246693362`
- job id: `93076380197`
- checked PR merge ref: `90259d8353c854abe160d6df6a0d61545f52ce47`
- `npm install`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS — 0 errors / seven known pre-existing warnings
- `npm test`: PASS — 57/57 files, 360/360 tests
- `forecast-view-model.test.ts`: PASS — 8/8
- `forecast-card-runtime.test.ts`: PASS — 2/2
- `forecast-clarity-regression.test.ts`: PASS — 1/1
- `npm run build`: PASS — test suite reran 57/57 files and 360/360 tests followed by client, SSR, Nitro/Vercel production builds
- `git diff --exit-code`: PASS
- job conclusion: SUCCESS.

This run demonstrates that the independent-review recovery added verification only. No production source changed after `61035e89d5250c6120ce6e2ddaafaac150f02eb7`.

## Final architecture implemented

`src/lib/forecast-view-model.ts`:

- normalizes canonical `defaultDailyHours` via `normalizeDailyStudyHours()`;
- uses `allRemainingLessonIds()` + canonical `forecast()` for completion/workload/confidence/basis;
- classifies completion as `complete`, `no-capacity`, `date`, or `range`;
- maps Forecast horizons exactly `2→14`, `4→28`, `8→56`, `12→84` rolling days;
- builds horizon visibility via existing `buildFlexiblePlan()`;
- derives outside-horizon unfinished work via existing `summarizeUnscheduledWork()`;
- performs no storage writes and owns no React state.

`src/components/ForecastCard.tsx`:

- owns transient local `horizonWeeks`, default 2;
- exposes exactly 2/4/8/12-week choices;
- does not persist horizon or mutate Flexible Schedule horizon state;
- retains `onSetDefaultDailyHours(normalizeDailyStudyHours(...))` as the existing hours mutation boundary;
- does not consume `shiftedDates` for completion prediction;
- visibly separates completion, remaining lessons, new-learning hours, review hours, total workload, capacity assumption, horizon, confidence, basis, and outside-horizon status;
- preserves high-hours guidance and per-subject progress.

## Acceptance criteria matrix

1. **PASS** — Forecast completion comes only from canonical `forecast()` via the pure read model.
2. **PASS** — RED #309 proves the predecessor shifted-date defect; final regression is GREEN.
3. **PASS** — actual production runtime renders explicit new-learning hours.
4. **PASS** — actual production runtime renders explicit review hours.
5. **PASS** — selector proves total workload equals new + review; production renders it.
6. **PASS** — normalized daily-capacity assumption is explicit.
7. **PASS** — bounded transient 2/4/8/12-week selector exists, default 2.
8. **PASS** — horizon state is local to ForecastCard; no route/Flexible Planner/persistence path changed.
9. **PASS** — outside-horizon accounting directly composes `buildFlexiblePlan()` and `summarizeUnscheduledWork()`.
10. **PASS** — production runtime proves positive `Ngoài phạm vi` state with exact selector-derived count.
11. **PASS** — recovery now directly proves selector `outsideHorizonLessons === 0` and actual production runtime `Trong phạm vi` / all-work-inside copy.
12. **PASS** — confidence remains explicit.
13. **PASS** — planned/mixed/actual evidence basis remains explicit.
14. **PASS** — pure selector distinguishes zero-capacity; production copy is preserved.
15. **PASS** — pure selector distinguishes complete state; production copy is preserved.
16. **PASS** — daily-hours mutation remains the existing normalized persistence callback.
17. **PASS** — no scheduler/persistence/transaction/Roadmap/Course Manager/dependency/workflow/deployment semantic change.
18. **PASS** — valid original RED evidence preceded production implementation; later recovery is test-only verification hardening.
19. **PASS** — final exact source/test head has full natural GitHub Actions GREEN run #324.
20. **PENDING INDEPENDENT REVIEW** — the prior Important verification gap has been corrected; only a fresh Independent Reviewer may grant package acceptance.

## Known nonblocking repository observations

Pre-existing and outside P1E scope:

- `npm install` reports one high-severity audit item; P1E changed no dependencies or lockfile.
- lint reports seven warnings: one existing `FocusTimerModal` hook-dependency warning and six existing UI Fast Refresh warnings.
- TanStack Router warns about `src/routes/__root.test.tsx` not exporting `Route`.
- Vite reports existing deprecation notices including `vite-tsconfig-paths` guidance.
- GitHub Actions post-checkout cleanup reports the existing `smart-study-habit-planner-deploy` / `.gitmodules` warning after gates.
- Node action deprecation notices remain.

## Independent Reviewer instructions

Fresh-review the refreshed evidence head rather than trusting this record. Verify:

- current `main`, PR base/head, Draft/unmerged state, and no base drift;
- predecessor→head changed-file scope;
- design and final implementation plan;
- production files and all three P1E test files;
- original valid RED/GREEN chain;
- independent rejection comment `5225149775`;
- test-only recovery commits through `3b1dea89c47a3e6a377dcb1b308ae6f2df9343cc`;
- final source/test run #324 `31246693362`, job `93076380197`, merge ref `90259d8353c854abe160d6df6a0d61545f52ce47`;
- refreshed evidence-head topology and its own natural CI.

Return exactly one disposition:

```text
P1E IMPLEMENTED / ACCEPTED / NOT_MERGED
```

or

```text
P1E IMPLEMENTED / REJECTED / NOT_MERGED
```

Do not mark ready, enable auto-merge, merge, squash, rebase, force-push, or delete the branch. Merge requires later separate authorization after independent acceptance.
