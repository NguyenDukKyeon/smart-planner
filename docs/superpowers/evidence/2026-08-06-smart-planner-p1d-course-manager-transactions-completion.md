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
- Last production-behavior source commit: `ec220ab2752e023f0dbd9e71ff3a3587f1ea64e3`
- Literal final reviewed source/test HEAD covered by this evidence: `863bac4ddf9f4c546f09d17f4562a11c8ba3b0b3`
- Source topology at final reviewed source/test HEAD: 72 commits ahead of predecessor, 0 behind.
- Pull request: draft PR #8, open and unmerged.

No production source changed after `ec220ab2752e023f0dbd9e71ff3a3587f1ea64e3`. The latest recovery after prior evidence head `4511609f1afca87eb2975665e4161924f9914d7d` is test-only and closes the later independent review finding that the existing runtime presentation suite rendered only the initial open TopicSection state rather than proving the collapse interaction path.

This evidence commit is intentionally after the literal final reviewed source/test HEAD above. Independent review must bind runtime behavior and verification to `863bac4ddf9f4c546f09d17f4562a11c8ba3b0b3`, verify that production source remained frozen at `ec220ab2752e023f0dbd9e71ff3a3587f1ea64e3`, and verify that source/test-head → evidence-head is exactly one docs-only commit modifying only this record.

## Final exact-head GREEN gate

GitHub Actions `Build diagnostics` run #305:

- run id: `31235022388`
- job id: `93045807390`
- literal reviewed source/test head: `863bac4ddf9f4c546f09d17f4562a11c8ba3b0b3`
- checked PR merge ref: `05164e7aca1455ed61b7ecd990c31129e61aac8e` — merge of reviewed head into predecessor `ceeee84682c55c663d09a6b171227a1d92171046`
- `npm install`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS — 0 errors, 7 known nonblocking warnings
- `npm test`: PASS — 54/54 test files, 349/349 tests
- `course-manager-presentation-runtime.test.ts`: PASS — 3/3 tests
- `course-manager-topic-collapse-interaction.test.ts`: PASS — 1/1 test
- `course-manager-runtime-coverage-contract.test.ts`: PASS — 2/2 tests
- `npm run build`: PASS — test suite reran 54/54 files and 349/349 tests, followed by client, SSR and Nitro/Vercel production builds
- `git diff --exit-code`: PASS
- job conclusion: SUCCESS

The remaining seven lint warnings are outside the P1D recovery surface: one existing Focus Timer hook dependency warning and six existing React fast-refresh export warnings in UI primitives.

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
- Final official full gate is superseded by later Task 9 runs described below.

### Task 9 — scope-audit cleanup and independent-review recovery

The first Task 9 scope audit found a dead intermediate `src/components/CourseManagerModalContent.tsx` copy and regressions reading that non-runtime file.

- RED test commit after forward cleanup: `545f95f00973b5b3a6f1b3296dd10505b7eddbc6`; formatter-only correction: `00896723051ff8793ae8b0e04207bc375b0a3eec`.
- Valid RED run #288 `31137221906`, job `92739174608`: typecheck PASS, lint PASS, 50/51 files and 341/342 tests PASS; the only failure was `build-purity-regression` because `CourseManagerModalContent.tsx` still existed.
- GREEN cleanup: `977841037bba79a53d090e2120b2498986b4a58a`, deleting only the dead intermediate source artifact.
- GREEN run #289 `31137356888`, job `92739603534`: full gate PASS at 51/51 files and 342/342 tests.

A subsequent independent review found a separate Important Task 6.4 behavior-preservation regression. The approved plan required `LessonRow` and `TopicSection` to preserve predecessor behavior, but the extracted runtime had lost topic collapse/completed-and-remaining summary, lesson status/progress/details/full management menu including quick move-to-subject, and visible insertion-line feedback.

