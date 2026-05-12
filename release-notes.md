# Cotab Release Notes

## v1.5.0 - 2026-05-12

This release makes Cotab's search, selection, and dark-mode experience feel more complete and deliberate.

- Added checkboxes to each Active and Staged row.
- Highlighted selected rows so pending batch actions are visible before closing.
- Kept the original `× Close all N tabs` behavior when nothing is selected, and switches to highlighted `× Close selected N tabs` actions only after the user selects rows.
- Added `Esc` keyboard support to clear all selected Active and Staged rows at once.
- Active batch close now closes only selected open tabs when rows are selected, otherwise it closes the currently visible Active tabs.
- Staged batch close now removes only selected staged records when rows are selected, otherwise it removes the currently visible Staged records.
- Added a Restore action icon to History search results, matching the Staged restore interaction.
- Changed the search placeholder to `Search tabs`.
- Improved dark-mode support across imported design themes with shared dark tokens, so non-Claude themes no longer remain effectively light.
- Restyled row checkboxes for dark mode so selected and unselected states stay calm and readable.

## v1.4.0 - 2026-05-12

This release fixes recent tab activation counting reliability.

- Serialized dashboard state writes in the background service worker so tab activation updates are not overwritten by nearby tab update, refresh, close, stage, or staged-item mutations.
- Preserved the recent-24-hour activation window while preventing concurrent Chrome events from losing newly recorded activations.
- Rebuilt the extension package after the background service worker fix.

## v1.3.0 - 2026-05-12

This release expands Cotab's design theme picker to cover every imported theme reference.

- Added all `themes/*/DESIGN.md` entries to the UI theme list, expanding from 10 to 23 selectable themes.
- Added theme options for Airbnb, Airtable, Apple, Coinbase, Cursor, Figma, Framer, Lovable, Notion, Spotify, Stripe, Supabase, and Vercel Inspired.
- Added base CSS token mappings for the newly imported themes.
- Updated theme tests to verify every listed theme has a matching `themes/<id>/DESIGN.md` file.

## v1.2.0 - 2026-05-12

This release adds a design-theme layer to Cotab's new tab workspace.

- Added a theme selector to the left of search, with Claude as the default option.
- Added ten theme entries under `themes/`, sourced from getdesign.md's public design-md collection order.
- Added runtime theme switching with local preference storage via `cotab-design-theme`.
- Added CSS token mappings for Claude, Cohere, ElevenLabs, Minimax, Mistral AI, Ollama, OpenCode AI, Replicate, RunwayML, and Together AI.
- Added tests for default theme selection, persisted theme loading, unsupported theme fallback, and theme list size.

## v1.1.0 - 2026-05-11

This release makes Active ranking more current and easier to understand.

- Changed tab activation counting from lifetime accumulation to a rolling last-24-hours window.
- Stored recent activation timestamps locally and derives each tab's displayed activation count from that window.
- Added a small hover tooltip on activation-count text explaining that it means tab activations in the last 24 hours.
- Confirmed the bottom page footer remains `Cotab by yunshan`, with Cotab linking to the GitHub repository.

## v1.0.0 - 2026-05-11

This release extends Cotab search beyond currently open and staged tabs while keeping results quiet and relevant.

- Added Chrome history search results below the Staged table, visible only while the user is actively searching.
- Excluded URLs already shown in Active or Staged from History results to avoid duplicated rows.
- Added click-to-open behavior for History result titles, opening the page in a new active tab.
- Added the `history` permission for user-initiated Chrome history lookup.
- Added unit coverage for History filtering, duplicate URL handling, unsupported URL exclusion, and Active/Staged URL exclusion.
- Updated README and extension metadata for the new permission and search behavior.

## v0.9.0 - 2026-05-11

This release prepares Cotab's local build output and project publishing path for GitHub Releases.

- Added a quiet bottom footer with `Cotab by yunshan`, linking the Cotab name to the GitHub repository.
- Changed the production build output from `dist/` to `extension/`, making the unpacked Chrome extension artifact explicit.
- Added a release archive script that builds Cotab and packages the `extension/` directory as `cotab-v<version>.zip`.
- Expanded `.gitignore` to cover build outputs, release archives, caches, coverage, logs, environment files, and OS noise.
- Updated README installation, development, and release instructions to use `extension/` and the GitHub release flow.

