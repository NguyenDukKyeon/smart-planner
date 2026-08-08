# Forecast Horizon Window Completion Evidence

Date: 2026-08-08

Current disposition before Independent Review:

```text
FORECAST HORIZON WINDOW IMPLEMENTED / REVIEW_PENDING / NOT_MERGED
```

## 1. Authority and topology

Repository:

```text
NguyenDukKyeon/smart-planner
```

Exact predecessor:

```text
main@3444c5d54207ec16de90988958755da62507af11
```

Branch / PR:

```text
fix/forecast-horizon-window
PR #12 Forecast: make horizon scope visible workload
Draft / open / unmerged
```

Approved written spec:

```text
docs/superpowers/specs/2026-08-08-smart-planner-forecast-horizon-window-design.md
```

Implementation plan:

```text
docs/superpowers/plans/2026-08-08-smart-planner-forecast-horizon-window.md
```

The package changes Forecast presentation scope only. Scheduler placement, Roadmap, Flexible Schedule, persistence/schema, dependencies, CI/deployment, Weekly Summary and P2 remain out of scope.

## 2. Final semantic contract

The 2/4/8/12-week Forecast selector now scopes the user-facing lesson/workload metrics to the actual canonical `buildFlexiblePlan()` window.

Global whole-roadmap facts remain global:

```text
remainingLessons
totalNewHours
totalReviewHours
totalWorkloadHours
completion
```

New selected-window facts are explicit:

```text
totalRemainingLessons
horizonScheduledLessons
horizonNewHours
horizonReviewHours
horizonWorkloadHours
horizonUnplacedFixedLessons
```

Rules:

1. `horizonScheduledLessons` counts unique unfinished lessons actually placed in `visiblePlan[*].queue.newLessons`.
2. `horizonNewHours` sums planned duration for those unique unfinished lessons.
3. completed lessons pinned into the visible plan are excluded from scoped count/workload.
4. `horizonReviewHours` sums unique uncompleted scheduler review tasks actually placed in the selected window, using scheduler-provided minutes.
5. global `35%` review estimation is not used for the scoped review metric.
6. unplaced fixed lessons are exposed separately and are not counted as scheduled new work.
7. `horizonWorkloadHours = horizonNewHours + horizonReviewHours` under the existing one-decimal rounding policy.
8. whole-roadmap `completion` is independent of horizon choice and remains equal across 2/4/8/12 weeks for identical state.
9. Sunday remains a normal default-capacity day under the already-merged seven-day policy.

## 3. Task 1 TDD — horizon read model

### Formatting-only attempts — not behavioral RED

Initial test-only head:

```text
head 27e4912d6f606b0505b3c6b6eddcd403d5ebf949
run  31259851045  (#376)
job  93108856878
```

Typecheck PASS; lint/Prettier failed before tests. Not behavioral evidence.

Formatting correction:

```text
head 963ae587f1b014df9ad515f3e6cab15adb13477d
run  31259962134  (#377)
job  93109128284
```

Typecheck PASS; lint/Prettier still failed before tests. Not behavioral evidence.

Second formatting correction established the valid RED head:

```text
head a9c140f743661c548dba30271697ec20d43dd1bc
```

### Valid Task 1 RED

```text
workflow   Build diagnostics #378
run        31260070763
job        93109401469
merge ref  aa69fa9cfe7ef891e58342eb24218629c579600c
```

Typecheck/lint PASS.

```text
62/63 test files PASS
393/398 tests PASS
```

Exactly five failures came from the new horizon fields being absent/undefined. The failures covered:

- scoped lesson count/new-work window;
- real-roadmap scoped-vs-global behavior;
- completed pinned lesson exclusion;
- scheduled review scope;
- unplaced fixed separation.

### Minimal read-model implementation

Production commit:

```text
737c2d2b200be6872a782be97030ac0573c219d5
```

Only `src/lib/forecast-view-model.ts` changed. It added a pure horizon summarizer over the already-built `visiblePlan`; no scheduler production file changed.

### Run #379 — implementation behavior correct, test fixture assumption wrong

