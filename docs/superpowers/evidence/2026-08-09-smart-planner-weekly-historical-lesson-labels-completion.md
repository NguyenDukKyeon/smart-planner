# Smart Planner WEEKLY-HF1 Historical Lesson Labels — Completion Evidence

**Package:** `WEEKLY-HF1`  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Exact predecessor:** `main@5ee26bab12944195f6bd785d738887c6af0afd07`  
**Branch:** `fix/weekly-historical-lesson-labels`  
**PR:** #13  
**Approved design commit:** `8ca366645ada03ecc370aceae8659b669468695b`  
**Final implementation-plan commit:** `9fd69a11e554be1babe4dde9197b463fcb83a33e`  
**Literal final source/test head:** `a6bbfee753b221f5435e727b3128d76a47053139`

## 1. Implemented behavior

Weekly Summary no longer uses raw internal lesson IDs as the visible label in these three sections:

1. `Trạng thái bài học cần lưu ý`
2. `Bài hoàn thành trong tuần nhưng ngoài kế hoạch tuần`
3. `Hoạt động từ bài đã xóa khỏi lộ trình`

The pure weekly read model now emits `lessonTitle` for weekly targets, out-of-plan completions, and archived activity while retaining `lessonId` as stable internal identity.

Canonical title precedence is:

1. live current-catalog lesson title;
2. archived standalone lesson title from `ArchivedCatalog.lessons`;
3. lesson title retained inside an archived full subject;
4. exact fallback `Bài học không còn trong lộ trình`.

Blank or whitespace-only titles fall through to the next source. Raw IDs are not used as fallback display text.

The route loads archived catalog metadata through the existing `loadArchivedCatalog()` storage boundary and passes the successful archive value explicitly into `selectWeeklyMetrics()`. Missing, invalid, or unavailable archive metadata degrades to an empty enrichment value. It is not added to `storageBlocked`, is not reset or overwritten, and does not change weekly arithmetic.

## 2. Task 1 — pure selector RED → GREEN

### Invalid pre-RED formatting run

Test-only candidate `283fda826e3c6118d686c23811519752a0d5825b` received Build diagnostics #387 (`31287007928`, job `93177552869`). Typecheck passed, but lint stopped on Prettier errors before tests. This run is **not** counted as RED.

Formatting-only successor: `5136eec2cc63e64cebb5899a24a9f8f89f0ff798`.

### Valid RED

Build diagnostics #388 on exact test-only head `5136eec2cc63e64cebb5899a24a9f8f89f0ff798`:

- run `31287092092`;
- job `93177783751`;
- checked PR merge ref `1e2f0bc4273aa8671db3f25665c31ff927623462`;
- typecheck PASS;
- lint PASS with 0 errors / 7 known warnings;
- tests intentionally FAIL: 62/63 files, 397/400 tests pass;
- exactly 3 failures prove `lessonTitle`/archive enrichment is absent in predecessor production behavior;
- build and clean-tree correctly do not run after the failing test gate.

The failures cover live weekly target title, live out-of-plan title, and archived/fallback resolution.

### GREEN

Minimal selector production change committed at `082a9f89f79452d245a8364db202cc2b9d110240`.

Build diagnostics #389 on that exact head:

- run `31287183019`;
- job `93178028133`;
- checked PR merge ref `9eb1b9d5045a01029ab5d6bb5392a68e71f40eee`;
- typecheck PASS;
- lint PASS with 0 errors / 7 known warnings;
- tests PASS: 63/63 files, 400/400 tests;
- `weekly-metrics.test.ts`: 7/7 PASS;
- production build PASS;
- clean-tree PASS;
- conclusion SUCCESS.

Selector coverage proves:

- live metadata overrides conflicting archive metadata;
- archived standalone metadata precedes archived-subject metadata;
- archived-subject-only metadata resolves;
- a blank standalone archive title falls through to a valid archived-subject title;
- missing metadata uses exactly `Bài học không còn trong lộ trình`;
- archived focus minutes remain 30 minutes in the focused fixture;
- existing weekly target/count/habit/time behavior remains green.

## 3. Task 2 — runtime presentation RED → GREEN

### Valid runtime RED

Runtime test-only head: `eafb4e3cfee094a7014cfc4f4f750f506b0c02bf`.

Build diagnostics #390:

- run `31287294229`;
- job `93178332049`;
- checked PR merge ref `4f90b7a9b2dd840560241c5122394249e98f5f0d`;
- typecheck PASS;
- lint PASS with 0 errors / 7 known warnings;
- tests intentionally FAIL: 63/64 files, 400/401 tests pass;
- sole failure: actual `WeeklyStudySummary` server-rendered HTML still contains `lesson-target-raw-123`, `lesson-outside-raw-456`, and `lesson-archived-raw-789` instead of the supplied resolved titles;
- existing completion status/date/focus presentation remains visible in the RED HTML;
- build and clean-tree correctly do not run after the failing test gate.

