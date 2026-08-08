# Smart Planner P1E-HF1 Forecast Correctness Design

**Status:** Approved design direction; written spec awaiting user review; implementation not yet authorized  
**Date:** 2026-08-08  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Branch:** `fix/p1e-hf1-forecast-correctness`  
**Exact predecessor:** `main@78f042255fe46e9bbc69193e6ef47158442cdf03`  
**Predecessor package:** `P1E IMPLEMENTED / ACCEPTED / MERGED`

---

## 1. Purpose

P1E-HF1 is a bounded post-acceptance correctness hotfix for Forecast and the scheduler projection that supplies Roadmap dates.

The hotfix exists because two independent data-model errors can make the current completion estimate materially earlier than the schedule can actually realize:

1. individual study sessions are currently treated as if each session were a complete lesson-duration sample;
2. Forecast computes a completion date independently from the capacity scheduler, while Roadmap uses a day-by-day scheduler projection.

The result can be internally contradictory: Forecast may report completion in late August while the same current catalog and capacity settings produce a Roadmap that extends into September.

This package fixes the source-of-truth problem. It must not merely clamp one displayed date to another.

---

## 2. Reproduced real-world evidence

The user-provided `lo_trinh_hien_tai.csv` contains the current roadmap shape used to reproduce the defect.

Verified catalog facts:

- 352 rows and 352 unique lesson IDs;
- 160 Toán lessons;
- 116 Hóa học lessons;
- 69 Vật lý lessons;
- 7 Tiếng Anh lessons;
- 345 lessons at 120 planned minutes;
- 6 lessons at 90 planned minutes;
- 1 lesson at 30 planned minutes;
- 41,970 planned minutes total = 699.5 planned hours;
- imported planned dates range from 2026-08-01 through 2026-08-04.

The production screenshot showed 341 remaining lessons but only 210.3 hours of new-learning work. That value is impossible under the verified catalog regardless of which eleven lessons were completed: removing any eleven lessons can remove at most 11 × 120 = 1,320 minutes, leaving at least 40,650 minutes = 677.5 hours of planned new-learning work.

Therefore the hotfix must include a regression invariant equivalent to:

```text
352-lesson roadmap
→ mark any 11 lessons complete
→ 341 lessons remain
→ planned new-learning workload >= 677.5 hours
→ never approximately 210.3 hours
```

The full personal CSV will not be committed to the repository. Tests will use deterministic synthetic fixtures that preserve the verified counts, duration distribution, subject distribution where relevant, and boundary conditions needed to reproduce the bug.

---

## 3. Root cause A — session-level evidence is being interpreted as lesson-level duration

`ProgressState.studySessions` stores individual study sessions. A lesson can have many sessions.

Current persistence also appends every session duration into `studyMeta.actualMinutes[lessonId]`. Existing Forecast code flattens those values and treats their arithmetic mean as the estimated duration of one lesson.

That interpretation is dimensionally wrong.

Example:

```text
lesson A
session 1 = 20 min
session 2 = 20 min
session 3 = 20 min
```

Current interpretation:

```text
3 samples
mean lesson duration = 20 min
```

Correct lesson-level evidence:

```text
1 completed-lesson sample
observed lesson duration = 60 min
```

Review sessions are also `StudySession` records and can carry `reviewTaskId`. Review time must never be counted as new-learning lesson duration evidence.

### Required correction

Forecast confidence/evidence must be derived from `state.studySessions`, not from the legacy session-duration arrays in `studyMeta.actualMinutes`.

Create a pure lesson-duration evidence layer, proposed path:

```text
src/lib/study-duration-evidence.ts
```

It must:

- ignore every session with `reviewTaskId`;
- accept both `focus-timer` and `manual` non-review study-session sources;
- group qualifying non-review sessions by `lessonId`;
- use only lessons that are completed and still resolvable in the current catalog;
- sum all qualifying study-session duration for each evidence lesson;
- produce one evidence record per completed lesson, not one record per session;
- retain the lesson's planned duration alongside observed total duration;
- expose the number of evidence lessons separately from raw session count;
- never mutate persisted progress data.

