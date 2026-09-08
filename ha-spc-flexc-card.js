import "./ha-spc-flexc-card-base.js";

const SpcFlexCCard = customElements.get("spc-flexc-card");

if (!SpcFlexCCard) {
  throw new Error("SPC FlexC Card base module did not register the card.");
}

const proto = SpcFlexCCard.prototype;
const originalLoadActiveTab = proto._loadActiveTab;
const originalRenderActiveView = proto._renderActiveView;
const originalStyles = proto._styles;
const originalRender = proto._render;

proto._loadActiveTab = function (entityId) {
  const key = this._activeTabStorageKey(entityId);
  if (!key) return null;

  try {
    const value = window.localStorage.getItem(key);
    return ["system", "areas", "zones", "doors", "technical"].includes(value)
      ? value
      : null;
  } catch {
    return originalLoadActiveTab.call(this, entityId);
  }
};

proto._getDoors = function () {
  const doors = new Map();

  const ensureDoor = (doorId) => {
    const key = String(doorId);
    if (!doors.has(key)) {
      doors.set(key, {
        id: doorId,
        name: null,
        areaId: null,
        areaName: null,
        areaSide1: null,
        areaSide1Name: null,
        zoneId: null,
        zoneName: null,
        status: null,
        mode: null,
        buttons: {},
      });
    }
    return doors.get(key);
  };

  for (const item of this._scopedStates(true)) {
    const { entityId, stateObj, registryEntry } = item;
    const attrs = stateObj?.attributes || {};
    const uniqueId = String(registryEntry?.unique_id || "");

    let doorId = attrs.door_id;
    let match = uniqueId.match(/_door_(\d+)_(status|mode)$/);
    if (match) doorId = match[1];

    if (doorId !== undefined && doorId !== null) {
      const door = ensureDoor(doorId);
      door.zoneId = attrs.zone_id ?? door.zoneId;
      door.zoneName = attrs.zone_name || door.zoneName;
      door.areaId = attrs.area_id ?? door.areaId;
      door.areaName = attrs.area_name || door.areaName;
      door.areaSide1 = attrs.area_side_1 ?? door.areaSide1;
      door.areaSide1Name = attrs.area_side_1_name || door.areaSide1Name;
      door.name = attrs.zone_name || door.name;

      const rawStatus = attrs.raw_status;
      const rawMode = attrs.raw_mode;

      if (match?.[2] === "status" || rawStatus !== undefined) {
        door.status = rawStatus ?? stateObj.state;
      }
      if (match?.[2] === "mode" || rawMode !== undefined) {
        door.mode = rawMode ?? stateObj.state;
      }

      if (!door.name) {
        const friendly = String(attrs.friendly_name || "").trim();
        door.name = friendly
          .replace(/\s+(Status|Mode|Statut)$/i, "")
          .trim() || null;
      }
    }

    match = uniqueId.match(
      /_door_(\d+)_(open_momentarily|open_permanently|set_normal|lock)$/
    );
    if (match && entityId.startsWith("button.")) {
      const door = ensureDoor(match[1]);
      door.buttons[match[2]] = entityId;
    }
  }

  return Array.from(doors.values())
    .filter((door) => door.status !== null || door.mode !== null || Object.keys(door.buttons).length)
    .map((door) => ({
      ...door,
      name: door.name || door.zoneName || `Porte ${door.id}`,
    }))
    .sort((a, b) => Number(a.id) - Number(b.id));
};

proto._doorAreasLabel = function (door) {
  const first = door.areaName ||
    (door.areaId !== null && door.areaId !== undefined
      ? this._areaName(door.areaId)
      : null);
  const second = door.areaSide1Name ||
    (door.areaSide1 !== null && door.areaSide1 !== undefined
      ? this._areaName(door.areaSide1)
      : null);

  if (first && second && first !== second) return `${first} ↔ ${second}`;
  return first || second || "Association secteur inconnue";
};

proto._renderDoorButton = function (door, action, label, icon, primary = false) {
  const entityId = door.buttons[action];
  if (!entityId || this._config.show_controls === false) return "";

  return `
    <button
      type="button"
      class="control-button door-control${primary ? " primary" : ""}"
      data-door-entity="${this._escapeHtml(entityId)}"
      data-door-name="${this._escapeHtml(door.name)}"
      data-door-action="${this._escapeHtml(label)}"
    >
      <ha-icon icon="${this._escapeHtml(icon)}"></ha-icon>
      <span>${this._escapeHtml(label)}</span>
    </button>
  `;
};