- Independent rejection comment: PR #8 issue comment `5211344413`.
- Corrected historical comment `5211359682` records `P1D IMPLEMENTED / REJECTED / NOT_MERGED` after the preceding finding was fresh-read.
- Recovery RED test commit: `50cbc176da983e66b4407b3728fe72b1ff71f918`.
- Valid RED run #291 `31141111294`, job `92751024900`: typecheck PASS, lint PASS, 50/51 files and 342/343 tests PASS; only the new authoritative presentation regression failed.
- Production recovery commits:
  - `5eeff3e8bf2f4f8436959283614ecdba7018f4ba` — restore lesson status/progress/details/full dropdown and quick-move callback surface.
  - `5e843a4672db70bb6e5dffe4b08011a583347c5b` — restore collapsible topic summary and visible insertion line/label.
  - `39c1238b0db506ca78ff13c4dcd064b3f41faa62` — reconnect completion/remaining data and route single-lesson quick move through `buildMoveLessonsCandidate` plus the shared `move-lessons` transaction boundary.
- Run #294 `31141660682`, job `92752657254` typechecked but failed lint only on three Prettier errors; it was not treated as GREEN.
- Formatting-only forward commits: `71e522b3f460db04a1d0091d39c7b11d885f3528` and `ec220ab2752e023f0dbd9e71ff3a3587f1ea64e3`.
- Production-recovery GREEN run #296 `31141823263`, job `92753150350`: typecheck PASS, lint PASS with 0 errors/7 known warnings, 51/51 files and 343/343 tests PASS, production build PASS, clean-tree PASS.

A fresh independent re-review then found one remaining Important verification gap: the restored production behavior was still protected only by source-string inspection in `catalog-order-drag-regression.test.ts`.

- Independent verification-gap rejection comment: PR #8 issue comment `5212784605`.
- RED coverage-contract commit: `cf25889b205050f74b213df6bddb9f87f99ecfeb`.
- Valid RED run #298 `31159077248`, job `92805053031`: typecheck PASS, lint PASS; 51/52 test files and 343/344 tests PASS; only the new runtime coverage contract failed because `course-manager-presentation-runtime.test.ts` did not yet exist.
- GREEN runtime-regression commit: `0967d6b6c5cced4634914ea68405e8b0daf9822c`.
- The runtime suite uses existing React/ReactDOM only and adds no dependency. It renders authoritative production `TopicSection` and `LessonRow` via `renderToStaticMarkup`; a minimal Radix dropdown mock exposes menu children/callbacks in Node without replacing either production Course Manager component.
- Runtime assertions prove open-state topic semantics and completed/remaining summary, visible active insertion feedback, lesson status/progress/details/full management actions, exact quick-move callback IDs, and all predecessor progress-state labels.
- GREEN run #299 `31159303627`, job `92805769615`: typecheck PASS, lint PASS with 0 errors/7 known warnings, 53/53 files and 347/347 tests PASS, production build PASS, clean-tree PASS.

### Task 9.7 — close the remaining TopicSection interaction-proof gap

A later fresh Independent Reviewer accepted the production restoration but rejected acceptance because the runtime presentation suite still rendered only the initial open TopicSection state. It did not exercise the required `open → collapsed → reopened` interaction path.

- Independent rejection comment: PR #8 issue comment `5221237680`.
- Initial RED contract commit: `e7b0a2d8fbe02ab01cc1497dfbe9ebee1ba513f9`.
- Run #301 `31234513608`, job `93044488142` failed at lint on one Prettier error before tests executed. It is explicitly **not** counted as valid RED.
- Formatter-only RED correction: `836a645d03ee663066b3bd22dea48d5dfdebe765`.
- Valid RED run #302 `31234598868`, job `93044702586`, checked merge ref `084f6c0a91dfbc3eaa4f73bb3448908946ea52e5`:
  - typecheck PASS;
  - lint PASS — 0 errors / 7 known warnings;
  - tests: 52/53 files and 347/348 tests PASS;
  - sole failure: `course-manager-runtime-coverage-contract.test.ts` → `requires a runtime TopicSection collapse interaction regression`, because `course-manager-topic-collapse-interaction.test.ts` did not yet exist;
  - build/clean-tree skipped after the failing test gate.