## v0.8.0 - 2026-05-11

This release improves favicon consistency and prepares Cotab for open-source publishing.

- Changed favicon rendering to prefer each site's normal `/favicon.ico` before falling back to Chrome's internal favicon endpoint, reducing greyed-out icons caused by discarded tabs.
- Added an MIT `LICENSE` file.
- Updated `README.md` to declare the MIT License and document Cotab's consistent favicon behavior.

## v0.7.0 - 2026-05-11

This release improves project presentation and tightens tab-row readability.

- Reduced tab metadata text, including domain and activation count, to 12px for a cleaner table rhythm.
- Rewrote `README.md` into a GitHub-ready project overview with a stronger product description, installation steps, development workflow, testing notes, icon references, privacy details, and release process guidance.
- Documented Cotab's current extension metadata, permissions, local data model, and open-source publishing note.

## v0.6.0 - 2026-05-11

This release adds localized section naming and faster bulk cleanup controls.

- Translated the section titles in Chinese mode from `Active` and `Staged` to `活跃` and `暂存`.
- Added a compact `× Close all N tabs` action to the right side of both section headers.
- Active bulk close closes all currently visible Active tabs, respecting the current search filter.
- Staged bulk close removes all currently visible Staged items, also respecting the current search filter.
- Added background message support for removing multiple Staged items in one action.

## v0.5.0 - 2026-05-11

This release fixes a few new-tab polish issues and makes language selection behave predictably.

- Hid the page footer/status area by default so the new tab surface stays visually clean.
- Removed duplicate browser-native tooltips from Staged action buttons, keeping only Cotab's custom tooltip treatment.
- Fixed default language selection so Cotab follows the browser/system language unless the user explicitly switches language.
- Added tests for the language preference fallback and manual override behavior.

## v0.4.0 - 2026-05-11

This release tightens the page chrome and adds language awareness to Cotab.

- Reduced Active and Staged section titles to compact 18px headings with 12px supporting text.
- Removed the redundant `Cotab` eyebrow above the quote area.
- Added a Chinese/English language toggle beside the theme button, defaulting to the browser or system language.
- Localized key interface text, search placeholders, status messages, and action tooltips for Chinese and English.
- Updated quotes so the selected language becomes the primary line while the other language remains as a smaller companion line.
- Removed default borders and backgrounds from action buttons and the theme/language controls, keeping hover feedback for clarity.

## v0.3.0 - 2026-05-11

This release refines the tab table layout for faster scanning and more confident actions.

- Adjusted the workspace split so Active uses three fifths of the page and Staged uses two fifths.
- Removed individual tab row card backgrounds and borders, replacing them with subtle divider lines between rows.
- Added hover highlights for tab rows to make scanning and targeting easier.
- Added tooltips for tab action buttons, including `Store for later use`, `Close tab`, `Restore tab`, and `Remove staged item`.
- Strengthened action button hover states so each operation gives clearer visual feedback.

## v0.2.0 - 2026-05-11

This release reshapes Cotab into a cleaner two-pane workspace for everyday tab control.

- Updated the new tab page title to `Cotab` and kept the extension identity consistent across the manifest and package metadata.
- Expanded the quote library with a richer mix of Chinese classics and international thinkers, including Wang Yangming, Zhuangzi, Sunzi, Laozi, Confucius, Mencius, the I Ching, Marcus Aurelius, Seneca, Epictetus, Aristotle, and others.
- Replaced the previous shelve/archive flow with a simpler `Active` and `Staged` model.
- Added per-tab icon actions: `Stage` saves the tab into Staged and closes it, while `Close` closes the tab without saving.
- Moved Active and Staged into a side-by-side layout, with Active taking three quarters of the workspace and Staged taking one quarter.
- Restyled Staged as a lighter companion panel and moved tab counts into the section titles.
- Kept search as an inline, input-as-you-type control that filters both Active and Staged lists.

Release process note: after each successful build for future requirement changes, bump the version by `0.1` and add a dated entry here.
