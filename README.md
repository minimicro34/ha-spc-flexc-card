# SPC FlexC Card

A dedicated Home Assistant Lovelace card for the [SPC FlexC integration](https://github.com/minimicro34/ha-spc-flexc).

The card provides four core views plus a conditional **Doors** view when SPC access-control doors are discovered:

- **General** — overall alarm state, counts, diagnostics and global controls.
- **Areas** — one card per SPC area, with area state and available arm/disarm controls.
- **Detectors** — dynamically discovered SPC zones and tampers.
- **Doors** — shown only when access-control doors are exposed by SPC FlexC.
- **System** — panel identity, power, FlexC communication, X-BUS, RF and modem information when available.

## Requirements

- Home Assistant
- [SPC FlexC](https://github.com/minimicro34/ha-spc-flexc)
- A recent SPC FlexC version exposing the entities used by the card

## Installation with HACS

1. Add this repository as a custom frontend repository in HACS.
2. Install **SPC FlexC Card**.
3. Refresh the browser after installation or update.
4. Add the card to a dashboard.

Example:

```yaml
type: custom:spc-flexc-card
entity: alarm_control_panel.spc_flexc
```

Optional settings:

```yaml
type: custom:spc-flexc-card
entity: alarm_control_panel.spc_flexc
name: SPC FlexC
show_controls: true
confirm_actions: true
```

## General

The General view displays the panel state, the number of discovered areas and detectors, active detectors and tamper faults, FlexC connection diagnostics, active system faults and the main alarm controls.

The exact information shown depends on what the SPC FlexC integration exposes for the connected panel.

## Areas

Each SPC area is displayed separately with its current alarm state, associated detectors, active zones, tamper state and the most recent arm/disarm information when available.

### Custom Part Set names

SPC FlexC can expose the names configured in the SPC panel for **Part Set A** and **Part Set B**.

When available, the card automatically uses those names in:

- the area control buttons;
- the displayed armed-state badge.

For example, if the SPC panel names Part Set A `Nuit`, the card displays **Nuit** instead of **Partiel A**.

If no custom name is exposed, the card keeps the fallback labels **Partiel A** and **Partiel B**.

No additional card configuration is required.

## Detectors

SPC zones are discovered automatically from Home Assistant entities exposed by the SPC FlexC integration.

The card groups normal detectors and tamper entities and displays an appropriate state according to the Home Assistant device class and SPC zone information.

No manual detector `entity_id` list is required.

## Doors

The **Doors** tab appears automatically when at least one SPC access-control door is discovered through the SPC FlexC integration. If the installation has no SPC door controller, the tab remains hidden.

For each discovered door, the card displays:

- the door name, using the SPC zone name when available;
- the associated SPC areas, for example `Garage ↔ Studio`;
- the raw SPC **Status** value;
- the raw SPC **Mode** value;
- the associated SPC zone when available.

When the corresponding native Home Assistant button entities are exposed by SPC FlexC, the card also provides the following controls:

- **Ouverture momentanée**;
- **Ouverture permanente**;
- **Retour au mode normal**;
- **Verrouiller**.

The door view is fully dynamic and does not require manual button or sensor entity IDs.

### Door validation status

The card intentionally displays numeric **Status** and **Mode** values without translating them into semantic labels such as “locked”, “unlocked” or “open”. Those mappings are kept raw until they have been confirmed on real SPC access-control hardware.

The door commands are state-changing actions. When `confirm_actions: true` is enabled, the card asks for confirmation before sending a door command.

## System

The System view uses the Home Assistant entity and device registries to group information belonging to the same SPC FlexC configuration entry.

Depending on the connected panel and the integration version, it can display:

- panel manufacturer, model, firmware, hardware and serial number;
- AC frequency, battery voltage and auxiliary supply information;
- FlexC ATS/ATP communication information;
- X-BUS devices and tamper state;
- RF and modem entities.

Unavailable information is simply omitted.

## Dynamic discovery

The card is designed around the integration data rather than manually configured entity lists.

Areas, detectors, diagnostics, communication entities and access-control doors are resolved dynamically from the selected SPC FlexC alarm entity and its Home Assistant registry metadata.

This allows the same card configuration to adapt to different SPC installations and to newly discovered entities.

## Safety

SPC FlexC controls can change the state of a real alarm and, when access control is present, real doors.

The card therefore enables confirmations by default:

```yaml
confirm_actions: true
```

Keep confirmations enabled unless you explicitly want one-tap control.

Before testing door locking or permanent opening on a real installation, remain on site and keep another means of access available.

## Troubleshooting

After upgrading the card, perform a hard browser refresh if the old frontend code is still cached.

If a view is missing information:

1. verify that the corresponding entities exist in Home Assistant;
2. confirm they belong to the same SPC FlexC configuration entry as the selected alarm entity;
3. update SPC FlexC and this card to compatible versions;
4. provide a Home Assistant diagnostic from the SPC FlexC integration when reporting an issue.

For door-related reports, include the observed physical behavior, the values shown for **Status** and **Mode**, and a fresh SPC FlexC diagnostic whenever possible.

## Development

The source file is stored in `src/ha-spc-flexc-card.js` and the distributable file is `ha-spc-flexc-card.js`.

The current 1.0.1 build loads the previous card implementation from `ha-spc-flexc-card-base.js` and layers the access-control door view on top. The source directory contains the matching base file for development builds.

Run the project build/check commands before publishing a release.

## License

See [LICENSE](LICENSE).