No schema migration is authorized. `studyMeta.actualMinutes` remains readable for backward compatibility but is no longer authoritative for Forecast workload, completion, scheduler placement, or confidence.

---

## 4. Root cause B — scheduler placement must use planned lesson duration

The current scheduler calls an estimator that can substitute the average study-session duration for `lesson.plannedDurationMinutes`. This lets a partially studied 120-minute lesson appear to require only a short session-sized amount of capacity.

P1E-HF1 restores deterministic schedule semantics:

```text
capacity cost of an unfinished ordinary lesson
= lesson.plannedDurationMinutes
```

Actual study-session history does not silently rewrite schedule capacity.

This rule applies to:

- `pickDayQueue()` ordinary lesson placement;
- Flexible Schedule;
- Roadmap projection;
- Forecast schedule projection.

Review items retain their existing review-minute semantics and are not converted to planned lesson duration.

If an adaptive scheduler is desired later, it requires a separate explicitly authorized package. It is not part of this hotfix.

---

## 5. One canonical daily-capacity policy

Current Forecast copy says the plan studies six days per week and rests on Sunday, while the day-by-day scheduler can otherwise inherit `defaultDailyHours` on Sunday. P1E-HF1 must remove that inconsistency.

Introduce one pure daily-capacity resolver used by every scheduler/projection path.

Required semantics:

```text
if date is the real/current planning day:
    use todayHours
else if dailyHours contains an explicit entry for date:
    use that explicit value
else if date is Sunday:
    use 0 hours
else:
    use defaultDailyHours
```

Consequences:

- Sunday is a rest day by default;
- an explicit per-date Sunday override may schedule study;
- `todayHours` remains the explicit capacity for the current day, including when today is Sunday;
- Flexible Schedule, Roadmap and Forecast resolve the same capacity for the same date/settings;
- the UI must not claim a six-day policy while another engine silently schedules seven default-capacity days.

The resolver must continue to consume the canonical normalized 0–16 hour values from the existing study-hours policy.

---

## 6. Canonical schedule projection

Create one pure projection layer, proposed path:

```text
src/lib/schedule-projection.ts
```

The projection must compose the existing scheduler rather than duplicate placement rules.

Primary responsibilities:

- iterate calendar days using the canonical daily-capacity resolver;
- call the existing `pickDayQueue()` placement boundary;
- record projected dates for placed ordinary lessons;
- preserve fixed-versus-flexible semantics;
- preserve earliest eligible dates for flexible lessons;
- record fixed lessons that cannot be placed on their exact date;
- record unfinished lessons with no schedule date as unscheduled;
- report whether all unfinished ordinary lessons were successfully projected;
- report the last projected new-learning lesson date only when the projection is complete.

Proposed result shape:

```ts
export type ScheduleProjection = {
  datesByLesson: Record<string, string>;
  lastScheduledLessonDate?: string;
  placedLessonIds: string[];
  unplacedFixedLessonIds: string[];
  unscheduledLessonIds: string[];
  projectionComplete: boolean;
};
```

`buildShiftedSchedule()` becomes a compatibility wrapper over this projection rather than a second implementation of the same day loop.

`buildFlexiblePlan()` keeps its bounded visible-horizon responsibility, but it must use the same daily-capacity resolver and the same planned-duration placement semantics.

### Defensive projection bound

Projection must be bounded to avoid non-terminating behavior when capacity cannot place work.

The implementation plan must use a deterministic bound that is at least:

- 365 calendar days;
- long enough to reach the latest unfinished lesson eligibility date;
- plus at least two calendar days per unfinished lesson;
- capped at 3,660 calendar days.

