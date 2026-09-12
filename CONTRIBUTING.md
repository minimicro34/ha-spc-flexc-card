# Contributing to SPC FlexC Card

## Development

SPC FlexC Card is developed as several source modules which are concatenated into the distributed `ha-spc-flexc-card.js` file.

Current source layout:

- `src/ha-spc-flexc-card.js` — core card, alarm areas, zones and technical views.
- `src/spc-flexc-outputs.js` — Mapping Gates, doors and zone inhibition extensions.
- `src/spc-flexc-zone-groups.js` — collapsible area-based zone grouping.
- `src/spc-flexc-i18n.js` — card internationalization (i18n) and translations.
- `src/spc-flexc-render-scheduler.js` — render coalescing and scheduling.

Do not edit the generated root `ha-spc-flexc-card.js` directly. Edit the appropriate source module and rebuild it.

After every source change run:

```bash
npm run build
npm run check
git diff --check
```

`npm run check` validates the JavaScript source modules and verifies that the generated distribution matches them.

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

Do not implement automatic retries of state-changing alarm actions. Read-only operations may use bounded retry logic when appropriate, but an arm, disarm, door, inhibition or Mapping Gate command must never be repeated automatically by the card.

## Source and distribution

The build order is intentionally defined by `scripts/build.mjs`. When adding or removing a source module, update both:

- `scripts/build.mjs`
- `scripts/check-dist.mjs`

Also update the `check` script in `package.json` so every source module is syntax-checked.

Keep the card version consistent across source comments, package metadata, build/check scripts, README and changelog when preparing a release.

## License

Contributions are licensed under the GNU General Public License v3.0 or later.