- Contract marker correction: `0ddf42c7f7eb21ed1f8f5789273b527802429889`; this preserved RED semantics and corrected only the expected literal `aria-expanded` markers.
- Interaction suite commit: `eadaf1fb0166ed920d02a0b1d293205924b370ec`.
- Run #304 `31234886032`, job `93045449341` passed typecheck but failed lint on two Prettier errors in the new test before tests ran. It is explicitly **not** counted as GREEN.
- Formatter-only interaction correction / literal final source-test head: `863bac4ddf9f4c546f09d17f4562a11c8ba3b0b3`.
- Valid GREEN run #305 `31235022388`, job `93045807390`, checked merge ref `05164e7aca1455ed61b7ecd990c31129e61aac8e`: typecheck PASS; lint PASS with 0 errors/7 known warnings; 54/54 test files and 349/349 tests PASS; full production build PASS; clean-tree PASS.

The interaction suite:

- imports and renders the actual production `TopicSection` component;
- does not read production component source with `fs.readFile`;
- uses only existing React/ReactDOM/Vitest dependencies and adds no package or lockfile change;
- uses a minimal test-only state harness plus Collapsible adapter because this repository does not include a DOM interaction testing dependency;
- captures the `onOpenChange` supplied by production `TopicSection` and exposes a test trigger that invokes that exact callback path;
- proves initial open state (`aria-expanded="true"`) with lesson content visible;
- invokes the runtime trigger, proves state becomes closed, rerenders, then proves `aria-expanded="false"` and lesson content is absent;
- invokes the trigger again, rerenders, and proves `aria-expanded="true"` and lesson content returns.

This is a component-runtime interaction harness, not a browser pointer/click DOM simulation. Its purpose is specifically to prove the production `TopicSection` state/onOpenChange collapse contract that the preceding review identified as untested.

## Exact changed-file list at literal final reviewed source/test HEAD

Compared with `ceeee84682c55c663d09a6b171227a1d92171046`, reviewed head `863bac4ddf9f4c546f09d17f4562a11c8ba3b0b3` changes exactly these 34 paths:

1. `docs/superpowers/evidence/2026-08-06-smart-planner-p1d-course-manager-transactions-completion.md`
2. `docs/superpowers/plans/2026-08-06-smart-planner-p1d-course-manager-transactions.md`
3. `docs/superpowers/specs/2026-08-06-smart-planner-p1d-course-manager-transactions-design.md`
4. `src/components/CourseManagerModal.tsx`
5. `src/components/FlexiblePlanner.tsx`
6. `src/components/OnboardingDialog.tsx`
7. `src/components/course-manager/BulkActionsBar.tsx`
8. `src/components/course-manager/LessonEditorDialog.tsx`
9. `src/components/course-manager/LessonRow.tsx`
10. `src/components/course-manager/SubjectHeader.tsx`
11. `src/components/course-manager/SubjectListPane.tsx`
12. `src/components/course-manager/SubjectWorkspace.tsx`
13. `src/components/course-manager/TopicSection.tsx`
14. `src/components/course-manager/course-manager-model.ts`
15. `src/components/course-manager/useLessonReorder.ts`
16. `src/components/schedule/useScheduleTransactions.ts` — rename/move from the old Flexible Planner-owned hook path
17. `src/lib/build-purity-regression.test.ts`
18. `src/lib/catalog-order-drag-regression.test.ts`
19. `src/lib/course-manager-lesson-edit-candidate.test.ts`
20. `src/lib/course-manager-lesson-edit-integration.test.ts`
21. `src/lib/course-manager-model.test.ts`
22. `src/lib/course-manager-presentation-runtime.test.ts`
23. `src/lib/course-manager-reorder-bulk-candidates.test.ts`
24. `src/lib/course-manager-runtime-coverage-contract.test.ts`
25. `src/lib/course-manager-topic-collapse-interaction.test.ts`
26. `src/lib/course-manager-transaction-owner-regression.test.ts`
27. `src/lib/course-manager-ui-regression.test.ts`
28. `src/lib/flexible-planner-transactions-regression.test.ts`
29. `src/lib/flexible-planner-ux-regression.test.ts`
30. `src/lib/schedule-candidates.ts`
31. `src/lib/schedule-mode-regression.test.ts`
32. `src/lib/schedule-operations-integration.test.ts`
33. `src/lib/schedule-transactions.ts`
34. `src/routes/index.tsx`

No dependency manifest, lockfile, scheduler algorithm, review algorithm, catalog/progress persistence schema, Forecast component, Roadmap implementation, CI workflow, deployment configuration or production dependency is changed.

## Scope audit and explicit justifications

### Locked implementation paths