```text
run        31260183450
job        93109678724
merge ref  d17d637d72d21c9de0eeba4d770ec0f041875246
```

Typecheck/lint PASS.

```text
62/63 test files PASS
397/398 tests PASS
```

The sole failure was the review fixture expecting `0.3h`. Investigation proved the canonical scheduler generates four 15-minute review tasks inside a 14-day window for a lesson completed on 2026-08-07:

```text
2026-08-08 age 1  -> 15m
2026-08-10 age 3  -> 15m
2026-08-14 age 7  -> 15m
2026-08-21 age 14 -> 15m
TOTAL             -> 60m = 1.0h
```

This corrected an implementation-plan fixture assumption; production behavior was not changed.

Fixture-correction commit:

```text
0087fbee3cd04b514c76c4dfe4c8911ebbad5a12
```

The completed-review case marks all four task IDs complete and then expects `0h`.

### Task 1 GREEN

```text
head       0087fbee3cd04b514c76c4dfe4c8911ebbad5a12
workflow   Build diagnostics #380
run        31260304487
job        93109976839
merge ref  28d9f33581dad4e628c4996cecc28d93ebdb1746
```

Full gate PASS:

```text
63/63 test files
398/398 tests
typecheck PASS
lint PASS
build PASS
clean-tree PASS
```

## 4. Real-world regression anchor

The real-roadmap-style fixture mirrors the user-provided catalog distribution:

```text
352 lessons total
345 × 120 minutes
6 × 90 minutes
1 × 30 minutes
699.5 planned new-learning hours total
```

With the first 11 120-minute lessons completed:

```text
341 lessons remain
677.5 global planned new-learning hours remain
```

The regression preserves those whole-roadmap compatibility facts while proving a 2-week view reports:

```text
horizonScheduledLessons < 341
horizonNewHours < 677.5
```

Thus the 2-week selector no longer presents the entire 341-lesson / 677.5-hour roadmap as if it were two weeks of work.

A longer 12-week horizon schedules at least as many lessons/new-work hours as the 2-week horizon.

## 5. Task 2 TDD — runtime presentation

### Valid Task 2 RED

Test-only head:

```text
ea3ce34c2448898ded7f804c5dbaa005376fa607
```

Natural RED:

```text
workflow   Build diagnostics #381
run        31260418533
job        93110259493
merge ref  f871209efb611341fd3f2eba246ae218e1af4b34
```

Typecheck/lint PASS.

```text
62/63 test files PASS
395/399 tests PASS
```

Exactly four runtime failures proved the real `ForecastCard` still rendered the old global contract.

### Minimal presentation implementation

Production commit:

```text
9eb21279078a4f269022ad08c4b1ab086b26b196
```

Only `src/components/ForecastCard.tsx` changed.

The five key tiles now render:

```text
Mốc học hết toàn bộ bài mới
Bài trong phạm vi          -> X / Y bài
Bài mới trong phạm vi     -> horizonNewHours
Ôn tập trong phạm vi      -> horizonReviewHours
Khối lượng trong phạm vi  -> horizonWorkloadHours
```

Outside-horizon feedback now states scoped/total context:

```text
Trong N tuần: X/Y bài được xếp.
```

and separately reports unplaced fixed work when present.

### Task 2 GREEN

```text
head       9eb21279078a4f269022ad08c4b1ab086b26b196
workflow   Build diagnostics #382
run        31260531894
job        93110536764
merge ref  13482104c62c17ceb8d6f9869501a93eb7f8895b
```

Full gate PASS:

```text
63/63 test files
399/399 tests
typecheck PASS
lint PASS
build PASS
clean-tree PASS
```

## 6. Final spec-coverage strengthening / literal source-test head

The approved spec requires global completion invariance across all four horizons, not only endpoints. A final test-only commit strengthened the regression to evaluate:

```text
2 weeks
4 weeks
8 weeks
12 weeks
```

and require every `completion` value to equal the 2-week result.

Commit:

```text
d38b4c37a04341a45cf2cd0bc15dd2cb1f9619d5
```

