const CARD_VERSION = "0.2.0-dev";

class SpcFlexCCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("spc-flexc-card-editor");
  }

  static getStubConfig(hass) {
    const alarmEntities = Object.entries(hass.states)
      .filter(([id]) => id.startsWith("alarm_control_panel."));

    const systemEntity = alarmEntities.find(([, stateObj]) =>
      stateObj?.attributes?.areas && typeof stateObj.attributes.areas === "object"
    );

    const entity = systemEntity?.[0] || alarmEntities[0]?.[0];
    return entity ? { entity } : {};
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("SPC FlexC Card requires an alarm_control_panel entity.");
    }

    const entityChanged = this._config?.entity !== config.entity;

    this._config = {
      name: "SPC FlexC",
      show_controls: true,
      confirm_actions: true,
      ...config,
    };

    if (!["system", "areas", "zones"].includes(this._activeTab)) {
      this._activeTab = "system";
    }

    if (entityChanged) {
      this._diagnosticScope = null;
      this._diagnosticScopeForEntity = null;
      this._diagnosticScopeLoading = false;
    }

    this._render();
    this._ensureDiagnosticScope();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
    this._ensureDiagnosticScope();
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
    };
  }

  _escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _locale() {
    return this._hass?.locale?.language || navigator.language || undefined;
  }

  _formatDateTime(value) {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    try {
      return new Intl.DateTimeFormat(this._locale(), {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    } catch {
      return date.toLocaleString(this._locale());
    }
  }

  _stateLabel(state) {
    return (
      {
        disarmed: "Désarmée",
        armed_away: "Armée",
        armed_home: "Partiel A",
        armed_night: "Partiel B",
        armed_vacation: "Armée",
        armed_custom_bypass: "Armée",
        arming: "Armement…",
        disarming: "Désarmement…",
        triggered: "ALARME",
        pending: "Temporisation",
        unavailable: "Indisponible",
        unknown: "État inconnu",
      }[state] ||
      state ||
      "Inconnu"
    );
  }

  _stateClass(state) {
    switch (state) {
      case "disarmed":
        return "ok";

      case "armed_away":
      case "armed_home":
      case "armed_night":
      case "armed_vacation":
      case "armed_custom_bypass":
      case "arming":
      case "pending":
        return "warning";

      case "triggered":
        return "danger";

      default:
        return "muted";
    }
  }

  _stateIcon(state) {
    switch (state) {
      case "disarmed":
        return "mdi:lock-open-variant";

      case "armed_away":
      case "armed_home":
      case "armed_night":
      case "armed_vacation":
      case "armed_custom_bypass":
        return "mdi:lock";

      case "arming":
      case "pending":
        return "mdi:lock-clock";

      case "triggered":
        return "mdi:alarm-light";

      case "unavailable":
        return "mdi:alert-circle";

      default:
        return "mdi:shield-outline";
    }
  }

  _modeLabel(mode) {
    const normalized = String(mode ?? "").toLowerCase();

    const labels = {
      unset: "Désarmé",
      disarmed: "Désarmé",
      full_set: "Armé",
      fullset: "Armé",
      set: "Armé",
      armed: "Armé",
      part_set_a: "Partiel A",
      partset_a: "Partiel A",
      part_set_b: "Partiel B",
      partset_b: "Partiel B",
      part_set: "Partiel",
      partset: "Partiel",
      unknown: "Inconnu",
    };

    return labels[normalized] || String(mode ?? "Inconnu");
  }

  _modeClass(mode) {
    const normalized = String(mode ?? "").toLowerCase();

    if (normalized === "unset" || normalized === "disarmed") {
      return "ok";
    }

    if (normalized.includes("set") || normalized.includes("armed")) {
      return "warning";
    }

    return "muted";
  }

  _getAlarmEntity() {
    if (!this._hass || !this._config) {
      return undefined;
    }

    return this._hass.states[this._config.entity];
  }

  _getAreas() {
    const alarm = this._getAlarmEntity();
    const rawAreas = alarm?.attributes?.areas;

    if (!rawAreas || typeof rawAreas !== "object") {
      return [];
    }

    return Object.entries(rawAreas)
      .map(([id, area]) => ({
        id: String(id),
        numericId: Number(id),
        name: area?.name || `Secteur ${id}`,
        mode: area?.mode,
        modeName: area?.mode_name,
        raw: area,
      }))
      .sort((a, b) => {
        if (
          Number.isFinite(a.numericId) &&
          Number.isFinite(b.numericId)
        ) {
          return a.numericId - b.numericId;
        }

        return a.name.localeCompare(b.name);
      });
  }

  _getAreaAlarmEntity(areaId) {
    if (!this._hass) {
      return null;
    }

    const id = String(areaId);

    return (
      Object.entries(this._hass.states)
        .filter(([entityId]) =>
          entityId.startsWith("alarm_control_panel.")
        )
        .map(([entityId, stateObj]) => ({
          entityId,
          stateObj,
        }))
        .find(
          ({ stateObj }) =>
            String(stateObj?.attributes?.area_id ?? "") === id
        ) || null
    );
  }

  _getZones() {
    if (!this._hass) {
      return [];
    }

    return Object.entries(this._hass.states)
      .filter(([entityId, stateObj]) => {
        if (!entityId.startsWith("binary_sensor.")) {
          return false;
        }

        const attrs = stateObj?.attributes || {};

        return (
          attrs.zone_id !== undefined &&
          attrs.zone_id !== null &&
          attrs.area_id !== undefined &&
          attrs.area_id !== null &&
          attrs.spc_zone_type !== undefined &&
          attrs.spc_zone_type !== null &&
          String(attrs.spc_zone_type).trim() !== ""
        );
      })
      .map(([entityId, stateObj]) => {
        const attrs = stateObj.attributes || {};

        return {
          entityId,
          state: stateObj.state,
          zoneId: attrs.zone_id,
          areaId: attrs.area_id,
          zoneType: String(
            attrs.spc_zone_type || ""
          ).toLowerCase(),
          deviceClass: String(
            attrs.device_class || ""
          ).toLowerCase(),
          name:
            attrs.friendly_name ||
            entityId.split(".").pop() ||
            `Zone ${attrs.zone_id}`,
          logicInput: attrs.logic_input,
          status: attrs.status,
          procState: attrs.proc_state,
          alarmState: attrs.alarm_state,
          actuationsSinceLastRead:
            attrs.actuations_since_last_read,
          raw: stateObj,
        };
      })
      .sort((a, b) => {
        const areaA = Number(a.areaId);
        const areaB = Number(b.areaId);

        if (
          Number.isFinite(areaA) &&
          Number.isFinite(areaB) &&
          areaA !== areaB
        ) {
          return areaA - areaB;
        }

        const zoneA = Number(a.zoneId);
        const zoneB = Number(b.zoneId);

        if (
          Number.isFinite(zoneA) &&
          Number.isFinite(zoneB)
        ) {
          return zoneA - zoneB;
        }

        return a.name.localeCompare(b.name);
      });
  }

  _getNormalZones() {
    return this._getZones().filter(
      (zone) =>
        zone.zoneType !== "tamper" &&
        zone.deviceClass !== "tamper"
    );
  }

  _getTamperZones() {
    return this._getZones().filter(
      (zone) =>
        zone.zoneType === "tamper" ||
        zone.deviceClass === "tamper"
    );
  }

  _areaName(areaId) {
    const id = String(areaId);

    const area = this._getAreas().find(
      (candidate) => String(candidate.id) === id
    );

    return area?.name || `Secteur ${id}`;
  }

  _zoneIcon(zone) {
    if (
      zone.zoneType === "tamper" ||
      zone.deviceClass === "tamper"
    ) {
      return "mdi:shield-alert-outline";
    }

    switch (zone.deviceClass) {
      case "motion":
      case "occupancy":
        return "mdi:motion-sensor";

      case "door":
        return "mdi:door";

      case "window":
        return "mdi:window-closed-variant";

      case "opening":
        return "mdi:door-open";

      case "smoke":
        return "mdi:smoke-detector";

      case "heat":
        return "mdi:fire";

      case "moisture":
        return "mdi:water-alert";

      case "gas":
        return "mdi:gas-cylinder";

      default:
        break;
    }

    switch (zone.zoneType) {
      case "entry_exit":
      case "entry-exit":
        return "mdi:door-open";

      case "fire":
        return "mdi:fire";

      case "panic":
        return "mdi:alarm-light";

      default:
        return "mdi:shield-home-outline";
    }
  }

  _zoneStateInfo(zone) {
    const active = zone.state === "on";

    if (
      zone.zoneType === "tamper" ||
      zone.deviceClass === "tamper"
    ) {
      return {
        label: active ? "AUTOPROTECTION" : "Normal",
        className: active ? "danger" : "ok",
      };
    }

    if (zone.state === "unavailable") {
      return {
        label: "Indisponible",
        className: "muted",
      };
    }

    if (zone.state === "unknown") {
      return {
        label: "Inconnu",
        className: "muted",
      };
    }

    switch (zone.deviceClass) {
      case "motion":
      case "occupancy":
        return {
          label: active ? "Mouvement" : "Repos",
          className: active ? "warning" : "ok",
        };

      case "door":
      case "window":
      case "opening":
        return {
          label: active ? "Ouvert" : "Fermé",
          className: active ? "warning" : "ok",
        };

      case "smoke":
        return {
          label: active ? "Fumée détectée" : "Normal",
          className: active ? "danger" : "ok",
        };

      case "heat":
        return {
          label: active ? "Chaleur détectée" : "Normal",
          className: active ? "danger" : "ok",
        };

      default:
        return {
          label: active ? "Actif" : "Repos",
          className: active ? "warning" : "ok",
        };
    }
  }

  _lastAreaChange(stateObj) {
    if (!stateObj) {
      return "";
    }

    const stableArmedStates = new Set([
      "armed_away",
      "armed_home",
      "armed_night",
      "armed_vacation",
      "armed_custom_bypass",
    ]);

    let prefix;
    let label;

    if (stateObj.state === "disarmed") {
      prefix = "last_unset";
      label = "Dernier désarmement";
    } else if (stableArmedStates.has(stateObj.state)) {
      prefix = "last_set";
      label = "Dernier armement";
    } else {
      return "";
    }

    const attrs = stateObj.attributes || {};

    const formattedTime = this._formatDateTime(
      attrs[`${prefix}_time`]
    );

    if (!formattedTime) {
      return "";
    }

    const rawUserName =
      attrs[`${prefix}_user_name`];

    const rawUserId =
      attrs[`${prefix}_user_id`];

    const userName =
      rawUserName != null
        ? String(rawUserName).trim()
        : "";

    const userId =
      rawUserId != null
        ? String(rawUserId).trim()
        : "";

    const user = userName || userId || null;

    return `
      <div class="last-change">
        <div class="last-change-label">
          ${this._escapeHtml(label)}
        </div>

        <div class="last-change-value">
          ${this._escapeHtml(formattedTime)}
          ${
            user
              ? `<span class="last-change-user"> · ${this._escapeHtml(
                  user
                )}</span>`
              : ""
          }
        </div>
      </div>
    `;
  }

  async _ensureDiagnosticScope() {
    if (
      !this._hass?.callWS ||
      !this._config?.entity
    ) {
      return;
    }

    if (this._diagnosticScopeLoading) {
      return;
    }

    if (
      this._diagnosticScopeForEntity ===
        this._config.entity &&
      this._diagnosticScope
    ) {
      return;
    }

    this._diagnosticScopeLoading = true;

    try {
      const entries = await this._hass.callWS({
        type: "config/entity_registry/list",
      });

      const selected = entries.find(
        (entry) =>
          entry.entity_id === this._config.entity
      );

      if (!selected) {
        this._diagnosticScope = {
          method: "none",
          entityIds: null,
        };
      } else if (selected.device_id) {
        const entityIds = new Set(
          entries
            .filter(
              (entry) =>
                entry.device_id &&
                entry.device_id === selected.device_id
            )
            .map((entry) => entry.entity_id)
        );

        this._diagnosticScope = {
          method: "device",
          entityIds,
        };
      } else if (selected.config_entry_id) {
        const entityIds = new Set(
          entries
            .filter((entry) => {
              if (
                entry.config_entry_id !==
                selected.config_entry_id
              ) {
                return false;
              }

              if (
                selected.platform &&
                entry.platform &&
                entry.platform !== selected.platform
              ) {
                return false;
              }

              return true;
            })
            .map((entry) => entry.entity_id)
        );

        this._diagnosticScope = {
          method: "config_entry",
          entityIds,
        };
      } else {
        this._diagnosticScope = {
          method: "none",
          entityIds: null,
        };
      }
    } catch (error) {
      console.warn(
        "SPC FlexC Card: unable to read entity registry for diagnostics",
        error
      );

      this._diagnosticScope = {
        method: "unavailable",
        entityIds: null,
      };
    } finally {
      this._diagnosticScopeForEntity =
        this._config.entity;

      this._diagnosticScopeLoading = false;
      this._render();
    }
  }

  _getSystemDiagnostics() {
    const scope = this._diagnosticScope;

    if (!scope?.entityIds) {
      return {
        scopeAvailable: false,
        connection: null,
        faults: [],
      };
    }

    const diagnostics = [];

    for (const entityId of scope.entityIds) {
      if (
        !entityId.startsWith("binary_sensor.")
      ) {
        continue;
      }

      const stateObj =
        this._hass.states[entityId];

      if (!stateObj) {
        continue;
      }

      const attrs = stateObj.attributes || {};

      if (
        attrs.zone_id !== undefined ||
        attrs.area_id !== undefined ||
        attrs.spc_zone_type !== undefined
      ) {
        continue;
      }

      diagnostics.push({
        entityId,
        stateObj,
        deviceClass: String(
          attrs.device_class || ""
        ).toLowerCase(),
        friendlyName: String(
          attrs.friendly_name || entityId
        ),
      });
    }

    const connection =
      diagnostics.find((item) => {
        if (
          item.deviceClass !== "connectivity"
        ) {
          return false;
        }

        return /flex\s*c|flexc/i.test(
          `${item.entityId} ${item.friendlyName}`
        );
      }) || null;

    const faults = diagnostics
      .filter(
        (item) =>
          item.deviceClass === "problem" &&
          item.stateObj.state === "on"
      )
      .sort((a, b) =>
        a.friendlyName.localeCompare(
          b.friendlyName,
          this._locale()
        )
      );

    return {
      scopeAvailable: true,
      connection,
      faults,
    };
  }

  _renderSystemDiagnostics() {
    const diagnostics =
      this._getSystemDiagnostics();

    let connectionHtml;

    if (!diagnostics.scopeAvailable) {
      connectionHtml = `
        <div class="diagnostic-row">
          <ha-icon
            class="muted"
            icon="mdi:lan-disconnect"
          ></ha-icon>

          <div class="diagnostic-main">
            <div class="diagnostic-name">
              Connexion FlexC
            </div>

            <div class="diagnostic-detail muted">
              État non déterminé
            </div>
          </div>
        </div>
      `;
    } else if (!diagnostics.connection) {
      connectionHtml = `
        <div class="diagnostic-row">
          <ha-icon
            class="muted"
            icon="mdi:lan"
          ></ha-icon>

          <div class="diagnostic-main">
            <div class="diagnostic-name">
              Connexion FlexC
            </div>

            <div class="diagnostic-detail muted">
              Entité non exposée
            </div>
          </div>
        </div>
      `;
    } else {
      const connected =
        diagnostics.connection.stateObj.state ===
        "on";

      connectionHtml = `
        <div class="diagnostic-row">
          <ha-icon
            class="${connected ? "ok" : "danger"}"
            icon="${
              connected
                ? "mdi:lan-connect"
                : "mdi:lan-disconnect"
            }"
          ></ha-icon>

          <div class="diagnostic-main">
            <div class="diagnostic-name">
              Connexion FlexC
            </div>

            <div class="diagnostic-detail ${
              connected ? "ok" : "danger"
            }">
              ${
                connected
                  ? "Connectée"
                  : "Déconnectée"
              }
            </div>
          </div>
        </div>
      `;
    }

    const faultsHtml =
      !diagnostics.scopeAvailable
        ? `
          <div class="fault-ok muted">
            <ha-icon
              icon="mdi:information-outline"
            ></ha-icon>
            <span>
              Défauts système non déterminés :
              métadonnées d’entité indisponibles.
            </span>
          </div>
        `
        : diagnostics.faults.length
          ? `
            <div class="fault-header danger">
              <ha-icon
                icon="mdi:alert-circle"
              ></ha-icon>

              <span>Défauts actifs</span>

              <span class="fault-count">
                ${diagnostics.faults.length}
              </span>
            </div>

            <div class="fault-list">
              ${diagnostics.faults
                .map(
                  (fault) => `
                    <div class="fault-row danger">
                      <ha-icon
                        icon="mdi:alert"
                      ></ha-icon>

                      <span>
                        ${this._escapeHtml(
                          fault.friendlyName
                        )}
                      </span>
                    </div>
                  `
                )
                .join("")}
            </div>
          `
          : `
            <div class="fault-ok ok">
              <ha-icon
                icon="mdi:check-circle"
              ></ha-icon>
              <span>Aucun défaut actif</span>
            </div>
          `;

    return `
      <div class="diagnostics-block">
        <div class="group-title">
          Système
        </div>

        ${connectionHtml}
        ${faultsHtml}
      </div>
    `;
  }

  async _callAlarmService(
    service,
    entityId = this._config?.entity,
    displayName = null
  ) {
    if (!this._hass || !entityId) {
      return;
    }

    const stateObj =
      this._hass.states[entityId];

    const name =
      displayName ||
      stateObj?.attributes?.friendly_name ||
      this._config?.name ||
      entityId;

    let prompt =
      `Exécuter l'action sur ${name} ?`;

    switch (service) {
      case "alarm_disarm":
        prompt = `Désarmer ${name} ?`;
        break;

      case "alarm_arm_away":
        prompt = `Armer complètement ${name} ?`;
        break;

      case "alarm_arm_home":
        prompt =
          `Activer le partiel A sur ${name} ?`;
        break;

      case "alarm_arm_night":
        prompt =
          `Activer le partiel B sur ${name} ?`;
        break;

      default:
        break;
    }

    if (
      this._config.confirm_actions &&
      !window.confirm(prompt)
    ) {
      return;
    }

    await this._hass.callService(
      "alarm_control_panel",
      service,
      {
        entity_id: entityId,
      }
    );
  }

  _renderTabs() {
    const tabs = [
      {
        id: "system",
        label: "Système",
      },
      {
        id: "areas",
        label: "Secteurs",
      },
      {
        id: "zones",
        label: "Détecteurs",
      },
    ];

    return `
      <div class="tabs">
        ${tabs
          .map(
            (tab) => `
              <button
                type="button"
                class="tab ${
                  this._activeTab === tab.id
                    ? "active"
                    : ""
                }"
                data-tab="${this._escapeHtml(
                  tab.id
                )}"
              >
                ${this._escapeHtml(tab.label)}
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  _renderSystem() {
    const alarm = this._getAlarmEntity();
    const state = alarm?.state || "unknown";

    const areas = this._getAreas();
    const zones = this._getNormalZones();
    const tampers = this._getTamperZones();

    const activeZones = zones.filter(
      (zone) => zone.state === "on"
    ).length;

    const activeTampers = tampers.filter(
      (zone) => zone.state === "on"
    ).length;

    const controls =
      this._config.show_controls
        ? `
          <div class="alarm-controls system-controls">
            <button
              type="button"
              class="control-button"
              data-service="alarm_disarm"
              data-entity="${this._escapeHtml(
                this._config.entity
              )}"
            >
              <ha-icon
                icon="mdi:lock-open-variant"
              ></ha-icon>
              <span>Désarmer</span>
            </button>

            <button
              type="button"
              class="control-button primary"
              data-service="alarm_arm_away"
              data-entity="${this._escapeHtml(
                this._config.entity
              )}"
            >
              <ha-icon icon="mdi:lock"></ha-icon>
              <span>Armement total</span>
            </button>
          </div>
        `
        : "";

    return `
      <div class="system-view">
        <div class="system-panel">
          <div class="system-state ${this._stateClass(
            state
          )}">
            ${this._escapeHtml(
              this._stateLabel(state)
            )}
          </div>

          <ha-icon
            class="system-icon ${this._stateClass(
              state
            )}"
            icon="${this._escapeHtml(
              this._stateIcon(state)
            )}"
          ></ha-icon>

          <div class="system-summary">
            ${
              areas.length
                ? `${areas.length} secteur${
                    areas.length > 1 ? "s" : ""
                  }`
                : "Aucun secteur"
            }
            ·
            ${
              zones.length
                ? `${zones.length} détecteur${
                    zones.length > 1 ? "s" : ""
                  }`
                : "Aucun détecteur"
            }
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <ha-icon
              icon="mdi:shield-home-outline"
            ></ha-icon>

            <div>
              <div class="summary-value">
                ${areas.length}
              </div>

              <div class="summary-label">
                Secteurs
              </div>
            </div>
          </div>

          <div class="summary-card">
            <ha-icon
              icon="mdi:motion-sensor"
            ></ha-icon>

            <div>
              <div class="summary-value">
                ${zones.length}
              </div>

              <div class="summary-label">
                Détecteurs
                ${
                  activeZones
                    ? `<span class="warning"> · ${activeZones} actif${
                        activeZones > 1 ? "s" : ""
                      }</span>`
                    : ""
                }
              </div>
            </div>
          </div>

          <div class="summary-card">
            <ha-icon
              icon="mdi:shield-alert-outline"
            ></ha-icon>

            <div>
              <div class="summary-value">
                ${tampers.length}
              </div>

              <div class="summary-label">
                Autoprotections
                ${
                  activeTampers
                    ? `<span class="danger"> · ${activeTampers} en défaut</span>`
                    : ""
                }
              </div>
            </div>
          </div>
        </div>

        ${this._renderSystemDiagnostics()}
        ${controls}
      </div>
    `;
  }

  _renderAreaControls(area, areaEntity) {
    if (
      !this._config.show_controls ||
      !areaEntity
    ) {
      return "";
    }

    const {
      entityId,
      stateObj,
    } = areaEntity;

    const attrs =
      stateObj?.attributes || {};

    const state =
      stateObj?.state || "unknown";

    const stableArmedStates = new Set([
      "armed_away",
      "armed_home",
      "armed_night",
      "armed_vacation",
      "armed_custom_bypass",
    ]);

    const buttons = [];

    if (state === "disarmed") {
      buttons.push(`
        <button
          type="button"
          class="control-button primary"
          data-service="alarm_arm_away"
          data-entity="${this._escapeHtml(
            entityId
          )}"
          data-name="${this._escapeHtml(
            area.name
          )}"
        >
          <ha-icon icon="mdi:lock"></ha-icon>
          <span>Armer</span>
        </button>
      `);

      if (
        attrs.partset_a_enabled === true
      ) {
        buttons.push(`
          <button
            type="button"
            class="control-button"
            data-service="alarm_arm_home"
            data-entity="${this._escapeHtml(
              entityId
            )}"
            data-name="${this._escapeHtml(
              area.name
            )}"
          >
            <ha-icon
              icon="mdi:shield-home"
            ></ha-icon>
            <span>Partiel A</span>
          </button>
        `);
      }

      if (
        attrs.partset_b_enabled === true
      ) {
        buttons.push(`
          <button
            type="button"
            class="control-button"
            data-service="alarm_arm_night"
            data-entity="${this._escapeHtml(
              entityId
            )}"
            data-name="${this._escapeHtml(
              area.name
            )}"
          >
            <ha-icon
              icon="mdi:weather-night"
            ></ha-icon>
            <span>Partiel B</span>
          </button>
        `);
      }
    } else if (
      stableArmedStates.has(state)
    ) {
      buttons.push(`
        <button
          type="button"
          class="control-button"
          data-service="alarm_disarm"
          data-entity="${this._escapeHtml(
            entityId
          )}"
          data-name="${this._escapeHtml(
            area.name
          )}"
        >
          <ha-icon
            icon="mdi:lock-open-variant"
          ></ha-icon>
          <span>Désarmer</span>
        </button>
      `);
    }

    if (!buttons.length) {
      return "";
    }

    return `
      <div class="area-controls">
        ${buttons.join("")}
      </div>
    `;
  }

  _renderAreas() {
    const areas = this._getAreas();
    const zones = this._getZones();

    if (!areas.length) {
      return `
        <div class="empty-state">
          <ha-icon
            icon="mdi:shield-home-outline"
          ></ha-icon>
          <div>
            Aucun secteur SPC disponible.
          </div>
        </div>
      `;
    }

    return `
      <div class="list area-list">
        ${areas
          .map((area) => {
            const areaZones =
              zones.filter(
                (zone) =>
                  String(zone.areaId) ===
                  String(area.id)
              );

            const normalZones =
              areaZones.filter(
                (zone) =>
                  zone.zoneType !== "tamper" &&
                  zone.deviceClass !== "tamper"
              );

            const tampers =
              areaZones.filter(
                (zone) =>
                  zone.zoneType === "tamper" ||
                  zone.deviceClass === "tamper"
              );

            const activeZones =
              normalZones.filter(
                (zone) => zone.state === "on"
              ).length;

            const activeTampers =
              tampers.filter(
                (zone) => zone.state === "on"
              ).length;

            const areaEntity =
              this._getAreaAlarmEntity(
                area.id
              );

            const mode =
              areaEntity?.stateObj?.attributes
                ?.mode_name ??
              area.modeName ??
              areaEntity?.stateObj?.attributes
                ?.mode ??
              area.mode ??
              "unknown";

            const renderedState =
              areaEntity?.stateObj?.state ||
              null;

            const stateClass =
              renderedState
                ? this._stateClass(
                    renderedState
                  )
                : this._modeClass(mode);

            const icon =
              renderedState
                ? this._stateIcon(
                    renderedState
                  )
                : stateClass === "ok"
                  ? "mdi:lock-open-variant"
                  : "mdi:lock";

            const label =
              renderedState
                ? this._stateLabel(
                    renderedState
                  ).replace(
                    /^Désarmée$/,
                    "Désarmé"
                  )
                : this._modeLabel(mode);

            return `
              <div class="area-card">
                <div class="area-card-header">
                  <div class="area-card-title">
                    ${this._escapeHtml(
                      area.name
                    )}
                  </div>

                  <div class="badge ${stateClass}">
                    ${this._escapeHtml(
                      label
                    )}
                  </div>
                </div>

                <div class="area-lock">
                  <ha-icon
                    class="${stateClass}"
                    icon="${this._escapeHtml(
                      icon
                    )}"
                  ></ha-icon>
                </div>

                <div class="area-meta">
                  <span>
                    ${normalZones.length}
                    détecteur${
                      normalZones.length > 1
                        ? "s"
                        : ""
                    }
                  </span>

                  ${
                    activeZones
                      ? `<span class="warning">${activeZones} actif${
                          activeZones > 1
                            ? "s"
                            : ""
                        }</span>`
                      : `<span class="ok">Au repos</span>`
                  }

                  ${
                    activeTampers
                      ? `<span class="danger">Autoprotection</span>`
                      : ""
                  }
                </div>

                ${this._lastAreaChange(
                  areaEntity?.stateObj
                )}

                ${this._renderAreaControls(
                  area,
                  areaEntity
                )}
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  _renderZoneRow(zone) {
    const stateInfo =
      this._zoneStateInfo(zone);

    return `
      <div class="zone-row">
        <div class="zone-icon ${
          stateInfo.className
        }">
          <ha-icon
            icon="${this._escapeHtml(
              this._zoneIcon(zone)
            )}"
          ></ha-icon>
        </div>

        <div class="zone-main">
          <div class="zone-name">
            ${this._escapeHtml(zone.name)}
          </div>

          <div class="zone-area">
            ${this._escapeHtml(
              this._areaName(zone.areaId)
            )}
          </div>
        </div>

        <div class="zone-state ${
          stateInfo.className
        }">
          ${this._escapeHtml(
            stateInfo.label
          )}
        </div>
      </div>
    `;
  }

  _renderZones() {
    const zones = this._getNormalZones();
    const tampers = this._getTamperZones();

    if (
      !zones.length &&
      !tampers.length
    ) {
      return `
        <div class="empty-state">
          <ha-icon
            icon="mdi:motion-sensor-off"
          ></ha-icon>

          <div>
            Aucune zone SPC découverte.
          </div>
        </div>
      `;
    }

    return `
      <div class="zones-view">
        ${
          zones.length
            ? `
              <div class="group-title">
                Détecteurs
                <span>${zones.length}</span>
              </div>

              <div class="zone-list">
                ${zones
                  .map((zone) =>
                    this._renderZoneRow(zone)
                  )
                  .join("")}
              </div>
            `
            : ""
        }

        ${
          tampers.length
            ? `
              <div class="group-title tamper-title">
                Autoprotections
                <span>${tampers.length}</span>
              </div>

              <div class="zone-list tamper-list">
                ${tampers
                  .map((zone) =>
                    this._renderZoneRow(zone)
                  )
                  .join("")}
              </div>
            `
            : ""
        }
      </div>
    `;
  }

  _renderActiveView() {
    switch (this._activeTab) {
      case "areas":
        return this._renderAreas();

      case "zones":
        return this._renderZones();

      case "system":
      default:
        return this._renderSystem();
    }
  }

  _styles() {
    return `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        ha-card {
          overflow: hidden;
          padding: 0;
          width: 100%;
        }

        .card {
          padding: 22px;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 10px;
        }

        .title {
          font-size: 24px;
          line-height: 1.2;
          font-weight: 600;
        }

        .entity {
          margin-top: 4px;
          color: var(--secondary-text-color);
          font-size: 12px;
        }

        .tabs {
          display: flex;
          gap: 28px;
          overflow-x: auto;
          border-bottom: 1px solid var(--divider-color);
          margin: 0 -22px 20px;
          padding: 0 22px;
        }

        .tab {
          appearance: none;
          border: 0;
          border-bottom: 3px solid transparent;
          background: transparent;
          color: var(--secondary-text-color);
          cursor: pointer;
          font: inherit;
          font-weight: 600;
          padding: 12px 0 10px;
          white-space: nowrap;
        }

        .tab:hover {
          color: var(--primary-text-color);
        }

        .tab.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        .system-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 260px;
          padding: 28px;
          border-radius: 14px;
          background: var(
            --secondary-background-color,
            rgba(127, 127, 127, 0.08)
          );
        }

        .system-state {
          font-size: 22px;
          font-weight: 700;
          text-align: center;
        }

        .system-icon {
          --mdc-icon-size: 140px;
          margin: 22px 0;
        }

        .system-summary {
          color: var(--secondary-text-color);
          text-align: center;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 12px;
          margin-top: 16px;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 15px;
          border: 1px solid var(--divider-color);
          border-radius: 12px;
        }

        .summary-card ha-icon {
          --mdc-icon-size: 30px;
          flex: 0 0 auto;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 700;
        }

        .summary-label {
          color: var(--secondary-text-color);
          font-size: 12px;
        }

        .alarm-controls {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .system-controls {
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
        }

        .area-controls {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(120px, 1fr)
          );
          gap: 10px;
          margin-top: 16px;
        }

        .control-button {
          appearance: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 70px;
          padding: 10px;
          border: 1px solid var(--divider-color);
          border-radius: 12px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          font: inherit;
        }

        .control-button:hover {
          background: var(
            --secondary-background-color,
            rgba(127, 127, 127, 0.08)
          );
        }

        .control-button.primary {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .control-button ha-icon {
          --mdc-icon-size: 27px;
        }

        .diagnostics-block {
          margin-top: 18px;
          padding: 16px;
          border: 1px solid var(--divider-color);
          border-radius: 14px;
        }

        .diagnostic-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 0 12px;
        }

        .diagnostic-row > ha-icon {
          --mdc-icon-size: 28px;
        }

        .diagnostic-main {
          min-width: 0;
        }

        .diagnostic-name {
          font-weight: 600;
        }

        .diagnostic-detail {
          margin-top: 2px;
          font-size: 12px;
        }

        .fault-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--divider-color);
          font-weight: 700;
        }

        .fault-count {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 11px;
          background: color-mix(
            in srgb,
            currentColor 14%,
            transparent
          );
        }

        .fault-list {
          display: grid;
          gap: 7px;
          margin-top: 10px;
        }

        .fault-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 9px;
          background: var(
            --secondary-background-color,
            rgba(127, 127, 127, 0.08)
          );
        }

        .fault-row ha-icon {
          --mdc-icon-size: 20px;
        }

        .fault-ok {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--divider-color);
          font-weight: 600;
        }

        .list {
          display: grid;
          gap: 14px;
        }

        .area-list {
          grid-template-columns: repeat(
            auto-fit,
            minmax(280px, 1fr)
          );
        }

        .area-card {
          padding: 18px;
          border-radius: 14px;
          background: var(
            --secondary-background-color,
            rgba(127, 127, 127, 0.08)
          );
        }

        .area-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .area-card-title {
          font-size: 18px;
          font-weight: 700;
        }

        .badge {
          font-weight: 700;
        }

        .area-lock {
          display: flex;
          justify-content: center;
          padding: 18px 0 10px;
        }

        .area-lock ha-icon {
          --mdc-icon-size: 78px;
        }

        .area-meta {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px 18px;
          color: var(--secondary-text-color);
          font-size: 12px;
        }

        .last-change {
          margin-top: 15px;
          padding-top: 12px;
          border-top: 1px solid var(--divider-color);
          text-align: center;
        }

        .last-change-label {
          color: var(--secondary-text-color);
          font-size: 12px;
        }

        .last-change-value {
          margin-top: 4px;
          font-size: 13px;
          color: var(--primary-text-color);
        }

        .last-change-user {
          color: var(--secondary-text-color);
        }

        .zones-view {
          display: grid;
          gap: 12px;
        }

        .group-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
          color: var(--secondary-text-color);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .group-title span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 9px;
          background: var(
            --secondary-background-color,
            rgba(127, 127, 127, 0.12)
          );
          font-size: 10px;
        }

        .tamper-title {
          margin-top: 16px;
        }

        .zone-list {
          display: grid;
          gap: 7px;
        }

        .zone-row {
          display: grid;
          grid-template-columns:
            46px minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          min-height: 52px;
          padding: 8px 12px;
          border-radius: 10px;
          background: var(
            --secondary-background-color,
            rgba(127, 127, 127, 0.08)
          );
        }

        .zone-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 2px solid currentColor;
          border-radius: 50%;
        }

        .zone-icon ha-icon {
          --mdc-icon-size: 22px;
        }

        .zone-main {
          min-width: 0;
        }

        .zone-name {
          overflow: hidden;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .zone-area {
          overflow: hidden;
          margin-top: 2px;
          color: var(--secondary-text-color);
          font-size: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .zone-state {
          font-weight: 700;
          text-align: right;
          white-space: nowrap;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 180px;
          color: var(--secondary-text-color);
          text-align: center;
        }

        .empty-state ha-icon {
          --mdc-icon-size: 54px;
        }

        .ok {
          color: var(
            --success-color,
            #4caf50
          );
        }

        .warning {
          color: var(
            --warning-color,
            #ff9800
          );
        }

        .danger {
          color: var(
            --error-color,
            #f44336
          );
        }

        .muted {
          color: var(--secondary-text-color);
        }

        @media (max-width: 700px) {
          .card {
            padding: 16px;
          }

          .tabs {
            margin-left: -16px;
            margin-right: -16px;
            padding-left: 16px;
            padding-right: 16px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .system-controls {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .area-list {
            grid-template-columns: 1fr;
          }

          .system-panel {
            min-height: 220px;
          }

          .system-icon {
            --mdc-icon-size: 110px;
          }
        }

        @media (max-width: 420px) {
          .zone-row {
            grid-template-columns:
              40px minmax(0, 1fr);
          }

          .zone-state {
            grid-column: 2;
            text-align: left;
            font-size: 12px;
          }

          .system-controls {
            grid-template-columns:
              1fr 1fr;
          }
        }
      </style>
    `;
  }

  _render() {
    if (
      !this._config ||
      !this._hass
    ) {
      return;
    }

    const stateObj =
      this._getAlarmEntity();

    if (!stateObj) {
      this.innerHTML = `
        <ha-card>
          <div style="padding:16px">
            Entity not found:
            ${this._escapeHtml(
              this._config.entity
            )}
          </div>
        </ha-card>
      `;

      return;
    }

    const title =
      this._config.name ||
      stateObj.attributes.friendly_name ||
      "SPC FlexC";

    this.innerHTML = `
      <ha-card>
        ${this._styles()}

        <div class="card">
          <div class="header">
            <div>
              <div class="title">
                ${this._escapeHtml(title)}
              </div>

              <div class="entity">
                ${this._escapeHtml(
                  this._config.entity
                )}
              </div>
            </div>
          </div>

          ${this._renderTabs()}

          <div class="content">
            ${this._renderActiveView()}
          </div>
        </div>
      </ha-card>
    `;

    this.querySelectorAll(
      "[data-tab]"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this._activeTab =
            button.dataset.tab;

          this._render();
        }
      );
    });

    this.querySelectorAll(
      "[data-service]"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this._callAlarmService(
            button.dataset.service,
            button.dataset.entity ||
              this._config.entity,
            button.dataset.name || null
          );
        }
      );
    });
  }
}

class SpcFlexCCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = {
      show_controls: true,
      confirm_actions: true,
      ...config,
    };

    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _changed() {
    const config = {
      ...this._config,

      entity:
        this.querySelector("#entity")
          ?.value || "",

      name:
        this.querySelector("#name")
          ?.value || undefined,

      show_controls: Boolean(
        this.querySelector(
          "#show_controls"
        )?.checked
      ),

      confirm_actions: Boolean(
        this.querySelector(
          "#confirm_actions"
        )?.checked
      ),
    };

    this._config = config;

    this.dispatchEvent(
      new CustomEvent(
        "config-changed",
        {
          detail: {
            config,
          },
          bubbles: true,
          composed: true,
        }
      )
    );
  }

  _render() {
    if (
      !this._config ||
      !this._hass
    ) {
      return;
    }

    const options =
      Object.keys(this._hass.states)
        .filter((id) =>
          id.startsWith(
            "alarm_control_panel."
          )
        )
        .map((id) => {
          const stateObj =
            this._hass.states[id];

          const name =
            stateObj?.attributes
              ?.friendly_name || id;

          return `
            <option
              value="${this._escapeHtml(
                id
              )}"
              ${
                id ===
                this._config.entity
                  ? "selected"
                  : ""
              }
            >
              ${this._escapeHtml(
                name
              )}
              (${this._escapeHtml(id)})
            </option>
          `;
        })
        .join("");

    this.innerHTML = `
      <style>
        .editor {
          display: grid;
          gap: 16px;
        }

        label {
          display: grid;
          gap: 6px;
        }

        input,
        select {
          box-sizing: border-box;
          width: 100%;
          padding: 9px;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .toggle input {
          width: auto;
        }

        .help {
          color: var(--secondary-text-color);
          font-size: 12px;
          line-height: 1.4;
        }
      </style>

      <div class="editor">
        <label>
          Entité d'alarme

          <select id="entity">
            <option value="">
              Sélectionner une entité
            </option>

            ${options}
          </select>
        </label>

        <label>
          Nom de la carte

          <input
            id="name"
            type="text"
            value="${this._escapeHtml(
              this._config.name || ""
            )}"
            placeholder="SPC FlexC"
          >
        </label>

        <label class="toggle">
          <input
            id="show_controls"
            type="checkbox"
            ${
              this._config
                .show_controls !== false
                ? "checked"
                : ""
            }
          >

          Afficher les commandes d'alarme
        </label>

        <label class="toggle">
          <input
            id="confirm_actions"
            type="checkbox"
            ${
              this._config
                .confirm_actions !== false
                ? "checked"
                : ""
            }
          >

          Confirmer les actions d'armement/désarmement
        </label>

        <div class="help">
          Les secteurs sont récupérés depuis l'entité d'alarme.
          Les détecteurs SPC sont découverts automatiquement parmi
          les binary_sensor possédant les attributs zone_id, area_id
          et spc_zone_type. Les diagnostics système sont rattachés à
          la même centrale via le registre d'entités Home Assistant
          quand celui-ci est disponible.
        </div>
      </div>
    `;

    this.querySelectorAll(
      "input, select"
    ).forEach((element) => {
      element.addEventListener(
        "change",
        () => this._changed()
      );

      element.addEventListener(
        "input",
        () => this._changed()
      );
    });
  }
}

if (
  !customElements.get(
    "spc-flexc-card"
  )
) {
  customElements.define(
    "spc-flexc-card",
    SpcFlexCCard
  );
}

if (
  !customElements.get(
    "spc-flexc-card-editor"
  )
) {
  customElements.define(
    "spc-flexc-card-editor",
    SpcFlexCCardEditor
  );
}

window.customCards =
  window.customCards || [];

if (
  !window.customCards.some(
    (card) =>
      card.type === "spc-flexc-card"
  )
) {
  window.customCards.push({
    type: "spc-flexc-card",
    name: "SPC FlexC Card",
    description:
      "Visual alarm control card for the SPC FlexC Home Assistant integration.",
    preview: true,
    documentationURL:
      "https://github.com/minimicro34/ha-spc-flexc-card",
  });
}

console.info(
  `%c SPC FLEXC CARD %c ${CARD_VERSION} `,
  "color:white;background:#1565c0;font-weight:700;",
  "color:#1565c0;background:white;font-weight:700;"
);