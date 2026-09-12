# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.4]

### Changed

- Improved live zone rendering introduced in v1.0.3.
- Multiple SPC zone state changes occurring during the same browser frame are now coalesced into a single render.
- Added a dedicated render scheduler using `requestAnimationFrame()`.
- Added a fallback when `requestAnimationFrame()` is unavailable.
- Pending scheduled renders are cancelled when the card is disconnected.
- Moved render scheduling into its own source module to keep it separate from SPC Outputs-specific functionality.
- Updated build and validation scripts for the additional source module.

## [1.0.3]

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
- Project checks now validate both JavaScript source files and ensure the generated distribution is stamped with version `1.0.2`.

### Notes

- In SPC terminology, the outputs shown by this card are **Mapping Gates**. They are logical outputs/interactions managed by the panel.
- A Mapping Gate can be associated with a physical output or another programmed function in SPC, but this depends on the panel configuration. The card therefore does not assume that every Mapping Gate corresponds directly to an OP terminal.
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
