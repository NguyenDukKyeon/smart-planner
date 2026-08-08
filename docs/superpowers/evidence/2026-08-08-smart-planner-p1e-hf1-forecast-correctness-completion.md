# P1E-HF1 Forecast Correctness Completion Evidence

**Repository:** `NguyenDukKyeon/smart-planner`  
**Package:** `P1E-HF1 Forecast Correctness`  
**Date:** 2026-08-08  
**PR:** #10  
**Branch:** `fix/p1e-hf1-forecast-correctness`  
**Exact predecessor:** `main@78f042255fe46e9bbc69193e6ef47158442cdf03`  
**Literal final source/test head:** `1fbeb119d85d3552c388f7a7955ab0faa34c0428`  
**Disposition at evidence creation:** `IMPLEMENTED / REVIEW_PENDING / NOT_MERGED`

---

## 1. Authority and package documents

Design spec commits:

- initial spec: `2673b1c5ea2b7d0a47cceb57c262ae3911e46258`
- final self-reviewed spec: `df59a042087d51e6cbb0f0cedd3b4fa642f77483`

Implementation plan commits:

- initial plan: `ddd09c74425cb868772f9ae431b3edc07197476b`
- final self-reviewed plan: `80e3b884553990059af770fbaef52e020b2c2dfd`

The user-provided `lo_trinh_hien_tai.csv` was used as external reproduction evidence only and was not committed.

Verified roadmap invariants encoded by synthetic regression tests:

```text
352 unique lessons
160 Toán
116 Hóa học
69 Vật lý
7 Tiếng Anh
345 × 120 minutes
6 × 90 minutes
1 × 30 minutes
41,970 total planned minutes = 699.5 hours
```

After deterministically completing eleven 120-minute lessons:

```text
341 lessons remain
40,650 planned minutes remain = 677.5 hours
```

This proves the former production value around `210.3` new-learning hours was not compatible with the current catalog workload.

---

## 2. Task 1 — lesson-level study-duration evidence

### Valid RED

- exact head: `eaa17253fc81171c9228f5c91da9612dd7132a0b`
- workflow: Build diagnostics #328
- run: `31250481356`
- job: `93085973579`
- PR merge ref: `413b3a89954ea36cbdbc2abc599c474ba3e5bea1`
- typecheck: PASS
- lint: PASS
- tests: 57/58 files and 360/363 tests passed
- intended failures: three tests required the missing `selectStudyDurationEvidence()` boundary

### Rejected intermediate run

- Build diagnostics #329
- reason: one Prettier error in the new selector; tests did not run
- this run is not GREEN evidence

### Valid GREEN

- exact head: `6af7c815d2c5d4562fd06ab84db8b9745a72483b`
- workflow: Build diagnostics #330
- run: `31250666866`
- job: `93086431610`
- PR merge ref: `7a707c4a38a3aa90d760f2c1b7965ad8bc455e57`
- 58/58 test files PASS
- 363/363 tests PASS
- typecheck/lint/build/clean-tree PASS

Locked behavior:

- repeated sessions on one completed lesson become one lesson-level evidence sample;
- non-review `focus-timer` and `manual` sessions are accepted;
- review sessions are excluded;
- incomplete or deleted-catalog lessons do not become confidence evidence;
- confidence counts evidence lessons rather than raw sessions.

---

## 3. Task 2 — planned lesson cost and canonical daily capacity

### Valid RED

- exact head: `b2d57fdafaddba143969ed18aa7cf3769af7d9d8`
- workflow: Build diagnostics #332
- run: `31250783124`
- job: `93086711212`
- PR merge ref: `cc480345cbcbfd4c22aecee3315cc9453429f570`
- typecheck/lint PASS
- 57/59 files and 363/369 tests passed
- intended failures: five missing daily-capacity resolver cases plus one 120-minute lesson incorrectly fitting after short session history

### Rejected intermediate run

- exact head: `557c8029221658f7e255c62ac778f558cd9379e1`
- workflow: Build diagnostics #334
- run: `31250912972`
- job: `93087031211`
- typecheck/lint PASS
- tests failed because three pre-existing fixtures unintentionally relied on default Sunday capacity
- fixtures were corrected with explicit Sunday capacity; scheduler semantics were not weakened
- this run is not GREEN evidence

### Valid GREEN

- exact head: `93f9dea31e8f49c8a16c4998d7537e77e5a40aaa`
- workflow: Build diagnostics #336
- run: `31251020982`
- job: `93087295638`
- PR merge ref: `88c8a43551ed2993ad54c027a3db32ead726d196`
- 59/59 files PASS
- 369/369 tests PASS
- typecheck/lint/build/clean-tree PASS

