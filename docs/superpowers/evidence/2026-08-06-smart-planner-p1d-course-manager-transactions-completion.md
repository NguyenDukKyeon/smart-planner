# P1D Course Manager Transactions — Completion Evidence

## Status

`IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED`

This record is implementation evidence only. It does not grant package acceptance and does not authorize merge.

## Authority and exact topology

- Repository: `NguyenDukKyeon/smart-planner`
- Package: `P1D — Course Manager transactions and decomposition`
- Branch: `improve/p1d-course-manager-transactions`
- Exact integrated predecessor: `main@ceeee84682c55c663d09a6b171227a1d92171046`
- Approved design commit: `448c9ff69944a95229afc9da0fa400539f9185c3`
- Approved implementation plan commit: `522e7a0cc3027b0f7c86d1bf20cebc5c6ab48450`
- Literal final source HEAD covered by this evidence: `977841037bba79a53d090e2120b2498986b4a58a`
- Source topology at final source HEAD: 56 commits ahead of predecessor, 0 behind.
- Pull request: draft PR #8, open and unmerged.

The evidence document itself is committed after the literal source HEAD above. Review must distinguish the docs-only evidence commit from the source HEAD whose behavior was verified.

## Final exact-head GREEN gate

GitHub Actions `Build diagnostics` run #289:

- run id: `31137356888`
- job id: `92739603534`
- source head: `977841037bba79a53d090e2120b2498986b4a58a`
- `npm install`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS — 0 errors, 7 pre-existing/nonblocking warnings
- `npm test`: PASS — 51/51 test files, 342/342 tests
- `npm run build`: PASS — test suite reran 51/51 and 342/342, followed by client, SSR and Nitro/Vercel production builds
- `git diff --exit-code`: PASS
- job conclusion: SUCCESS

The dead intermediate Course Manager artifact removed during Task 9 had itself contributed one lint warning. After removal, the remaining seven warnings are outside the P1D implementation surface: one existing Focus Timer hook dependency warning and six existing React fast-refresh export warnings in UI primitives.

## RED / GREEN implementation history

### Task 1 — one shared schedule transaction owner

- Initial RED: `bd012b2fd6149667c9d768fca9851ab088cdde08`.
- GREEN checkpoint: `c28af9eaa87cbea108ba0d3b0b58ad70b4cef94e`.
- GitHub Actions run #241 `31086797654`, job `92568036882`.
- Result: 46/46 files and 283/283 tests PASS; build and clean-tree PASS.

### Task 2 — atomic lesson editor candidate

- Valid RED head: `da0fbda1ac887ce83fe35ee2ff54757ff1edb68c`; existing 46 files / 283 tests passed and 12 new tests failed only because `buildEditLessonCandidate` did not exist.
- GREEN: `36b13f38fec57158f3b53150520648eccddec822`.
- Run #246 `31090436618`, job `92579866853`.
- Result: 48/48 files and 296/296 tests PASS; build and clean-tree PASS.

### Task 3 — reorder, move and bulk candidates

- Valid RED head: `0c44ac0eeb58dee011878f7fe92668488b8fb07c`; existing 48 files / 296 tests passed and 21 new tests failed because the four required builders did not yet exist.
- GREEN: `099dde3bb817b7dab9081eceb1fcaf8d3f6d2deb`.
- Run #252 `31092864441`, job `92587752202`.
- Result: 49/49 files and 317/317 tests PASS; build and clean-tree PASS.

### Task 4 — pure Course Manager model

- Valid RED head: `ead5f47aaf11f65eab4be75c0ab94b54f9242b70`; all 49 existing files / 317 tests passed and the model suite failed only because the new model module did not exist.
- GREEN: `85a4f906cddefa0d7488d8bb03aff461b6b179ac`.
- Run #257 `31094135812`, job `92591932964`.
- Result: 50/50 files and 336/336 tests PASS; build and clean-tree PASS.

### Task 5 — atomic Course Manager lesson editor routing

- RED ownership regression: `8587bb7b39c34a0b86aae02259229f562c10f144`.
- GREEN: `5c9b626501f4e5a54c07bec508f0c7320b04f195`.
- Run #263 `31094974079`, job `92594672738`.
- Result: 51/51 files and 337/337 tests PASS; build and clean-tree PASS.

### Task 6 — extracted drag units and transactional reorder routing