If work remains after the bound, `projectionComplete` is false and no trustworthy full completion date is emitted.

---

## 7. Forecast workload semantics

Forecast's new-learning workload must be calculated directly from unfinished catalog lessons:

```text
totalNewMinutes
= sum(plannedDurationMinutes of every unfinished current-catalog lesson)
```

It must not be calculated as:

```text
remainingLessonCount × global average study-session duration
```

The existing review-workload approximation may remain for continuity in this hotfix:

```text
totalReviewMinutes ≈ 35% of totalNewMinutes
```

This estimated review workload remains informational. It does not replace concrete due-review items already handled by the canonical scheduler and it does not define the new-learning completion date.

The UI must distinguish:

- planned new-learning workload;
- estimated review workload;
- total displayed workload;
- default daily capacity;
- whether current-day or per-date overrides affect projection;
- Sunday-rest semantics;
- selected visibility horizon;
- work outside that visibility horizon;
- current schedule-projected new-learning completion.

### Capacity copy must remain truthful

The corrected projection uses the complete planner settings, not a fictional constant speed. Therefore `ForecastCard` must not continue to say only:

```text
Tính toán theo vận tốc học đều X giờ/ngày
```

when `todayHours`, `dailyHours`, or Sunday-rest semantics can make actual projected capacity differ by date.

Recommended wording:

```text
Theo lịch công suất hiện tại · mặc định X giờ/ngày · Chủ nhật nghỉ nếu không đặt riêng
```

If one or more explicit per-date overrides affect the projection, the UI must indicate that date-specific capacities are included. The exact compact presentation may be chosen in implementation, but it must not imply that every study day uses the same value.

---

## 8. Forecast completion semantics

The primary completion value must no longer come from a separate arithmetic `remaining × mean ÷ capacity` clock.

Instead:

```text
Forecast completion
= lastScheduledLessonDate from the canonical schedule projection
```

only when `projectionComplete === true`.

If projection is incomplete because of unscheduled lessons, unplaced fixed lessons, impossible current capacity, or the defensive bound, Forecast must not manufacture a date range. It displays an explicit unresolved state and the blocking counts.

Recommended copy semantics:

```text
Mốc học hết bài mới theo lịch hiện tại
20/09/2026
```

or, when incomplete:

```text
Chưa thể xác định ngày hoàn thành
Có bài chưa xếp được hoặc chưa có ngày bắt đầu.
```

The existing visibility horizon remains separate from full completion projection. A two-week visible horizon must not imply that Forecast only projects two weeks.

The review chain remains separate from the date on which all current new-learning lessons are projected to be completed.

---

## 9. Confidence semantics

Confidence must describe the quality of lesson-level planned-versus-actual evidence. It must never count study sessions as independent lesson samples.

For each evidence lesson:

```text
ratio = observed non-review study minutes / plannedDurationMinutes
```

Let `n` be the number of completed lessons with usable evidence and let `CV` be the coefficient of variation of those ratios when `n >= 2`.

Confidence rules:

```text
n < 3                    → insufficient
3 <= n < 7               → low
7 <= n < 20              → medium
n >= 20 and CV <= 0.35   → high
n >= 20 and CV > 0.35    → medium
```

This prevents many short sessions from creating false high confidence and prevents highly inconsistent completed-lesson evidence from being labeled high confidence solely because the user has many samples.

The UI basis text must say that confidence is based on completed lessons with non-review study evidence, not raw session count.

P1E-HF1 does not use this ratio to automatically rescale planned workload. Actual-versus-planned calibration of future workload is deliberately deferred until it can be designed and validated independently.

---

## 10. Real-roadmap regression strategy

The uploaded personal CSV is evidence, not a repository dependency.

Tests must construct a deterministic synthetic catalog preserving these verified properties:

```text
352 unique lessons
160 Toán
116 Hóa học
69 Vật lý
7 Tiếng Anh
345 × 120 minutes
6 × 90 minutes
1 × 30 minutes
41,970 total planned minutes
```

