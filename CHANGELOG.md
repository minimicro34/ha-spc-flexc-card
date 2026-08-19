# Changelog

All notable changes to SPC FlexC Card are documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-08-19

### Added

- Added four dedicated views: General, Areas, Detectors and System.
- Added global SPC alarm state display.
- Added global Disarm and Full Set controls with confirmation dialogs.
- Added area, detector and tamper summary counters.
- Added individual SPC area controls.
- Added contextual Arm / Disarm actions according to the current area state.
- Added Part Set A and Part Set B controls only when supported by the area.
- Added last Set / Unset information for each area.
- Added localized Set / Unset timestamps and user information when available.
- Added FlexC connection status.
- Added active SPC fault display.
- Added Engineer / Installer mode indication.
- Added detector and tamper visualization.
- Added dedicated tamper grouping in the Detectors view.
- Added dedicated System view for technical SPC and FlexC information.
- Added panel manufacturer, model, firmware, hardware and serial information
  when available.
- Added panel power and battery diagnostics when exposed by the integration.
- Added RF and modem diagnostic information when available.
- Added dynamic X-BUS device and diagnostic display.
- Added dynamic FlexC ATS and ATP discovery.
- Added ATS active-path display.
- Added ATP fault status.
- Added last successful transmission timestamp for each ATP.
- Added persistent active-tab selection across card rerenders and page reloads.
- Added a Home Assistant visual card editor.
- Added HACS Dashboard repository support.
- Added CI and HACS validation workflows.

### Changed

- Reworked the original dashboard into four purpose-specific views.
- General is now the compact daily-use view.
- Technical and diagnostic information is displayed in the dedicated System
  view instead of the daily-use view.
- Removed the technical `alarm_control_panel` entity ID from the card header.
- Improved responsive presentation of area, detector and tamper counters.
- Improved detector state presentation with distinct normal, activity, fault
  and unavailable states.
- Detector visual states now follow the SPC states and attributes exposed by
  the integration.
- Improved tamper presentation so real tamper conditions are visually
  distinguished from normal detector activity.
- FlexC communication paths are dynamically grouped by ATS.
- ATP numbering displayed by the card is local to each ATS.
- Internal FlexC ATP identifiers remain internal and are not exposed as
  user-facing ATP numbers.
- ATP active/inactive state follows the active path reported by its ATS.
- An active ATP without a reported fault is displayed as OK.
- An inactive fallback ATP without a fault is displayed as inactive.
- ATP fault conditions take precedence and are displayed as faults.
- Missing SPC, ATS, ATP, X-BUS and diagnostic information is omitted instead
  of being represented by fictitious values.

### Safety

- Confirmation dialogs are enabled by default for state-changing alarm
  actions.
- State-changing alarm actions are not automatically retried.
- The card does not bypass SPC readiness checks or force commands rejected by
  the panel.
- The SPC panel and SPC FlexC integration remain authoritative for alarm state
  and command validation.

### Validated

SPC FlexC Card v1.0.0 has been tested with a real SPC FlexC Home Assistant
installation.

Validated behaviour includes:

- global alarm state and controls;
- individual area state and controls;
- conditional partial-set controls;
- last Set / Unset information;
- detector state display;
- detector activity display;
- tamper state display;
- real-time SPC diagnostic faults;
- Engineer / Installer mode indication;
- FlexC connection state;
- ATS/ATP topology;
- multiple ATP paths associated with an ATS;
- ATS with a single ATP path;
- active and inactive ATP path presentation;
- ATP fault presentation;
- ATP last successful transmission;
- X-BUS diagnostics;
- active-tab persistence across rerenders and page reloads;
- desktop Home Assistant dashboard rendering.

### Development

- Source code is maintained in `src/ha-spc-flexc-card.js`.
- `npm run build` generates the distributable `ha-spc-flexc-card.js` at the
  repository root.
- `npm run check` validates JavaScript syntax and verifies that the generated
  distribution file is current.
- `git diff --check` is used to detect whitespace errors.

**Full Changelog**:
https://github.com/minimicro34/ha-spc-flexc-card/commits/v1.0.0