- RED: `1ccd66fc56c5cbc76b6176063a13ef8c7d4c5d9a` with formatter-only correction `b1d2a862dd235739114167a92aa14d1adcb93c8a`.
- GREEN checkpoint: `c6debcb3162658ad38138ef53d50756ca6485845`.
- Run #277 `31099940281`, job `92610784991`.
- Result: 51/51 files and 338/338 tests PASS; build and clean-tree PASS.

### Task 7 — extracted bulk actions and atomic bulk routing

- Valid RED: `e89065048d0a4640fadfcef6d1aaaf57b0ca33f6`; 50 existing files / 340 existing tests passed while the new UI regression failed because `BulkActionsBar.tsx` did not exist. New transaction integration tests passed.
- GREEN checkpoint: `524f15023e3b5040c357337b5df19a8de827c803`.
- Run #281 `31112746603`, job `92654470191`.
- Result: 51/51 files and 341/341 tests PASS; build and clean-tree PASS.

### Task 8 — final presentation decomposition

- RED commits: `de993a224f854114e5a0b730a67fa80c18fa2d02` and formatter-only correction `8623232e99f4b37625b8078e5ad1d5bd0f32d558`.
- GitHub Actions was in a service incident during the first RED attempt; runners failed or remained queued before repository tests executed.
- Implementation: `d21fc486705b7cd2ba67bf23e004ff2426394d22`.
- Formatting-only exact-head correction: `318c64d3ed08ac5c4e6a7b6c0833e6009e960aeb`.
- Independent disposable-clone verification on `d21fc486…`: typecheck PASS, 51/51 files and 342/342 tests PASS, production build PASS and clean tracked tree; lint reported only eleven Prettier formatting errors, all subsequently corrected by `318c64d…`.
- Vercel built exact `318c64d…`: 51/51 files and 342/342 tests PASS plus client/SSR/Nitro production build PASS.
- GitHub Actions run #285 for `318c64d…` was initially cancelled before repository steps because the hosted runner service was unavailable. A later rerun remained queued during the incident.
- Final official full gate is superseded by the later source-head run #289 described above after Task 9 cleanup.

### Task 9 — scope-audit regression cleanup

The exact predecessor-to-head audit discovered an Important finding: `src/components/CourseManagerModalContent.tsx` was a dead intermediate copy of the old monolith, while two source-level regressions had been redirected to that dead file rather than the authoritative decomposed runtime.

- Test-only RED topology was added so authoritative drag assertions read `LessonRow.tsx`, `TopicSection.tsx` and `useLessonReorder.ts`, while build purity requires `CourseManagerModalContent.tsx` to be absent.
- An accidental connector write created an empty root file named `NOPE` in commit `0b62d40f07ca6e2314962366ce3b10f9faa93fa2`. It was immediately removed by a normal forward commit; no rebase, amend, force-push or history rewrite occurred, and the net tree contains no `NOPE` file.
- RED test commit after forward cleanup: `545f95f00973b5b3a6f1b3296dd10505b7eddbc6`; formatter-only correction: `00896723051ff8793ae8b0e04207bc375b0a3eec`.
- Valid RED run #288 `31137221906`, job `92739174608`: typecheck PASS, lint PASS, 50/51 files and 341/342 tests PASS; the only failure was `build-purity-regression` because `CourseManagerModalContent.tsx` still existed.
- GREEN cleanup: `977841037bba79a53d090e2120b2498986b4a58a`, deleting only the dead intermediate source artifact.
- GREEN run #289 `31137356888`, job `92739603534`: full gate PASS as recorded above.

## Exact changed-file list at literal final source HEAD

Compared with `ceeee84682c55c663d09a6b171227a1d92171046`, the source head changes exactly these 30 paths:

