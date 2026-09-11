/* SPC FlexC Card v1.0.2 extensions: Mapping Gates, door supervision and zone inhibition. */

const spcFlexCBaseLoadActiveTab = SpcFlexCCard.prototype._loadActiveTab;
const spcFlexCBaseGetZones = SpcFlexCCard.prototype._getZones;
const spcFlexCBaseGetDoors = SpcFlexCCard.prototype._getDoors;
const spcFlexCBaseStyles = SpcFlexCCard.prototype._styles;
const spcFlexCBaseRender = SpcFlexCCard.prototype._render;
const spcFlexCHassDescriptor = Object.getOwnPropertyDescriptor(
  SpcFlexCCard.prototype,
  "hass"
);
const spcFlexCBaseConnectedCallback = SpcFlexCCard.prototype.connectedCallback;
const spcFlexCBaseDisconnectedCallback = SpcFlexCCard.prototype.disconnectedCallback;

SpcFlexCCard.prototype._ensureStateSubscription = async function () {
  if (
    this._spcStateUnsubscribe ||
    this._spcStateSubscriptionPending ||
    !this._hass?.connection?.subscribeEvents
  ) {
    return;
  }

  this._spcStateSubscriptionPending = true;

  try {
    const unsubscribe = await this._hass.connection.subscribeEvents(
      (event) => {
        const entityId = event?.data?.entity_id;
        const newState = event?.data?.new_state || null;
        const oldState = event?.data?.old_state || null;
        const attrs = newState?.attributes || oldState?.attributes || {};
        const isSpcZone =
          entityId?.startsWith("binary_sensor.") &&
          attrs.zone_id != null &&
          attrs.area_id != null &&
          attrs.spc_zone_type != null;

        if (!isSpcZone) {
          return;
        }

        this._spcLiveStates ||= new Map();

        if (newState) {
          this._spcLiveStates.set(entityId, newState);
        } else {
          this._spcLiveStates.delete(entityId);
        }

        if (this.isConnected) {
          this._render();
        }
      },
      "state_changed"
    );

    if (!this.isConnected) {
      unsubscribe();
      return;
    }

    this._spcStateUnsubscribe = unsubscribe;
  } catch (error) {
    console.warn(
      "SPC FlexC Card: unable to subscribe to live zone state changes",
      error
    );
  } finally {
    this._spcStateSubscriptionPending = false;
  }
};

Object.defineProperty(SpcFlexCCard.prototype, "hass", {
  configurable: true,
  set(hass) {
    spcFlexCHassDescriptor.set.call(this, hass);
    this._ensureStateSubscription();
  },
});

SpcFlexCCard.prototype.connectedCallback = function () {
  if (spcFlexCBaseConnectedCallback) {
    spcFlexCBaseConnectedCallback.call(this);
  }
  this._ensureStateSubscription();
};

SpcFlexCCard.prototype.disconnectedCallback = function () {
  if (this._spcStateUnsubscribe) {
    this._spcStateUnsubscribe();
    this._spcStateUnsubscribe = null;
  }

  if (spcFlexCBaseDisconnectedCallback) {
    spcFlexCBaseDisconnectedCallback.call(this);
  }
};

SpcFlexCCard.prototype._loadActiveTab = function (entityId) {
  const value = spcFlexCBaseLoadActiveTab.call(this, entityId);
  if (value) return value;

  const key = this._activeTabStorageKey(entityId);
  if (!key) return null;

  try {
    return window.localStorage.getItem(key) === "outputs" ? "outputs" : null;
  } catch {
    return null;
  }
};