Natural exact-head GREEN:

```text
workflow   Build diagnostics #383
run        31260636065
job        93110786554
merge ref  1d155eef0f8344b8626c55f297e87feb455ef7d4
```

Full gate PASS:

```text
63/63 test files
399/399 tests
typecheck PASS
lint PASS
build PASS
clean-tree PASS
```

This is the literal final source/test head. Production code has not changed after `9eb21279078a4f269022ad08c4b1ab086b26b196`.

## 7. Final source/test scope audit

Comparison:

```text
3444c5d54207ec16de90988958755da62507af11
..
d38b4c37a04341a45cf2cd0bc15dd2cb1f9619d5
```

is:

```text
ahead 12
behind 0
merge base = exact predecessor
```

Exactly six paths differ:

```text
docs/superpowers/plans/2026-08-08-smart-planner-forecast-horizon-window.md
docs/superpowers/specs/2026-08-08-smart-planner-forecast-horizon-window-design.md
src/components/ForecastCard.tsx
src/lib/forecast-card-runtime.test.ts
src/lib/forecast-horizon-window-regression.test.ts
src/lib/forecast-view-model.ts
```

Production diff is bounded to:

```text
src/lib/forecast-view-model.ts  +54/-0
src/components/ForecastCard.tsx +26/-12
```

No `planner.ts`, schedule-projection, Roadmap, Flexible Schedule, persistence, dependency, workflow, deployment or unrelated production file changed.

The implementation plan originally listed `forecast-view-model.test.ts` as a possible focused modification, but the final implementation kept that existing compatibility suite untouched and placed the new contract in the dedicated `forecast-horizon-window-regression.test.ts`. This is a narrower scope than planned, not a missing production requirement.

## 8. Runtime behavior proven by tests

The final suite proves:

- selected horizon controls visible scheduled lesson count;
- selected horizon controls planned new-learning workload;
- selected horizon review workload comes from actual uncompleted scheduler review tasks;
- completed review tasks are excluded;
- completed lessons pinned for visibility are excluded from scoped new workload;
- unplaced fixed work is separate from scheduled workload;
- total scoped workload is new + review;
- 2/4/8/12 horizons preserve identical global completion;
- ForecastCard renders `X / Y bài` and scoped workload labels;
- all-fit feedback is neutral;
- unplaced fixed work has distinct feedback;
- seven-day Sunday capacity behavior remains intact;
- global whole-roadmap workload compatibility fields remain unchanged.

## 9. Known external/nonblocking diagnostics

Unrelated existing diagnostics remain unchanged:

- one high-severity npm audit item;
- seven lint warnings;
- TanStack route-shaped test warning;
- Vite/vite-tsconfig-paths deprecations;
- `.gitmodules` cleanup warning;
- Node action deprecation warning.

Vercel deployment quota is explicitly outside this package and ignored per user instruction. GitHub Actions are the authorized executable CI evidence.

## 10. Independent Review handoff

Literal final source/test head:

```text
d38b4c37a04341a45cf2cd0bc15dd2cb1f9619d5
```

This evidence file must be the sole docs-only commit after that frozen source/test head. Natural PR CI must run and pass on the exact evidence head before acceptance.

Fresh Independent Review must verify:

- `main` still equals exact predecessor `3444c5d54207ec16de90988958755da62507af11`;
- PR #12 remains Draft/open/unmerged on that base;
- no unresolved review threads;
- predecessor-to-head diff stays inside the approved package paths;
- selected-window metrics derive from the actual `visiblePlan`;
- global completion is invariant across 2/4/8/12 weeks;
- scoped review excludes completed tasks;
- completed pinned lessons do not inflate horizon workload;
- unplaced fixed lessons are separate;
- ForecastCard uses the horizon fields rather than whole-roadmap workload fields for selected-window tiles;
- exact evidence-head CI is GREEN.

Target disposition after a clean review:

```text
FORECAST HORIZON WINDOW IMPLEMENTED / ACCEPTED / NOT_MERGED
```