The Course Manager orchestration, extracted `course-manager/*` units, shared schedule transaction hook, `FlexiblePlanner`, schedule candidates/transactions and `src/routes/index.tsx` are the intended P1D implementation surface.

### Tests outside the plan's illustrative exact-name list

`course-manager-lesson-edit-candidate.test.ts`, `course-manager-lesson-edit-integration.test.ts` and `course-manager-reorder-bulk-candidates.test.ts` were added under `src/lib` to keep TDD RED/GREEN commits small and behavior-focused while the GitHub connector lacked a patch primitive. They test responsibilities assigned by the plan to existing candidate/integration suites.

`flexible-planner-ux-regression.test.ts`, `build-purity-regression.test.ts` and `schedule-mode-regression.test.ts` received narrow source-path updates because ownership and drag implementation moved to authoritative shared/extracted files. Task 9 also corrected source regressions so they cannot pass by reading a dead implementation copy.

`course-manager-runtime-coverage-contract.test.ts` and `course-manager-presentation-runtime.test.ts` close independent review comment `5212784605`. `course-manager-topic-collapse-interaction.test.ts` is the narrower follow-up closure for comment `5221237680` and proves the open/closed/reopen runtime state path without adding a DOM-test dependency.

### `src/components/OnboardingDialog.tsx`

This path is outside the locked P1D production map. It contains a narrow compatibility shim introduced after a connector reconstruction typo changed the route prop from `canRestoreFactoryReset` to `canRestoreFactoryResetRollback`. The shim maps either name to the same boolean and changes no storage, onboarding, reset, planner or Course Manager behavior. It remains explicitly disclosed for independent review.

### Task 9 recovery scope

The production recovery from the first behavior-preservation rejection changed only four logical paths relative to previous evidence head `2aa145dd5247362779662308adbfc6f19f074846`: `CourseManagerModal.tsx`, `LessonRow.tsx`, `TopicSection.tsx`, and `catalog-order-drag-regression.test.ts`. The modal recovery commit itself added exactly 43 lines and deleted 0 lines, avoiding full-file transcription drift. The two final production commits were formatting-only corrections demanded by the repository lint gate.

The verification-gap recovery from evidence head `57b8346fe967080dee52134296113a1ae6c6a6ab` to reviewed head `0967d6b6c5cced4634914ea68405e8b0daf9822c` changed exactly two test-only files: `course-manager-runtime-coverage-contract.test.ts` and `course-manager-presentation-runtime.test.ts`.

The final interaction-proof recovery from evidence head `4511609f1afca87eb2975665e4161924f9914d7d` to reviewed head `863bac4ddf9f4c546f09d17f4562a11c8ba3b0b3` is exactly five commits, 0 behind, and exactly two test-only paths:

- `src/lib/course-manager-runtime-coverage-contract.test.ts` — +16 / -0 relative to the prior evidence head;
- `src/lib/course-manager-topic-collapse-interaction.test.ts` — new, +189 / -0.

No production file changed in this final recovery.

## Acceptance criteria 1–25

1. **PASS — one shared controller.** `Dashboard` constructs one `useScheduleTransactions()` controller and passes that same object to Flexible Schedule and Course Manager.
2. **PASS — Flexible Schedule has no independent transaction history/listener.** It consumes `ScheduleTransactionController` through props.
3. **PASS — Course Manager has no independent transaction history/listener.** It consumes the same shared controller through props.
4. **PASS — schedule-affecting Course Manager operations use the shared boundary.** Date, mode, duration, subject/topic moves, quick single-lesson move-to-subject and canonical reorder build validated candidates and call shared `executeMutation`.
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
21. **PASS FOR IMPLEMENTER RECOVERY AUDIT — drag mechanics and predecessor feedback retained.** Dedicated handle, MIME, custom preview, top/bottom targets, edge auto-scroll, modal scroll container and up/down fallback remain under authoritative architecture regressions; active visible insertion feedback is rendered from production `TopicSection` in the runtime presentation suite.
22. **PASS FOR IMPLEMENTER RECOVERY AUDIT — Course Manager UX retained and TopicSection collapse path now exercised.** Search/filter/sort, bulk selection, archive/restore and mobile navigation remain under existing regressions; topic completed/remaining summary and lesson status/progress/details/full menu are rendered from authoritative production components; quick move callback wiring is executed; the focused interaction suite additionally proves production `TopicSection` open → closed → reopened state/content behavior through its supplied `onOpenChange` path.
23. **PASS WITH EXPLICIT INCIDENTAL-DIFF JUSTIFICATION.** No scheduler/review/schema/Forecast/Roadmap/dependency/lockfile/workflow/deployment changes exist. `OnboardingDialog.tsx` is the sole non-P1D production-path exception and is documented above as a behavior-equivalent compatibility shim from connector reconstruction.
24. **PASS — exact final reviewed source/test head quality gates.** GitHub Actions run #305 on the PR merge ref for `863bac4ddf9f4c546f09d17f4562a11c8ba3b0b3` passed typecheck, lint, 349 tests, production build and clean-tree.
25. **IMPLEMENTER RECOVERY AUDIT HAS NO KNOWN CRITICAL/IMPORTANT GAP / FRESH INDEPENDENT REVIEW REQUIRED.** Prior Important findings, including comment `5221237680`, have valid RED evidence and focused GREEN recovery evidence. This is not self-acceptance. Task 9 still requires a fresh Independent Reviewer disposition and that reviewer may reject this assessment.

