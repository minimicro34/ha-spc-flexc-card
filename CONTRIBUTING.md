# Contributing to SPC FlexC Card

## Development

SPC FlexC Card is developed as several source modules which are concatenated into the distributed `ha-spc-flexc-card.js` file.

Current source layout:

- `src/ha-spc-flexc-card.js` — core card, alarm areas, zones and technical views.
- `src/spc-flexc-outputs.js` — Mapping Gates, doors and zone inhibition extensions.
- `src/spc-flexc-zone-isolation.js` — dedicated zone isolation state discovery and isolated-zone rendering.
- `src/spc-flexc-zone-groups.js` — collapsible area-based zone grouping.
- `src/spc-flexc-i18n.js` — card internationalization (i18n) and translations.
- `src/spc-flexc-area-cards.js` — collapsible SPC area cards and area toolbar.
- `src/spc-flexc-communication.js` — FlexC ATS/ATP rendering and collapsible communication diagnostics.
- `src/spc-flexc-xbus.js` — X-BUS device discovery, diagnostics and collapsible X-BUS cards.
- `src/spc-flexc-responsive.js` — Home Assistant Sections grid options and responsive card/system layouts.
- `src/spc-flexc-render-scheduler.js` — render coalescing and scheduling.

Do not edit the generated root `ha-spc-flexc-card.js` directly. Edit the appropriate source module and rebuild it.

After every source change run:

```bash
npm run build
npm run check
git diff --check
```

`npm run check` validates every JavaScript source module and verifies that the generated distribution exactly matches the current sources and release version.

## Responsive layout

Responsive behaviour belongs in `src/spc-flexc-responsive.js` rather than being duplicated across feature modules.

The card is designed to work with Home Assistant's **Sections** dashboard layout. On a wide desktop layout, a section width of **3** allows the System view to use its three logical columns:

1. Panel / Power / RF / Modem;
2. X-BUS;
3. FlexC ATS / ATP communication.

Do not rely on a fixed browser viewport width to decide the internal card layout. The card uses its available container width so that Home Assistant can reduce a wide section on smaller displays and the card can fall back to a single-column layout.

Feature modules should keep their content usable at narrow widths and avoid introducing fixed minimum widths that cause horizontal overflow.

## Collapsible diagnostic content

Large technical collections such as area cards, X-BUS devices and FlexC ATP paths may use collapsible content to keep the dashboard compact.

When adding collapsible technical content:

- keep the identifying name visible while collapsed;
- keep the most useful current status visible when practical;
- do not hide a fault indication merely because the details are collapsed;
- preserve Home Assistant state as the authoritative source rather than maintaining a second independent status state in the card.

## Internationalization

All user-visible card text must go through the centralized i18n layer in `src/spc-flexc-i18n.js`.

- Do not add new user-visible French or English strings directly to rendering code.
- Add matching translation keys to both the `fr` and `en` dictionaries.
- For dynamic text, pass variables to translation templates rather than constructing a French sentence and translating it afterwards.
- Use `_t(key, variables)` for normal translated strings.
- Use `_tCount(key, count, variables)` for singular/plural text.
- Home Assistant's language is read from `hass.locale.language`; English is the fallback language.

Technical protocol values, entity IDs, CSS class names, Material Design icon names and developer/debug messages are not translations unless they are displayed as user-facing labels.

## Alarm safety

Do not implement automatic retries of state-changing alarm actions. Read-only operations may use bounded retry logic when appropriate, but an arm, disarm, door, inhibition, isolation or Mapping Gate command must never be repeated automatically by the card.

Zone inhibition and isolation are separate SPC states. The card must use the dedicated Home Assistant inhibition/isolation switch entities exposed by the integration rather than infer isolation from a raw SPC status value. The panel remains authoritative for whether each operation is currently allowed.

Diagnostic information must not be presented as having stronger semantics than the SPC FlexC integration has validated. Raw or partially understood protocol values should remain identifiable as diagnostics until their meaning has been confirmed.

## Source and distribution

The build order is intentionally defined by `scripts/build.mjs`. When adding or removing a source module, update both:

- `scripts/build.mjs`
- `scripts/check-dist.mjs`

Also update the `check` script in `package.json` so every source module is syntax-checked.

The release version is defined in `package.json`. The build and distribution checks read that value directly, so do not duplicate a release version constant in build/check scripts.

When preparing a release:

1. update the version in `package.json` and `package-lock.json`;
2. update the source card version where applicable;
3. update `README.md`, `CHANGELOG.md` and this guide when behaviour, source layout or development rules changed;
4. run `npm run build`;
5. run `npm run check` and `git diff --check`;
6. commit the generated root `ha-spc-flexc-card.js` together with the source/release changes.

## License

Contributions are licensed under the GNU General Public License v3.0 or later.