proto._renderDoors = function () {
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

          <div class="door-state-grid">
            <div class="door-state-card">
              <div class="door-state-label">Status</div>
              <div class="door-state-value">${this._escapeHtml(door.status ?? "—")}</div>
            </div>
            <div class="door-state-card">
              <div class="door-state-label">Mode</div>
              <div class="door-state-value">${this._escapeHtml(door.mode ?? "—")}</div>
            </div>
          </div>

          ${door.zoneName ? `
            <div class="door-zone">
              <ha-icon icon="mdi:shield-home-outline"></ha-icon>
              <span>Zone ${this._escapeHtml(door.zoneId ?? "")}${door.zoneId != null ? " · " : ""}${this._escapeHtml(door.zoneName)}</span>
            </div>
          ` : ""}

          <div class="door-controls">
            ${this._renderDoorButton(door, "open_momentarily", "Ouverture momentanée", "mdi:door-open", true)}
            ${this._renderDoorButton(door, "open_permanently", "Ouverture permanente", "mdi:lock-open-variant")}
            ${this._renderDoorButton(door, "set_normal", "Retour au mode normal", "mdi:door-closed")}
            ${this._renderDoorButton(door, "lock", "Verrouiller", "mdi:lock")}
          </div>

          <div class="door-raw-note">
            Status et Mode sont affichés tels que fournis par SPC tant que leur signification n’est pas validée sur matériel réel.
          </div>
        </div>
      `).join("")}
    </div>
  `;
};

proto._renderTabs = function () {
  const hasDoors = this._getDoors().length > 0;
  if (!hasDoors && this._activeTab === "doors") {
    this._activeTab = "system";
  }

  const tabs = [
    { id: "system", label: "Général" },
    { id: "areas", label: "Secteurs" },
    { id: "zones", label: "Détecteurs" },
    ...(hasDoors ? [{ id: "doors", label: "Portes" }] : []),
    { id: "technical", label: "Système" },
  ];

  return `
    <div class="tabs">
      ${tabs.map((tab) => `
        <button
          type="button"
          class="tab ${this._activeTab === tab.id ? "active" : ""}"
          data-tab="${this._escapeHtml(tab.id)}"
        >
          ${this._escapeHtml(tab.label)}
        </button>
      `).join("")}
    </div>
  `;
};

proto._renderActiveView = function () {
  if (this._activeTab === "doors") {
    return this._getDoors().length ? this._renderDoors() : this._renderSystem();
  }
  return originalRenderActiveView.call(this);
};

proto._styles = function () {
  return `${originalStyles.call(this)}
    <style>
      .door-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 14px;
      }
      .door-card {
        padding: 18px;
        border-radius: 14px;
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
      }
      .door-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
      }
      .door-title {
        font-size: 18px;
        font-weight: 700;
      }
      .door-areas,
      .door-zone,
      .door-raw-note {
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .door-areas { margin-top: 3px; }
      .door-icon { --mdc-icon-size: 38px; }
      .door-state-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 16px;
      }
      .door-state-card {
        padding: 11px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
      }
      .door-state-label {
        color: var(--secondary-text-color);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .door-state-value {
        margin-top: 3px;
        font-size: 18px;
        font-weight: 700;
      }
      .door-zone {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 12px;
      }
      .door-zone ha-icon { --mdc-icon-size: 18px; }
      .door-controls {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 16px;
      }
      .door-raw-note {
        margin-top: 14px;
        line-height: 1.4;
      }
      @media (max-width: 520px) {
        .door-list,
        .door-controls,
        .door-state-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
};

proto._callDoorButton = async function (entityId, doorName, actionLabel) {
  if (!this._hass || !entityId) return;

  if (
    this._config.confirm_actions &&
    !window.confirm(`${actionLabel} — ${doorName} ?`)
  ) {
    return;
  }

  await this._hass.callService("button", "press", { entity_id: entityId });
};

proto._render = function () {
  originalRender.call(this);

  this.querySelectorAll("[data-door-entity]").forEach((button) => {
    button.addEventListener("click", () => {
      this._callDoorButton(
        button.dataset.doorEntity,
        button.dataset.doorName || "Porte SPC",
        button.dataset.doorAction || "Exécuter la commande"
      );
    });
  });
};

console.info(
  "%c SPC FLEXC CARD %c 1.0.1 + doors ",
  "color:white;background:#1565c0;font-weight:700;",
  "color:#1565c0;background:white;font-weight:700;"
);
