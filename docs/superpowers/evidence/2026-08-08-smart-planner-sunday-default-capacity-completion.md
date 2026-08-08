# Sunday Default-Capacity Completion Evidence

Date: 2026-08-08

Package disposition before independent review:

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

Branch:

```text
fix/sunday-default-capacity
```

PR:

```text
#11 Sunday: use default study capacity
Draft / open / unmerged
```

## 2. Implemented policy

`resolveDailyCapacityHours()` now resolves capacity with this exact precedence:

1. current date => `todayHours`;
2. exact-date entry in `dailyHours` => that value, including `0`;
3. otherwise => `defaultDailyHours` on every day of the week, including Sunday.

There is no implicit Sunday-rest rule.

Forecast user-visible capacity copy now states that the default applies to all seven days and no longer claims Sunday rests automatically.

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

This proves the old resolver still imposed Sunday zero-capacity.

### Minimal implementation

Source commit:

```text
ed7c6bbf9091f3c0f4e263c3186730b9b556d76a
```

The implementation removed only the `isSundayISO()` zero-capacity branch and unused import. Function signature and today/exact-date/default precedence remain unchanged.

### First implementation run — not GREEN

```text
workflow   Build diagnostics #364
run        31255436229
job        93097999103
```

Typecheck/lint PASS. Two existing assertions in `schedule-projection.test.ts` failed because they explicitly encoded the superseded Sunday-rest product policy:

- flexible work expected to skip Sunday and land Monday;
- a test explicitly expected Sunday to have zero capacity by default.

This run is not counted as GREEN and did not show a production resolver defect. The two policy assertions were updated to the approved seven-day semantics; no projection production code changed.

### Valid Task 1 GREEN

```text
head       21959efe98afc57a48f412f8a941b4407b45f342
workflow   Build diagnostics #365
run        31255552781
job        93098274345
merge ref  467cabc59b21140013973b83c7c37ce2373a8fb3
```

Full gate PASS:

```text
61/61 test files
391/391 tests
typecheck PASS
lint PASS
build PASS
clean-tree PASS
```

Regression proof includes:

- Sunday no override => default capacity;
- Sunday positive exact-date override wins;
- Sunday explicit zero override wins;
- current Sunday uses `todayHours` before same-date override;
- weekdays retain default/override semantics;
- canonical schedule projection can place flexible work on Sunday;
- Roadmap shifted dates remain identical to the canonical projection.

## 4. Task 2 TDD — truthful Forecast copy

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

Sole failure was the real rendered `ForecastCard` runtime assertion. Rendered HTML still contained:

```text
Chủ nhật nghỉ nếu không đặt riêng
```

and did not contain the required seven-day default-capacity wording.

### Minimal presentation implementation / literal final source-test head

```text
head       76263f770d51665a62dac10898dbd31502c5fc88
workflow   Build diagnostics #367
run        31255808534
job        93098869135
merge ref  9cff2d427305d25c430b00635c9a7321a790c71e
```

The production change is exactly one `ForecastCard` capacity-copy line:

```text
Theo lịch công suất hiện tại · mặc định <N> giờ/ngày cho cả 7 ngày.
```

Full gate PASS:

```text
61/61 test files
391/391 tests
typecheck PASS
lint PASS
build PASS
clean-tree PASS
```

Runtime proof requires the seven-day wording and rejects the old Sunday-rest wording.

## 5. Final source/test scope audit

Comparison:

```text
c7d82ec6a07a7fab2b6465456d53a0e1b9919498
..
76263f770d51665a62dac10898dbd31502c5fc88
```

is ahead-only with no base drift.

Final source/test diff contains exactly these authorized paths:

```text
docs/superpowers/plans/2026-08-08-smart-planner-sunday-default-capacity.md
docs/superpowers/specs/2026-08-08-smart-planner-sunday-default-capacity-design.md
src/components/ForecastCard.tsx
src/lib/daily-capacity.test.ts
src/lib/daily-capacity.ts
src/lib/forecast-card-runtime.test.ts
src/lib/schedule-projection.test.ts
```

Production scope is only:

```text
src/lib/daily-capacity.ts       remove implicit Sunday-zero branch
src/components/ForecastCard.tsx update one truthful capacity-copy line
```

The projection test changes only align assertions with the approved policy; `planner.ts`, `schedule-projection.ts`, persistence, dependencies, CI/deployment, Weekly Summary and P2 are untouched.

## 6. Execution-history note

While preparing the Draft PR, two accidental temporary files (`tmp` and `__probe__`) were created by connector mis-selection and immediately removed by forward commits. No amend/rebase/force-push/history rewrite was used. Neither path exists in the predecessor-to-final-source diff and neither affects the implementation tree.

## 7. Pre-existing nonblocking diagnostics

The exact-head CI still reports existing repository diagnostics that are outside this package:

- one high-severity `npm audit` item;
- seven lint warnings;
- TanStack route-shaped test warning;
- `vite-tsconfig-paths` deprecation;
- `.gitmodules` cleanup warning;
- Node action deprecation warning.

No new dependency, workflow or deployment change was made.

## 8. Independent-review handoff

Literal source/test head is frozen at:

```text
76263f770d51665a62dac10898dbd31502c5fc88
```

This evidence document must be the only change after that source/test head. A natural exact-head PR CI run must be GREEN on the resulting evidence head. Independent review must fresh-check predecessor/base, final diff, canonical capacity precedence, Sunday scheduling behavior, Forecast runtime wording, exact CI evidence, and PR state before acceptance.

Target accepted disposition:

```text
SUNDAY DEFAULT CAPACITY IMPLEMENTED / ACCEPTED / NOT_MERGED
```