This is a direct behavioral presentation RED against the actual production component.

### Formatting-only/non-GREEN intermediate runs

After the component and route production corrections, the first exact route head produced Build diagnostics #392 (`31287558028`, job `93179044280`). Typecheck passed, but lint stopped on two EOF Prettier errors plus one new hook-dependency warning. It is **not** counted as GREEN.

A forward-only correction moved the archive read into the existing `weeklyMetrics` memo so `subjects` is a genuine dependency and restored the baseline warning set. Build diagnostics #394 (`31287696589`, job `93179413039`) passed typecheck but still stopped on one remaining Prettier line-wrap error in `src/routes/index.tsx`. It is **not** counted as GREEN.

No history was amended or rewritten. These were corrected with forward commits only.

### Final GREEN

Literal final source/test head: `a6bbfee753b221f5435e727b3128d76a47053139`.

Build diagnostics #395:

- run `31287818908`;
- job `93179734236`;
- checked PR merge ref `1986fa3685dfaed6b7f82a43b62b26ac0823a055`;
- typecheck PASS;
- lint PASS with 0 errors / 7 known pre-existing warnings;
- tests PASS: 64/64 files, 401/401 tests;
- `weekly-metrics.test.ts`: 7/7 PASS;
- `weekly-study-summary-runtime.test.tsx`: 1/1 PASS;
- production client/SSR/Nitro/Vercel-target build PASS and reran the full green suite;
- `git diff --exit-code` clean-tree gate PASS;
- conclusion SUCCESS.

The runtime test proves all three user-facing sections render:

- `Bài trạng thái cần lưu ý`;
- `Bài hoàn thành ngoài kế hoạch`;
- `Bài học không còn trong lộ trình`;

and do not render representative raw lesson IDs. It also preserves the existing visible details:

- `Hoàn thành, không rõ ngày`;
- `hoàn thành 2026-08-03`;
- `1 giờ 42 phút tập trung`.

## 4. Exact final source/test scope

Compare `5ee26bab12944195f6bd785d738887c6af0afd07...a6bbfee753b221f5435e727b3128d76a47053139` is 12 commits ahead, 0 behind and changes exactly seven paths:

1. `docs/superpowers/specs/2026-08-09-smart-planner-weekly-historical-lesson-labels-design.md`
2. `docs/superpowers/plans/2026-08-09-smart-planner-weekly-historical-lesson-labels.md`
3. `src/lib/weekly-metrics.ts`
4. `src/lib/weekly-metrics.test.ts`
5. `src/lib/weekly-study-summary-runtime.test.tsx`
6. `src/components/WeeklyStudySummary.tsx`
7. `src/routes/index.tsx`

Production patch audit:

- `WeeklyStudySummary.tsx`: exactly three visible-expression replacements from `lessonId` to `lessonTitle`;
- `weekly-metrics.ts`: adds archive type input, `lessonTitle` output fields, one precedence-preserving title map/fallback, and final title projection; weekly arithmetic remains structurally unchanged;
- `index.tsx`: adds `loadArchivedCatalog`, archive type, one empty enrichment constant, and archive enrichment inside the existing weekly-metrics memo; no archive failure enters `storageBlocked` and no storage mutation is added.

No scheduler, Forecast, Roadmap, Flexible Schedule, persistence/archive schema, dependency/lockfile, workflow, deployment, habits/goals/streaks, or broad P2 file changed.

## 5. Known pre-existing repository observations

The final green run still reports the known nonblocking repository observations, not introduced by WEEKLY-HF1:

- 7 lint warnings / 0 lint errors;
- npm audit reports 1 high-severity dependency advisory;
- TanStack route warning for `src/routes/__root.test.tsx`;
- Vite/vite-tsconfig-paths deprecation notices;
- post-job `.gitmodules` cleanup warning;
- GitHub Actions Node runtime deprecation notice.

They are outside this package scope and do not alter the exact green source/test evidence above.

## 6. Independent review request

Fresh Independent Review must bind to:

- predecessor `5ee26bab12944195f6bd785d738887c6af0afd07`;
- approved design `8ca366645ada03ecc370aceae8659b669468695b`;
- final plan `9fd69a11e554be1babe4dde9197b463fcb83a33e`;
- Task 1 valid RED #388 and GREEN #389;
- Task 2 valid RED #390 and final GREEN #395;
- literal final source/test head `a6bbfee753b221f5435e727b3128d76a47053139`;
- this evidence successor head once committed and exact-head CI completes.

Review must verify the full title precedence/fallback contract, blank-title fallthrough, raw-ID absence in all three sections, preserved completion/focus details, selector purity, enrichment-only archive failure behavior, exact final diff, and exact-head CI.

Keep PR #13 Draft/open/unmerged. Do not mark ready, merge, squash, rebase, force-push, amend published commits, rewrite history, or delete the branch. Merge remains a separate explicit authorization.
