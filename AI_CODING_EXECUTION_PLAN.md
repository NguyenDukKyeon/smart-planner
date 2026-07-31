> [!WARNING]
> **TÀI LIỆU LƯU TRỮ:** File này là kế hoạch cũ và không còn là nguồn đặc tả hiện hành.
> Khi tiếp tục phát triển Smart Planner, ưu tiên `SMART_PLANNER_REDESIGN_SPEC.md`, `AGENTS.md` và code/test hiện tại.

# AI Coding Execution Plan — Smart Study & Habit Planner

## 0. Document control

| Field               | Value                                                                                |
| ------------------- | ------------------------------------------------------------------------------------ |
| Status              | **APPROVED FOR SEQUENTIAL EXECUTION**                                                |
| Workspace           | `D:\Downloads\Smart-Study-And-Habit-Planner-main\Smart-Study-And-Habit-Planner-main` |
| Created             | 2026-07-26                                                                           |
| Product language    | Vietnamese                                                                           |
| Execution model     | One implementation package, then one independent read-only audit                     |
| Source-control note | This workspace currently has no `.git` metadata                                      |

This file is the execution authority for the approved product, behavioral,
UI/UX, accessibility, responsive, data-safety, and technical remediation plan.
It is intended to be handed to coding agents one work package at a time.

Do not edit this document while implementing a work package. Report progress in
the agent response. A change to this authority requires explicit user approval.

### Authority order

1. The user's latest explicit instruction.
2. The applicable `AGENTS.md`.
3. This execution plan.
4. Current source code and tests.
5. An implementing agent's report.

If current source contradicts an assumption in this plan, stop and report the
exact conflict. Do not silently invent a replacement design.

### How to launch an agent

The user or orchestrator must name exactly one package:

```text
Read AGENTS.md and AI_CODING_EXECUTION_PLAN.md completely.
Execute only <PACKAGE-ID>.
Predecessor verdict: <ACCEPTED VERDICT TEXT>.
Predecessor accepted workspace digest: <SHA-256 DIGEST>.
Do not begin any successor package.
```

Except for `EXEC-00`, the prompt must also include the predecessor auditor's
exact `ACCEPTED` verdict and accepted post-package workspace digest. During
preflight, regenerate the current digest with the canonical manifest command
and compare it byte-for-byte with the accepted digest. If the package ID,
verdict, or digest is absent—or the current digest differs—the agent must stop
without editing files and request re-audit of the current workspace.

---

## 1. Outcome and approved product decisions

### Product outcome

The application must help a Vietnamese self-learner:

1. Create or import a learning roadmap safely.
2. Immediately understand the next useful study action.
3. Start and finish a focus session with reliable persistence.
4. Record lessons and supportive habits with minimal friction.
5. Review accurate weekly progress and adjust the plan.
6. Reset, replace, back up, and restore data without silent loss.

Grade 11 remains available as **sample data**. It is not the identity of the
whole product.

### Approved behavioral decisions

These decisions are no longer open to an implementing agent:

- A "study day" means at least one of:
  - one lesson completed on that date;
  - the explicit study habit completed on that date; or
  - one focus-mode `StudySession` with `durationSeconds > 0` on that date.
- The same study-day rule applies to today and past dates.
- A focus session crossing local midnight contributes study evidence to every
  local date with a positive-duration overlap, using the existing
  `studySecondsOnDate` splitting behavior.
- The explicit study-habit evidence is the stable historical
  `habitLog[date].study === true`. Renaming, archiving, or later deleting the
  current habit definition must not erase already recorded study-day evidence.
  Other custom habits do not become study evidence merely because they use a
  study icon.
- Legacy `UNDATED_COMPLETION` means the lesson is completed but its date is
  unknown. It may satisfy the lesson's target status and must be labelled
  `"Hoàn thành, không rõ ngày"`, but it never contributes to a dated streak,
  a "completed this week" count, or an out-of-plan weekly completion.
- User-facing copy uses **"ngày học liên tiếp"**, not guilt-oriented
  "chuỗi kỷ luật".
- Lesson progress, habit progress, and study time remain separate measures.
  They must not be added into a composite "discipline" score.
- An early lesson completion counts as meeting its later weekly lesson target.
- A completion made during the week for a lesson not targeted that week is
  shown separately as an out-of-plan completion.
- XP, coins, rewards, and streak features remain available but are secondary
  to the next study action.
- New users receive no automatic notification, sound, or permission prompt.
- Reminder behavior is in-app while the page is open unless a real background
  implementation is separately approved.
- Every automatic deadline, push, or habit-reminder effect requires both
  `onboardingComplete === true` and a persisted, explicit opt-in for that
  specific reminder feature. Completing onboarding is not opt-in.
- A control must not promise snooze/rescheduling if no scheduler exists.
- Destructive reset or replacement requires clear scope, confirmation, a
  recoverable snapshot, and an undo/restore path.
- No runtime or development dependency may be added by any package in this
  plan. If a package cannot be completed without one, report `BLOCKED` and ask
  for separate approval.

### Global invariants

Every package must preserve the following:

- No external API-contract change.
- No database or authentication change.
- No persisted `ProgressState` schema change.
- Existing valid local data remains readable.
- Invalid/corrupt data is never overwritten automatically.
- Do not use `localStorage.clear()`.
- Do not remove existing user capabilities merely to simplify the layout.
- Do not add gamification, badges, streak mechanics, artificial scarcity,
  guilt messaging, addictive mechanics, or unsolicited notifications.
- Do not commit, push, open a PR, deploy, or rewrite Lovable history.
- Preserve unrelated existing files and changes.
- Do not fabricate command results, browser observations, screenshots, test
  counts, performance numbers, or accessibility results.

---

## 2. Baseline that must be reproduced

The following is prior observation, not acceptance evidence for a new agent.
`EXEC-00` must reproduce it independently.

### Repository snapshot

- 114 source/config/document files were found before this document was added,
  excluding `node_modules`, `.output`, `.wrangler`, `dist`, and `build`.
- There is no `.git` directory in the effective repository.
- The project uses React 19, TanStack Start/Router/Query, Vite 8, Tailwind 4,
  Radix/shadcn-style primitives, Sonner, and browser storage.
- Tests are under `src/lib/*.test.ts`.

### Known command baseline

| Command                         | Previously observed result                            |
| ------------------------------- | ----------------------------------------------------- |
| `bun install --frozen-lockfile` | Exit 0                                                |
| `bunx tsc --noEmit`             | Exit 1                                                |
| `bun test`                      | Exit 1: 29 pass, 1 fail, 30 tests, 86 assertions      |
| `bun run lint`                  | Exit 0 with 6 Fast Refresh warnings                   |
| `bun run build`                 | Exit 0; initial route chunk about 867.45 kB           |
| `bun run test`                  | Invalid as a gate: script currently echoes `No tests` |

The known failing unit test expects a valid focus session today to make the
study streak equal `1`. This is why the approved study-day selector correction
is owned by `EXEC-01`, even though the remaining streak UI/copy belongs to
`EXEC-04`. Without this dependency correction, `EXEC-01` could never satisfy
the mandatory full-test gate.