1. `docs/superpowers/plans/2026-08-06-smart-planner-p1d-course-manager-transactions.md`
2. `docs/superpowers/specs/2026-08-06-smart-planner-p1d-course-manager-transactions-design.md`
3. `src/components/CourseManagerModal.tsx`
4. `src/components/FlexiblePlanner.tsx`
5. `src/components/OnboardingDialog.tsx`
6. `src/components/course-manager/BulkActionsBar.tsx`
7. `src/components/course-manager/LessonEditorDialog.tsx`
8. `src/components/course-manager/LessonRow.tsx`
9. `src/components/course-manager/SubjectHeader.tsx`
10. `src/components/course-manager/SubjectListPane.tsx`
11. `src/components/course-manager/SubjectWorkspace.tsx`
12. `src/components/course-manager/TopicSection.tsx`
13. `src/components/course-manager/course-manager-model.ts`
14. `src/components/course-manager/useLessonReorder.ts`
15. `src/components/schedule/useScheduleTransactions.ts` — rename/move from the old Flexible Planner-owned hook path
16. `src/lib/build-purity-regression.test.ts`
17. `src/lib/catalog-order-drag-regression.test.ts`
18. `src/lib/course-manager-lesson-edit-candidate.test.ts`
19. `src/lib/course-manager-lesson-edit-integration.test.ts`
20. `src/lib/course-manager-model.test.ts`
21. `src/lib/course-manager-reorder-bulk-candidates.test.ts`
22. `src/lib/course-manager-transaction-owner-regression.test.ts`
23. `src/lib/course-manager-ui-regression.test.ts`
24. `src/lib/flexible-planner-transactions-regression.test.ts`
25. `src/lib/flexible-planner-ux-regression.test.ts`
26. `src/lib/schedule-candidates.ts`
27. `src/lib/schedule-mode-regression.test.ts`
28. `src/lib/schedule-operations-integration.test.ts`
29. `src/lib/schedule-transactions.ts`
30. `src/routes/index.tsx`

No dependency manifest, lockfile, scheduler algorithm, review algorithm, catalog/progress persistence schema, Forecast component, Roadmap implementation, CI workflow, deployment configuration or production dependency is changed.

## Scope audit and explicit justifications

### Locked implementation paths

The Course Manager orchestration, extracted `course-manager/*` units, shared schedule transaction hook, `FlexiblePlanner`, schedule candidates/transactions and `src/routes/index.tsx` are the intended P1D implementation surface.

### Tests outside the plan's illustrative exact-name list

`course-manager-lesson-edit-candidate.test.ts`, `course-manager-lesson-edit-integration.test.ts` and `course-manager-reorder-bulk-candidates.test.ts` were added under `src/lib` to keep TDD RED/GREEN commits small and behavior-focused while the GitHub connector lacked a safe patch editor. They test the same candidate/integration responsibilities assigned by the plan to existing schedule test modules; they add coverage rather than introduce production scope.

`flexible-planner-ux-regression.test.ts`, `build-purity-regression.test.ts` and `schedule-mode-regression.test.ts` required narrow source-path updates because ownership and drag implementation moved to authoritative shared/extracted files. Task 9 additionally corrected the latter two so they can no longer pass by reading a dead implementation copy.

### `src/components/OnboardingDialog.tsx`

This path is outside the locked P1D production map. It contains a narrow compatibility shim introduced after a connector reconstruction typo changed the route prop from `canRestoreFactoryReset` to `canRestoreFactoryResetRollback`. The shim maps either name to the same boolean and changes no storage, onboarding, reset, planner or Course Manager behavior. It is explicitly disclosed here rather than silently treated as P1D functionality. Reverting it at completion time would require replacing the large route file solely to rename one prop through a connector that has no patch primitive; that reconstruction risk is greater than retaining the behavior-equivalent compatibility alias. Independent review should decide whether this separately justified incidental diff is acceptable.

## Acceptance criteria 1–25

