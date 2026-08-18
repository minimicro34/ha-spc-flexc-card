# SPC FlexC Card

> Dedicated Lovelace dashboard card for the SPC FlexC Home Assistant integration.

[![GitHub Release](https://img.shields.io/github/v/release/minimicro34/ha-spc-flexc-card)](https://github.com/minimicro34/ha-spc-flexc-card/releases)
[![CI](https://github.com/minimicro34/ha-spc-flexc-card/actions/workflows/ci.yml/badge.svg)](https://github.com/minimicro34/ha-spc-flexc-card/actions/workflows/ci.yml)
[![HACS](https://github.com/minimicro34/ha-spc-flexc-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/minimicro34/ha-spc-flexc-card/actions/workflows/hacs.yml)
[![License](https://img.shields.io/github/license/minimicro34/ha-spc-flexc-card)](LICENSE)

SPC FlexC Card is a custom Home Assistant dashboard card designed for the [SPC FlexC integration](https://github.com/minimicro34/ha-spc-flexc).

> [!IMPORTANT]
> This card can trigger alarm state-changing services. Confirmation dialogs are enabled by default.

## Installation

### HACS

Add this repository as a custom repository:

```text
https://github.com/minimicro34/ha-spc-flexc-card
```

Repository type:

```text
Dashboard
```

Then install **SPC FlexC Card**.

## Configuration

```yaml
type: custom:spc-flexc-card
entity: alarm_control_panel.spc_alarm
```

Full example:

```yaml
type: custom:spc-flexc-card
entity: alarm_control_panel.spc_alarm
name: SPC FlexC
show_areas: true
show_controls: true
confirm_actions: true
```

## Options

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `entity` | Yes | — | Global SPC FlexC alarm entity |
| `name` | No | `SPC FlexC` | Card title |
| `show_areas` | No | `true` | Display areas from the global entity |
| `show_controls` | No | `true` | Display Full Set / Disarm controls |
| `confirm_actions` | No | `true` | Confirm alarm actions |

## Development

```bash
npm run build
npm run check
```

HACS requires `dist/ha-spc-flexc-card.js`, matching the repository name.

## Roadmap

- improved visual design;
- dedicated area controls;
- open/not-ready zone display;
- fault and bell display;
- mobile and desktop layouts;
- richer visual editor.

## License

MIT
