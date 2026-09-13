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
  🔐 Alarm control • 🏠 Areas • 🚪 Detectors • 🚪 Access-control doors • 🔌 Mapping Gate outputs • 📡 FlexC • X-BUS • 🩺 Diagnostics
</p>

SPC FlexC Card is a custom Home Assistant dashboard card designed for the
[SPC FlexC integration](https://github.com/minimicro34/ha-spc-flexc).

It provides a dedicated interface for everyday alarm control while keeping
technical SPC, FlexC and X-BUS information available in a separate System view.

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
- Part Set A / Part Set B when supported;
- custom Part Set names exposed by the integration;
- last Set / Unset information;
- localized date and time;
- user name, with user ID as fallback.

Starting with **v1.0.6**, area cards are collapsed by default and keep the area
name and current arming state visible in the header. Each area can be expanded
individually, and **Expand all** / **Collapse all** controls are available.

The SPC panel remains authoritative for arming availability and validation.

### Detectors

Zones are grouped by SPC area. Each group can be expanded or collapsed
independently, with global **Expand all** and **Collapse all** controls.
Collapsed headers keep useful information such as detector count, tamper count,
active zones, inhibited zones and unavailable zones.

The visual convention is:

- green — normal;
- orange — normal activity or inhibited state;
- red — alarm, fault or tamper;
- grey — unavailable or unknown.

### Doors

The **Doors** tab is displayed automatically when at least one SPC
access-control door is discovered. Depending on the integration data, the card
can show the SPC door name, associated areas and zone, status, interpreted mode,
and DPS / DRS inputs.

Validated door mode values are:

- `0` — Normal;
- `1` — Access forbidden;
- `2` — Free access.

Door information is primarily supervision data. A FlexC mode must not be
interpreted as proof that a physical lock or relay has actuated.

### Outputs / Mapping Gates

The **Outputs** tab is displayed automatically when the integration exposes at
least one Mapping Gate. Mapping Gates are SPC logical outputs / interactions and
are not necessarily identical to physical OP terminals.

For each Mapping Gate, the card displays its configured name, ID, current state
and explicit ON/OFF controls using Home Assistant switch services.

### System

The System view can display:

- loaded card version;
- panel manufacturer, model, firmware, hardware and serial number;
- panel power and battery information;
- RF and modem diagnostics;
- FlexC ATS and ATP communication paths;
- active path, ATP state and last successful transmission;
- X-BUS devices and their diagnostics;
- X-BUS voltage/current, hardware metadata and raw diagnostic values exposed by
  the integration.

Starting with **v1.0.6**, X-BUS and ATP cards are collapsible to keep large
installations readable. X-BUS RF metadata is kept with its X-BUS device instead
of being duplicated in the generic RF section.

On wide displays, the System view is organized into three logical columns:

1. panel, power, RF and modem;
2. X-BUS;
3. FlexC ATS / ATP communication.

## Wide desktop layout

SPC FlexC Card is responsive to the width that Home Assistant gives to the card.
On a sufficiently wide card, Areas, Doors, Outputs and System diagnostics can use
up to three columns. On narrow screens the same content automatically returns to
a single-column layout.

For the full three-column desktop layout in Home Assistant:

1. use a dashboard view of type **Sections**;
2. edit the section containing SPC FlexC Card;
3. set the section **Width** to **3**.

Home Assistant automatically reduces wide sections on smaller displays, so the
same dashboard remains suitable for phones and tablets. No custom card CSS or
manual width override is required.

## Localization

The card includes centralized French and English translations and follows Home
Assistant's frontend language through `hass.locale.language`, with the browser
language as fallback.

Translations are bundled directly in the card JavaScript source because custom
Lovelace cards do not automatically load integration-style `strings.json` /
`translations/*.json` files.

Translations are maintained in:

```text
src/spc-flexc-i18n.js
```

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

Copy the built file `ha-spc-flexc-card.js` to a location served by Home
Assistant and add it as a Lovelace JavaScript module resource.

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

SPC FlexC Card keeps state-changing operations conservative. Alarm and Mapping
Gate actions are sent through native Home Assistant services, while the SPC
panel remains authoritative for the resulting state and for rejected actions.

Automatic retries of state-changing commands must not be implemented.

Mapping Gates are logical panel objects. Before controlling one, verify in SPC
what it is mapped to. Door mode changes must not be interpreted as proof that a
physical door or lock has actuated.

## Dynamic information

The exact information displayed depends on the SPC panel model and firmware,
installed SPC/X-BUS/access-control hardware, configured ATS/ATP paths and Mapping
Gates, FlexC permissions, and the entities exposed by the installed SPC FlexC
integration. Missing information is simply not displayed.

## Development

The card is split into dedicated source modules:

```text
src/ha-spc-flexc-card.js
src/spc-flexc-outputs.js
src/spc-flexc-zone-groups.js
src/spc-flexc-i18n.js
src/spc-flexc-area-cards.js
src/spc-flexc-communication.js
src/spc-flexc-xbus.js
src/spc-flexc-responsive.js
src/spc-flexc-render-scheduler.js
```

Their responsibilities are:

- `ha-spc-flexc-card.js` — main card, alarm, area, detector and system logic;
- `spc-flexc-outputs.js` — Mapping Gates, door supervision and zone inhibition;
- `spc-flexc-zone-groups.js` — detector grouping by SPC area and collapse state;
- `spc-flexc-i18n.js` — centralized French/English localization;
- `spc-flexc-area-cards.js` — collapsible area cards and area-wide layout helpers;
- `spc-flexc-communication.js` — collapsible FlexC ATP diagnostics;
- `spc-flexc-xbus.js` — X-BUS discovery, grouping and collapsible diagnostics;
- `spc-flexc-responsive.js` — container-responsive desktop/mobile layout;
- `spc-flexc-render-scheduler.js` — coalesced rendering and loaded card version display.

`package.json` is the authoritative release version. The build and distribution
checks derive the card version from it and inject that version into the generated
bundle.

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
root `ha-spc-flexc-card.js` exactly matches the current sources and package
version.

Do not edit the generated root file directly. Edit files under `src/` and run
`npm run build`.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before
submitting changes.

Useful contributions include bug fixes, visual improvements, additional SPC
entities or diagnostics, mobile/desktop layout improvements, accessibility,
translations and documentation.

> [!WARNING]
> Never publish FlexC encryption keys, Command Profile passwords, SPC user
> PINs, installer codes or other alarm credentials in Issues, Pull Requests,
> logs or screenshots.

## Disclaimer

SPC FlexC Card is an independent open-source project. It is not affiliated with,
endorsed by, or supported by Siemens, Vanderbilt, Comelit or Home Assistant.

Alarm and access-control systems are security equipment. Always validate the
behaviour of your specific panel, integration and Home Assistant installation
before relying on dashboard control.

## Support

If you find SPC FlexC Card useful and would like to support its development,
you can buy me a coffee:

https://buymeacoffee.com/minimicro34

For bug reports and feature requests, please use GitHub Issues and include when
possible the SPC FlexC Card version, integration version, Home Assistant
version, browser/device type, affected view, screenshots, console errors and
relevant entity states or attributes.

Never include passwords, PINs, FlexC encryption keys or other alarm credentials.

## Related project

SPC FlexC Home Assistant integration:

```text
https://github.com/minimicro34/ha-spc-flexc
```

## License

Copyright © 2026 minimicro34.

This project is licensed under the [GNU General Public License v3.0 or later](LICENSE).