### Known high-risk source areas

- `src/routes/index.tsx`
- `src/routes/__root.tsx`
- `src/lib/progress-store.ts`
- `src/lib/custom-subjects.ts`
- `src/lib/app-backup.ts`
- `src/lib/push-notification-store.ts`
- `src/components/FocusTimerModal.tsx`
- `src/components/SettingsModal.tsx`
- `src/components/CourseImportExportModal.tsx`
- `src/components/TodayPanel.tsx`
- `src/components/WeeklyStudySummary.tsx`
- `src/components/WeeklyChart.tsx`

### Known app-owned local-storage keys

The scoped reset registry must cover at least these current keys:

```text
hocvien-progress-v2
hocvien-progress-v2-backup-before-v5
hocvien-custom-subjects-v1
hocvien-custom-subjects-backup-before-delete
hocvien-archived-catalog-v1
hocvien-focus-timer-v2
hocvien-focus-timer-lock-v1
hocvien-full-backup-before-import
hocvien_push_preferences_v1
hocvien_push_history_v1
hocvien-workspace-title-v1
hocvien-identity-title-v1
```

`EXEC-02` must introduce exactly one reset-rollback key:

```text
hocvien-reset-rollback-v1
```

It must be included in the same owned-key registry. Unknown origin keys must
never be removed.

---

## 3. Sequential execution and acceptance protocol

### Package ledger

| Order | Package            | Scope                                                           | Dependency          |
| ----: | ------------------ | --------------------------------------------------------------- | ------------------- |
|     1 | `EXEC-00`          | Read-only runtime/visual baseline                               | None                |
|     2 | `EXEC-01`          | Contracts, runtime/type errors, real gates, study-day selector  | `EXEC-00 ACCEPTED`  |
|     3 | `EXEC-02`          | Persistence recovery, reset/onboarding, import/undo             | `EXEC-01 ACCEPTED`  |
|     4 | `EXEC-03`          | Honest opt-in notification/reminder behavior                    | `EXEC-02 ACCEPTED`  |
|     5 | `EXEC-04`          | Streak UI, weekly metrics, original/effective dates, zero hours | `EXEC-03 ACCEPTED`  |
|     6 | `EXEC-05A`         | First-use/loading/empty/error states and dashboard hierarchy    | `EXEC-04 ACCEPTED`  |
|     7 | `EXEC-05B`         | Timer accessibility, forms, design system, responsive           | `EXEC-05A ACCEPTED` |
|     8 | `EXEC-06`          | Lazy loading, locale, microcopy, URL navigation                 | `EXEC-05B ACCEPTED` |
|     9 | `ACCEPTANCE-FINAL` | Full production-path audit                                      | `EXEC-06 ACCEPTED`  |

Packages must not run in parallel. Shared state, route, and component files make
parallel implementation unsafe.

### Implementer status

An implementing agent must return exactly one:

- `COMPLETE`: every package criterion and mandatory gate passed.
- `PARTIAL`: useful scoped changes exist, but at least one criterion failed or
  remains unverified.
- `BLOCKED`: no safe progress is possible without new authority or an external
  environment change.

`COMPLETE` is implementation evidence only. It does not unlock the next
package.

`PARTIAL` keeps the same package active. Create a correction prompt for its
unmet criteria; do not launch an audit as an acceptance gate and do not advance.

`BLOCKED` keeps the same package active and prohibits retries until the reported
external condition changes or the user grants the missing authority. On
resumption, repeat preflight and regenerate the full workspace manifest.

### Independent auditor status

An auditor works in a fresh context and makes no repository edits. It must
return exactly one:

- `ACCEPTED`
- `REJECTED`
- `BLOCKED`

Only `ACCEPTED` unlocks the successor package. The auditor must reproduce
source, command, runtime, storage, and browser evidence rather than trust the
implementer's report.

Every verdict is bound to the exact post-package workspace manifest digest in
the audit report. Generated directories excluded by the manifest command do not
affect it. Any other workspace change after the verdict must be classified:

- a successor package's declared change is evaluated by that successor audit;
- an undeclared or out-of-package change invalidates the active package audit
  and requires re-audit before advancement.

### Correction flow

If an implementation returns `PARTIAL` or an audit returns `REJECTED`:

1. Create one correction prompt for the same package only.
2. Include each unmet/failed criterion and the implementer/auditor evidence.
3. Do not add adjacent backlog work.
4. Re-run the same independent audit after correction.

If an audit returns `BLOCKED`, do not create a correction that works around the
missing evidence. Resume the same read-only audit only after the blocking
condition changes.

---

## 4. Global evidence and reporting requirements

### Preflight for every implementation package

1. Read `AGENTS.md` and this file completely.
2. For every package except `EXEC-00`, confirm the exact package ID,
   predecessor `ACCEPTED` verdict, and accepted post-package workspace digest.
3. For every package except `EXEC-00`, generate the current canonical
   manifest/digest and require an exact match to the accepted predecessor
   digest. On mismatch, stop and request re-audit.
4. For `EXEC-00`, no predecessor exists: generate the canonical digest at the
   start as its baseline and require the end-of-package digest to match it.
5. Identify existing user changes before editing.
6. Read all package-owned source, tests, types, and comparable patterns.
7. Run the narrowest relevant baseline tests before editing.

Because Git metadata is absent, every implementer and auditor must generate the
complete source/config/test/document manifest below before work and after work.
Do not write the manifest into the repository; include its rows and digest in
the response.

