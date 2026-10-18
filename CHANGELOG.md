# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.17] - 2026-10-18

### Fixed

- Preserve the Lovelace graphical editor's alarm entity dropdown and card name input during frequent Home Assistant state updates.
- Avoid rebuilding editor controls when Home Assistant echoes unchanged visible configuration settings, preventing interrupted selection and text entry.

### Validation

- Build and browser validation pending; graphical editor fix is intended to address the issue reported in [#3](https://github.com/minimicro34/ha-spc-flexc-card/issues/3).
- Multi-panel operation in v1.0.16 was confirmed by a tester with two SPC panels.

**Full Changelog**: [v1.0.16...v1.0.17](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.16...v1.0.17)

## [1.0.16] - 2026-10-18

### Fixed

- Scope area and zone entities to the selected SPC configuration entry, preventing collisions when multiple panels use identical area or zone IDs.
- Block alarm, zone restore and mapping-gate commands if their target entity cannot be verified as belonging to the selected SPC.
- Remove global entity fallbacks for mapping gates, zone inhibition and isolation.
- Ignore stale registry results when switching between SPC panels in the card editor.

### Validation

- Multi-panel runtime verification remains pending with a tester using two SPC panels.

**Full Changelog**: [v1.0.15...v1.0.16](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.15...v1.0.16)

## [1.0.15] - 2026-10-17

### Added

- Display the last arming and last disarming events together in each expanded SPC area card, regardless of its current alarm state.
- Show the configured SPC user display alias when available, falling back to the original SPC user name and then the user ID.

### Changed

- Read the new `last_arm_*` and `last_disarm_*` area attributes, while retaining compatibility with legacy `last_set_*` and `last_unset_*` attributes.
- Omit history entries that have no available timestamp.

### Documentation

- Explain dual area history, user alias display and compatibility with older SPC FlexC integration versions.

### Notes

- Full user alias and separate arm/disarm history support requires SPC FlexC integration v1.1.2-beta24 or later.
- Area history is read from the integration; the card does not reconstruct missing events.

**Full Changelog**: [v1.0.14...v1.0.15](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.14...v1.0.15)

## [1.0.14] - 2026-10-15

### Fixed

- Synchronize the intrusion banner during partial card updates so it disappears immediately after disarming without requiring a tab switch or page refresh.
- Update the banner when active intrusion areas or triggering zones change, while preserving the stable card shell and avoiding full-card flicker.

### Notes

- This is a frontend rendering fix; no changes to SPC FlexC intrusion event processing are included.

**Full Changelog**: [v1.0.13...v1.0.14](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.13...v1.0.14)

## [1.0.13] - 2026-10-15

### Added

- Display a flashing red intrusion banner when an area is in an active intrusion alarm state.
- Show affected areas and triggering zone names in the intrusion banner.

### Fixed

- Keep the individual **Disarm / Désarmer** action available in the Areas tab when an area is in the `triggered` state.

### Notes

- Intrusion details require an SPC FlexC integration version supporting intrusion alarm tracking (v1.1.2-beta16 or later).
- The banner uses alarm state and zone information reported by the integration.

**Full Changelog**: [v1.0.12...v1.0.13](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.12...v1.0.13)

## [1.0.12] - 2026-10-15

### Added

- Display a dedicated **Mixed / Mixte** global alarm state when the SPC FlexC integration reports `arming_summary=mixed` while the native Home Assistant alarm state is `unknown`.
- Add a localized mixed-state label, warning styling and a dedicated icon.

### Notes

- Home Assistant has no native mixed arming state. The card uses the integration's explicit `arming_summary` attribute rather than inferring mixed modes from an `unknown` state.
- Requires an SPC FlexC integration version exposing the `arming_summary` attribute.

**Full Changelog**: [v1.0.11...v1.0.12](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.11...v1.0.12)

## [1.0.11] - 2026-10-15

### Added

- Add contextual zone restoration controls for SPC FlexC v1.1.2-beta11.
- Display a **Restore / Restaurer** button only when the integration reports that zone restoration is currently allowed.
- Use the native Home Assistant `button.press` service exposed by the integration.
- Respect the card's existing confirmation setting before restoring a zone.
- Add French and English translations for zone restoration.

### Documentation

- Document contextual zone restoration and its dependency on the state exposed by the SPC FlexC integration.

### Notes

- Zone restoration requires an SPC FlexC integration version exposing the native zone restore button, starting with v1.1.2-beta11.
- The SPC panel and integration remain authoritative for restoration availability and post-command verification.

**Full Changelog**: [v1.0.10...v1.0.11](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.10...v1.0.11)

## [1.0.10] - 2026-09-24

### Fixed

- Prevent panel-level X-BUS fault entities such as battery and mains faults from being misidentified as physical X-BUS devices.
- Restrict unique-ID fallback discovery to numeric or hexadecimal X-BUS device identities while preserving legacy numeric IDs and serial-based identities.

### Notes

- Physical X-BUS devices continue to use their serial number as the frontend identity when available.
- This keeps devices with duplicate local X-BUS IDs separate without creating spurious `X-BUS null` cards.

**Full Changelog**: [v1.0.9...v1.0.10](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.9...v1.0.10)

## [1.0.9] - 2026-09-23

### Fixed

- Group X-BUS diagnostics by device serial identity instead of assuming that the local X-BUS ID is globally unique.
- Preserve separate X-BUS cards when multiple devices share the same local ID.
- Support serial-based X-BUS entity unique IDs, including hexadecimal serial numbers exposed by SPC FlexC v1.1.2 beta builds.
- Preserve expanded/collapsed X-BUS card state using the serial-based device identity.

### Notes

- The local X-BUS ID remains visible as diagnostic information but is no longer used as the frontend device identity.
- This aligns the card with the serial-based X-BUS identity model introduced for installations with duplicate local IDs.

**Full Changelog**: [v1.0.8...v1.0.9](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.8...v1.0.9)

## [1.0.8] - 2026-09-19

### Added

- Display X-BUS tamper inhibition as a dedicated state alongside tamper fault and isolation.
- Keep active X-BUS tamper fault, inhibition and isolation visible in collapsed device headers.
- Add localized **Inhibited / Inhibé** and **Not inhibited / Non inhibé** X-BUS state labels.

### Changed

- Use the same orange/amber visual convention for X-BUS tamper inhibition as for inhibited detectors.

### Fixed

- Preserve the already-rendered card shell during same-tab live updates instead of replacing the complete visible card DOM on every SPC zone state change.
- Reduce full-card flicker and vertical jumping observed on Windows desktop browsers when detectors change state.
- Keep the existing render pipeline, extension post-processing and event handlers intact by transplanting the freshly rendered active-view content into the stable card shell before browser paint.

### Notes

- X-BUS tamper inhibition, isolation and fault states are consumed from the dedicated states exposed by SPC FlexC v1.1.1.
- Full card rendering is still used when the active tab or available tab set changes.

**Full Changelog**: [v1.0.7...v1.0.8](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.7...v1.0.8)

## [1.0.7] - 2026-09-17

### Added

- Added dedicated SPC zone isolation state discovery from the Home Assistant isolation switch entities introduced by SPC FlexC v1.1.0.
- Added a distinct isolated-zone visual state and **Isolated / Isolé** badge.
- Added a dedicated `src/spc-flexc-zone-isolation.js` source module.

### Changed

- Zone isolation is derived from the dedicated integration entity rather than inferred from a raw SPC `STATUS` value.
- Isolated zones are visually distinct from inhibited zones and use the alarm/fault red visual convention.
- Build and validation scripts now include the zone isolation source module.

### Notes

- SPC zone inhibition and isolation remain separate states. The SPC panel and SPC FlexC integration remain authoritative for the operations currently allowed on each zone.
- v1.0.7 is intended for validation with SPC FlexC integration v1.1.0 before the final card release.

**Full Changelog**: [v1.0.6...v1.0.7](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.6...v1.0.7)

## [1.0.6] - 2026-09-13

### Added

- Added responsive wide-screen layouts for Areas, Doors, Outputs and the System view.
- Added collapsible area cards, collapsed by default, while keeping the current arming state visible in the header.
- Added **Expand all** / **Collapse all** controls for area cards.
- Added X-BUS device discovery from integration entity unique IDs so newer X-BUS diagnostic entities are grouped with their device even when they do not expose `xbus_device_id` attributes.
- Added detailed X-BUS diagnostics including electrical, hardware and raw protocol values exposed by the integration.
- Added collapsible X-BUS device cards, collapsed by default while retaining the device name and tamper state in the header.
- Added collapsible ATP cards in FlexC communication diagnostics, collapsed by default while retaining the ATP name and state in the header.

### Changed

- The card now requests the full available card width in Home Assistant Sections views and adapts its internal layout to the actual width it receives.
- Wide System layouts are organized into three logical columns: panel/power/RF/modem, X-BUS, and FlexC ATS/ATP communication.
- X-BUS RF fields are no longer duplicated in the generic RF section when they already belong to an X-BUS device.
- Areas, Doors and Outputs use up to three columns on wide cards and fall back to a single column on narrow/mobile layouts.
- The build and distribution validation now derive the card version from `package.json`, keeping release version metadata in a single authoritative location.
- Build and validation scripts now include the dedicated responsive, area-card, X-BUS and FlexC communication source modules.

### Notes

- For the three-column desktop layout, use a Home Assistant **Sections** dashboard and set the section containing SPC FlexC Card to **Width 3**. Home Assistant automatically reduces the section width on smaller displays, while the card switches back to its single-column layout.
- The browser-loaded card version remains available in **System → Panel / Centrale** to help detect stale frontend cache after HACS updates.

**Full Changelog**: [v1.0.5...v1.0.6](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.5...v1.0.6)

## [1.0.5] - 2026-09-12

### Added

- Added detector grouping by SPC area in the Detectors view.
- Added per-area expand/collapse controls.
- Added global **Expand all** / **Collapse all** controls.
- Added compact area summaries showing detector count, tamper count, active zones, active tamper faults, inhibited zones and unavailable zones.
- Added persistent per-area expanded/collapsed state in browser local storage.
- Added centralized French and English card translations in `src/spc-flexc-i18n.js`.
- Added automatic language selection from Home Assistant `hass.locale.language`, with browser language as fallback.
- Added localization coverage for the card UI, detector states, area grouping controls, diagnostics, editor labels and confirmation prompts.

### Changed

- Detector groups now start collapsed by default on first display, regardless of installation size.
- Per-area expand/collapse choices remain persisted in browser local storage after the initial display.
- Inhibited zones are highlighted in their area summary, including while the area is collapsed.
- The build now includes the dedicated detector grouping and translation source modules.
- Project checks now validate all card source modules, including grouping and localization.
- Updated card source version markers, package metadata, build metadata and documentation for v1.0.5.

### Notes

- SPC FlexC Card is a custom Lovelace dashboard resource rather than a Home Assistant integration package. Home Assistant does not automatically load integration-style `strings.json` / `translations/*.json` files for dashboard cards, so translations are bundled in the card JavaScript source.
- The browser-loaded card version remains available in **System → Panel / Centrale** to help detect stale frontend cache after HACS updates.

**Full Changelog**: [v1.0.4...v1.0.5](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.4...v1.0.5)

## [1.0.4] - 2026-09-12

### Added

- Added the SPC FlexC Card version to the System view, making it easy to verify which frontend version is actually loaded by the browser.

### Changed

- Improved live zone rendering introduced in v1.0.3.
- Multiple SPC zone state changes occurring during the same browser frame are now coalesced into a single render.
- Added a dedicated render scheduler using `requestAnimationFrame()`.
- Added a fallback when `requestAnimationFrame()` is unavailable.
- Pending scheduled renders are cancelled when the card is disconnected.
- Moved render scheduling into its own source module to keep it separate from SPC Outputs-specific functionality.
- Updated build and validation scripts for the additional source module.

**Full Changelog**: [v1.0.3...v1.0.4](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.3...v1.0.4)

## [1.0.3] - 2026-09-11

### Added

- Added a dedicated Home Assistant `state_changed` subscription for live SPC zone updates.
- Added a temporary live-state cache so zone changes can be displayed immediately without waiting for the normal Lovelace `hass.states` refresh.

### Changed

- Zone rendering now uses the latest live event state when it is newer than the state provided by Lovelace.
- Live cached states are automatically reconciled and discarded once the normal Home Assistant state catches up.
- Live zone subscription handling is implemented in the core card rather than in the SPC Outputs extension.
- WebSocket subscriptions are cleaned up when the card is disconnected.

### Fixed

- Improved reliability of zone state updates when the card did not visually refresh despite Home Assistant already having received the new zone state.

**Full Changelog**: [v1.0.2...v1.0.3](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.2...v1.0.3)

## [1.0.2] - 2026-09-09

### Added

- Added a conditional **Outputs** view for SPC Mapping Gates exposed by the SPC FlexC integration.
- Added automatic discovery of Mapping Gate switches from the Home Assistant entity registry and their `mg_id` metadata.
- Added current Mapping Gate ON/OFF state display.
- Added explicit **ON** and **OFF** controls for each Mapping Gate on the same row.
- Added SPC door DPS and DRS input values to the **Doors** view when available.
- Added interpreted door mode labels for the values validated on real hardware: `0 = Normal`, `1 = Access forbidden`, `2 = Free access`.

### Changed

- The **Doors** view is now primarily a supervision view and no longer presents FlexC door mode commands as guaranteed physical door or lock actuation.
- Mapping Gates are presented as SPC logical outputs / logical interactions rather than as direct physical panel outputs.
- The generated distribution now includes the dedicated `src/spc-flexc-outputs.js` source module during `npm run build`.
- Project checks now validate both JavaScript source files and ensure the generated distribution carries the expected card version.

### Notes

- In SPC terminology, the outputs shown by this card are **Mapping Gates**. They are logical outputs/interactions managed by the panel.
- A Mapping Gate can be associated with a physical output or another programmed function in SPC, but this depends on the panel configuration.
- Mapping Gate control uses the native Home Assistant switch entities exposed by SPC FlexC.

**Full Changelog**: [v1.0.1...v1.0.2](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.1...v1.0.2)

## [1.0.1] - 2026-09-08

### Added

- Added support for custom SPC Part Set A and Part Set B names exposed by the SPC FlexC integration.
- Added a conditional **Doors** view for SPC access-control doors discovered by the integration.
- Added automatic display of the door name, associated SPC areas and associated zone when available.
- Added raw SPC door **Status** and **Mode** values for validation on real hardware.
- Added native door controls for momentary opening, permanent opening, return to normal mode and locking.

### Changed

- Area partial-set buttons now display the custom SPC name when available instead of always showing `Partiel A` or `Partiel B`.
- Area armed-state badges now use the same custom partial-set names.
- The card keeps `Partiel A` and `Partiel B` as fallbacks when no custom name is exposed by the integration.
- The **Doors** tab is hidden when no SPC door is discovered.
- Door commands use the native Home Assistant button entities exposed by SPC FlexC and follow the card confirmation setting.

### Safety

- Door `Status` and `Mode` values remain intentionally uninterpreted until their numeric mappings are confirmed on real SPC access-control hardware.
- Door commands are state-changing actions and remain protected by confirmation when `confirm_actions: true` is enabled.

**Full Changelog**: [v1.0.0...v1.0.1](https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.0...v1.0.1)

## [1.0.0]

### Added

- Initial public release of SPC FlexC Card.
- General alarm overview.
- Area view with per-area controls.
- Detector and tamper discovery.
- Technical/system view.
- Home Assistant registry-based SPC FlexC entity scoping.
