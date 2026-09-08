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
  🔐 Alarm control • 🏠 Areas • 🚪 Detectors • 🚪 Access-control doors • 📡 FlexC • 🩺 Diagnostics
</p>

SPC FlexC Card is a custom Home Assistant dashboard card designed for the
[SPC FlexC integration](https://github.com/minimicro34/ha-spc-flexc).

It provides a dedicated interface for everyday alarm control while keeping
technical SPC and FlexC information available in a separate system view.

> [!IMPORTANT]
> This card can trigger alarm and access-control state-changing services.
> Confirmation dialogs are enabled by default.

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

> The Doors view is displayed only when the SPC FlexC integration discovers at
> least one SPC access-control door.

---
## Contents
---

- [Features](#features)
  - [General](#general)
  - [Areas](#areas)
  - [Detectors](#detectors)
  - [Doors](#doors)
  - [System](#system)
- [Requirements](#requirements)
- [Installation](#installation)
  - [HACS](#hacs)
  - [Manual installation](#manual-installation)
- [Configuration](#configuration)
- [Options](#options)
- [Alarm and access-control safety](#alarm-and-access-control-safety)
- [Dynamic information](#dynamic-information)
- [Development](#development)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [Support](#support)
- [Related project](#related-project)
- [License](#license)

## Features

SPC FlexC Card provides four core views and adds a fifth **Doors** view when
access-control doors are available.

### General

The General view is designed for everyday use and includes:

- global alarm state;
- area, detector and tamper counters;
- FlexC connection status;
- active SPC faults;
- Engineer / Installer mode indication when active;
- global Disarm and Full Set controls.

Technical entity IDs are intentionally hidden from the normal user interface.

### Areas

The Areas view provides individual SPC area control.

For each area, the card can display:

- current arming state;
- Arm or Disarm action according to the current state;
- Part Set A when supported by the area, using the custom SPC name exposed by the integration when available;
- Part Set B when supported by the area, using the custom SPC name exposed by the integration when available;
- last Set / Unset information;
- localized date and time;
- user name, with user ID as fallback.

When the integration exposes custom partial-set names from the SPC panel, the
card uses them for the corresponding controls and armed-state labels. For
example, an SPC Part Set A configured as `Nuit` is displayed as **Nuit**.
Otherwise the card falls back to `Partiel A` and `Partiel B`.

The SPC panel remains authoritative for arming availability and validation.

### Detectors

The Detectors view displays SPC zones and separates normal detectors from
tamper states.

The visual convention is:

- green — normal;
- orange — normal activity such as movement or opening;
- red — alarm, fault or tamper;
- grey — unavailable or unknown.

The card uses the states and attributes exposed by the SPC FlexC integration
and does not invent unavailable detector information.

### Doors

The **Doors** tab is automatically displayed when at least one SPC
access-control door is discovered. Installations without a door controller do
not get an empty permanent tab.

For each discovered door, the card can display:

- the SPC door name, using the associated zone name when available;
- the associated areas, for example `Garage ↔ Studio`;
- the associated SPC zone;
- the raw SPC `Status` value;
- the raw SPC `Mode` value.

When the corresponding native Home Assistant button entities are exposed by
SPC FlexC, four controls are available:

- **Ouverture momentanée**;
- **Ouverture permanente**;
- **Retour au mode normal**;
- **Verrouiller**.

No manual door sensor or button `entity_id` configuration is required. The
card resolves them from the SPC FlexC configuration entry and Home Assistant
entity registry metadata.

> [!NOTE]
> Door `Status` and `Mode` are intentionally displayed as raw values while the
> numeric mappings are being validated on real SPC access-control hardware.
> The card does not guess meanings such as locked, unlocked or open.

### System

The System view contains technical and diagnostic information that is less
useful during normal daily operation.

Depending on what the SPC panel and integration expose, this can include:

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

ATS and ATP information is dynamically discovered from Home Assistant.

ATP numbering displayed by the card is local to each ATS. Internal FlexC ATP
identifiers are used only to associate the corresponding entities and are not
shown as user-facing ATP numbers.

The active path reported by the ATS is used to distinguish the active ATP from
inactive fallback paths.

The selected card tab is preserved across Home Assistant rerenders and page
reloads.

## Requirements

- Home Assistant;
- the SPC FlexC custom integration;
- HACS is recommended for installation and updates.

The integration is available at:

https://github.com/minimicro34/ha-spc-flexc

The custom Part Set names and access-control door view require an SPC FlexC
integration version exposing the corresponding attributes and door entities.

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

Then install **SPC FlexC Card** and reload Home Assistant if required.

### Manual installation

Copy the built files:

```text
ha-spc-flexc-card.js
ha-spc-flexc-card-base.js
```

to the same location served by Home Assistant and add
`ha-spc-flexc-card.js` as a Lovelace JavaScript module resource.

HACS installation is recommended because it handles the dashboard resource and
updates more conveniently.

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
| `show_controls` | No | `true` | Display alarm and door control actions |
| `confirm_actions` | No | `true` | Request confirmation before state-changing alarm and door actions |

## Alarm and access-control safety

SPC FlexC Card deliberately keeps state-changing operations conservative.

Alarm and door actions are sent through native Home Assistant services and
confirmation is enabled by default.

The card does not attempt to bypass SPC readiness checks or force an arming
operation rejected by the panel.

Automatic retries of state-changing commands must not be implemented.

Before testing access-control locking or permanent opening on a real
installation, remain on site and keep another means of access available.

## Dynamic information

The exact information displayed depends on:

- SPC panel model;
- SPC firmware;
- installed SPC hardware;
- configured ATS/ATP paths;
- X-BUS devices;
- installed access-control hardware and discovered doors;
- entities and attributes exposed by the installed SPC FlexC integration
  version.

Missing information is simply not displayed.

The card does not create fictitious panel, ATS, ATP, X-BUS, door or diagnostic
data.

## Development

The 1.0.1 source entry point is:

```text
src/ha-spc-flexc-card.js
```

The existing card implementation is kept in:

```text
src/ha-spc-flexc-card-base.js
```

The entry point loads that base implementation and adds the dynamic
access-control door view. This keeps the existing tested card behaviour intact
while the door support is validated on real hardware.

Then build the distributable file:

```bash
npm run build
```

Run the project checks:

```bash
npm run check
git diff --check
```

The HACS files at the repository root are:

```text
ha-spc-flexc-card.js
ha-spc-flexc-card-base.js
```

Do not edit generated files directly.

## Contributing

Contributions are welcome.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

Contributions can include:

- bug fixes;
- visual improvements;
- support for additional SPC entities or diagnostics;
- improved mobile and desktop layouts;
- accessibility improvements;
- documentation.

For significant alarm-control or access-control behaviour changes, please open
a GitHub Issue before starting a large implementation.

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

The authors and contributors cannot be held responsible for alarm activations,
failed arming operations, access-control actions, missed information, security
incidents or other consequences resulting from the use of this card.

## Support

If you find SPC FlexC Card useful and would like to support its development,
you can buy me a coffee.

<p align="center">
  <a href="https://buymeacoffee.com/minimicro34">
    <img
      src="https://github.com/appcraftstudio/buymeacoffee/raw/master/Images/snapshot-bmc-button.png"
      alt="Buy Me a Coffee"
      width="300"
    />
  </a>
</p>

Your support helps me dedicate more time to improving the card, adding new
features, testing additional SPC configurations and fixing issues.

Bug reports, feature suggestions, contributions and GitHub stars are also
greatly appreciated.

Please use GitHub Issues for bug reports and feature requests.

When reporting an issue, please include whenever possible:

- SPC FlexC Card version;
- SPC FlexC integration version;
- Home Assistant version;
- browser and device type;
- a clear description of the problem;
- screenshots when relevant;
- relevant browser console errors;
- relevant Home Assistant entity states or attributes.

For display or entity-discovery problems, please also indicate which card view
is affected:

- General;
- Areas;
- Detectors;
- Doors;
- System.

For door-related reports, include the observed physical behaviour and the raw
`Status` / `Mode` values after each tested command whenever possible. A fresh
SPC FlexC diagnostic is particularly useful for validating access-control
support.

Never include passwords, PINs, FlexC encryption keys or other alarm
credentials.

## Related project

SPC FlexC Home Assistant integration:

https://github.com/minimicro34/ha-spc-flexc

## License

Copyright © 2026 minimicro34.

This project is licensed under the [GNU General Public License v3.0 or later](LICENSE).
