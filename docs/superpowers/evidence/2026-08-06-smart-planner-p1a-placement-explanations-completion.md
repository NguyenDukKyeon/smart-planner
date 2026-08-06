# Smart Planner P1A Placement Explanations — Completion Record

## Status

- Package: `P1A — Placement explanations`
- Implementation status: `IMPLEMENTED / EXACT-HEAD GREEN / REVIEW_PENDING`
- P0 predecessor exact head: `3e296b2d2bb1e7f52b482643a30496b4e3757c0a`
- Verified P1A implementation head before this evidence-only commit: `aed4a12dd32a37ada2a490516623423fad8eaebf`
- Branch: `improve/p1a-placement-explanations`
- Pull request: Draft PR #5
- Integration state: stacked on P0; not merged; no deploy action performed by the implementer.

This companion completion record is separate from the immutable implementation plan to avoid reconstructing the 1,274-line historical plan solely to append evidence.

## Implemented behavior

- Catalog lessons support one optional, sanitized latest manual-move provenance object.
- Catalog reload preserves valid provenance and removes malformed provenance without deleting the lesson.
- CSV/JSON imports cannot inject application-generated provenance.
- Lesson editor schedule changes clear stale provenance only when date or mode actually changes; non-schedule edits preserve it.
- Every Flexible Planner date move uses `buildMoveLessonDateCandidate` and the existing P0 transaction boundary.
- A same-date move is a no-op and does not replace provenance or call the clock.
- Failed persistence publishes neither the new date nor provenance and appends no undo history.
- Undo restores both the previous date and previous provenance.
- Today lessons and reviews derive one primary reason with fixed/manual/capacity/roadmap/review precedence.
- `LessonPlacementReason` renders one badge and a keyboard-accessible button disclosure with `aria-expanded` and `aria-controls`.

## Exact-head verification

GitHub Actions workflow run `31058700597`, job `92481720512`, against PR merge commit containing source head `aed4a12dd32a37ada2a490516623423fad8eaebf`:

| Gate | Result |
|---|---|
| `npm install` | PASS; 465 packages installed |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS with 0 errors and 8 pre-existing warnings |
| `npm test` | PASS — 42/42 test files, 255/255 tests |
| `npm run build` | PASS; tests repeated 255/255, client/SSR/Nitro Vercel output built successfully |
| `git diff --exit-code` | PASS; build/test did not mutate tracked files |
| Vercel commit status | SUCCESS for source head `aed4a12dd32a37ada2a490516623423fad8eaebf` |

Focused P1A coverage included:

- `src/lib/custom-subjects.test.ts` — 14 tests
- `src/lib/lesson-placement-catalog.test.ts` — 9 tests
- `src/lib/lesson-placement.test.ts` — 13 tests
- `src/lib/schedule-candidates.test.ts` — 18 tests
- `src/lib/schedule-operations-integration.test.ts` — 6 tests
- `src/lib/flexible-planner-transactions-regression.test.ts` — 7 tests
- `src/lib/today-placement-reason-regression.test.ts` — 3 tests

## Scope audit against P0

Comparison base `3e296b2d2bb1e7f52b482643a30496b4e3757c0a` → verified implementation head `aed4a12dd32a37ada2a490516623423fad8eaebf`:

- Branch is 31 commits ahead and 0 behind the P0 exact head.
- Diff contains 15 files, all within the approved P1A design/plan, provenance model, catalog normalization/editor semantics, schedule-move candidate, Today reason UI, or regression/integration tests.
- No dependency, package-lock, CI workflow, review algorithm, broad Today redesign, Flexible Planner filter redesign, or Course Manager ownership refactor was introduced.
- `.github/workflows` still contains only the canonical `build.yml` workflow.

Changed-file allowlist:

- `docs/superpowers/plans/2026-08-06-smart-planner-p1a-placement-explanations.md`
- `docs/superpowers/specs/2026-08-06-smart-planner-p1a-placement-explanations-design.md`
- `src/components/TodayPanel.tsx`
- `src/components/today/LessonPlacementReason.tsx`
- `src/components/today/TodayLessonCard.tsx`
- `src/lib/custom-subjects.ts`
- `src/lib/flexible-planner-transactions-regression.test.ts`
- `src/lib/lesson-placement-catalog.test.ts`
- `src/lib/lesson-placement.test.ts`
- `src/lib/lesson-placement.ts`
- `src/lib/mock-data.ts`
- `src/lib/schedule-candidates.test.ts`
- `src/lib/schedule-candidates.ts`
- `src/lib/schedule-operations-integration.test.ts`
- `src/lib/today-placement-reason-regression.test.ts`

## Recorded non-blocking warnings

- ESLint reports eight existing warnings: two React hook dependency warnings and six `react-refresh/only-export-components` warnings; no lint errors.
- `npm install` reports one high-severity dependency vulnerability; dependency remediation is outside P1A and no dependency was changed here.
- Vite reports existing deprecation/configuration notices for HMR options and `vite-tsconfig-paths`.
- Route generation reports that `src/routes/__root.test.tsx` is not a route; the file is still intentionally executed by the test command.
- GitHub Actions post-checkout cleanup warns that `.gitmodules` has no URL for `smart-study-habit-planner-deploy`; the job nevertheless completed successfully and this pre-existing repository issue is outside P1A.

## Review gate

P1A remains unmerged and stacked on P0. Independent diff review must use P0 exact head `3e296b2d2bb1e7f52b482643a30496b4e3757c0a` as the base and the final evidence commit on `improve/p1a-placement-explanations` as the head. A green implementer run is evidence, not package acceptance.