Required regression assertions:

1. The full fixture reports exactly 699.5 planned new-learning hours.
2. After any deterministic set of eleven lessons is marked complete, exactly 341 remain.
3. The remaining planned workload is never below 677.5 hours.
4. The result can never regress to approximately 210.3 hours merely because historical study sessions average roughly 37 minutes.
5. Multiple study sessions for one completed lesson count as one evidence lesson with summed minutes.
6. Review sessions do not contribute to new-learning duration evidence.
7. Twenty or more sessions from one or two lessons cannot produce high confidence.
8. The projected Forecast completion date equals the canonical projection's last scheduled lesson date when complete.
9. Forecast emits no full completion date when the projection contains unresolved ordinary lessons.

The regression suite may use a compact fixture generator; it does not need to duplicate 352 literal CSV rows.

---

## 11. Component and runtime behavior

`ForecastCard` remains a presentation component over a pure view model.

The view model must expose semantic fields rather than reconstructing schedule rules in React.

At minimum it needs:

- remaining lesson count;
- planned new-learning hours;
- estimated review hours;
- total workload hours;
- normalized default daily capacity;
- a flag/count describing explicit capacity overrides that affect projection;
- visibility horizon and outside-horizon count;
- schedule-projected completion state;
- evidence lesson count;
- confidence;
- evidence basis;
- unresolved projection counts when applicable.

Runtime tests must render the production `ForecastCard` and prove that:

- the user-visible new-learning workload follows the planned catalog workload;
- the displayed completion date is the canonical projection date;
- no contradictory earlier statistical date/range is rendered;
- unresolved projections display a truthful no-date state;
- capacity copy does not claim a constant speed when explicit date overrides affect projection;
- confidence copy cannot claim high confidence from repeated sessions on too few lessons.

---

## 12. Scope boundaries

### In scope

- planned-duration semantics for unfinished ordinary lesson placement;
- lesson-level aggregation of non-review study evidence;
- confidence correction;
- canonical Sunday/default-capacity resolution;
- shared schedule projection;
- Roadmap compatibility through `buildShiftedSchedule()`;
- Forecast workload/completion/read-model correction;
- focused Forecast UI wording necessary to expose the corrected semantics;
- regression tests including a synthetic equivalent of the verified real roadmap;
- typecheck, lint, tests, production build and clean-tree verification.

### Out of scope

- Weekly Summary raw lesson-ID fix;
- ArchivedCatalog presentation work;
- P2 design-system cleanup;
- P2 accessibility audit;
- P2 Mobile/PWA work;
- P2 secondary-system audit;
- adaptive future-workload scaling from actual/planned ratios;
- changing review intervals;
- changing review task generation;
- persistence schema migration;
- deleting historical `studyMeta.actualMinutes` data;
- new dependency;
- broad planner rewrite;
- framework or deployment changes.

The Weekly Summary raw-ID defect will be handled as a separate `WEEKLY-HF1 Historical lesson labels` package after this Forecast correctness hotfix.

---

## 13. Expected file boundaries

### Proposed new pure modules

```text
src/lib/study-duration-evidence.ts
src/lib/schedule-projection.ts
```

### Expected modified production files

```text
src/lib/planner.ts
src/lib/forecast-view-model.ts
src/components/ForecastCard.tsx
```

A small dedicated daily-capacity module may be created instead of placing the resolver in `planner.ts` if the implementation plan confirms that this reduces coupling. The semantic rule in section 5 is fixed regardless of exact file placement.

`src/routes/index.tsx` should not change unless a now-obsolete Forecast prop can be removed without broadening behavior.

### Expected tests

```text
src/lib/study-duration-evidence.test.ts
src/lib/schedule-projection.test.ts
src/lib/planner.test.ts
src/lib/forecast-view-model.test.ts
src/lib/forecast-card-runtime.test.ts
src/lib/forecast-clarity-regression.test.ts
```

