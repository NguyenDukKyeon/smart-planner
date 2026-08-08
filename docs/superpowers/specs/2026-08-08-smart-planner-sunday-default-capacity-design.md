# Smart Planner Sunday Default-Capacity Design

Date: 2026-08-08

Status: Approved direction; implementation not yet authorized by this document alone.

## Context

`P1E-HF1` introduced one canonical daily-capacity resolver so Forecast, Roadmap and Flexible Schedule use the same capacity semantics. The current resolver treats Sunday as zero capacity unless that date has an explicit override. The user has now chosen to study on Sundays as a normal day.

Exact predecessor:

```text
main@c7d82ec6a07a7fab2b6465456d53a0e1b9919498
```

## Goal

Make Sunday use the same default daily capacity as every other non-current day unless that exact date has an explicit override.

## Canonical capacity precedence

`resolveDailyCapacityHours()` must resolve capacity in this exact order:

1. If `dateISO === currentDateISO`, return `todayHours`.
2. If `dailyHours` contains an explicit entry for `dateISO`, return that value, including `0`.
3. Otherwise return `defaultDailyHours` for every day of the week, including Sunday.

There is no implicit Sunday-rest rule after this change.

Examples:

```text
Sunday + no override + defaultDailyHours=6  => 6 hours
Sunday + explicit override 4               => 4 hours
Sunday + explicit override 0               => 0 hours
Current Sunday + todayHours=3              => 3 hours
Monday + no override + defaultDailyHours=6  => 6 hours
```

## Product behavior

Because Forecast, Roadmap and Flexible Schedule already consume the canonical capacity policy, they must all treat Sunday as an ordinary study day after this change.

Forecast presentation must no longer state or imply that Sunday is a default rest day. Capacity copy should instead explain that the default hours apply every day and exact-date overrides take precedence.

## Scope

Authorized implementation scope:

- canonical daily-capacity policy;
- tests that lock Sunday default-capacity behavior and existing precedence semantics;
- Forecast capacity wording that currently mentions Sunday rest;
- scheduler/Forecast regressions only where existing fixtures explicitly depend on the old Sunday-rest policy.

## Non-goals

This change does not:

- add a new "study Sunday" setting;
- change persistence schema;
- create recurring weekday-specific capacity settings;
- alter planned lesson durations, schedule-mode semantics or Forecast workload evidence;
- modify Weekly Summary;
- implement P2 work;
- change dependencies, workflows or deployment configuration.

## Testing requirements

TDD evidence must prove at minimum:

1. Sunday without an explicit override uses `defaultDailyHours`.
2. Sunday explicit positive override still wins.
3. Sunday explicit zero-hour override still wins.
4. Current-day `todayHours` still has highest precedence, including when today is Sunday.
5. Ordinary weekdays continue to use `defaultDailyHours` when no override exists.
6. Forecast runtime copy no longer claims Sunday rests by default.
7. Existing Forecast/Roadmap/Flexible Schedule regression suites remain GREEN under the new shared policy.
8. Full repository gates pass: typecheck, lint, tests, build and clean-tree verification.

## Acceptance

The package is acceptable when one canonical resolver applies the same default capacity seven days per week, all affected user-visible wording matches that policy, natural exact-head GitHub Actions are GREEN, and an independent review finds no Critical or Important issue.