SpcFlexCCard.prototype._getMappingGates = function () {
  if (!this._hass) return [];

  const scoped = this._scopedStates(true);
  const candidates = scoped.length
    ? scoped
    : Object.entries(this._hass.states).map(([entityId, stateObj]) => ({
        entityId,
        stateObj,
        registryEntry: null,
      }));

  return candidates
    .filter(({ entityId, stateObj, registryEntry }) => {
      if (!entityId.startsWith("switch.")) return false;
      const attrs = stateObj?.attributes || {};
      const uniqueId = String(registryEntry?.unique_id || "");
      return attrs.mg_id != null || /_mapping_gate_\d+$/.test(uniqueId);
    })
    .map(({ entityId, stateObj, registryEntry }) => {
      const attrs = stateObj?.attributes || {};
      const uniqueId = String(registryEntry?.unique_id || "");
      const match = uniqueId.match(/_mapping_gate_(\d+)$/);
      const mgId = attrs.mg_id ?? match?.[1] ?? null;
      return {
        entityId,
        id: mgId,
        name:
          attrs.mg_name ||
          attrs.friendly_name ||
          (mgId != null ? `Sortie ${mgId}` : entityId),
        state: stateObj.state,
      };
    })
    .sort((a, b) => Number(a.id) - Number(b.id));
};

SpcFlexCCard.prototype._getZones = function () {
  if (!this._hass) return [];

  const originalHass = this._hass;
  let zones;

  if (this._spcLiveStates?.size) {
    const states = { ...originalHass.states };
    for (const [entityId, stateObj] of this._spcLiveStates) {
      states[entityId] = stateObj;
    }

    this._hass = {
      ...originalHass,
      states,
    };

    try {
      zones = spcFlexCBaseGetZones.call(this);
    } finally {
      this._hass = originalHass;
    }
  } else {
    zones = spcFlexCBaseGetZones.call(this);
  }

  if (!zones.length) return zones;

  const byId = new Map(zones.map((zone) => [String(zone.zoneId), zone]));
  const scoped = this._scopedStates(true);
  const candidates = scoped.length
    ? scoped
    : Object.entries(this._hass.states).map(([entityId, stateObj]) => ({
        entityId,
        stateObj,
        registryEntry: null,
      }));

  for (const { entityId, stateObj, registryEntry } of candidates) {
    if (!entityId.startsWith("switch.")) continue;

    const attrs = stateObj?.attributes || {};
    const uniqueId = String(registryEntry?.unique_id || "");
    const match = uniqueId.match(/_zone_(\d+)_inhibition$/);
    const zoneId = attrs.zone_id ?? match?.[1] ?? null;

    if (zoneId == null) continue;
    if (!match && attrs.zone_id == null) continue;

    const zone = byId.get(String(zoneId));
    if (!zone) continue;

    zone.inhibited = stateObj.state === "on";
    zone.inhibitionEntityId = entityId;
  }

  return zones;
};

SpcFlexCCard.prototype._renderZoneRow = function (zone) {
  const stateInfo = this._zoneStateInfo(zone);
  const inhibited = zone.inhibited === true;
  const active = zone.state === "on";
  const visualClass = inhibited
    ? active
      ? "danger"
      : "warning"
    : stateInfo.className;

  return `
    <div class="zone-row${inhibited ? " zone-row-inhibited" : ""}">
      <div class="zone-icon ${visualClass}">
        <ha-icon icon="${this._escapeHtml(this._zoneIcon(zone))}"></ha-icon>
      </div>

      <div class="zone-main">
        <div class="zone-name">${this._escapeHtml(zone.name)}</div>
        <div class="zone-area">
          ${this._escapeHtml(this._areaName(zone.areaId))}
          ${inhibited ? '<span class="zone-operating-badge warning">INHIBÉ</span>' : ""}
        </div>
      </div>

      <div class="zone-state ${visualClass}">
        ${this._escapeHtml(stateInfo.label)}
      </div>
    </div>
  `;
};

SpcFlexCCard.prototype._getDoors = function () {
  const doors = spcFlexCBaseGetDoors.call(this);
  const byId = new Map(doors.map((door) => [String(door.id), door]));

  for (const { stateObj } of this._scopedStates(true)) {
    const attrs = stateObj?.attributes || {};
    if (attrs.door_id == null) continue;
    const door = byId.get(String(attrs.door_id));
    if (!door) continue;
    door.dpsInput = attrs.dps_input ?? door.dpsInput ?? null;
    door.drsInput = attrs.drs_input ?? door.drsInput ?? null;
  }

  return doors;
};

SpcFlexCCard.prototype._doorModeLabel = function (mode) {
  const value = Number(mode);
  if (value === 0) return "Normal";
  if (value === 1) return "Accès interdit";
  if (value === 2) return "Accès libre";
  return mode == null ? "—" : String(mode);
};