```powershell
$files = @(
  rg --files `
    -g '!node_modules/**' `
    -g '!.output/**' `
    -g '!.wrangler/**' `
    -g '!dist/**' `
    -g '!build/**' |
    Sort-Object
)
$rows = @(
  $files | ForEach-Object {
    $hash = (Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash.ToLowerInvariant()
    "$_`t$hash"
  }
)
$manifest = $rows -join "`n"
$sha = [System.Security.Cryptography.SHA256]::Create()
try {
  $digest = (
    [BitConverter]::ToString(
      $sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($manifest))
    )
  ).Replace('-', '').ToLowerInvariant()
} finally {
  $sha.Dispose()
}
$rows
"FILES=$($files.Count)"
"DIGEST=$digest"
```

The implementer must diff the complete before/after rows and prove every
changed path is inside the package's closed allowed-file set. The auditor must
regenerate, not reuse, both the manifest and digest. A hash only for files the
implementer expected to edit is insufficient.

### Mandatory technical gate

Run each command separately and report its actual exit code:

```powershell
bun run typecheck
bun run test
bun run lint
bun run build
```

For `EXEC-00`, before real scripts exist, use:

```powershell
bunx tsc --noEmit
bun test
bun run lint
bun run build
```

Do not run a formatter over the repository. Do not call a green build a green
typecheck or test run.

### Reproducible failure-injection policy

Do not add a production debug query, hidden UI control, global backdoor, or
shipping test route merely to satisfy an audit.

Use these approved mechanisms:

- storage/quota/multi-key failures: inject an internal storage adapter into pure
  storage functions and use an in-memory faulting adapter in unit tests;
- root error presentation: keep the error presentation separate from the
  router error hook and verify its Vietnamese copy/semantics with a
  render-to-static-markup test;
- lazy-module failure: inject the dynamic importer into a pure loader boundary
  and reject it in a unit test;
- invalid stored data: set the real app-owned browser-storage key before reload;
- 404: navigate to a real nonexistent URL;
- browser permission: instrument the browser API when the browser tool supports
  it without source modification; otherwise prove call sites with unit tests
  and verify the explicit permission button manually.

`EXEC-00` is read-only and therefore may mark root-error, quota-failure, and
lazy-import-failure visual states `UNVERIFIED` when no supported source-free
trigger exists. That alone does not block `EXEC-00`; the report must identify
the owning later package. After the owning package, its deterministic unit test
is mandatory. Browser evidence remains mandatory for every state that has a
real user-reachable trigger.

### Required implementation report

Every implementer report must contain:

1. Package ID and claimed status.
2. Full before/after manifest rows, digest, and classified diff.
3. Files changed, with one reason per file.
4. Important symbols and behavior changed.
5. Tests added or changed.
6. Every command, exit code, and real result.
7. Browser scenarios and viewport sizes actually exercised.
8. Storage values before and after persistence scenarios where applicable.
9. Unverified criteria and remaining risks.
10. Confirmation that no successor package was started.
11. Final line containing only `COMPLETE`, `PARTIAL`, or `BLOCKED`.

### Stop conditions for every package

Stop without broadening scope when:

- predecessor acceptance is missing;
- a required browser cannot be connected for a package with visual criteria;
- install would change the lockfile unexpectedly;
- a new dependency appears necessary;
- unrelated user changes overlap owned files and cannot be preserved safely;
- a data migration or external contract change appears necessary;
- a mandatory result cannot be reproduced.

---

## 5. `EXEC-00` — Read-only baseline

### Objective

Create reproducible runtime, visual, responsive, keyboard, and storage evidence
before implementation. Do not edit source/config/test files.

### Allowed

- Read source/config/tests.
- `bun install --frozen-lockfile`.
- Run checks, build, dev server, and HTTP probes.
- Use the provided in-app browser.
- Set browser local/session storage to construct test states.
- Capture screenshots in the agent response.
- Generate ignored cache/build artifacts.

### Forbidden

- Editing or formatting repository files.
- Adding dependencies or updating `bun.lock`.
- Using standalone Playwright or Computer Use as a substitute when the approved
  browser workflow is unavailable.
- Fixing any defect.
- Starting `EXEC-01`.

### Required command evidence

```powershell
bun install --frozen-lockfile
bunx tsc --noEmit
bun test
bun run lint
bun run build
bun run dev
```

Confirm:

- `/` returns HTTP 200;
- a nonexistent route returns HTTP 404;
- the exact dev-server process is stopped afterward.

### Required browser matrix

Viewports:

- 320×800
- 360×800
- 768×1024
- 1440×900

States and journeys:

1. First use before onboarding choice.
2. Empty workspace choice.
3. Sample-data choice.
4. Empty subjects and lessons.
5. Hydration/loading.
6. Complete and undo a normal lesson.
7. Open Focus Timer from Today.
8. Open Focus Timer from a notification when reproducible.
9. 404. Attempt root error only through a supported source-free browser trigger;
        otherwise mark it `UNVERIFIED` and assign it to `EXEC-05A`.
10. Corrupt progress JSON.
11. Corrupt subject JSON.
12. Storage write failure when browser tooling permits safe simulation;
    otherwise mark it `UNVERIFIED` and assign it to `EXEC-02`.
13. A lesson title of at least 200 characters.
14. Keyboard-only Tab, Shift+Tab, Enter, Space, Escape, and focus return.
15. `prefers-reduced-motion`.
16. Desktop zoom at 200%.

For each relevant viewport, record:

- viewport-level horizontal overflow;
- clipped/covered controls;
- whether the next-action CTA is visible;
- undersized touch targets;
- long-title behavior;
- modal focus trap and focus return;
- suspicious contrast/focus state.

### Binary Definition of Done

`EXEC-00` is ready for audit only when:

- no source/config/test content changed;
- the complete before/after manifest rows and digest are identical;
- every command has an exit code;
- every user-reachable required viewport/scenario has direct evidence;
- any permitted source-free-trigger exception is explicitly `UNVERIFIED` and
  assigned to its owning package under the failure-injection policy;
- observations are separated from inference/unverified items;
- the dev server is stopped.

If the browser is unavailable, return `BLOCKED`; do not substitute another
browser surface and do not edit code.

---

## 6. `EXEC-01` — Contracts, runtime/type errors, and real gates

### Objective

Make the current production source internally type-correct, ensure primary
actions do not throw, establish real test/typecheck scripts, and implement the
approved shared study-day rule required by the existing failing test.

### Preconditions

- Independent `EXEC-00` verdict is `ACCEPTED`.
- Browser evidence is available for the affected primary actions.

### Closed allowed-file set

- `package.json`
- `tsconfig.json`
- `src/routes/index.tsx`
- `src/components/FocusTimerModal.tsx`
- `src/components/TopBar.tsx`
- `src/components/HabitSidebar.tsx`
- `src/components/TodayPanel.tsx`
- `src/components/NotificationCenterModal.tsx`
- `src/lib/progress-store.ts`
- `src/lib/progress-store.test.ts`
- `src/lib/focus-timer-store.test.ts`
- `src/lib/study-sessions.test.ts`

If another file is required, stop before editing it and request a package-scope
correction with the exact compiler/runtime evidence.

### Required implementation

1. Add real scripts:

   ```json
   {
     "typecheck": "tsc --noEmit",
     "test": "bun test"
   }
   ```

2. Keep app typecheck independent from test-runner declarations by excluding
   `src/**/*.test.ts` and `src/**/*.test.tsx` from the application TypeScript
   project. Do not add Vitest or Bun type dependencies.
3. Resolve every production TypeScript error without weakening strictness.
4. Normalize `FocusTimerModal` calls:
   - route passes `onRecordSession={addStudySession}`;
   - lesson completion uses `onToggleComplete`;
   - the wrapper supplies the active lesson XP to existing business logic;
   - remove stale `xp` and `onComplete` props from callers;
   - preserve the timer store, locking, reload, and exactly-once behavior.
5. Import missing `toast`, `HabitEntry`, and `Subject` symbols where required.
6. Do not add `unit` to persisted `HabitDef`. Toggle habits use completion
   language; counters use the generic unit `"lần"` unless the habit name already
   supplies a natural unit.
7. Use the route's derived `shiftedDates`; do not read nonexistent
   `state.shiftedDates`.
8. Resolve the TopBar notification callback type without widening it to `any`.
9. Implement one pure study-day predicate used for today and past dates:
   completed lesson, explicit study habit, or focus session
   `durationSeconds > 0`.
   A cross-midnight focus session counts on every local date with positive
   overlap. Historical `habitLog[date].study === true` remains evidence even if
   the definition is later archived/deleted. `UNDATED_COMPLETION` is never dated
   streak evidence.
10. Add unit tests for today/past lesson, habit, focus, cross-midnight/timezone,
    archived/deleted study definition history, undated legacy completion, no
    activity, and non-focus/zero-duration sessions.
11. Do not redesign visual hierarchy or notification behavior in this package.

### Required runtime scenarios

- Open timer from Today, record one focus session, and close.
- Open timer through the notification path if the baseline proves that path.
- Finish early and save exactly one session.
- Mark a lesson complete through the timer.
- Click the editable identity action without an exception.
- Click existing habit-stacking actions without an exception.
- Confirm no rendered copy contains `undefined`.

### Binary Definition of Done

- `bun run typecheck`: exit 0.
- `bun run test`: exit 0 and runs the real suite.
- `bun run lint`: exit 0 with no new warning.
- `bun run build`: exit 0.
- Timer entry paths call the same prop contract.
- Study-day unit tests cover all approved evidence types.
- No dependency or lockfile change.

---

## 7. `EXEC-02` — Persistence recovery, safe reset, import, and undo

### Objective

Prevent silent data loss and misleading success feedback. Make missing,
invalid, unavailable, and successfully loaded storage states explicit.

### Preconditions

- Independent `EXEC-01` verdict is `ACCEPTED`.

### Closed allowed-file set

- `src/lib/progress-store.ts`
- `src/lib/custom-subjects.ts`
- `src/lib/app-backup.ts`
- `src/lib/app-storage.ts` (new owned-key, raw-snapshot, and storage-result module)
- `src/lib/focus-timer-store.ts`
- `src/routes/index.tsx`
- `src/components/FocusTimerModal.tsx`
- `src/components/SettingsModal.tsx`
- `src/components/OnboardingDialog.tsx`
- `src/components/CourseImportExportModal.tsx`
- `src/components/StorageRecoveryPanel.tsx` (new)
- `src/lib/app-storage.test.ts` (new)
- `src/lib/app-backup.test.ts`
- `src/lib/custom-subjects.test.ts`
- `src/lib/progress-store.test.ts`
- `src/lib/focus-timer-store.test.ts`

This set is closed. If another file is proven necessary, stop before editing it
and request a package-scope correction.

### Required implementation

1. Introduce this internal discriminated storage result in
   `src/lib/app-storage.ts`:

   ```ts
   type StorageLoadResult<T> =
     | { status: "ok"; value: T }
     | { status: "missing" }
     | { status: "invalid"; raw: string; error: string }
     | { status: "unavailable"; error: string };
   ```

   Do not merge or rename the four states. The raw invalid payload must remain
   available without reparsing or normalization.

2. Subject storage must not return the sample catalog for invalid JSON. Sample
   data is used only for a real first-use/sample-data choice.
3. Save/clear operations return success/failure results. A caller displays a
   success toast only after confirmed success.
4. Progress, subjects, focus-timer state, and timer-lock persistence must use
   the same explicit result/failure discipline. An invalid timer payload must
   remain unchanged until the user explicitly exports/discards/restores it; a
   new timer cannot silently overwrite it.
5. When progress, subject, or timer storage is `invalid`:
   - show a persistent Recovery Panel;
   - prevent normal mutations that would create false confidence;
   - keep raw invalid content unchanged;
   - provide raw export;
   - offer restore from a valid existing backup when available;
   - offer scoped reset with explicit confirmation.
6. When storage is `unavailable`:
   - show a persistent diagnostic and retry action;
   - prevent normal mutations;
   - perform no write or reset;
   - do not claim that raw data exists and do not offer a fabricated raw export.
7. A normal single-key mutation is commit-after-persist:
   - compute the candidate state without committing it to React/UI state;
   - serialize and write the candidate;
   - read back and validate the written value;
   - commit the in-memory state only after successful verification;
   - on failure, retain the previous in-memory state and show a persistent
     storage error.
8. Timer-lock acquisition/release must surface failed or unverifiable writes.
   It must not claim lock ownership or timer persistence when the stored lock
   cannot be written and read back.
9. A destructive or multi-key mutation is rollback-protected:
   - capture the raw preimage of every target key;
   - write and read-back-verify the rollback snapshot before changing a target;
   - abort without changing targets if snapshot creation/verification fails;
   - write targets in a documented deterministic order and verify each write;
   - if any target write fails, restore every target from the raw preimage;
   - verify the rollback;
   - if rollback verification also fails, retain the snapshot, enter recovery
     mode, perform no further normal mutation, and report both errors;
   - update React/UI state only after the whole transaction-like flow succeeds.
10. Restore operations never delete their snapshot until every restored key has
    been read-back verified. A failed restore remains retryable and must not show
    success.
11. Replace factory `localStorage.clear()` with a central app-owned key registry.
    Unknown origin keys must survive reset.
12. Create the `hocvien-reset-rollback-v1` raw-value snapshot before factory
    reset. Do not delete that key during the reset it protects. When the key
    exists, expose `"Khôi phục lần xóa gần nhất"` in both the first-use
    onboarding and Settings/System surfaces.
13. "Mở lại onboarding" becomes "Tạo không gian học tập mới":

- show counts of lessons, sessions, habits, and completions affected;
- Cancel changes nothing;
- confirmation creates a rollback snapshot before replacement.

14. Curriculum import:

- explicitly says it replaces the entire current catalog;
- shows subject/lesson counts and additions/removals where derivable;
- validates before write;
- snapshots the existing catalog before write;
- provides Undo;
- Cancel causes no storage write.
  Additions/removals are calculated by stable lesson/subject ID after preview
  normalization; do not compare display names.

15. `"Khôi phục về lộ trình lớp 11 mặc định"` is also a destructive catalog
    replacement:
    - label it `"Thay lộ trình hiện tại bằng mẫu lớp 11"`;
    - show affected counts;
    - require confirmation;
    - snapshot before write;
    - write the explicit sample catalog rather than relying on missing-key
      fallback;
    - provide Undo and verify behavior after reload.
16. Whole-app import remains a destructive multi-key replacement:
    - invalid input and Cancel perform no write;
    - preview/confirmation identifies replaced domains;
    - snapshot must succeed before target writes;
    - failure at any target write invokes verified rollback;
    - the existing rollback action remains compatible and retryable.
17. Existing subject/lesson delete backup and undo behavior must remain
    functional and receive regression coverage.
18. Preserve whole-app exported-backup compatibility and stable lesson IDs.
19. Do not introduce a `ProgressState` migration or schema change.

### Required tests

- Missing progress and missing subjects.
- Invalid progress JSON.
- Valid JSON with invalid progress shape/version.
- Invalid subject JSON.
- Invalid focus-timer JSON and invalid timer-lock JSON.
- `getItem` unavailable/throws.
- `setItem` quota failure.
- Timer-state and timer-lock write/read-back failure, including reload and
  two-tab behavior.
- Snapshot write failure and snapshot read-back mismatch.
- Failure at each write position in every multi-key flow.
- Successful target writes followed by rollback failure.
- Restore failure at each key, with snapshot retained.
- Cancel onboarding reset.
- Confirm onboarding replacement and restore rollback.
- Curriculum invalid preview, cancel, replace, and undo.
- Replace with Grade 11 sample: cancel, confirm, reload, and undo.
- Whole-app import: invalid, cancel, success, failure at each target, rollback,
  reload, and retry.
- Factory reset preserves an unrelated sentinel key.
- Recovery reload keeps invalid raw bytes unchanged.

### Binary Definition of Done

- All mandatory gates exit 0.
- No normal mutation is possible while persistence is blocked.
- No success feedback follows a failed write.
- Every destructive flow has confirmation, snapshot, and restore.
- A failed snapshot aborts before any target write.
- A failed mutation leaves in-memory state equal to verified persisted state or
  enters explicit recovery when verified rollback is impossible.
- Unrelated local-storage keys survive factory reset.
- Existing valid stored data and exported backups remain compatible.

---

## 8. `EXEC-03` — Honest, opt-in notification behavior

### Objective

Ensure notifications are voluntary, based on real data, and accurately describe
what the application can do.

### Preconditions

- Independent `EXEC-02` verdict is `ACCEPTED`.

### Closed allowed-file set

- `src/lib/push-notification-store.ts`
- `src/lib/deadline-notifier.ts`
- `src/lib/focus-timer-store.ts`
- `src/routes/index.tsx`
- `src/components/FocusTimerModal.tsx`
- `src/components/SimulatedPushBanner.tsx`
- `src/components/NotificationCenterModal.tsx`
- `src/components/PushNotificationCenterModal.tsx`
- `src/components/RemindersCard.tsx`
- `src/lib/push-notification-store.test.ts` (new)
- `src/lib/deadline-notifier.test.ts` (new)
- `src/lib/focus-timer-store.test.ts`

This set is closed. If another file is proven necessary, stop before editing it
and request a package-scope correction.

### Required implementation

1. Fresh-user defaults:
   - `enabled: false`;
   - `soundEnabled: false`;
   - `enableStreakGuard: false`.
2. Preserve a returning user's explicitly saved preferences.
3. Remove the dashboard effect that automatically opens a simulated
   notification after 3.2 seconds.
4. Every automatic deadline, push, or habit-reminder effect requires both:
   - `onboardingComplete === true`; and
   - the relevant persisted preference explicitly enabled.
     Neither onboarding choice grants opt-in.
5. Notification generation returns no payload when no real applicable lesson
   exists. Do not fabricate Toán, "Chương 1", minutes, XP, or subject names.
6. Keep a simulator only as an explicitly labelled manual action.
7. Replace false snooze behavior with `"Để sau"`/dismiss:
   - do not promise another notification;
   - do not show guilt copy;
   - keep legacy `SNOOZED` history readable;
   - new dismiss records may use a backward-compatible `DISMISSED` value.
8. If morning/evening times still have no scheduler, hide those controls from
   the active settings UI while retaining stored fields for compatibility.
9. Empty history shows `"Chưa có dữ liệu"`, not 100%.
10. Rename `"Chỉ số kỷ luật"` to a descriptive response metric.
11. Habit reminder copy states that reminders work while the page is open.
12. Browser notification permission may be requested only by activating a
    visible control whose accessible name explicitly says
    `"Bật thông báo trình duyệt"`. Starting/resuming a Focus Timer, completing
    onboarding, enabling an in-app preference, or opening a modal must never
    call `Notification.requestPermission()`.
13. Remove permission requests from timer-start/store lifecycle paths.
    `FocusTimerModal` and `RemindersCard` may retain the explicit
    `"Bật thông báo trình duyệt"` action.
14. No automatic sound may play during onboarding or first use.

### Required tests and runtime scenarios

- Fresh storage produces no banner or audio after at least 10 seconds.
- After each onboarding choice, wait at least 10 seconds and confirm there is no
  deadline/push/habit notification without persisted opt-in.
- Existing explicit enabled preference is preserved.
- Empty catalog produces no notification payload.
- Manual simulator with a real lesson works.
- Manual simulator without a lesson shows an honest empty message.
- "Để sau" closes without promising reschedule.
- Empty history displays no percentage.
- Permission is requested only after the dedicated action.
- Starting and resuming Focus Timer never requests permission.

### Binary Definition of Done

- All mandatory gates exit 0.
- No unsolicited first-use notification, sound, or permission prompt.
- No fake lesson content.
- No unsupported scheduling promise remains in visible copy.

---

## 9. `EXEC-04` — Accurate streak, weekly metrics, and plan semantics

### Objective

Make every progress number traceable to one definition and make original versus
effective schedules logically correct.

### Preconditions

- Independent `EXEC-03` verdict is `ACCEPTED`.
- Reuse the accepted study-day predicate from `EXEC-01`; do not reimplement it.

### Closed allowed-file set

- `src/components/StudyStreakCard.tsx`
- `src/components/WeeklyStudySummary.tsx`
- `src/components/WeeklyChart.tsx`
- `src/components/ForecastCard.tsx`
- `src/components/LearningRoadmap.tsx`
- `src/components/FlexiblePlanner.tsx`
- `src/routes/index.tsx`
- `src/lib/weekly-metrics.ts` (new)
- `src/lib/weekly-metrics.test.ts` (new)
- `src/lib/planner.test.ts`
- `src/lib/progress-store.test.ts`
- `src/lib/study-sessions.test.ts`

This set is closed. If another file is proven necessary, stop before editing it
and request a package-scope correction.

### Required implementation

1. Create one pure weekly-metrics selector consumed by both weekly components.
2. Week is local Monday through Sunday.
3. Lesson target:
   - effective date is `shiftedDates[id] ?? scheduledDate`;
   - target belongs to the week when the effective date is in that week.
4. Lesson target is met when a completion date exists on or before that week's
   Sunday. An early completion therefore counts.
5. `UNDATED_COMPLETION` satisfies a targeted lesson's completed status and is
   displayed as `"Hoàn thành, không rõ ngày"`, but it does not contribute to
   dated completion, streak, early-completion, or out-of-plan counts.
6. A lesson completed during the week whose effective target date is outside
   the week is an out-of-plan completion and is displayed separately.
7. Deleted/archived lesson activity is displayed separately, not silently
   assigned to a current subject.
8. Habit denominator contains only habits whose weekly target is greater than
   zero. Numerator is capped at target for percentage calculation.
9. Do not calculate a composite overall rate from lessons plus habit
   occurrences.
10. Actual time comes only from focus `StudySession` records and uses existing
    midnight-splitting behavior.
11. Weekly target time is the sum of the effective planned hours for all seven
    dates, using date override when present and the default otherwise. Preserve
    an explicit value of `0`.
12. Replace `value || 2` fallback with nullish/validated fallback so zero
    remains zero.
13. `"Lịch gốc"` receives no shifted dates and always renders
    `scheduledDate`.
14. Flexible/effective views may use shifted dates.
15. Replace hard-coded `"(3 môn)"` with the actual subject count.
16. Replace guilt/discipline/forced-90-minute copy with factual guidance.
17. Update streak UI to `"ngày học liên tiếp"` and describe the accepted
    study-day rule accurately.

### Required tests

- Early completion.
- Completion on target date.
- Completion after week end.
- Legacy undated completion on a weekly target.
- Out-of-plan weekly completion.
- Archived/deleted lesson activity.
- Habit target zero with and without activity.
- Habit activity above target.
- No lesson/habit targets.
- Explicit zero default hours.
- Per-date zero override.
- Original and shifted date divergence.
- Zero, one, three, and four-or-more subjects.
- All reported percentages remain within 0–100.
- Focus session overlap across local midnight and timezone-boundary dates.

### Binary Definition of Done

- Both weekly components render the same selector results.
- Lesson, habit, and time metrics remain separate.
- Original schedule never renders a shifted date.
- Explicit zero values remain zero.
- All mandatory gates exit 0.

---

## 10. `EXEC-05A` — First-use states and dashboard hierarchy

### Objective

Make the next useful action obvious while preserving every existing capability.

### Preconditions

- Independent `EXEC-04` verdict is `ACCEPTED`.
- Required browser viewports from `EXEC-00` are available.

### Closed allowed-file set

- `src/routes/index.tsx`
- `src/routes/__root.tsx`
- `src/routes/__root.test.tsx` (new render-to-static-markup test)
- `src/components/OnboardingDialog.tsx`
- `src/components/TodayPanel.tsx`
- `src/components/TopBar.tsx`
- `src/components/HabitSidebar.tsx`
- `src/components/ForecastCard.tsx`
- `src/components/ui/empty-state.tsx` (optional new shared component)
- `src/components/ui/loading-state.tsx` (optional new shared component)
- `src/components/ui/inline-alert.tsx` (optional new shared component)

Create an optional shared component only when at least two allowed consumers
use it. This set is closed. If another file is proven necessary, stop before
editing it and request a package-scope correction.

### Required implementation

1. Hydration renders a semantic skeleton with `aria-busy`, not a blank page.
2. Empty workspace presents:
   - `"Thêm bài đầu tiên"` as the primary action;
   - `"Nhập lộ trình"` as the secondary action;
   - no fabricated progress or lesson content.
3. First-use onboarding clearly distinguishes:
   - create an empty workspace;
   - load the Grade 11 sample.
4. A controlled onboarding dialog must not show a close action that cannot
   actually close it.
5. Today hierarchy, in order:
   - optional user-owned long-term goal/identity;
   - available study time today;
   - one prioritized next lesson with reason and planned minutes;
   - primary start-focus action;
   - factual completion/progress;
   - optional habits and secondary modules.
6. Move Forecast to the Plan area.
7. Move XP, coins, reward entry, and streak details into secondary/weekly
   surfaces while keeping them reachable within two interactions.
8. Remove duplicate controls that update the same habit in the same viewport.
9. Habit-stacking suggestions that have no persisted behavior become
   non-interactive guidance, not fake-success buttons.
10. Persistent storage/recovery errors remain visible until resolved.
11. Root error and not-found copy become actionable Vietnamese.
    Keep the presentational error state separable from the router hook so its
    copy and semantics can be tested without a production debug route.
12. Do not introduce analytics-driven claims without analytics evidence.

### Required browser acceptance

At 360×800:

- the prioritized lesson and primary CTA are visible before secondary modules;
- no page-level horizontal overflow;
- empty workspace CTA is visible without opening settings;
- XP/reward/streak remain reachable in two or fewer actions.

Also verify 320×800, 768×1024, and 1440×900 with first-use, empty, long-title,
success, and persistent-error states.

### Binary Definition of Done

- All mandatory gates exit 0.
- Required viewports have direct browser evidence.
- No existing feature has been deleted.
- The first meaningful action is objectively earlier in DOM/tab order than
  gamification and secondary metrics.

---

## 11. `EXEC-05B` — Accessibility, forms, timer shell, and design system

### Objective

Standardize shared UI behavior, make primary flows keyboard/screen-reader
usable, and remove responsive and contrast failures without changing business
logic.

### Preconditions

- Independent `EXEC-05A` verdict is `ACCEPTED`.

### Closed allowed-file set

- `src/styles.css`
- `src/components/ui/button.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/FocusTimerModal.tsx`
- `src/components/AddLessonModal.tsx`
- `src/components/CourseManagerModal.tsx`
- `src/components/SettingsModal.tsx`
- `src/components/FlexiblePlanner.tsx`
- `src/components/DailyProgressBar.tsx`
- `src/components/TodayPanel.tsx`
- `src/components/HabitSidebar.tsx`
- `src/components/TopBar.tsx`
- `src/components/StudyStreakCard.tsx`
- `src/components/WeeklyStudySummary.tsx`
- `src/components/WeeklyChart.tsx`
- `src/components/ConfettiBurst.tsx`
- `src/components/RewardShopModal.tsx`
- `src/components/ui/app-card.tsx` (optional new wrapper)
- `src/components/ui/form-field.tsx` (optional new wrapper)
- `src/components/ui/empty-state.tsx` (optional new wrapper)
- `src/components/ui/loading-state.tsx` (optional new wrapper)
- `src/components/ui/inline-alert.tsx` (optional new wrapper)
- `src/components/ui/progress-meter.tsx` (optional new wrapper)
- `src/lib/form-validation.ts` (optional new pure validation module)
- `src/lib/form-validation.test.ts` (optional new test)
- `src/lib/focus-timer-store.test.ts`
- `src/lib/planner.test.ts`

This set is closed. If another file is proven necessary, stop before editing it
and request a package-scope correction.

### Required implementation

1. Reuse existing Button, Label, Input, Form, Dialog, AlertDialog, Progress,
   Skeleton, Tooltip, and Sonner primitives.
2. Create a new wrapper only when at least two consumers require the same
   behavior. Approved wrapper candidates:
   - `AppCard`;
   - `FormField`;
   - `EmptyState`;
   - `InlineAlert`;
   - `ProgressMeter`.
3. Standardize semantic color roles for surface, foreground, muted, info,
   success, warning, and danger. Replace direct palette classes incrementally
   in touched components only.
4. Normal text contrast must be at least 4.5:1; large text and non-text
   indicators at least 3:1.
5. Shared focus ring is at least 2 CSS pixels and visible on every interactive
   element.
6. Primary mobile actions and icon controls target 44×44 CSS pixels where
   layout permits; no interactive target may fall below WCAG 2.2 minimum.
7. Every icon-only control has an accessible name; `title` alone is not enough.
8. Every input/select has a programmatic label. Help/error is linked with
   `aria-describedby`.
9. Mobile text input font size is at least 16 px.
10. Inline validation blocks:
    - impossible calendar dates such as `2026-02-31`;
    - negative/non-finite duration and XP values;
    - empty required names.
      Use existing Zod/React Hook Form or native validation; add no dependency.
11. Replace sequential `window.prompt` editing with an accessible inline/dialog
    form while preserving all editable fields.
12. Focus Timer keeps its existing timer/persistence engine but uses
    Dialog/AlertDialog semantics:
    - focus trap;
    - initial focus;
    - return focus;
    - defined Escape behavior while active;
    - no nested interactive element;
    - long title wraps;
    - save-session and mark-lesson-complete are distinct actions.
13. Elapsed zero cannot create a study session. Lesson completion remains a
    separate explicit action.
14. Progress indicators expose an accessible name and current/min/max values.
15. Add `prefers-reduced-motion` behavior for pulse, bounce, confetti, and
    decorative transitions.
16. A 720 px planner table may remain horizontally scrollable, but its container
    must expose the overflow and an understandable mobile affordance; the page
    itself must not overflow.
17. Toast is supplementary feedback. Persistent errors use inline alert/status.

### Required runtime scenarios

- Keyboard open/use/close for every touched dialog.
- Focus return to every dialog trigger.
- Timer start, pause, resume, minimize, reload, finish early, expire, and
  two-tab lock.
- Exactly one session after each terminal timer path.
- Add/edit lesson with valid, invalid, and long inputs.
- 200-character lesson and subject names.
- 200% desktop zoom.
- Reduced-motion preference.
- All four required viewports.

### Binary Definition of Done

- All mandatory gates exit 0.
- No keyboard trap.
- All touched controls have accessible names.
- Required contrast and focus criteria are measured, not guessed.
- Timer lifecycle tests remain green.
- No viewport-level overflow at 320/360 px.

---

## 12. `EXEC-06` — Performance, locale, microcopy, and URL navigation

### Objective

Reduce initial JavaScript, make language and navigation consistent, and retain
all import/export capabilities.

### Preconditions

- Independent `EXEC-05B` verdict is `ACCEPTED`.

### Closed allowed-file set

- `src/lib/custom-subjects.ts`
- `src/lib/excel-import-export.ts` (new)
- `src/routes/index.tsx`
- `src/routes/__root.tsx`
- `src/components/CourseImportExportModal.tsx`
- `src/components/PushNotificationCenterModal.tsx`
- `src/components/NotificationCenterModal.tsx`
- `src/components/RewardShopModal.tsx`
- `src/components/SettingsModal.tsx`
- `src/components/ui/dialog.tsx`
- `src/lib/custom-subjects.test.ts`
- `src/lib/excel-import-export.test.ts` (new)
- `src/lib/route-search.ts` (new)
- `src/lib/route-search.test.ts` (new)

This set is closed. If another file is proven necessary, stop before editing it
and request a package-scope correction.

### Required implementation

1. Remove static `xlsx` import from the storage/catalog module used by the
   initial route.
2. Put Excel parse/export behavior in a focused dynamically imported module.
3. Lazy-load these heavy, non-initial UI modules:
   - curriculum import/export;
   - notification center;
   - reward shop.
     Settings may be lazy-loaded only if the three required modules already meet
     the performance gate and the change remains within the allowed set.
4. Provide visible loading and error states for lazy modules.
5. Keep CSV/JSON/Excel input/output behavior and validation compatible.
6. Immediately before editing, produce a fresh production client manifest with
   this exact read-only build command:

   ```powershell
   bunx vite build --manifest
   ```

   The client manifest for this toolchain is
   `.output/public/.vite/manifest.json`; no `vite.config.ts` edit is required or
   allowed. Measure the initial user-visible JavaScript graph before editing,
   then repeat the identical command and algorithm after editing:

   - graph roots are every manifest record with `isEntry: true` plus the
     initial `/` route record whose `src` is
     `src/routes/index.tsx?tsr-split=component`;
   - include only `.js` files;
   - recursively follow each root's static `imports`;
   - do not follow any other `dynamicImports`;
   - de-duplicate files by emitted manifest `file`;
   - sum raw bytes and gzip-compressed bytes of the complete set;
   - report the manifest path, graph roots, recursive emitted-file list, raw
     total, and gzip total.

   If the TanStack-generated key changes, identify the one route record loaded
   for `/` by its `src` field; do not substitute a different route or omit the
   initial route chunk.

7. The post-change initial static graph must:
   - contain no `xlsx` module/chunk;
   - reduce total gzip bytes by at least 25% from the fresh pre-change
     `EXEC-06` baseline;
   - not increase total raw bytes.
     The older 867.45 kB single-route-chunk observation is context only and is not
     the acceptance denominator.
8. Set `<html lang="vi">`.
9. Root error/not-found, dialog close text, and user-facing shell copy are
   Vietnamese.
10. Standardize approved vocabulary:
    - `"ngày học liên tiếp"`;
    - `"phiên tập trung"`;
    - `"lộ trình mẫu"`;
    - `"Để sau"`.
11. Remove typo/casing inconsistencies such as `"Thói Quên"`.
12. Synchronize top-level tab with validated URL search:
    - `view=today|weekly|plan`;
    - `plan=flex|original`.
13. Invalid search values fall back to `today` and `flex`.
14. Browser Back/Forward restores the correct tab without losing persisted
    state.
15. Do not create new route paths or change external API behavior.

### Required tests and measurements

- Fresh pre-edit and post-edit production-manifest static-graph report using the
  exact algorithm above.
- Confirm `xlsx` is absent from initial dependency graph.
- Excel import and export after lazy loading.
- Lazy-module loading and failure UI.
- Direct URL for every valid tab/search combination.
- Invalid query fallback.
- Back/Forward history.
- Reload on each tab.
- Vietnamese root error and 404.

### Binary Definition of Done

- All mandatory gates exit 0.
- Performance target is met with measured output.
- Initial graph excludes `xlsx`.
- Deep links and Back/Forward work.
- No import/export capability is lost.

---

## 13. `ACCEPTANCE-FINAL` — Independent production-path audit

### Role

The final auditor is read-only and must not be an implementing agent from any
package. It must reproduce current evidence from source and a production build.
Read-only prohibits changes to source, config, tests, documents, dependencies,
lockfiles, and browser data not required for test setup. Frozen install,
ignored caches, and ignored build output are allowed and must be inventoried
before/after.

### Required source audit

- Read `AGENTS.md`, this plan, all implementation reports, and all independent
  package verdicts.
- Inventory current source/config/document files.
- Identify every file attributable to the approved packages.
- Verify no external API, auth, database, or persisted `ProgressState` schema
  change.
- Verify no dependency was added.
- Search for:
  - `localStorage.clear`;
  - auto simulated push effects;
  - fabricated lesson notification fallbacks;
  - unsupported snooze promises;
  - `Notification.requestPermission()` in timer start/resume/store lifecycle;
  - direct `xlsx` import in initial-route modules;
  - guilt/discipline copy;
  - missing accessible labels in touched flows;
  - `prefers-reduced-motion`;
  - `lang="vi"`.

### Required executable gate

```powershell
bun install --frozen-lockfile
bun run typecheck
bun run test
bun run lint
bun run build
```

Record exact exit codes, test files, test count, assertion count, warnings, and
bundle sizes. Independently reproduce the `EXEC-06` production-manifest
static-import graph using the same entry/import/raw/gzip algorithm and compare
it with the accepted pre-edit `EXEC-06` baseline.

### Required production-path journeys

Use the production build/preview, not only isolated components:

1. First use → empty workspace → add first lesson → reload.
2. First use → sample data → identify next lesson.
3. Start focus → pause/resume → finish → record once → reload.
4. Timer reload and two-tab lock.
5. Complete and undo a lesson.
6. Record toggle and counter habits.
7. Weekly metrics with early/out-of-plan/zero-target fixtures.
8. Original versus effective plan.
9. Curriculum preview → cancel with no write.
10. Curriculum replace → undo.
11. Replace with Grade 11 sample → cancel → confirm → reload → undo.
12. Whole-app import → invalid/cancel/success → reload → rollback.
13. Corrupt progress recovery without overwrite.
14. Corrupt subject recovery without demo substitution.
15. A user-reachable storage write failure, when the browser environment can
    trigger it without a shipping debug hook, produces no false success.
16. Factory reset with unrelated sentinel key preserved.
17. Restore reset rollback, including a failed restore and retry.
18. Fresh user receives no notification/audio after both onboarding choices.
19. Manual notification simulator using real data.
20. Empty catalog produces no fake notification.
21. Focus Timer start/resume does not request browser permission.
22. Direct tab URLs, Back/Forward, and reload.
23. Excel import/export after lazy loading.

For storage journeys, record relevant raw key values before the action, after
the action, and after reload.

### Required deterministic fault evidence

Fault-at-each-write-position is not a production-preview journey. The final
auditor must independently rerun and inspect deterministic unit tests using the
approved faulting storage/importer adapters for:

- snapshot creation and read-back mismatch;
- every target position in each multi-key mutation;
- rollback write/read-back failure;
- restore failure and retry;
- timer state/lock write and verification failure;
- lazy-import rejection.

The production preview verifies the user-facing error/recovery behavior for
real user-reachable states. Unit fault injection verifies otherwise
unreachable internal fault positions. Neither evidence type substitutes for
the other.

### Required responsive/accessibility matrix

Repeat all critical journeys at:

- 320×800
- 360×800
- 768×1024
- 1440×900

Also test:

- keyboard-only operation;
- focus visibility and return;
- 200% zoom;
- reduced motion;
- long 200-character content;
- screen-reader accessible names/roles/states;
- measured contrast;
- no viewport-level horizontal overflow.

### Final verdict

Return exactly one:

- `ACCEPTED`: every mandatory criterion is reproduced and green.
- `REJECTED`: one or more in-scope criteria fails; list exact evidence and
  owning package.
- `BLOCKED`: an external condition prevents reliable audit; list what was and
  was not verified.

Do not use `ACCEPTED WITH NOTES`. Any failed mandatory criterion is
`REJECTED`.

---

## 14. Independent audit prompt template

```text
You are the independent read-only auditor for <PACKAGE-ID>.

