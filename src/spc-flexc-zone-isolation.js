/* SPC FlexC Card zone isolation extension. */

const spcFlexCZoneIsolationBaseGetZones = SpcFlexCCard.prototype._getZones;
const spcFlexCZoneIsolationBaseRenderZoneRow = SpcFlexCCard.prototype._renderZoneRow;
const spcFlexCZoneIsolationBaseStyles = SpcFlexCCard.prototype._styles;

SpcFlexCCard.prototype._getZones = function () {
  const zones = spcFlexCZoneIsolationBaseGetZones.call(this);
  if (!this._hass || !zones.length) return zones;

  const byId = new Map(zones.map((zone) => [String(zone.zoneId), zone]));
  const scoped = this._scopedStates(true);
  const candidates = scoped.length
    ? scoped
    : Object.entries(this._hass.states).map(([entityId, stateObj]) => ({
        entityId,
        stateObj,
        registryEntry: null,
      }));

  // spc-flexc-outputs predates the isolation switch and historically accepted
  // every switch carrying zone_id as an inhibition switch. Once isolation was
  // added, that allowed the two switch states to overwrite each other depending
  // on registry iteration order. Rebuild both operating states from their exact
  // integration unique IDs so inhibition and isolation remain independent.
  for (const zone of zones) {
    zone.inhibited = false;
    zone.inhibitionEntityId = null;
    zone.isolated = false;
    zone.isolationEntityId = null;
  }

  for (const { entityId, stateObj, registryEntry } of candidates) {
    if (!entityId.startsWith("switch.")) continue;

    const attrs = stateObj?.attributes || {};
    const uniqueId = String(registryEntry?.unique_id || "");
    const inhibitionMatch = uniqueId.match(/_zone_(\d+)_inhibition$/);
    const isolationMatch = uniqueId.match(/_zone_(\d+)_isolation$/);

    if (!inhibitionMatch && !isolationMatch) continue;

    const zoneId = attrs.zone_id ?? inhibitionMatch?.[1] ?? isolationMatch?.[1];
    const zone = byId.get(String(zoneId));
    if (!zone) continue;

    if (inhibitionMatch) {
      zone.inhibited = stateObj.state === "on";
      zone.inhibitionEntityId = entityId;
    }

    if (isolationMatch) {
      zone.isolated = stateObj.state === "on";
      zone.isolationEntityId = entityId;
    }
  }

  return zones;
};

SpcFlexCCard.prototype._zoneIsIsolated = function (zone) {
  return zone?.isolated === true;
};

SpcFlexCCard.prototype._renderZoneRow = function (zone) {
  if (!this._zoneIsIsolated(zone)) {
    return spcFlexCZoneIsolationBaseRenderZoneRow.call(this, zone);
  }

  return `
    <div class="zone-row zone-row-isolated">
      <div class="zone-icon danger">
        <ha-icon icon="${this._escapeHtml(this._zoneIcon(zone))}"></ha-icon>
      </div>

      <div class="zone-main">
        <div class="zone-name">${this._escapeHtml(zone.name)}</div>
        <div class="zone-area">
          ${this._escapeHtml(this._areaName(zone.areaId))}
          <span class="zone-operating-badge zone-isolated">${this._t("state.isolated")}</span>
        </div>
      </div>

      <div class="zone-state danger">
        ${this._escapeHtml(this._t("state.isolated"))}
      </div>
    </div>
  `;
};

SpcFlexCCard.prototype._styles = function () {
  return `${spcFlexCZoneIsolationBaseStyles.call(this)}
    <style>
      .zone-row-isolated {
        box-shadow:inset 3px 0 0 var(--error-color,#db4437);
        background:color-mix(in srgb,var(--error-color,#db4437) 9%,transparent);
      }
      .zone-row-isolated .zone-name,
      .zone-row-isolated .zone-area,
      .zone-isolated {
        color:var(--error-color,#db4437);
      }
    </style>`;
};
