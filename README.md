# SPC FlexC Card

> Dedicated Lovelace dashboard card for the SPC FlexC Home Assistant integration.

<p align="center">

[![GitHub Release](https://img.shields.io/github/v/release/minimicro34/ha-spc-flexc-card)](https://github.com/minimicro34/ha-spc-flexc-card/releases)
[![CI](https://github.com/minimicro34/ha-spc-flexc-card/actions/workflows/ci.yml/badge.svg)](https://github.com/minimicro34/ha-spc-flexc-card/actions/workflows/ci.yml)
[![HACS](https://github.com/minimicro34/ha-spc-flexc-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/minimicro34/ha-spc-flexc-card/actions/workflows/hacs.yml)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-SPC%20FlexC-41BDF5.svg)](https://www.home-assistant.io/)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-FFDD00?logo=buymeacoffee&logoColor=000000)](https://buymeacoffee.com/minimicro34)
[![License](https://img.shields.io/github/license/minimicro34/ha-spc-flexc-card)](LICENSE)

</p>

<p align="center">
  🔐 Alarm control • 🏠 Areas • 🚪 Detectors • 🚪 Access-control doors • 🔌 Mapping Gate outputs • 📡 FlexC • 🩺 Diagnostics
</p>

SPC FlexC Card is a custom Home Assistant dashboard card designed for the
[SPC FlexC integration](https://github.com/minimicro34/ha-spc-flexc).

It provides a dedicated interface for everyday alarm control while keeping
technical SPC and FlexC information available in a separate system view.

> [!IMPORTANT]
> This card can trigger alarm and Mapping Gate state-changing services.
> Confirmation dialogs are enabled by default for supported actions.

## Screenshots

### General

![SPC FlexC Card - General view](images/general.png)

### Areas

![SPC FlexC Card - Areas view](images/areas.png)

### Detectors

![SPC FlexC Card - Detectors view](images/detectors.png)

### System

![SPC FlexC Card - System view 1](images/system1.png)

![SPC FlexC Card - System view 2](images/system2.png)

The **Doors** view is displayed only when the SPC FlexC integration discovers at
least one SPC access-control door. The **Outputs** view is displayed only when at
least one SPC Mapping Gate is exposed by the integration.

## Features

### General

The General view includes:

- global alarm state;
- area, detector and tamper counters;
- FlexC connection status;
- active SPC faults;
- Engineer / Installer mode indication when active;
- global Disarm and Full Set controls.

### Areas

The Areas view provides individual SPC area control and can display:

- current arming state;
- Arm or Disarm action according to the current state;
- Part Set A when supported by the area;
- Part Set B when supported by the area;
- custom Part Set A / Part Set B names exposed by the integration;
- last Set / Unset information;
- localized date and time;
- user name, with user ID as fallback.

The SPC panel remains authoritative for arming availability and validation.

### Detectors

The Detectors view displays SPC zones using the states and attributes exposed by
the SPC FlexC integration.

Starting with **v1.0.5**, zones are grouped by SPC area. Each area can be
expanded or collapsed independently, and the card provides global **Expand all**
and **Collapse all** controls.

For large installations, groups start collapsed by default when more than 40
zones are present. The expanded/collapsed state is stored locally in the browser
for the selected SPC alarm entity.

Collapsed area headers still show useful information such as:

- number of detectors;
- number of tamper zones;
- active detectors;
- active tamper faults;
- unavailable zones.

This keeps installations with more than one hundred zones usable without
rendering every detector row all the time.

The visual convention is:

- green — normal;
- orange — normal activity such as movement or opening;
- red — alarm, fault or tamper;
- grey — unavailable or unknown.

### Doors

The **Doors** tab is displayed automatically when at least one SPC
access-control door is discovered.

For each discovered door, the card can display:

- SPC door name;
- associated areas;
- associated SPC zone;
- raw SPC Status value;
- interpreted SPC Mode value where validated;
- DPS and DRS input values when exposed by the integration.

Validated door mode values are:

- `0` — Normal;
- `1` — Access forbidden;
- `2` — Free access.

The door view is intentionally treated primarily as a supervision view. A door
mode reported by FlexC must not be interpreted as proof that a physical lock or
relay has actuated.

### Outputs / Mapping Gates

The **Outputs** tab is displayed automatically when the SPC FlexC integration
exposes at least one Mapping Gate.

The word **Output** in this view refers to an SPC **Mapping Gate**. Mapping Gates
are logical outputs / logical interactions managed by the SPC panel and are not
necessarily identical to physical OP terminals.

For each Mapping Gate, the card displays:

- configured name;
- Mapping Gate ID;
- current ON/OFF state;
- explicit ON and OFF controls.

The controls use the native Home Assistant `switch.turn_on` and
`switch.turn_off` services.

### System

The System view contains technical and diagnostic information such as:

- card version loaded by the browser;
- manufacturer;
- model;
- firmware and hardware information;
- serial number;
- panel power and battery information;
- RF and modem diagnostics;
- X-BUS devices and diagnostics;
- FlexC ATS paths;
- ATP paths associated with each ATS;
- active FlexC path;
- ATP fault state;
- last successful transmission timestamp for each ATP.

The displayed card version is useful after HACS upgrades to verify that the
browser is not still serving a cached JavaScript resource.

## Localization

SPC FlexC Card v1.0.5 includes centralized **French and English** translations.
The card follows the Home Assistant frontend language through
`hass.locale.language`, with the browser language used as a fallback.

A custom Lovelace dashboard card is not a Home Assistant integration package,
so Home Assistant does not automatically load integration-style
`strings.json` / `translations/*.json` files for it. To keep HACS/manual
installation self-contained and reliable, the translations are bundled in the
card JavaScript source instead.

Translations are maintained in:

```text
src/spc-flexc-i18n.js
```

This includes normal card labels, detector states, grouped-area controls such as
**Expand all / Collapse all**, diagnostics, editor labels and confirmation
prompts.

## Requirements

- Home Assistant;
- the SPC FlexC custom integration;
- HACS is recommended for installation and updates.

Integration repository:

```text
https://github.com/minimicro34/ha-spc-flexc
```

## Installation

### HACS

Add this repository as a custom repository in HACS:

```text
https://github.com/minimicro34/ha-spc-flexc-card
```

Repository type:

```text
Dashboard
```

Then install **SPC FlexC Card** and reload the frontend if required.

### Manual installation

Copy the built file:

```text
ha-spc-flexc-card.js
```

to a location served by Home Assistant and add it as a Lovelace JavaScript
module resource.

## Configuration

Minimal configuration:

```yaml
type: custom:spc-flexc-card
entity: alarm_control_panel.spc_alarm
```

Full example:

```yaml
type: custom:spc-flexc-card
entity: alarm_control_panel.spc_alarm
name: SPC FlexC
show_controls: true
confirm_actions: true
```

The card also provides a visual editor in Home Assistant.

## Options

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `entity` | Yes | — | Global SPC FlexC alarm entity |
| `name` | No | `SPC FlexC` | Card title |
| `show_controls` | No | `true` | Display supported alarm and Mapping Gate actions |
| `confirm_actions` | No | `true` | Request confirmation before supported state-changing actions |

## Alarm, Mapping Gate and access-control safety

SPC FlexC Card keeps state-changing operations conservative.

Alarm and Mapping Gate actions are sent through native Home Assistant services.
The SPC panel remains authoritative for the resulting state and for any action
rejected by its own configuration.

Automatic retries of state-changing commands must not be implemented.

Mapping Gates are logical panel objects. Before controlling one, verify in SPC
what it is mapped to.

Door mode changes must not be interpreted as proof that a physical door or lock
has actuated.

## Dynamic information

The exact information displayed depends on:

- SPC panel model;
- SPC firmware;
- installed SPC hardware;
- configured ATS/ATP paths;
- X-BUS devices;
- installed access-control hardware;
- configured Mapping Gates;
- FlexC reporting and control permissions;
- entities and attributes exposed by the installed SPC FlexC integration.

Missing information is simply not displayed.

## Development

The card is split into dedicated source modules:

```text
src/ha-spc-flexc-card.js
src/spc-flexc-outputs.js
src/spc-flexc-zone-groups.js
src/spc-flexc-i18n.js
src/spc-flexc-render-scheduler.js
```

Their responsibilities are:

- `ha-spc-flexc-card.js` — main card, alarm, area, detector and system logic;
- `spc-flexc-outputs.js` — Mapping Gates, door supervision and zone inhibition;
- `spc-flexc-zone-groups.js` — detector grouping by SPC area and collapse state;
- `spc-flexc-i18n.js` — centralized French/English localization;
- `spc-flexc-render-scheduler.js` — coalesced rendering and loaded card version display.

Build the distributable file with:

```bash
npm run build
```

Run checks with:

```bash
npm run check
git diff --check
```

`npm run check` validates every source module and confirms that the generated
root `ha-spc-flexc-card.js` exactly matches the current sources and version.

Do not edit the generated root file directly. Edit files under `src/` and run
`npm run build`.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before
submitting changes.

Useful contributions include:

- bug fixes;
- visual improvements;
- additional SPC entities or diagnostics;
- improved mobile and desktop layouts;
- accessibility improvements;
- additional translations;
- documentation.

> [!WARNING]
> Never publish FlexC encryption keys, Command Profile passwords, SPC user
> PINs, installer codes or other alarm credentials in Issues, Pull Requests,
> logs or screenshots.

## Disclaimer

SPC FlexC Card is an independent open-source project.

It is not affiliated with, endorsed by, or supported by Siemens, Vanderbilt,
Comelit or Home Assistant.

Alarm and access-control systems are security equipment. Always validate the
behaviour of your specific panel, SPC FlexC integration and Home Assistant
installation before relying on dashboard control.

## Support

If you find SPC FlexC Card useful and would like to support its development,
you can buy me a coffee:

https://buymeacoffee.com/minimicro34

Please use GitHub Issues for bug reports and feature requests and include, when
possible:

- SPC FlexC Card version;
- SPC FlexC integration version;
- Home Assistant version;
- browser and device type;
- affected card view;
- screenshots when relevant;
- browser console errors;
- relevant Home Assistant entity states or attributes.

Never include passwords, PINs, FlexC encryption keys or other alarm
credentials.

## Related project

SPC FlexC Home Assistant integration:

```text
https://github.com/minimicro34/ha-spc-flexc
```

## License

Copyright © 2026 minimicro34.

This project is licensed under the [GNU General Public License v3.0 or later](LICENSE).