SpcFlexCCard.prototype._renderDoors = function () {
  const doors = this._getDoors();
  if (!doors.length) {
    return `
      <div class="empty-state">
        <ha-icon icon="mdi:door-closed-lock"></ha-icon>
        <div>Aucune porte SPC découverte.</div>
      </div>
    `;
  }

  return `
    <div class="door-list">
      ${doors.map((door) => `
        <div class="door-card">
          <div class="door-header">
            <div>
              <div class="door-title">${this._escapeHtml(door.name)}</div>
              <div class="door-areas">${this._escapeHtml(this._doorAreasLabel(door))}</div>
            </div>
            <ha-icon class="door-icon" icon="mdi:door"></ha-icon>
          </div>
          <div class="door-state-grid door-supervision-grid">
            <div class="door-state-card">
              <div class="door-state-label">Status</div>
              <div class="door-state-value">${this._escapeHtml(door.status ?? "—")}</div>
            </div>
            <div class="door-state-card">
              <div class="door-state-label">Mode</div>
              <div class="door-state-value">${this._escapeHtml(this._doorModeLabel(door.mode))}</div>
            </div>
            <div class="door-state-card">
              <div class="door-state-label">DPS</div>
              <div class="door-state-value">${this._escapeHtml(door.dpsInput ?? "—")}</div>
            </div>
            <div class="door-state-card">
              <div class="door-state-label">DRS</div>
              <div class="door-state-value">${this._escapeHtml(door.drsInput ?? "—")}</div>
            </div>
          </div>
          ${door.zoneName ? `
            <div class="door-zone">
              <ha-icon icon="mdi:shield-home-outline"></ha-icon>
              <span>Zone ${this._escapeHtml(door.zoneId ?? "")}${door.zoneId != null ? " · " : ""}${this._escapeHtml(door.zoneName)}</span>
            </div>
          ` : ""}
          <div class="door-raw-note">
            Supervision FlexC uniquement. Les commandes de mode de porte ne sont pas présentées comme une commande physique de serrure.
          </div>
        </div>
      `).join("")}
    </div>
  `;
};

SpcFlexCCard.prototype._renderOutputs = function () {
  const outputs = this._getMappingGates();
  if (!outputs.length) {
    return `
      <div class="empty-state">
        <ha-icon icon="mdi:electric-switch"></ha-icon>
        <div>Aucune sortie SPC (Mapping Gate) découverte.</div>
      </div>
    `;
  }

  return `
    <div class="outputs-view">
      <div class="group-title">Sorties <span>${outputs.length}</span></div>
      <div class="output-list">
        ${outputs.map((output) => {
          const isOn = output.state === "on";
          const unavailable = ["unknown", "unavailable"].includes(output.state);
          return `
            <div class="output-row">
              <div class="output-icon ${unavailable ? "muted" : isOn ? "ok" : "muted"}">
                <ha-icon icon="mdi:electric-switch"></ha-icon>
              </div>
              <div class="output-main">
                <div class="output-name">${this._escapeHtml(output.name)}</div>
                <div class="output-id">Mapping Gate ${this._escapeHtml(output.id ?? "—")}</div>
              </div>
              <div class="output-state ${unavailable ? "muted" : isOn ? "ok" : "muted"}">
                ${unavailable ? this._escapeHtml(output.state) : isOn ? "ON" : "OFF"}
              </div>
              ${this._config.show_controls === false ? "" : `
                <div class="output-controls">
                  <button type="button" class="output-button${isOn ? " active" : ""}"
                    data-mg-entity="${this._escapeHtml(output.entityId)}"
                    data-mg-name="${this._escapeHtml(output.name)}" data-mg-action="on">ON</button>
                  <button type="button" class="output-button${!isOn && !unavailable ? " active" : ""}"
                    data-mg-entity="${this._escapeHtml(output.entityId)}"
                    data-mg-name="${this._escapeHtml(output.name)}" data-mg-action="off">OFF</button>
                </div>
              `}
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
};