Locked behavior:

- ordinary unfinished lesson placement consumes `plannedDurationMinutes`;
- short historical session arrays no longer reduce ordinary schedule capacity cost;
- current day uses `todayHours`;
- explicit per-date overrides preserve explicit zero and override Sunday rest;
- Sunday defaults to zero otherwise;
- ordinary weekdays use `defaultDailyHours`.

---

## 4. Task 3 — canonical full schedule projection

### Valid RED

- exact head: `a1d1801056ce692447296fbb42688909257b9e72`
- workflow: Build diagnostics #337
- run: `31251139016`
- job: `93087589080`
- PR merge ref: `329649f6fad179be375e5dc48decd9be95b8741c`
- typecheck/lint PASS
- 59/60 files and 369/375 tests passed
- six intended failures required the missing canonical projection API

### Valid GREEN

- exact head: `787e65ec1f9af7296db5bbbafccea4c9a6bbcc71`
- workflow: Build diagnostics #339
- run: `31251305007`
- job: `93087995567`
- PR merge ref: `254a247307e8040a40f3fd55ea28cdaa42de28c8`
- 60/60 files PASS
- 375/375 tests PASS
- typecheck/lint/build/clean-tree PASS

Locked behavior:

- projection composes the existing `pickDayQueue()` scheduler;
- unscheduled, unplaced-fixed and defensive-bound work are explicit blockers;
- Sunday/default/override capacity uses one resolver;
- `buildShiftedSchedule()` returns the canonical projection `datesByLesson`;
- Roadmap shifted dates and Forecast projection share one placement clock.

Implementation note: projection implementation lives next to scheduler internals in `planner.ts`; `schedule-projection.ts` is the public re-export boundary. This avoids a runtime circular import while preserving a dedicated projection API.

---

## 5. Task 4 — Forecast workload, completion and confidence

### Rejected pre-RED formatting run

- Build diagnostics #341
- reason: new regression fixture did not pass Prettier, so tests did not run
- not behavioral RED evidence

### Valid RED

- exact head: `c3229f0dc34742bdca5613db0d2ca512e8fc509e`
- workflow: Build diagnostics #342
- run: `31251542012`
- job: `93088566770`
- PR merge ref: `ea093ae7266c4d2e663ecd4c37fc1356ab3b8375`
- typecheck/lint PASS
- 58/60 files and 374/382 tests passed
- eight intended failures covered impossible workload, missing lesson-level confidence fields, independent completion semantics, blocker state and capacity metadata

### Rejected intermediate runs

- Build diagnostics #345 / run `31251734964`: Prettier-blocked, tests did not run
- Build diagnostics #346 / run `31251849439`: one remaining Prettier error, tests did not run
- neither run is GREEN evidence

### Valid GREEN

- exact head: `6df802285a9c351aeb95f6e5f47294247b3ae7fc`
- workflow: Build diagnostics #347
- run: `31251931016`
- job: `93089493552`
- PR merge ref: `8c1f5e9b54476b4f137efa2ea974937952a63220`
- 60/60 files PASS
- 382/382 tests PASS
- typecheck/lint/build/clean-tree PASS

Key regression proofs at GREEN:

- synthetic real-roadmap fixture totals exactly 699.5 planned hours;
- after eleven deterministic 120-minute completions, exactly 341 lessons / 677.5 hours remain;
- approximately 37-minute historical sessions cannot collapse that workload toward 210.3 hours;
- 22 sessions across only two completed lessons remain `insufficient` confidence;
- 20 stable lesson-level ratios can reach `high`, while 20 high-variance ratios are downgraded to `medium`;
- Forecast completion equals `buildScheduleProjection().lastScheduledLessonDate` when complete;
- incomplete projection uses explicit `no-capacity`, `unscheduled`, `unplaced-fixed`, or `projection-bound` state;
- `forecast-view-model.ts` no longer calls legacy arithmetic `forecast()`.

---

## 6. Task 5 — truthful ForecastCard presentation

### Valid RED

- exact head: `d77410a28c0c821377581eaf03c11c952e18a0d0`
- workflow: Build diagnostics #348
- run: `31252067090`
- job: `93089818566`
- PR merge ref: `58b3aa0b6129f617def1d6064bf4c82cf55600de`
- typecheck/lint PASS
- 59/60 files and 383/387 tests passed
- four intended presentation failures: canonical completion label, lesson-level evidence copy, truthful capacity copy, and obsolete source-contract expectation

### Execution adjustment

