# Smart Planner P1A Placement Explanations — Completion Record

## Status

- Package: `P1A — Placement explanations`
- Implementation status: `IMPLEMENTED / SOURCE_HEAD_GREEN / DIFF_REVIEWED / READY_FOR_REVIEW`
- P0 predecessor exact head: `3e296b2d2bb1e7f52b482643a30496b4e3757c0a`
- Verified and reviewed P1A source head: `b9ee5de4092a1f38362d12dfadc7207ae2858c79`
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
- Review cards keep one placement explanation only; duplicate review-age and “Lượt ôn hôm nay” reason signals were removed during independent diff review.

## Exact source-head verification

GitHub Actions workflow run `31059503567`, job `92484131068`, against PR merge commit containing source head `b9ee5de4092a1f38362d12dfadc7207ae2858c79`:

| Gate | Result |
|---|---|
| `npm install` | PASS; 465 packages installed |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS with 0 errors and 8 pre-existing warnings |
| `npm test` | PASS — 42/42 test files, 256/256 tests |
| `npm run build` | PASS; tests repeated 256/256, client/SSR/Nitro Vercel output built successfully |
| `git diff --exit-code` | PASS; build/test did not mutate tracked files |
| Vercel commit status | SUCCESS for source head `b9ee5de4092a1f38362d12dfadc7207ae2858c79` |

Focused P1A coverage included:

- `src/lib/custom-subjects.test.ts` — 14 tests
- `src/lib/lesson-placement-catalog.test.ts` — 9 tests
- `src/lib/lesson-placement.test.ts` — 13 tests
- `src/lib/schedule-candidates.test.ts` — 18 tests
- `src/lib/schedule-operations-integration.test.ts` — 6 tests
- `src/lib/flexible-planner-transactions-regression.test.ts` — 7 tests
- `src/lib/today-placement-reason-regression.test.ts` — 4 tests

## Independent diff review

Review base `3e296b2d2bb1e7f52b482643a30496b4e3757c0a` → source head `b9ee5de4092a1f38362d12dfadc7207ae2858c79`:

- Branch is 35 commits ahead and 0 behind the exact P0 predecessor.
- Diff contains 16 files including this completion record; all are within the approved P1A design/plan, provenance model, catalog normalization/editor semantics, schedule-move candidate, Today reason UI, or regression/integration tests.
- One important review finding was fixed: review cards previously displayed multiple competing placement explanations. A RED regression test reproduced the issue with 255/256 passing, then the fix passed 256/256.
- A suspected undated-provenance edge was dismissed after source inspection: `remainingBySubject` excludes lessons without `scheduledDate`, so an undated lesson cannot reach the canonical Flexible Planner move path.
- No fabricated manual-move reason is derived without valid provenance.
- Malformed provenance is stripped while preserving the lesson.
- Schedule edits clear stale provenance; same-date no-ops preserve it.
- Failed writes and undo preserve atomic date-plus-provenance semantics.
- No dependency, package-lock, CI workflow, review algorithm, broad Today redesign, Flexible Planner filter redesign, or Course Manager ownership refactor was introduced.
- `.github/workflows` still contains only the canonical `build.yml` workflow.

Changed-file allowlist:

- `docs/superpowers/evidence/2026-08-06-smart-planner-p1a-placement-explanations-completion.md`
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

P1A remains unmerged and stacked on P0. Review and merge decisions must use exact predecessor `3e296b2d2bb1e7f52b482643a30496b4e3757c0a` and the final evidence commit on `improve/p1a-placement-explanations`. A green implementer run and this diff review are evidence, not package acceptance.
