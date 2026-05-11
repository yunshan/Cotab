# AGENTS.md

> This file defines how Codex and other AI coding agents should work in the Cotab repository.
> It is a working contract for AI agents, not a marketing README.

---

## 1. Product Context

### Product Name

Cotab

### Product Type

Chrome Extension / Browser productivity tool.

### Product Mission

Cotab helps users stay mentally clear when Chrome tabs become chaotic.

The product should feel like:

- A soft guiding light.
- A calm workspace.
- A minimal tool for reducing cognitive load.
- A lightweight assistant that helps users organize browser context without interrupting their thinking.

Cotab should not feel like:

- A heavy tab manager.
- A dashboard full of noise.
- A technical tool made only for power users.
- A clone of existing Chrome tab extensions.

### Core Product Principles

1. **Clarity first**  
   Every feature should reduce mental burden.

2. **Extreme simplicity**  
   Prefer one obvious action over many configurable options.

3. **Calm interface**  
   Avoid visual noise, dense controls, excessive colors, and unnecessary animations.

4. **Fast interaction**  
   Common operations should feel instant.

5. **Trustworthy behavior**  
   Never close, move, group, archive, or modify tabs without clear user intent.

6. **Progressive power**  
   Advanced functions may exist, but the default experience must remain simple.

7. **No fake intelligence**  
   If AI features are added later, they must be explainable, reviewable, and reversible.

---

## 2. Current Development Stage

Cotab is currently in early product development.

Primary goal:

```text
Build a stable, elegant, minimal Chrome extension MVP that helps users understand, organize, and reduce tab clutter.
````

MVP priorities:

1. Stable Chrome extension architecture.
2. Clean popup or side panel UI.
3. Reliable tab reading and grouping logic.
4. Thoughtful empty/loading/error states.
5. Minimal, beautiful icon and visual identity.
6. Safe tab operations.
7. Small, reviewable Git commits during development.

Non-goals for the MVP:

* Heavy account system.
* Cloud sync.
* Complex collaboration.
* Overly complicated settings.
* Aggressive AI automation.
* Closing tabs automatically without user confirmation.
* Rebuilding a full browser workspace too early.

---

## 3. Expected Tech Stack

Use the actual repository configuration as the source of truth.

Common expected stack:

* Language: TypeScript
* Frontend: React or vanilla TypeScript, depending on the repository
* Build tool: Vite or equivalent
* Extension platform: Chrome Extension Manifest V3
* Package manager: pnpm preferred, unless the repo already uses npm/yarn
* Styling: CSS / Tailwind / CSS Modules, depending on existing project
* Testing: Vitest / Playwright / Chrome extension manual test checklist

Rules:

* Do not switch framework without explicit approval.
* Do not migrate package manager without explicit approval.
* Do not introduce a UI framework just for convenience.
* Do not add large dependencies for small utilities.
* Follow the existing project conventions when they differ from this document.

---

## 4. Repository Structure

Expected structure may look like this:

```text
cotab/
  src/
    background/
    content/
    popup/
    sidepanel/
    options/
    shared/
    services/
    styles/
  public/
    icons/
  docs/
  scripts/
  tests/
  manifest.json
  package.json
  tsconfig.json
  vite.config.ts
  AGENTS.md
  README.md
```

### Directory Responsibilities

* `src/background/`
  Chrome extension service worker and background logic.

* `src/content/`
  Content scripts injected into web pages. Keep these small and safe.

* `src/popup/`
  Popup UI.

* `src/sidepanel/`
  Side panel UI if the project uses Chrome Side Panel.

* `src/options/`
  Options/settings page if needed.

* `src/shared/`
  Shared types, constants, utilities, and pure logic.

* `src/services/`
  Chrome API wrappers, tab services, storage services, grouping logic.

* `src/styles/`
  Global or shared styles.

* `public/icons/`
  Extension icons. Do not overwrite icon assets casually.

* `docs/`
  Product requirements, design notes, architecture notes, release notes.

* `tests/`
  Unit, integration, and e2e tests.

### Rules

* Keep Chrome API access isolated in service modules when practical.
* Keep pure logic independent from Chrome APIs so it can be tested.
* Avoid putting business logic directly inside UI components.
* Avoid large files with mixed responsibilities.
* Do not create duplicate abstractions if a similar service already exists.
* Do not modify generated build output directly.

---

## 5. Product UX Rules

Cotab's UI must be calm, minimal, and refined.

### Visual Direction

Preferred style:

* Minimal
* Soft
* Light
* Quiet
* Spacious
* High reading clarity
* Low cognitive load

Brand/icon direction:

* Star-like / guiding-light metaphor is acceptable.
* Single-color or restrained gradient is preferred.
* Main accent color may use `#0080f7` when consistent with the design system.
* Avoid noisy backgrounds.
* Avoid text inside extension icons.
* Avoid overly sharp, spiky, aggressive shapes.
* Prefer soft, elegant geometry.