The implementation plan must narrow this list further based on exact callsites before code is changed.

---

## 14. TDD and verification requirements

Implementation must proceed RED → GREEN in independently reviewable tasks.

Minimum RED proofs:

1. session aggregation: three 20-minute sessions on one completed lesson must fail until represented as one 60-minute lesson-level sample;
2. review exclusion: review sessions must fail until excluded from evidence;
3. planned scheduler duration: a 120-minute lesson with a short study-session history must still consume 120 minutes of ordinary-lesson capacity;
4. Sunday consistency: default Sunday must resolve to zero across projection and visible scheduler, while an explicit Sunday override remains honored;
5. real-roadmap workload: the 352/341 synthetic fixture must fail under the old 210.3-hour-style estimator and pass with direct planned-workload summation;
6. projection completion: Forecast must fail until it uses the canonical projected last lesson date;
7. incomplete projection: Forecast must fail until unresolved work suppresses a fake completion date;
8. confidence: many sessions from too few completed lessons must fail to produce high confidence;
9. capacity copy: an explicit date override must fail until runtime UI stops implying constant X-hours-per-day projection.

Full exact-head gate:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Natural GitHub Actions remains executable CI evidence. Formatting/lint failures before the target test gate are not valid RED evidence and are not counted as GREEN.

---

## 15. Acceptance criteria

P1E-HF1 is implementation-complete only when all of the following are true:

1. Unfinished ordinary lessons consume their planned duration in scheduler placement.
2. A study session is never interpreted as an independent completed-lesson duration sample.
3. Multiple non-review study sessions for one completed lesson are summed into one lesson-level evidence record.
4. Both `focus-timer` and `manual` non-review sessions may contribute to that lesson-level record.
5. Review sessions are excluded from new-learning evidence.
6. Confidence sample count is the number of evidence lessons, not session count.
7. High confidence requires at least 20 evidence lessons and ratio CV <= 0.35.
8. The canonical daily-capacity resolver applies the same Sunday/default/override semantics everywhere.
9. Sunday defaults to zero capacity unless todayHours or an explicit date override applies.
10. `buildShiftedSchedule()` and Forecast use the same projection semantics.
11. Forecast new-learning workload is the direct sum of unfinished planned lesson minutes.
12. The verified 352-lesson fixture produces 699.5 planned hours before completions.
13. A 341-remaining fixture derived from that roadmap cannot report less than 677.5 planned new-learning hours.
14. The 210.3-hour screenshot regression is impossible under the corrected workload path.
15. Forecast completion equals the canonical projection's last new-learning lesson date when projection is complete.
16. Forecast does not manufacture a completion date when unscheduled or unplaced ordinary work remains.
17. Forecast capacity copy truthfully reflects default capacity, Sunday rest and explicit per-date/current-day overrides.
18. The visibility horizon remains separate from full completion projection.
19. Review workload remains explicitly separate from new-learning workload and completion date.
20. No progress-storage schema migration is introduced.
21. No dependency, workflow, deployment, Weekly Summary or P2 change is included.
22. Targeted tests, full tests, typecheck, lint, production build and clean-tree checks pass on the exact candidate head.
23. Independent review verifies the exact source/test head and exact evidence head before merge authorization.

---

## 16. Delivery and governance

P1E-HF1 is a post-acceptance hotfix. It does not rewrite or invalidate P1E history.

Required lifecycle:

```text
approved written spec
→ implementation plan
→ test-only RED commits
→ minimal production GREEN commits
→ exact-head CI
→ completion evidence
→ Independent Review
→ ACCEPTED / NOT_MERGED
→ separate merge authorization
```

No squash, rebase, amend, force-push or published-history rewrite is authorized.

P2 remains blocked until this correctness hotfix and the separate Weekly Summary historical-label hotfix are independently resolved and integrated.
