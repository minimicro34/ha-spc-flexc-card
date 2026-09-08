# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
