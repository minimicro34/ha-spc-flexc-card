# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

**Full Changelog**: https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.6...v1.0.7

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

**Full Changelog**: https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.5...v1.0.6

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

**Full Changelog**: https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.4...v1.0.5

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

**Full Changelog**: https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.3...v1.0.4

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

**Full Changelog**: https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.2...v1.0.3

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

**Full Changelog**: https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.1...v1.0.2

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

**Full Changelog**: https://github.com/minimicro34/ha-spc-flexc-card/compare/v1.0.0...v1.0.1

## [1.0.0]

### Added

- Initial public release of SPC FlexC Card.
- General alarm overview.
- Area view with per-area controls.
- Detector and tamper discovery.
- Technical/system view.
- Home Assistant registry-based SPC FlexC entity scoping.
