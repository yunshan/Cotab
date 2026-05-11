# Cotab Release Notes

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