### Interaction Rules

* Do not surprise users.
* Do not auto-close tabs.
* Do not auto-group tabs without clear confirmation unless explicitly designed.
* Do not discard tabs unless the user explicitly requests it.
* Destructive operations must have confirmation or undo.
* Prefer “preview → confirm” for batch actions.
* Always show what will happen before operating on many tabs.

### Empty States

Every major UI surface should handle:

* No tabs available.
* No permission granted.
* Loading Chrome tab data.
* Chrome API failure.
* Unsupported browser environment.
* First-time user onboarding.

### Error States

Errors should be:

* Clear
* Non-technical where user-facing
* Recoverable when possible
* Logged with enough development context
* Never exposing private data or browser history unnecessarily

---

## 6. Chrome Extension Rules

Cotab should follow Chrome Extension Manifest V3 best practices.

### Manifest

When modifying `manifest.json`:

* Preserve Manifest V3 compatibility.
* Keep permissions minimal.
* Do not add broad host permissions unless necessary.
* Prefer `activeTab` where possible.
* Explain any new permission in the final response.
* Keep extension name, icons, action, background, content scripts, and side panel config consistent.

### Permissions

Be conservative with permissions.

Common acceptable permissions only when needed:

```json
[
  "tabs",
  "tabGroups",
  "storage",
  "activeTab",
  "scripting",
  "sidePanel"
]
```

Rules:

* Do not add `<all_urls>` without explicit approval.
* Do not request browsing history unless the feature truly requires it.
* Do not access page content unless necessary.
* Do not collect or transmit tab URLs outside the local extension unless explicitly designed and approved.

### Background Service Worker

Rules:

* Keep background logic event-driven.
* Do not assume long-lived background state.
* Persist necessary state in Chrome storage.
* Handle service worker restart gracefully.
* Avoid timers that depend on long-lived execution.

### Content Scripts

Rules:

* Avoid content scripts unless the feature requires page-level access.
* Do not inject UI into arbitrary pages unless explicitly required.
* Keep selectors robust.
* Avoid brittle generated class names.
* Do not rely on unstable DOM structures unless unavoidable.
* Clean up injected nodes and observers when possible.

### Chrome APIs

* Wrap Chrome APIs in typed service functions.
* Handle `chrome.runtime.lastError`.
* Do not assume APIs exist in every browser or Chrome version.
* Keep browser-specific behavior isolated.

---

## 7. Privacy and Data Rules

Cotab may read tab titles, URLs, groups, and browser window context.

This data is sensitive.

### Hard Rules

* Do not send tab data to any remote service unless explicitly approved.
* Do not add analytics without explicit approval.
* Do not log full URLs unnecessarily.
* Do not store more tab data than needed.
* Do not store private browsing context.
* Do not collect page content unless the feature explicitly requires it.
* Never commit secrets, API keys, tokens, or private config.

### Storage

When using `chrome.storage`:

* Prefer minimal schema.
* Version persisted schema if it may evolve.
* Write migration logic for breaking storage changes.
* Keep user data local by default.
* Document stored fields when adding new storage.

Example storage documentation:

```ts
/**
 * Stored locally:
 * - userPreferences: UI and behavior settings
 * - tabGroupsSnapshot: optional local snapshot for recovery
 *
 * Never stored:
 * - page content
 * - cookies
 * - credentials
 */
```

---

## 8. Architecture Rules

### Preferred Layers

Use this mental model:

```text
UI Layer
  ↓
Application / Use Case Layer
  ↓
Domain Logic
  ↓
Chrome API / Storage / Infrastructure Layer
```

### UI Layer

UI components should:

* Render state.
* Trigger user actions.
* Avoid direct complex Chrome API operations.
* Avoid hidden side effects.
* Keep visual logic separate from tab operation logic.

### Domain Logic

Domain logic should:

* Be pure where practical.
* Be testable without Chrome.
* Handle sorting, grouping, filtering, scoring, and classification.
* Avoid UI framework dependencies.

Examples:

```text
groupTabsByDomain()
scoreTabClutter()
suggestTabGroups()
filterDuplicateTabs()
buildTabPreviewModel()
```

### Infrastructure Layer

Infrastructure code should:

* Wrap Chrome APIs.
* Handle errors.
* Normalize browser API responses.
* Expose stable internal interfaces.

Examples:

```text
tabService.getCurrentWindowTabs()
tabService.createGroup()
tabService.moveTabs()
storageService.getPreferences()
storageService.savePreferences()
```

---

## 9. Coding Standards

### General

* Write clear, boring, maintainable code.
* Prefer readability over cleverness.
* Keep functions small when practical.
* Use descriptive names.
* Avoid premature abstraction.
* Avoid global mutable state.
* Avoid unrelated refactoring.
* Follow existing style in nearby files.
* Do not add comments for obvious code.
* Add comments only for non-obvious decisions, constraints, or browser quirks.

### TypeScript

* Prefer strict typing.
* Avoid `any`.
* Use `unknown` when type is genuinely unknown.
* Define shared types in a stable location.
* Prefer discriminated unions for complex UI states.
* Avoid unsafe casts unless documented.
* Export types intentionally.
* Keep Chrome-specific types away from pure domain modules when practical.

### React, if used

* Prefer functional components.
* Keep components focused.
* Derive state instead of duplicating it.
* Avoid deeply nested prop chains when a simpler structure exists.
* Handle loading, empty, error, and disabled states.
* Do not introduce global state unless necessary.
* Avoid large components that mix UI, data fetching, and business logic.

### CSS / Styling

* Keep visual design minimal.
* Avoid excessive shadows, gradients, borders, and animations.
* Respect system font rendering.
* Use consistent spacing.
* Prefer accessible contrast.
* Avoid hardcoded magic sizes when design tokens exist.
* Do not make UI dense.

---

## 10. Accessibility Rules

Cotab must remain keyboard-friendly and readable.

For UI changes:

* Use semantic HTML where possible.
* Provide accessible names for icon-only buttons.
* Ensure keyboard navigation works.
* Ensure visible focus states.
* Do not rely only on color to communicate state.
* Use proper labels for inputs.
* Respect reduced motion preferences.
* Keep text readable at small popup sizes.

---

## 11. Performance Rules

Cotab operates in the browser and must stay lightweight.

Rules:

* Avoid blocking the main thread.
* Avoid expensive scans on every render.
* Debounce expensive operations where appropriate.
* Avoid repeatedly querying all tabs without reason.
* Cache carefully and invalidate clearly.
* Do not load large libraries for small interactions.
* Avoid memory leaks in content scripts and observers.
* Keep popup startup fast.

For tab-heavy users:

* Assume hundreds of tabs may exist.
* UI should remain responsive with many tabs.
* Grouping/filtering should avoid obvious O(n²) behavior unless input size is small.
* Avoid rendering huge lists without basic optimization.

---

## 12. Build, Test, and Dev Commands

Use the commands defined in `package.json` as the source of truth.

Before running commands, inspect `package.json`.

Expected commands may include:

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm typecheck
```

If this repository uses npm:

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
npm run typecheck
```

If a command does not exist:

* Do not invent it.
* Check `package.json`.
* Use the closest existing command.
* Mention missing scripts in the final response.

### Validation Priority

For small changes:

```bash
pnpm typecheck
pnpm lint
```

For logic changes:

```bash
pnpm test
```

For release-sensitive changes:

```bash
pnpm build
```

For Chrome extension changes, also perform manual validation.

---

## 13. Manual Chrome Extension Validation

When changing extension behavior, include a manual validation checklist.

Recommended checklist:

```text
1. Build the extension.
2. Open chrome://extensions.
3. Enable Developer mode.
4. Load unpacked extension from the build output directory.
5. Open several tabs with different domains.
6. Open Cotab popup or side panel.
7. Verify tab list loads correctly.
8. Verify grouping/filtering/search behavior.
9. Verify no unexpected tab closing or movement occurs.
10. Verify console has no critical errors.
11. Verify extension reload does not break persisted state.
```

When changing permissions:

```text
1. Reload extension.
2. Confirm Chrome permission prompt is expected.
3. Verify the feature works with minimal permissions.
4. Confirm no unnecessary host permissions were added.
```

When changing icons:

```text
1. Verify icon16, icon32, icon48, icon128 if applicable.
2. Verify icon appearance in Chrome toolbar.
3. Verify icon appearance in chrome://extensions.
4. Verify transparent background when required.
5. Verify visual clarity at 16x16.
```

---

## 14. Testing Rules

Testing is required for behavior changes.

### What to Test

Add or update tests when changing:

* Tab grouping logic
* Tab filtering logic
* Tab scoring logic
* Storage schema
* User preferences
* Chrome API wrappers
* Safety confirmation logic
* Any bug fix

### Preferred Test Style

* Keep pure logic testable without Chrome.
* Mock Chrome APIs only at the service boundary.
* Prefer deterministic tests.
* Avoid timing-based tests where possible.
* Add regression tests for bugs.

### Do Not

* Do not delete tests just because they fail.
* Do not weaken assertions to make tests pass.
* Do not mock the function being tested.
* Do not add a large testing framework without approval.

---

## 15. Git Workflow

Git discipline is mandatory.

The user expects Codex to commit code changes locally during development.

### Before Editing

Always run:

```bash
git status --short
```

If there are existing uncommitted changes:

* Do not overwrite them.
* Identify whether they are user changes or previous agent changes.
* Avoid touching unrelated modified files.
* If the worktree is messy, first summarize the situation.

### Commit Policy

Unless the user explicitly says not to commit:

* Commit after each coherent unit of work.
* Do not accumulate a large uncommitted diff.
* Prefer small, meaningful commits.
* Do not mix unrelated changes.
* Do not wait until the entire product is finished before committing.
* Do not push unless explicitly asked.
* Do not create pull requests unless explicitly asked.

### Commit Granularity

Good commit boundaries:

```text
chore: initialize extension scaffold
feat: add popup tab overview
feat: add tab grouping preview
feat: implement safe tab group creation
feat: add local preferences storage
fix: handle empty tab list state
test: add tab grouping logic tests
docs: document extension loading steps
```

Bad commit boundaries:

```text
feat: build whole app
update files
fix stuff
misc changes
```

### Commit Message Format

Use Conventional Commits:

```text
feat: add tab grouping preview
fix: handle chrome runtime errors
refactor: extract tab service
test: add duplicate tab detection tests
docs: update manual validation guide
chore: update build config
style: refine popup spacing
```

Rules:

* Use English commit messages.
* Keep the subject concise.
* Use imperative mood.
* Add a body if the reason is not obvious.

### Commit Procedure

Before committing:

```bash
git status --short
git diff --stat
```

Stage intentionally:

```bash
git add <specific-files>
```

Avoid `git add .` unless all changes are intentionally included.

Commit:

```bash
git commit -m "<type>: <summary>"
```

After committing:

```bash
git status --short
git log --oneline -n 3
```

Final response must include:

```text
Commit:
- <hash> <message>
```

If no commit was created, explain exactly why.

---

## 16. Branch and Release Rules

### Branches

* Do not create branches unless asked.
* Do not switch branches without checking worktree state.
* Do not delete branches without explicit approval.
* Do not rewrite history without explicit approval.

### Push

* Do not push by default.
* Only push when the user explicitly asks.

### Release

Before preparing a release:

1. Run build.
2. Run tests.
3. Verify manifest.
4. Verify icons.
5. Verify permissions.
6. Perform manual Chrome extension validation.
7. Update changelog or release notes if present.

---

## 17. Safety Rules for Tab Operations

Cotab may operate on browser tabs. These actions affect the user’s real browsing context.

### Safe by Default

Read-only operations are preferred:

* Read current tabs.
* Display tab list.
* Suggest groups.
* Preview duplicates.
* Preview inactive tabs.
* Show clutter score.

### Confirmation Required

Require explicit user confirmation before:

* Closing tabs.
* Moving tabs.
* Grouping many tabs.
* Ungrouping tabs.
* Discarding tabs.
* Pinning/unpinning many tabs.
* Archiving sessions.
* Restoring many tabs.
* Deleting saved workspace data.

### Undo / Recovery

For destructive or batch operations:

* Prefer undo support.
* Store enough local snapshot data to recover when reasonable.
* Show clear success and failure feedback.

---

## 18. AI Feature Rules

If Cotab adds AI features later:

* AI must assist, not silently act.
* AI suggestions must be reviewable.
* AI-generated tab groups must be shown before applying.
* AI must not transmit tab data externally without explicit user approval.
* AI prompts must avoid including sensitive URLs unless the user approves.
* AI features must have a non-AI fallback where practical.

Potential AI features:

```text
- Suggest tab groups
- Summarize current browsing context
- Detect duplicate or stale tabs
- Suggest focus mode
- Generate workspace names
- Explain why certain tabs are grouped
```

Do not implement AI features before the core non-AI workflow is stable unless explicitly asked.

---

## 19. Documentation Rules

Update documentation when changing:

* Setup commands
* Build process
* Extension loading process
* Permissions
* Product behavior
* Storage schema
* User-visible features
* Architecture decisions

