# Sunday Default-Capacity Completion Evidence

Date: 2026-08-08

Current disposition before final independent re-review:

```text
SUNDAY DEFAULT CAPACITY IMPLEMENTED / REVIEW_PENDING / NOT_MERGED
```

## 1. Authority and exact predecessor

Approved design:

`docs/superpowers/specs/2026-08-08-smart-planner-sunday-default-capacity-design.md`

Implementation plan:

`docs/superpowers/plans/2026-08-08-smart-planner-sunday-default-capacity.md`

Exact predecessor:

```text
main@c7d82ec6a07a7fab2b6465456d53a0e1b9919498
```

Branch / PR:

```text
fix/sunday-default-capacity
PR #11 Sunday: use default study capacity
Draft / open / unmerged
```

## 2. Final canonical policy

`resolveDailyCapacityHours()` resolves capacity in this exact order:

1. current date => `todayHours`;
2. exact-date entry in `dailyHours` => that value, including `0`;
3. otherwise => `defaultDailyHours` on every day of the week, including Sunday.

There is no implicit Sunday-rest rule in the canonical scheduler or remaining public Forecast compatibility surfaces.

The final package also guarantees:

- Forecast, Roadmap and Flexible Schedule consume the canonical seven-day capacity behavior;
- Forecast UI says the default applies to all seven days;
- `ForecastViewModel.sundayRestByDefault` is `false`;
- exported legacy `forecast()` counts Sunday as a normal calendar study day instead of skipping it.

## 3. Task 1 TDD — canonical Sunday capacity

### Valid RED

```text
head       50493e6e9b8fd5d8337041bb8e45355c96c5669e
workflow   Build diagnostics #363
run        31255347546
job        93097789702
merge ref  951f285343119c0e766bc4204954126ba7db2dc0
```

Typecheck/lint PASS. Test result:

```text
60/61 test files PASS
390/391 tests PASS
```

Sole intended failure:

```text
Sunday without explicit override
expected 6
received 0
```

### Minimal resolver implementation

Commit:

```text
ed7c6bbf9091f3c0f4e263c3186730b9b556d76a
```

`src/lib/daily-capacity.ts` removed only the `isSundayISO()` import and implicit Sunday `return 0` branch.

### Run #364 — not GREEN

```text
run 31255436229
job 93097999103
```

Typecheck/lint PASS. Two existing `schedule-projection.test.ts` assertions encoded the superseded Sunday-rest policy. They were changed to state the approved seven-day policy; no projection production code changed.

### Valid Task 1 GREEN

```text
head       21959efe98afc57a48f412f8a941b4407b45f342
workflow   Build diagnostics #365
run        31255552781
job        93098274345
merge ref  467cabc59b21140013973b83c7c37ce2373a8fb3
```

```text
61/61 test files
391/391 tests
typecheck PASS
lint PASS
build PASS
clean-tree PASS
```

Proof includes Sunday default capacity, positive/zero exact-date overrides, current-Sunday `todayHours` precedence, Sunday scheduling in canonical projection, and Roadmap compatibility with that projection.

## 4. Task 2 TDD — truthful Forecast runtime copy

### Valid RED

```text
head       b527d70e79642e1f228ea35c3b3a02ad11c124f7
workflow   Build diagnostics #366
run        31255712147
job        93098640159
merge ref  3e8f6b7e66a372e83e721e99dc74bcc862c5531b
```

Typecheck/lint PASS. Test result:

```text
60/61 test files PASS
390/391 tests PASS
```

Sole failure proved the real rendered ForecastCard still stated:

```text
Chủ nhật nghỉ nếu không đặt riêng
```

### Initial presentation GREEN

```text
head       76263f770d51665a62dac10898dbd31502c5fc88
workflow   Build diagnostics #367
run        31255808534
job        93098869135
merge ref  9cff2d427305d25c430b00635c9a7321a790c71e
```

The production UI change is one capacity-copy line:

```text
Theo lịch công suất hiện tại · mặc định <N> giờ/ngày cho cả 7 ngày.
```

```text
61/61 test files
391/391 tests
full gate PASS
```

## 5. Initial evidence head and Independent Review rejection

Initial docs-only evidence head:

```text
head       7a9d68c684a3e2884b9533e6a7baf4afe00840f7
workflow   Build diagnostics #368
run        31255933926
job        93099160002
61/61 test files
391/391 tests
full gate PASS
```

A fresh Independent Review rejected that candidate in PR comment `5225997437`.

Important finding: two public compatibility surfaces still encoded the old Sunday-rest semantics even though active scheduler/UI behavior was correct:

1. `ForecastViewModel.sundayRestByDefault` was typed and returned as literal `true`, and an existing test asserted `true`;
2. exported legacy `forecast()` still used `advanceStudyDays()` that skipped Sundays via `isSundayISO()`.

Disposition at that point:

```text
SUNDAY DEFAULT CAPACITY IMPLEMENTED / REJECTED / NOT_MERGED
```

## 6. Independent-review correction TDD

### Valid correction RED

A dedicated regression file was added:

`src/lib/sunday-capacity-compatibility-regression.test.ts`

Exact RED:

```text
head       fd67713b1081110be8608d6b7a0040be34da0bad
workflow   Build diagnostics #369
run        31256187773
job        93099766774
merge ref  da995ad15d24b7f7a4a2fbdc038ab5a848582a85
```

Typecheck/lint PASS.