SpcFlexCCard.prototype._renderTabs = function () {
  const hasDoors = this._getDoors().length > 0;
  const hasOutputs = this._getMappingGates().length > 0;
  if (this._activeTab === "doors" && !hasDoors) this._activeTab = "system";
  if (this._activeTab === "outputs" && !hasOutputs) this._activeTab = "system";

  const tabs = [
    ["system", "Général"],
    ["areas", "Secteurs"],
    ["zones", "Détecteurs"],
    ...(hasDoors ? [["doors", "Portes"]] : []),
    ...(hasOutputs ? [["outputs", "Sorties"]] : []),
    ["technical", "Système"],
  ];

  return `<div class="tabs">${tabs.map(([id, label]) => `
    <button type="button" class="tab ${this._activeTab === id ? "active" : ""}" data-tab="${id}">
      ${this._escapeHtml(label)}
    </button>
  `).join("")}</div>`;
};

SpcFlexCCard.prototype._renderActiveView = function () {
  switch (this._activeTab) {
    case "areas": return this._renderAreas();
    case "zones": return this._renderZones();
    case "doors": return this._getDoors().length ? this._renderDoors() : this._renderSystem();
    case "outputs": return this._getMappingGates().length ? this._renderOutputs() : this._renderSystem();
    case "technical": return this._renderTechnicalSystem();
    case "system":
    default: return this._renderSystem();
  }
};

SpcFlexCCard.prototype._callMappingGate = async function (entityId, name, action) {
  if (!this._hass || !entityId || !["on", "off"].includes(action)) return;
  const label = action === "on" ? "Activer" : "Désactiver";
  if (this._config.confirm_actions && !window.confirm(`${label} — ${name} ?`)) return;
  await this._hass.callService("switch", action === "on" ? "turn_on" : "turn_off", {
    entity_id: entityId,
  });
};

SpcFlexCCard.prototype._styles = function () {
  return `${spcFlexCBaseStyles.call(this)}
    <style>
      .zone-operating-badge {
        display:inline-flex;
        align-items:center;
        margin-left:7px;
        padding:1px 6px;
        border:1px solid currentColor;
        border-radius:999px;
        font-size:9px;
        font-weight:800;
        letter-spacing:.04em;
        line-height:1.5;
        vertical-align:1px;
      }
      .zone-row-inhibited {
        box-shadow:inset 3px 0 0 color-mix(in srgb,currentColor 55%,transparent);
      }
      .outputs-view { display:grid; gap:12px; }
      .output-list { display:grid; gap:7px; }
      .output-row {
        display:grid;
        grid-template-columns:46px minmax(0,1fr) auto auto;
        align-items:center;
        gap:12px;
        min-height:58px;
        padding:8px 12px;
        border-radius:10px;
        background:var(--secondary-background-color,rgba(127,127,127,.08));
      }
      .output-icon { display:flex; align-items:center; justify-content:center; }
      .output-icon ha-icon { --mdc-icon-size:28px; }
      .output-main { min-width:0; }
      .output-name { overflow:hidden; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
      .output-id { margin-top:2px; color:var(--secondary-text-color); font-size:11px; }
      .output-state { min-width:34px; font-weight:700; text-align:right; }
      .output-controls { display:flex; gap:6px; }
      .output-button {
        appearance:none;
        min-width:48px;
        padding:7px 10px;
        border:1px solid var(--divider-color);
        border-radius:8px;
        background:var(--card-background-color);
        color:var(--primary-text-color);
        cursor:pointer;
        font:inherit;
        font-size:12px;
        font-weight:700;
      }
      .output-button.active { border-color:var(--primary-color); color:var(--primary-color); }
      .door-supervision-grid { grid-template-columns:repeat(4,minmax(0,1fr)); }
      @media (max-width:700px) {
        .output-row { grid-template-columns:40px minmax(0,1fr) auto; }
        .output-controls { grid-column:2 / -1; }
        .door-supervision-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      }
    </style>`;
};

SpcFlexCCard.prototype._render = function () {
  spcFlexCBaseRender.call(this);
  this.querySelectorAll("[data-mg-entity]").forEach((button) => {
    button.addEventListener("click", () => {
      this._callMappingGate(
        button.dataset.mgEntity,
        button.dataset.mgName || "Sortie SPC",
        button.dataset.mgAction
      );
    });
  });
};