Preferred docs:

```text
README.md
docs/PRD.md
docs/ARCHITECTURE.md
docs/VALIDATION.md
docs/CHANGELOG.md
```

Docs should be:

* Concrete
* Short
* Operational
* Accurate
* Easy for future Codex sessions to use

---

## 20. Dependency Rules

Before adding a dependency, check:

1. Is it already in the project?
2. Can native browser APIs solve this?
3. Is the dependency small?
4. Is it actively maintained?
5. Does it work in Chrome extension context?
6. Does it affect bundle size significantly?
7. Is the license acceptable?

Rules:

* Do not add dependencies casually.
* Do not add analytics SDKs without approval.
* Do not add remote telemetry libraries without approval.
* Do not add UI component libraries unless the project already uses one or the user approves.
* Explain every new dependency in the final response.

---

## 21. Files That Require Extra Care

Do not modify these casually:

```text
manifest.json
package.json
pnpm-lock.yaml
package-lock.json
yarn.lock
public/icons/*
.env
.env.*
```

Rules:

* For `manifest.json`, explain permission or extension behavior changes.
* For lock files, modify only when dependencies changed.
* For icons, preserve transparent background and required sizes.
* For env files, never commit secrets.

---

## 22. Common Failure Modes to Avoid

Avoid these mistakes:

1. Building too many features before committing.
2. Adding complex settings too early.
3. Treating Cotab as a generic tab manager.
4. Making the UI too dense.
5. Closing or moving tabs without user confirmation.
6. Adding broad Chrome permissions.
7. Mixing Chrome API calls directly into UI components.
8. Ignoring service worker lifecycle issues.
9. Forgetting empty/error states.
10. Claiming tests passed without running them.
11. Replacing icon/design assets without checking small-size clarity.
12. Using `git add .` and committing unrelated files.
13. Continuing development with a large unclear worktree.

---

## 23. Working Process for Codex

For each task:

### Step 1: Inspect

* Read this `AGENTS.md`.
* Check `git status --short`.
* Inspect relevant files.
* Check existing conventions before editing.

### Step 2: Plan

For non-trivial tasks, produce a short plan:

```text
Plan:
1. ...
2. ...
3. ...

Validation:
- ...

Risk:
- ...
```

For simple edits, proceed directly.

### Step 3: Implement

* Make small, scoped changes.
* Follow existing patterns.
* Avoid unrelated refactors.
* Update docs/tests when needed.

### Step 4: Validate

Run relevant commands.

At minimum, try:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Use only commands that exist in the repository.

For Chrome extension changes, include manual validation checklist.

### Step 5: Commit

Commit each coherent unit of work unless explicitly told not to.

### Step 6: Report

Final response format:

```text
Summary:
- ...

Validation:
- ...

Commit:
- <hash> <message>
  or
- Not committed: <reason>

Risks / Follow-up:
- ...
```

---

## 24. Product Roadmap Guidance

Use this as long-term direction, not as permission to build everything now.

### Phase 1: MVP

* Read current window tabs.
* Show clean tab overview.
* Support search/filter.
* Suggest simple groupings.
* Allow user-confirmed grouping.
* Provide minimal settings.
* Stable icon and visual identity.

### Phase 2: Workspace Clarity

* Save tab sessions.
* Restore sessions.
* Detect duplicate tabs.
* Detect stale tabs.
* Focus mode.
* Group naming.
* Lightweight workspace overview.

### Phase 3: Intelligent Assistance

* AI-assisted group suggestions.
* AI-generated workspace names.
* Context summaries.
* Gentle cleanup suggestions.
* User-controlled automation.

### Phase 4: Power User Layer

* Keyboard shortcuts.
* Rules.
* Advanced grouping.
* Cross-device sync if explicitly approved.
* Export/import workspace snapshots.

Rules:

* Do not jump phases unless instructed.
* Build the smallest useful version first.
* Keep product simplicity intact.

---

## 25. Definition of Done

A task is done only when:

* Relevant files were inspected.
* Change is minimal and scoped.
* Product behavior is safe.
* UI remains calm and simple.
* Chrome permissions remain minimal.
* Tests or validation were run where practical.
* Manual validation is documented for extension behavior.
* Documentation was updated if behavior changed.
* No secrets were added.
* No unrelated files were modified.
* Git status was checked.
* Changes were committed unless explicitly told not to.
* Final response includes summary, validation, commit hash, and risks.

[1]: https://developers.openai.com/codex/guides/agents-md?utm_source=chatgpt.com "Custom instructions with AGENTS.md – Codex"