## Nonblocking observations

- `npm install` reports one high-severity dependency audit item. P1D adds or changes no dependency, package manifest or lockfile; dependency remediation is outside this package and requires separate authorization.
- Seven lint warnings remain on the final reviewed source/test head: one Focus Timer hook dependency warning and six UI primitive fast-refresh warnings. They predate or sit outside P1D and are nonblocking under the configured gate.
- The TanStack Router warning that `src/routes/__root.test.tsx` does not export a Route is existing test-layout noise and does not fail tests/build.
- Post-job checkout cleanup still warns that `smart-study-habit-planner-deploy` has no URL in `.gitmodules`; repository verification steps themselves completed successfully.
- GitHub Actions experienced a service incident during Task 8; later reviewed heads received normal hosted runners and completed the entire official workflow successfully.

## Governance record

- `main` remains the exact predecessor during implementation; no merge was performed by this package workflow.
- PR #8 remains draft and unmerged at evidence creation time.
- No rebase, amend, squash, force-push, branch-history rewrite or auto-merge was used on the P1D implementation branch.
- The accidental empty `NOPE` commit from the earlier Task 9 audit remains preserved in history and neutralized by a forward cleanup commit.
- The dead `CourseManagerModalContent.tsx` artifact was removed only after a valid RED regression demonstrated the defect.
- The first independent behavior-preservation rejection was not dismissed: it was reproduced with a new authoritative RED regression before production recovery.
- The source-string verification-gap rejection was not dismissed: it was reproduced by run #298 before the runtime presentation suite was added.
- The subsequent interaction-proof rejection `5221237680` was not dismissed: run #302 reproduced the absence of the required interaction suite before the focused GREEN test was added.
- Runs #301 and #304 are recorded as lint-only intermediate failures and are not used as RED/GREEN behavioral evidence.
- This evidence does not self-accept P1D.

## Review handoff

Independent review must fresh-read GitHub and bind the review to:

- predecessor `ceeee84682c55c663d09a6b171227a1d92171046`;
- last production-behavior source commit `ec220ab2752e023f0dbd9e71ff3a3587f1ea64e3`;
- literal final reviewed source/test head `863bac4ddf9f4c546f09d17f4562a11c8ba3b0b3`;
- this evidence head, verifying source/test-head → evidence-head is one docs-only commit modifying only this completion record;
- production-recovery GREEN #296, runtime-presentation GREEN #299, valid interaction RED #302 and final interaction GREEN #305;
- independent rejection comments `5211344413`, `5212784605` and `5221237680`, plus corrected historical comment `5211359682`;
- predecessor-to-head scope, including the disclosed `OnboardingDialog.tsx` compatibility shim;
- all 25 acceptance criteria without relying on implementer self-audit.

Independent reviewer must decide exactly one of:

- `P1D IMPLEMENTED / ACCEPTED / NOT_MERGED`, or
- `P1D IMPLEMENTED / REJECTED / NOT_MERGED`.

No merge occurs in Task 9. Merge requires separate explicit authorization after acceptance.