```text
61/62 test files PASS
391/393 tests PASS
```

Exactly two intended failures:

- one legacy `forecast()` study day beginning Saturday ended Monday instead of Sunday;
- Forecast ViewModel reported `sundayRestByDefault === true` instead of `false`.

### Minimal production corrections

Forecast ViewModel commit:

```text
447b794eef910df0db1e67a3586a2539b59bdb4d
```

Changes only:

```text
sundayRestByDefault: true  -> false
```

Legacy Forecast commit:

```text
5fbdddac2343bd1105838aacd79d5c8738f2d197
```

Exact `planner.ts` patch contains only two hunks:

- remove `isSundayISO` from the date-utils import;
- replace Sunday-skipping `advanceStudyDays()` loop with `addDaysISO(fromISO, studyDays)`.

The active canonical projection/scheduler code was not changed by this correction.

### Run #371 — not GREEN

```text
workflow   Build diagnostics #371
run        31256388630
job        93100236026
```

Typecheck/lint PASS. Both new compatibility regressions PASS. One stale existing test still asserted `sundayRestByDefault === true`:

```text
61/62 test files PASS
392/393 tests PASS
```

That old test contract was aligned to `false`; no production code changed after `5fbdddac2343bd1105838aacd79d5c8738f2d197`.

### Final correction GREEN / literal final source-test head

```text
head       26da22544435972dab0d2e3528af9c720c908edf
workflow   Build diagnostics #372
run        31256507652
job        93100534067
PR merge ref at exact head 9510ca7c5e428daac260b23a97d14c6d76d20989
```

Full gate PASS:

```text
62/62 test files
393/393 tests
typecheck PASS
lint PASS
build PASS
clean-tree PASS
```

Both compatibility regressions are GREEN, and the original Forecast/Roadmap/Flexible Schedule suites remain GREEN.

## 7. Final source/test scope and transcription audit

Comparison:

```text
c7d82ec6a07a7fab2b6465456d53a0e1b9919498
..
26da22544435972dab0d2e3528af9c720c908edf
```

is:

```text
ahead 16
behind 0
merge base = exact predecessor
```

Final predecessor-to-source/test tree contains these package paths:

```text
docs/superpowers/evidence/2026-08-08-smart-planner-sunday-default-capacity-completion.md
docs/superpowers/plans/2026-08-08-smart-planner-sunday-default-capacity.md
docs/superpowers/specs/2026-08-08-smart-planner-sunday-default-capacity-design.md
src/components/ForecastCard.tsx
src/lib/daily-capacity.test.ts
src/lib/daily-capacity.ts
src/lib/forecast-card-runtime.test.ts
src/lib/forecast-view-model.test.ts
src/lib/forecast-view-model.ts
src/lib/planner.ts
src/lib/schedule-projection.test.ts
src/lib/sunday-capacity-compatibility-regression.test.ts
```

Production diffs are bounded to:

```text
src/lib/daily-capacity.ts
  remove implicit Sunday-zero branch

src/components/ForecastCard.tsx
  one truthful seven-day capacity-copy line

src/lib/forecast-view-model.ts
  compatibility flag true -> false

src/lib/planner.ts
  legacy Forecast date advancement no longer skips Sunday
```

`planner.ts` transcription audit confirms only `+2/-8` across the two intended hunks. `forecast-view-model.ts` is only `+2/-2`. No persistence, dependency, workflow, deployment, Weekly Summary, P2, or canonical projection production file changed.

## 8. Execution-history note

While preparing the Draft PR, two accidental temporary files (`tmp` and `__probe__`) were created by connector mis-selection and immediately removed by forward commits. No amend/rebase/force-push/history rewrite was used. Neither path exists in the final diff or implementation tree.

## 9. External / pre-existing nonblocking diagnostics

GitHub Actions continue to report the known repository diagnostics outside this package:

- one high-severity `npm audit` item;
- seven lint warnings;
- TanStack route-shaped test warning;
- `vite-tsconfig-paths` deprecation;
- `.gitmodules` cleanup warning;
- Node action deprecation warning.

Vercel bot comments on PR #11 also report preview deployment failure because the Free-plan project exceeded the daily deployment limit (`api-deployments-free-per-day`, >100 deployments). This is an external quota condition, not a compile/test failure; deployment changes are outside this package. GitHub Actions are the authorized executable CI evidence.

## 10. Final re-review handoff

Literal final source/test head is frozen at:

```text
26da22544435972dab0d2e3528af9c720c908edf
```

This refresh must be exactly one docs-only evidence commit after that head. Natural exact-head PR CI must be GREEN on the refreshed evidence head. A fresh Independent Re-Review must verify:

- `main` still equals exact predecessor `c7d82ec6a07a7fab2b6465456d53a0e1b9919498`;
- PR #11 remains Draft/open/unmerged on that base;
- final diff stays within the package paths above;
- resolver precedence is today -> exact-date override -> default seven-day capacity;
- active schedule projection places work on Sunday when capacity allows;
- `ForecastViewModel.sundayRestByDefault` is false;
- legacy `forecast()` does not skip Sunday;
- Forecast runtime copy contains the seven-day wording and no Sunday-rest claim;
- exact-head CI is GREEN.

Target disposition after a clean fresh re-review:

```text
SUNDAY DEFAULT CAPACITY IMPLEMENTED / ACCEPTED / NOT_MERGED
```