`shiftedDates` remains an optional compatibility-only `ForecastCard` prop so the large route file does not need unrelated churn. `ForecastCard` does not destructure or read it. Correctness is independently locked by the regression that a shifted Roadmap date cannot replace Forecast completion and by the ViewModel's zero dependency on legacy shifted-date arithmetic. Roadmap remains the active consumer of `shiftedDates`.

### Rejected intermediate run

- Build diagnostics #351
- run: `31252326908`
- job: `93090482814`
- typecheck PASS
- lint failed on one Prettier-only line in the runtime source-contract test; tests did not run
- not GREEN evidence

### Valid final source/test GREEN

- exact head: `1fbeb119d85d3552c388f7a7955ab0faa34c0428`
- workflow: Build diagnostics #352
- run: `31252411342`
- job: `93090684473`
- PR merge ref: `4235f405ed19f82c228e921e01cd447f767e933d`
- 60/60 test files PASS
- 387/387 tests PASS
- typecheck PASS
- lint PASS with zero errors (pre-existing warnings only)
- production build PASS
- clean-tree (`git diff --exit-code`) PASS

User-visible semantics now locked by production runtime tests:

- `Mốc học hết bài mới theo lịch hiện tại` renders the canonical projected date;
- planned new-learning workload is rendered independently from short historical session averages;
- unresolved ordinary work renders `Chưa thể xác định ngày hoàn thành` without a fabricated date range;
- many sessions on too few completed lessons cannot claim high confidence;
- confidence copy names the number of completed evidence lessons;
- `Công suất mặc định` and schedule-capacity copy disclose Sunday rest and explicit date overrides;
- the former constant-speed sentence and `~N phút/bài` authority are absent.

---

## 7. Source/test scope audit

Comparison:

```text
78f042255fe46e9bbc69193e6ef47158442cdf03
..
1fbeb119d85d3552c388f7a7955ab0faa34c0428
```

is ahead-only with no base drift.

Changed paths before this evidence document:

```text
docs/superpowers/plans/2026-08-08-smart-planner-p1e-hf1-forecast-correctness.md
docs/superpowers/specs/2026-08-08-smart-planner-p1e-hf1-forecast-correctness-design.md
src/components/ForecastCard.tsx
src/lib/daily-capacity.test.ts
src/lib/daily-capacity.ts
src/lib/forecast-card-runtime.test.ts
src/lib/forecast-clarity-regression.test.ts
src/lib/forecast-view-model.test.ts
src/lib/forecast-view-model.ts
src/lib/planner.test.ts
src/lib/planner.ts
src/lib/planning-date-regression.test.ts
src/lib/schedule-mode-regression.test.ts
src/lib/schedule-projection.test.ts
src/lib/schedule-projection.ts
src/lib/study-duration-evidence.test.ts
src/lib/study-duration-evidence.ts
```

The two existing scheduler regression files were fixture-only updates needed to make their intended behavior independent of the newly canonical Sunday-rest rule.

No Weekly Summary file, dependency manifest, workflow, deployment configuration, persistence schema, or P2 implementation file changed.

---

## 8. Known limitations / explicitly deferred work

- `studyMeta.actualMinutes` remains persisted for backward compatibility but is no longer Forecast authority.
- legacy `forecast()` may remain exported for compatibility; Forecast ViewModel and ForecastCard do not use it for workload/completion/confidence.
- actual/planned lesson evidence does not automatically scale future planned workload; adaptive forecasting remains a future package.
- review workload remains the existing approximate 35% informational estimate; concrete review scheduling remains owned by the scheduler.
- `shiftedDates` remains a compatibility-only Forecast prop but cannot affect Forecast output.
- Weekly Summary raw lesson IDs are not fixed here; they belong to separate `WEEKLY-HF1 Historical lesson labels` work.
- P2 remains blocked until this correctness hotfix is independently accepted/integrated and the separate weekly-label defect is handled according to package order.

---

## 9. Review handoff

Fresh conditions at evidence creation:

```text
main = 78f042255fe46e9bbc69193e6ef47158442cdf03
PR #10 = Draft / open / unmerged
base SHA = 78f042255fe46e9bbc69193e6ef47158442cdf03
literal source/test head = 1fbeb119d85d3552c388f7a7955ab0faa34c0428
source/test CI #352 = GREEN
```

The evidence commit must be exactly docs-only relative to the source/test head, followed by one natural exact-head CI run. After that run is GREEN, hand off for fresh independent review.

Target disposition:

```text
P1E-HF1 IMPLEMENTED / REVIEW_PENDING / NOT_MERGED
```