1. **PASS — one shared controller.** `Dashboard` constructs one `useScheduleTransactions()` controller and passes that same object to Flexible Schedule and Course Manager.
2. **PASS — Flexible Schedule has no independent transaction history/listener.** It consumes `ScheduleTransactionController` through props.
3. **PASS — Course Manager has no independent transaction history/listener.** It consumes the same shared controller through props.
4. **PASS — schedule-affecting Course Manager operations use the shared boundary.** Date, mode, duration, subject/topic moves and canonical reorder build validated candidates and call the shared `executeMutation`.
5. **PASS — combined editor save is atomic.** Schedule-affecting lesson edit constructs one `edit-lesson` candidate and creates at most one history entry; integration coverage proves full undo.
6. **PASS — title-only lesson edits remain catalog-only.** Edit classification routes title-only changes through catalog persistence/backup, not schedule history.
7. **PASS — subject/topic names and emoji remain catalog-only.** Their handlers remain in Course Manager catalog orchestration.
8. **PASS — archive/restore/delete/import/Add Lesson stay outside schedule history.** The extracted controls emit callbacks only; catalog operations use catalog persistence/backup paths.
9. **PASS — fixed lesson requires a valid date.** Candidate validation rejects missing/invalid fixed dates.
10. **PASS — flexible lesson date semantics.** Empty date is allowed for flexible lessons; invalid non-empty dates are rejected.
11. **PASS — identity preservation.** Reorder/move candidate tests assert complete lesson ID sets exactly once.
12. **PASS — no automatic catalog reorder.** Reorder occurs only through explicit candidate builders and is disabled outside canonical roadmap ordering.
13. **PASS — bulk all-or-nothing and one history entry.** Bulk candidate validation precedes mutation; integration tests prove one committed entry and complete undo.
14. **PASS — validation failure has no side effects.** Invalid builders return errors before persistence/publication/history and UI success feedback is withheld.
15. **PASS — persistence failure rolls back and creates no history.** Schedule transaction integration coverage verifies rollback/no publication/no history on failure.
16. **PASS — undo restores complete snapshot.** Transaction snapshots include subjects and planner settings; integration coverage compares full snapshots.
17. **PASS — cross-surface undo uses shared history.** One Dashboard-owned controller survives modal open/close and is shared with Flexible Schedule, so committed mutations from either surface enter the same stack.
18. **PASS — global undo guard retained.** The shared hook retains editable-control protection for Ctrl/Cmd+Z rather than attaching listeners per child surface.
19. **PASS — external catalog publication invalidates stale history.** Shared-hook stale-history invalidation remains active and catalog publication is observed above both surfaces.
20. **PASS — catalog backup is distinct from schedule undo.** UI labels are explicitly `Hoàn tác thay đổi danh mục gần nhất` versus `Hoàn tác thay đổi lịch`.
21. **PASS — drag mechanics retained.** Dedicated handle, MIME `application/x-smart-lesson-id`, custom preview, top/bottom insertion targets, edge auto-scroll, modal scroll container and up/down fallback are asserted against authoritative extracted source.
22. **PASS — Course Manager UX retained.** Search/filter/sort, bulk selection, archive/restore, mobile detail/back and progress statistics are protected by model/UI regressions.
23. **PASS WITH EXPLICIT INCIDENTAL-DIFF JUSTIFICATION.** No scheduler/review/schema/Forecast/Roadmap/dependency/lockfile/workflow/deployment changes exist. `OnboardingDialog.tsx` is the sole non-P1D production-path exception and is documented above as a behavior-equivalent compatibility shim from connector reconstruction.
24. **PASS — exact final source head quality gates.** GitHub Actions run #289 on `977841037bba79a53d090e2120b2498986b4a58a` passed typecheck, lint, 342 tests, production build and clean-tree.
25. **PASS FOR IMPLEMENTER SELF-AUDIT / INDEPENDENT REVIEW PENDING.** The Important dead-artifact/source-regression finding discovered during Task 9 was fixed and verified GREEN. No known unresolved Critical or Important finding remains in implementer evidence. Independent reviewer acceptance is still required and may overturn this assessment.

## Nonblocking observations

- `npm install` reports one high-severity dependency audit item. P1D adds or changes no dependency, package manifest or lockfile; dependency remediation is outside this package and should be handled separately under explicit authorization.
- Seven lint warnings remain on the final source head: one Focus Timer hook dependency warning and six UI primitive fast-refresh warnings. They predate or sit outside P1D and are nonblocking under the current lint gate.
- The route test filename warning from TanStack Router (`src/routes/__root.test.tsx` does not export a Route) is existing test-layout noise and does not fail tests/build.
- GitHub Actions experienced a service incident during Task 8; the final source head later received a normal hosted runner and completed the entire official workflow successfully.

## Governance record

- `main` remains the exact predecessor during implementation; no merge was performed by this package workflow.
- PR #8 remains draft and unmerged at evidence creation time.
- No rebase, amend, squash, force-push, branch-history rewrite or auto-merge was used.
- The accidental empty `NOPE` commit is preserved in history and neutralized by a forward cleanup commit, consistent with the no-history-rewrite rule.
- The dead `CourseManagerModalContent.tsx` artifact was removed only after a valid RED regression demonstrated the defect.
- This evidence does not self-accept P1D.

## Review handoff

Independent review must fresh-read GitHub, bind the review to the exact evidence head and literal source head above, inspect predecessor-to-head scope, verify the final successful workflow, and independently decide one of:

- `P1D IMPLEMENTED / ACCEPTED / NOT_MERGED`, or
- `P1D IMPLEMENTED / REJECTED / NOT_MERGED`.

Merge requires a separate explicit authorization after acceptance.