WORKSPACE
D:\Downloads\Smart-Study-And-Habit-Planner-main\Smart-Study-And-Habit-Planner-main

AUTHORITY
Read AGENTS.md and AI_CODING_EXECUTION_PLAN.md completely.
Audit only <PACKAGE-ID>.

RULES
- Do not edit or format source/config/test/document files; do not change
  dependencies or lockfiles; do not commit, push, or deploy.
- Frozen install, ignored caches, and ignored build output are allowed because
  the audit must reproduce build/runtime evidence. Inventory them before/after.
- Do not trust the implementer's completion report.
- Re-read current source and tests.
- Regenerate the complete workspace manifest and bind the verdict to its digest.
- Re-run every mandatory command and relevant focused command.
- Reproduce runtime, browser, storage, responsive, and accessibility evidence
  required by the package.
- Distinguish source evidence, runtime evidence, visual evidence, inference,
  and unverified items.
- A green build is not a green test/typecheck.
- Do not inspect or begin the successor package as implementation work.

OUTPUT
1. Scope and source inspected
2. Implementer claims checked independently
3. Commands with exact exit codes/results
4. Runtime/browser/storage evidence
5. Failed or unverified acceptance criteria
6. Regression and out-of-scope change audit
7. Current workspace file count/digest to which the verdict is bound
8. One final line only: ACCEPTED, REJECTED, or BLOCKED
```

---

## 15. Correction prompt template

```text
You are responsible only for correcting <PACKAGE-ID>.

PRECONDITION
One of these is attached:
- the implementer returned PARTIAL with unmet criteria; or
- the independent audit returned REJECTED with failed criteria.
Read the attached implementation/audit evidence.

OBJECTIVE
Correct only these failed criteria:
<PASTE FAILED CRITERIA AND EVIDENCE>

RULES
- Read AGENTS.md and AI_CODING_EXECUTION_PLAN.md completely.
- Preserve all accepted behavior from earlier packages.
- Do not refactor adjacent code unless the failed criterion proves it necessary.
- Do not add dependencies or change external/persisted contracts.
- Add or update regression tests for every corrected failure.
- Run the original package gates.
- Do not begin any successor package.
- If the previous status was PARTIAL, an independent acceptance audit may be
  launched only after this correction returns COMPLETE.

OUTPUT
Use the standard implementation report and end with COMPLETE, PARTIAL, or
BLOCKED.
```

---

## 16. Completion-report template

```markdown
# <PACKAGE-ID> Implementation Report

## Status

COMPLETE | PARTIAL | BLOCKED

## Preconditions

- Predecessor verdict:
- Predecessor workspace digest:
- AGENTS.md read:
- Authority plan read:

## Workspace manifest

- Before file count:
- Before digest:
- After file count:
- After digest:
- Complete classified path diff:

## Files changed

| File | Reason |
| ---- | ------ |

## Behavior implemented

- ...

## Tests added or changed

- ...

## Commands

| Command | Exit code | Actual result |
| ------- | --------: | ------------- |

## Runtime/browser evidence

| Scenario | Viewport | Result | Evidence |
| -------- | -------- | ------ | -------- |

## Storage evidence

| Scenario | Before | After | After reload |
| -------- | ------ | ----- | ------------ |

## Scope audit

- Successor package not started:
- Dependency/lockfile unchanged:
- External/persisted contracts unchanged:
- Unrelated files preserved:

## Remaining risks or unverified criteria

- ...

<FINAL STATUS ONLY>
```

---

## 17. Definition of project completion

The plan is complete only when:

1. Every `EXEC-*` package has an independent `ACCEPTED` verdict.
2. `ACCEPTANCE-FINAL` returns `ACCEPTED`.
3. All executable gates pass from a frozen-lockfile install.
4. Production-path browser evidence covers all required states and viewports.
5. Persistence failure, destructive replacement, rollback, and reload behavior
   are directly verified.
6. No required criterion is represented only by an implementing-agent claim.

Until then, report the project as in progress, partial, rejected, or blocked.
Do not describe it as completed.
