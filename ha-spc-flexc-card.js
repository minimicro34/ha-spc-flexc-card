const CARD_VERSION = "1.0.5";

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

    const validTabs = [
      "system",
      "areas",
      "zones",
      "doors",
      "outputs",
      "technical",
    ];

    if (entityChanged || !validTabs.includes(this._activeTab)) {
      this._activeTab = this._loadActiveTab(config.entity) || "system";
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
    this._reconcileLiveZoneStates();
    this._render();
    this._ensureDiagnosticScope();
    this._ensureStateSubscription();
  }

  connectedCallback() {
    this._ensureStateSubscription();
  }

  disconnectedCallback() {
    if (this._spcStateUnsubscribe) {
      this._spcStateUnsubscribe();
      this._spcStateUnsubscribe = null;
    }
  }

  _t(key, variables = {}, fallback = key) {
    if (typeof spcFlexCTranslate === "function") {
      return spcFlexCTranslate(this._hass, key, variables, fallback);
    }
    return fallback;
  }

  _tCount(key, count, variables = {}) {
    const suffix = Number(count) === 1 ? "one" : "other";
    return this._t(`${key}.${suffix}`, { count, ...variables }, String(count));
  }

  _reconcileLiveZoneStates() {
    if (!this._spcLiveStates?.size || !this._hass?.states) {
      return;
    }

    for (const [entityId, liveState] of this._spcLiveStates) {
      const currentState = this._hass.states[entityId];

      if (!currentState) {
        continue;
      }

      const currentUpdated = Date.parse(currentState.last_updated || "");
      const liveUpdated = Date.parse(liveState.last_updated || "");

      if (
        currentState === liveState ||
        (
          Number.isFinite(currentUpdated) &&
          Number.isFinite(liveUpdated) &&
          currentUpdated >= liveUpdated
        )
      ) {
        this._spcLiveStates.delete(entityId);
      }
    }
  }

  async _ensureStateSubscription() {
    if (
      this._spcStateUnsubscribe ||
      this._spcStateSubscriptionPending ||
      !this.isConnected ||
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
  }

  _activeTabStorageKey(entityId = this._config?.entity) {
    if (!entityId) {
      return null;
    }

    return `spc-flexc-card:${entityId}:active-tab`;
  }

  _loadActiveTab(entityId) {
    const key = this._activeTabStorageKey(entityId);

    if (!key) {
      return null;
    }

    try {
      const value = window.localStorage.getItem(key);
      return [
        "system",
        "areas",
        "zones",
        "doors",
        "outputs",
        "technical",
      ].includes(value)
        ? value
        : null;
    } catch {
      return null;
    }
  }

  _saveActiveTab(tabId) {
    const key = this._activeTabStorageKey();

    if (!key) {
      return;
    }

    try {
      window.localStorage.setItem(key, tabId);
    } catch {
      // Home Assistant can still keep the tab during normal rerenders even
      // when persistent browser storage is unavailable.
    }
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
    const key = {
      disarmed: "state.disarmed",
      armed_away: "state.armed",
      armed_home: "state.part_a",
      armed_night: "state.part_b",
      armed_vacation: "state.armed",
      armed_custom_bypass: "state.armed",
      arming: "state.arming",
      disarming: "state.disarming",
      triggered: "state.alarm",
      pending: "state.pending",
      unavailable: "state.unavailable",
      unknown: "state.unknown",
    }[state];

    return key ? this._t(key) : state || this._t("state.unknown_short");
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
    const key = {
      unset: "state.disarmed_masc",
      disarmed: "state.disarmed_masc",
      full_set: "state.armed_masc",
      fullset: "state.armed_masc",
      set: "state.armed_masc",
      armed: "state.armed_masc",
      part_set_a: "state.part_a",
      partset_a: "state.part_a",
      part_set_b: "state.part_b",
      partset_b: "state.part_b",
      part_set: "state.partial",
      partset: "state.partial",
      unknown: "state.unknown_short",
    }[normalized];

    return key ? this._t(key) : String(mode ?? this._t("state.unknown_short"));
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
        name: area?.name || this._t("area.name", { id }),
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

    const states = { ...this._hass.states };

    if (this._spcLiveStates?.size) {
      for (const [entityId, stateObj] of this._spcLiveStates) {
        states[entityId] = stateObj;
      }
    }

    return Object.entries(states)
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
            this._t("zone.name", { id: attrs.zone_id }),
          logicInput: attrs.logic_input,
          status: attrs.status,
          procState: attrs.proc_state,
          alarmState: attrs.alarm_state,
          eventTamper: attrs.event_tamper,
          lastEvent: attrs.last_event,
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

    return area?.name || this._t("area.name", { id });
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
    const isTamper =
      zone.zoneType === "tamper" ||
      zone.deviceClass === "tamper";
    const tamperActive =
      zone.eventTamper === true ||
      (isTamper && active);

    if (isTamper) {
      return {
        label: tamperActive
          ? this._t("zone.tamper")
          : this._t("state.normal"),
        className: tamperActive ? "danger" : "ok",
      };
    }

    if (zone.state === "unavailable") {
      return {
        label: this._t("state.unavailable"),
        className: "muted",
      };
    }

    if (zone.state === "unknown") {
      return {
        label: this._t("state.unknown_short"),
        className: "muted",
      };
    }

    switch (zone.deviceClass) {
      case "motion":
      case "occupancy":
        return {
          label: active
            ? this._t("zone.motion")
            : this._t("zone.rest"),
          className: active ? "warning" : "ok",
        };

      case "door":
      case "window":
      case "opening":
        return {
          label: active
            ? this._t("zone.open")
            : this._t("zone.closed"),
          className: active ? "warning" : "ok",
        };

      case "smoke":
        return {
          label: active
            ? this._t("zone.smoke")
            : this._t("state.normal"),
          className: active ? "danger" : "ok",
        };

      case "heat":
        return {
          label: active
            ? this._t("zone.heat")
            : this._t("state.normal"),
          className: active ? "danger" : "ok",
        };

      default:
        return {
          label: active
            ? this._t("zone.active")
            : this._t("zone.rest"),
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
    let labelKey;

    if (stateObj.state === "disarmed") {
      prefix = "last_unset";
      labelKey = "area.last_unset";
    } else if (stableArmedStates.has(stateObj.state)) {
      prefix = "last_set";
      labelKey = "area.last_set";
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

    const userName = String(
      attrs[`${prefix}_user_name`] ?? ""
    ).trim();
    const userId = String(
      attrs[`${prefix}_user_id`] ?? ""
    ).trim();
    const user = userName || userId || null;

    return `
      <div class="last-change">
        <div class="last-change-label">
          ${this._escapeHtml(this._t(labelKey))}
        </div>
        <div class="last-change-value">
          ${this._escapeHtml(formattedTime)}
          ${
            user
              ? `<span class="last-change-user"> · ${this._escapeHtml(user)}</span>`
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
      const [entries, devices] = await Promise.all([
        this._hass.callWS({
          type: "config/entity_registry/list",
        }),
        this._hass.callWS({
          type: "config/device_registry/list",
        }).catch(() => []),
      ]);

      const selected = entries.find(
        (entry) =>
          entry.entity_id === this._config.entity
      );

      if (!selected) {
        this._diagnosticScope = {
          method: "none",
          entityIds: null,
          integrationEntityIds: null,
          selected: null,
          device: null,
          integrationEntries: [],
          entryMap: new Map(),
        };
      } else {
        const integrationEntityIds = new Set(
          entries
            .filter((entry) => {
              if (selected.config_entry_id) {
                if (
                  entry.config_entry_id !==
                  selected.config_entry_id
                ) {
                  return false;
                }
              } else if (selected.device_id) {
                if (entry.device_id !== selected.device_id) {
                  return false;
                }
              } else if (
                entry.entity_id !== selected.entity_id
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

        let entityIds = integrationEntityIds;
        let method = "config_entry";

        if (selected.device_id) {
          entityIds = new Set(
            entries
              .filter(
                (entry) =>
                  entry.device_id &&
                  entry.device_id === selected.device_id
              )
              .map((entry) => entry.entity_id)
          );
          method = "device";
        }

        const device = Array.isArray(devices)
          ? devices.find(
              (candidate) =>
                candidate.id === selected.device_id
            ) || null
          : null;

        const integrationEntries = entries.filter((entry) =>
          integrationEntityIds.has(entry.entity_id)
        );

        this._diagnosticScope = {
          method,
          entityIds,
          integrationEntityIds,
          selected,
          device,
          integrationEntries,
          entryMap: new Map(
            integrationEntries.map((entry) => [entry.entity_id, entry])
          ),
        };
      }
    } catch (error) {
      console.warn(
        "SPC FlexC Card: unable to read Home Assistant registries for diagnostics",
        error
      );

      this._diagnosticScope = {
        method: "unavailable",
        entityIds: null,
        integrationEntityIds: null,
        selected: null,
        device: null,
        integrationEntries: [],
        entryMap: new Map(),
      };
    } finally {
      this._diagnosticScopeForEntity =
        this._config.entity;

      this._diagnosticScopeLoading = false;
      this._render();
    }
  }

  _scopeEntityIds(includeIntegration = false) {
    const scope = this._diagnosticScope;

    if (!scope) {
      return null;
    }

    if (
      includeIntegration &&
      scope.integrationEntityIds
    ) {
      return scope.integrationEntityIds;
    }

    return scope.entityIds || null;
  }

  _scopedStates(includeIntegration = false) {
    const ids = this._scopeEntityIds(
      includeIntegration
    );

    if (!ids || !this._hass) {
      return [];
    }

    const entryMap = this._diagnosticScope?.entryMap || new Map();

    return Array.from(ids)
      .map((entityId) => ({
        entityId,
        stateObj: this._hass.states[entityId],
        registryEntry: entryMap.get(entityId) || null,
      }))
      .filter((item) => Boolean(item.stateObj));
  }

  _getSystemDiagnostics() {
    const scope = this._diagnosticScope;

    if (!scope?.entityIds) {
      return {
        scopeAvailable: false,
        connection: null,
        engineerMode: null,
        faults: [],
      };
    }

    const diagnostics = [];

    for (const { entityId, stateObj } of this._scopedStates()) {
      if (!entityId.startsWith("binary_sensor.")) {
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
        if (item.deviceClass !== "connectivity") {
          return false;
        }

        return /flex\s*c|flexc/i.test(
          `${item.entityId} ${item.friendlyName}`
        );
      }) || null;

    const engineerMode =
      diagnostics.find((item) =>
        /engineer[_\s-]*mode|installer|installateur/i.test(
          `${item.entityId} ${item.friendlyName}`
        )
      ) || null;

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
      engineerMode,
      faults,
    };
  }

  _renderSystemDiagnostics() {
    const diagnostics = this._getSystemDiagnostics();

    let connectionHtml;

    if (!diagnostics.scopeAvailable) {
      connectionHtml = `
        <div class="diagnostic-row">
          <ha-icon class="muted" icon="mdi:lan-disconnect"></ha-icon>
          <div class="diagnostic-main">
            <div class="diagnostic-name">${this._t("system.connection")}</div>
            <div class="diagnostic-detail muted">${this._t("system.state_unknown")}</div>
          </div>
        </div>
      `;
    } else if (!diagnostics.connection) {
      connectionHtml = `
        <div class="diagnostic-row">
          <ha-icon class="muted" icon="mdi:lan"></ha-icon>
          <div class="diagnostic-main">
            <div class="diagnostic-name">${this._t("system.connection")}</div>
            <div class="diagnostic-detail muted">${this._t("system.entity_missing")}</div>
          </div>
        </div>
      `;
    } else {
      const connected =
        diagnostics.connection.stateObj.state === "on";

      connectionHtml = `
        <div class="diagnostic-row">
          <ha-icon
            class="${connected ? "ok" : "danger"}"
            icon="${connected ? "mdi:lan-connect" : "mdi:lan-disconnect"}"
          ></ha-icon>
          <div class="diagnostic-main">
            <div class="diagnostic-name">${this._t("system.connection")}</div>
            <div class="diagnostic-detail ${connected ? "ok" : "danger"}">
              ${this._t(connected ? "state.connected" : "state.disconnected")}
            </div>
          </div>
        </div>
      `;
    }

    const engineerHtml =
      diagnostics.engineerMode?.stateObj?.state === "on"
        ? `
          <div class="diagnostic-row engineer-warning">
            <ha-icon class="warning" icon="mdi:account-hard-hat"></ha-icon>
            <div class="diagnostic-main">
              <div class="diagnostic-name warning">${this._t("system.engineer_active")}</div>
              <div class="diagnostic-detail muted">
                ${this._t("system.engineer_detail")}
              </div>
            </div>
          </div>
        `
        : "";

    const faultsHtml =
      !diagnostics.scopeAvailable
        ? `
          <div class="fault-ok muted">
            <ha-icon icon="mdi:information-outline"></ha-icon>
            <span>${this._t("system.faults_unknown")}</span>
          </div>
        `
        : diagnostics.faults.length
          ? `
            <div class="fault-header danger">
              <ha-icon icon="mdi:alert-circle"></ha-icon>
              <span>${this._t("system.active_faults")}</span>
              <span class="fault-count">${diagnostics.faults.length}</span>
            </div>
            <div class="fault-list">
              ${diagnostics.faults
                .map(
                  (fault) => `
                    <div class="fault-row danger">
                      <ha-icon icon="mdi:alert"></ha-icon>
                      <span>${this._escapeHtml(fault.friendlyName)}</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          `
          : `
            <div class="fault-ok ok">
              <ha-icon icon="mdi:check-circle"></ha-icon>
              <span>${this._t("system.no_fault")}</span>
            </div>
          `;

    return `
      <div class="diagnostics-block">
        <div class="group-title">${this._t("system.health")}</div>
        ${connectionHtml}
        ${engineerHtml}
        ${faultsHtml}
      </div>
    `;
  }

  _valueWithUnit(stateObj) {
    if (!stateObj) return null;

    const state = String(stateObj.state ?? "").trim();
    if (!state || ["unknown", "unavailable"].includes(state)) {
      return null;
    }

    const unit = String(
      stateObj.attributes?.unit_of_measurement || ""
    ).trim();

    return unit ? `${state} ${unit}` : state;
  }

  _findIntegrationState(patterns) {
    return (
      this._scopedStates(true).find(({ entityId, stateObj }) => {
        const friendlyName =
          stateObj?.attributes?.friendly_name || "";
        const haystack = `${entityId} ${friendlyName}`;
        return patterns.some((pattern) => pattern.test(haystack));
      }) || null
    );
  }

  _technicalLine(label, value, className = "") {
    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      return "";
    }

    return `
      <div class="technical-row">
        <div class="technical-label">${this._escapeHtml(label)}</div>
        <div class="technical-value ${className}">${this._escapeHtml(value)}</div>
      </div>
    `;
  }

  _entityTechnicalLine(label, match, className = "") {
    return this._technicalLine(
      label,
      this._valueWithUnit(match?.stateObj),
      className
    );
  }

  _getFlexcCommunication() {
    const states = this._scopedStates(true);
    const atsMap = new Map();

    const ensureAts = (atsId) => {
      if (!atsMap.has(atsId)) {
        atsMap.set(atsId, {
          id: atsId,
          name: null,
          entities: [],
          atps: new Map(),
          activePath: null,
        });
      }
      return atsMap.get(atsId);
    };

    const ensureAtp = (ats, atpId) => {
      if (!ats.atps.has(atpId)) {
        ats.atps.set(atpId, {
          id: atpId,
          name: null,
          entities: [],
          lastTxOkTimestamp: null,
          active: null,
          fault: null,
        });
      }
      return ats.atps.get(atpId);
    };

    const friendlyName = (item) =>
      String(
        item.stateObj?.attributes?.friendly_name ||
          item.registryEntry?.original_name ||
          item.entityId ||
          ""
      ).trim();

    const atpNameFromFriendly = (friendly, atpId) => {
      const suffix = new RegExp(
        `\\s+ATP\\s+${atpId}\\s+(?:last\\s+TX\\s+successful|fault)$`,
        "i"
      );
      const match = String(friendly || "").match(suffix);
      if (!match) return null;
      const name = String(friendly).slice(0, match.index).trim();
      return name || null;
    };

    /*
     * SPC FlexC exposes stable registry unique IDs for communication entities:
     *   <entry_id>_ats_<ats_id>_active_path
     *   <entry_id>_ats_<ats_id>_atp_<atp_id>_last_tx_ok
     *   <entry_id>_ats_<ats_id>_atp_<atp_id>_fault
     *
     * Parse only those IDs. Do not infer ATS/ATP numbers from entity names or
     * unrelated states: doing so can incorrectly turn the alarm entity into
     * an ATS 0 / ATP 0.
     */
    for (const item of states) {
      const uniqueId = String(item.registryEntry?.unique_id || "");
      const stateObj = item.stateObj;
      if (!uniqueId || !stateObj) continue;

      let match = uniqueId.match(/_ats_(\d+)_active_path$/);
      if (match) {
        const atsId = Number(match[1]);
        if (atsId < 1) continue;

        const ats = ensureAts(atsId);
        ats.entities.push(item);

        const friendly = friendlyName(item);
        const nameMatch = friendly.match(/^(.*?)\s+active\s+path$/i);
        ats.name = nameMatch?.[1]?.trim() || ats.name;

        const activePath = String(stateObj.state || "").trim();
        if (activePath && !["unknown", "unavailable"].includes(activePath)) {
          ats.activePath = activePath;
        }
        continue;
      }

      match = uniqueId.match(/_ats_(\d+)_atp_(\d+)_(last_tx_ok|fault)$/);
      if (!match) continue;

      const atsId = Number(match[1]);
      const atpId = Number(match[2]);
      const kind = match[3];
      if (atsId < 1 || atpId < 1) continue;

      const ats = ensureAts(atsId);
      const atp = ensureAtp(ats, atpId);
      atp.entities.push(item);

      const parsedName = atpNameFromFriendly(friendlyName(item), atpId);
      if (parsedName && !atp.name) atp.name = parsedName;

      if (kind === "last_tx_ok") {
        const value = String(stateObj.state || "").trim();
        if (value && !["unknown", "unavailable"].includes(value)) {
          atp.lastTxOkTimestamp = value;
        }
      } else if (kind === "fault") {
        if (stateObj.state === "on") atp.fault = true;
        else if (stateObj.state === "off") atp.fault = false;
      }
    }

    const atsList = Array.from(atsMap.values())
      .map((ats) => {
        const rawAtps = Array.from(ats.atps.values()).sort(
          (a, b) => Number(a.id) - Number(b.id)
        );

        const normalizePath = (value) =>
          String(value || "")
            .toLocaleLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\batp\s*\d+\b/g, " ")
            .replace(/[^a-z0-9]+/g, " ")
            .trim();

        const activePath = normalizePath(ats.activePath);

        rawAtps.forEach((atp, index) => {
          atp.displayId = index + 1;

          if (!activePath) return;

          const atpName = normalizePath(atp.name);
          const significantWords = atpName
            .split(/\s+/)
            .filter((word) => word.length >= 3);

          if (
            atpName &&
            (atpName.endsWith(activePath) ||
              activePath.endsWith(atpName) ||
              significantWords.some(
                (word) =>
                  activePath === word ||
                  activePath.startsWith(`${word} `) ||
                  activePath.endsWith(` ${word}`)
              ))
          ) {
            atp.active = true;
          } else {
            atp.active = false;
          }
        });

        if (activePath && rawAtps.length === 1) {
          rawAtps[0].active = true;
          if (!rawAtps[0].name && ats.activePath) {
            rawAtps[0].name = ats.activePath;
          }
        }

        ats.atps = rawAtps;
        return ats;
      })
      .sort((a, b) => Number(a.id) - Number(b.id));

    return atsList;
  }

  _atpStateLabel(atp) {
    if (atp.fault === true || String(atp.fault).toLowerCase() === "true") {
      return { label: this._t("state.fault"), className: "danger" };
    }

    if (atp.active === true || String(atp.active).toLowerCase() === "true") {
      return { label: this._t("state.ok"), className: "ok" };
    }

    if (atp.active === false || String(atp.active).toLowerCase() === "false") {
      return { label: this._t("state.inactive"), className: "muted" };
    }

    if (atp.fault === false || String(atp.fault).toLowerCase() === "false") {
      return { label: this._t("state.ok"), className: "ok" };
    }

    return null;
  }

  _renderFlexcCommunication() {
    const atsList = this._getFlexcCommunication();
    if (!atsList.length) return "";

    return `
      <div class="technical-section">
        <div class="technical-section-title">${this._t("system.communication")}</div>
        <div class="ats-list">
          ${atsList
            .map((ats) => {
              const atsLabel = ats.ungrouped
                ? ats.name
                : `ATS ${ats.id ?? "?"}${
                    ats.name ? ` — ${ats.name}` : ""
                  }`;

              return `
                <div class="ats-card">
                  <div class="ats-title">${this._escapeHtml(atsLabel)}</div>
                  ${ats.atps.length
                    ? `<div class="atp-list">
                        ${ats.atps
                          .map((atp) => {
                            const atpLabel = `ATP ${atp.displayId ?? "?"}${
                              atp.name ? ` — ${atp.name}` : ""
                            }`;
                            const stateInfo = this._atpStateLabel(atp);
                            const formattedTx = this._formatDateTime(
                              atp.lastTxOkTimestamp
                            );

                            return `
                              <div class="atp-card">
                                <div class="atp-title">${this._escapeHtml(atpLabel)}</div>
                                ${stateInfo
                                  ? this._technicalLine(
                                      this._t("system.state"),
                                      stateInfo.label,
                                      stateInfo.className
                                    )
                                  : ""}
                                ${ats.ungrouped
                                  ? ""
                                  : this._technicalLine(
                                      this._t("system.ats_used"),
                                      atsLabel
                                    )}
                                ${this._technicalLine(
                                  this._t("system.last_tx"),
                                  formattedTx
                                )}
                              </div>
                            `;
                          })
                          .join("")}
                      </div>`
                    : ""}
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  _getXBusDevices() {
    const devices = new Map();

    for (const { entityId, stateObj } of this._scopedStates(true)) {
      const attrs = stateObj.attributes || {};
      const id = attrs.xbus_device_id;

      if (id === undefined || id === null) {
        continue;
      }

      const key = String(id);
      if (!devices.has(key)) {
        devices.set(key, {
          id,
          name: attrs.xbus_device_name || null,
          siaAddress: attrs.sia_address ?? null,
          tamperFault: attrs.tamper_fault ?? null,
          tamperIsolated: attrs.tamper_isolated ?? null,
          entities: [],
        });
      }

      const device = devices.get(key);
      device.entities.push({ entityId, stateObj });
      if (attrs.xbus_device_name) device.name = attrs.xbus_device_name;
      if (attrs.sia_address !== undefined) device.siaAddress = attrs.sia_address;
      if (attrs.tamper_fault !== undefined) device.tamperFault = attrs.tamper_fault;
      if (attrs.tamper_isolated !== undefined) device.tamperIsolated = attrs.tamper_isolated;
    }

    return Array.from(devices.values()).sort(
      (a, b) => Number(a.id) - Number(b.id)
    );
  }

  _renderXBusDevices() {
    const devices = this._getXBusDevices();
    if (!devices.length) return "";

    return `
      <div class="technical-section">
        <div class="technical-section-title">${this._t("system.xbus")}</div>
        <div class="xbus-list">
          ${devices
            .map((device) => {
              const title = device.name || `X-BUS ${device.id}`;
              const fault = device.tamperFault === true;
              const isolated = device.tamperIsolated === true;

              return `
                <div class="xbus-card">
                  <div class="xbus-title">
                    <span>${this._escapeHtml(title)}</span>
                    <span class="${fault ? "danger" : "ok"}">
                      ${this._t(fault ? "state.fault" : "state.ok")}
                    </span>
                  </div>
                  ${this._technicalLine(this._t("system.xbus_id"), device.id)}
                  ${this._technicalLine(this._t("system.sia_address"), device.siaAddress)}
                  ${device.tamperFault !== null
                    ? this._technicalLine(
                        this._t("system.tamper"),
                        this._t(fault ? "state.fault" : "state.ok"),
                        fault ? "danger" : "ok"
                      )
                    : ""}
                  ${device.tamperIsolated !== null
                    ? this._technicalLine(
                        this._t("system.tamper_isolation"),
                        this._t(isolated ? "state.isolated" : "state.not_isolated"),
                        isolated ? "warning" : "ok"
                      )
                    : ""}
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  _renderTechnicalSystem() {
    const scope = this._diagnosticScope;
    const device = scope?.device || {};

    const identityLines = [
      this._technicalLine(this._t("system.manufacturer"), device.manufacturer),
      this._technicalLine(this._t("system.model"), device.model || device.model_id),
      this._technicalLine(this._t("system.firmware"), device.sw_version),
      this._technicalLine(this._t("system.hardware"), device.hw_version),
      this._technicalLine(this._t("system.serial"), device.serial_number),
    ].join("");

    const acFrequency = this._findIntegrationState([
      /ac[_\s-]*frequency/i,
      /fr[ée]quence.*secteur/i,
    ]);
    const batteryVoltage = this._findIntegrationState([
      /battery[_\s-]*voltage/i,
      /tension.*batterie/i,
    ]);
    const auxVoltage = this._findIntegrationState([
      /aux[_\s-]*voltage/i,
      /tension.*aux/i,
    ]);
    const auxCurrent = this._findIntegrationState([
      /aux[_\s-]*current/i,
      /courant.*aux/i,
    ]);

    const powerLines = [
      this._entityTechnicalLine(this._t("system.ac_frequency"), acFrequency),
      this._entityTechnicalLine(this._t("system.battery_voltage"), batteryVoltage),
      this._entityTechnicalLine(this._t("system.aux_voltage"), auxVoltage),
      this._entityTechnicalLine(this._t("system.aux_current"), auxCurrent),
    ].join("");

    const rfEntities = this._scopedStates(true).filter(({ entityId, stateObj }) =>
      /\brf\b|radio/i.test(
        `${entityId} ${stateObj.attributes?.friendly_name || ""}`
      )
    );
    const modemEntities = this._scopedStates(true).filter(({ entityId, stateObj }) =>
      /modem/i.test(
        `${entityId} ${stateObj.attributes?.friendly_name || ""}`
      )
    );

    const renderEntityList = (title, entities) => {
      const rows = entities
        .filter(({ stateObj }) => this._valueWithUnit(stateObj) !== null)
        .map(({ stateObj }) =>
          this._technicalLine(
            stateObj.attributes?.friendly_name || this._t("system.state"),
            this._valueWithUnit(stateObj)
          )
        )
        .join("");

      return rows
        ? `<div class="technical-section">
            <div class="technical-section-title">${this._escapeHtml(title)}</div>
            ${rows}
          </div>`
        : "";
    };

    const identitySection = identityLines
      ? `<div class="technical-section" data-technical-section="panel">
          <div class="technical-section-title">${this._t("system.panel")}</div>
          ${identityLines}
        </div>`
      : "";

    const powerSection = powerLines
      ? `<div class="technical-section">
          <div class="technical-section-title">${this._t("system.power")}</div>
          ${powerLines}
        </div>`
      : "";

    const content = [
      identitySection,
      powerSection,
      this._renderFlexcCommunication(),
      this._renderXBusDevices(),
      renderEntityList(this._t("system.rf"), rfEntities),
      renderEntityList(this._t("system.modem"), modemEntities),
    ].join("");

    if (!content) {
      return "";
    }

    return `
      <div class="technical-system-view">
        ${content}
      </div>
    `;
  }

  async _callAlarmService(
    service,
    entityId = this._config?.entity,
    displayName = null,
    actionLabel = null
  ) {
    if (!this._hass || !entityId) {
      return;
    }

    const stateObj = this._hass.states[entityId];
    const name =
      displayName ||
      stateObj?.attributes?.friendly_name ||
      this._config?.name ||
      entityId;

    let prompt = this._t("confirm.generic", { name });

    switch (service) {
      case "alarm_disarm":
        prompt = this._t("confirm.disarm", { name });
        break;

      case "alarm_arm_away":
        prompt = this._t("confirm.full_arm", { name });
        break;

      case "alarm_arm_home":
        prompt = this._t("confirm.part_set", {
          action: actionLabel || this._t("state.part_a"),
          name,
        });
        break;

      case "alarm_arm_night":
        prompt = this._t("confirm.part_set", {
          action: actionLabel || this._t("state.part_b"),
          name,
        });
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

  _getDoors() {
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
      const {
        entityId,
        stateObj,
        registryEntry,
      } = item;

      const attrs = stateObj?.attributes || {};
      const uniqueId = String(registryEntry?.unique_id || "");
      let doorId = attrs.door_id;
      let match = uniqueId.match(/_door_(\d+)_(status|mode)$/);

      if (match) {
        doorId = match[1];
      }

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
          door.name =
            friendly
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
      .filter(
        (door) =>
          door.status !== null ||
          door.mode !== null ||
          Object.keys(door.buttons).length
      )
      .map((door) => ({
        ...door,
        name:
          door.name ||
          door.zoneName ||
          this._t("door.name", { id: door.id }),
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));
  }

  _doorAreasLabel(door) {
    const first =
      door.areaName ||
      (
        door.areaId !== null &&
        door.areaId !== undefined
          ? this._areaName(door.areaId)
          : null
      );

    const second =
      door.areaSide1Name ||
      (
        door.areaSide1 !== null &&
        door.areaSide1 !== undefined
          ? this._areaName(door.areaSide1)
          : null
      );

    if (first && second && first !== second) {
      return `${first} ↔ ${second}`;
    }

    return first || second || this._t("door.unknown_area");
  }

  _renderDoorButton(
    door,
    action,
    label,
    icon,
    primary = false
  ) {
    const entityId = door.buttons[action];

    if (!entityId || this._config.show_controls === false) {
      return "";
    }

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
  }

  _renderDoors() {
    const doors = this._getDoors();

    if (!doors.length) {
      return `
        <div class="empty-state">
          <ha-icon icon="mdi:door-closed-lock"></ha-icon>
          <div>${this._t("door.none")}</div>
        </div>
      `;
    }

    return `
      <div class="door-list">
        ${doors
          .map(
            (door) => `
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
                    <div class="door-state-label">${this._t("door.status")}</div>
                    <div class="door-state-value">${this._escapeHtml(door.status ?? "—")}</div>
                  </div>
                  <div class="door-state-card">
                    <div class="door-state-label">${this._t("door.mode")}</div>
                    <div class="door-state-value">${this._escapeHtml(door.mode ?? "—")}</div>
                  </div>
                </div>

                ${
                  door.zoneName
                    ? `
                      <div class="door-zone">
                        <ha-icon icon="mdi:shield-home-outline"></ha-icon>
                        <span>
                          ${this._t("zone.name", { id: door.zoneId ?? "" })}${
                            door.zoneId != null ? " · " : ""
                          }${this._escapeHtml(door.zoneName)}
                        </span>
                      </div>
                    `
                    : ""
                }

                <div class="door-controls">
                  ${this._renderDoorButton(
                    door,
                    "open_momentarily",
                    this._t("action.door_momentary"),
                    "mdi:door-open",
                    true
                  )}
                  ${this._renderDoorButton(
                    door,
                    "open_permanently",
                    this._t("action.door_permanent"),
                    "mdi:lock-open-variant"
                  )}
                  ${this._renderDoorButton(
                    door,
                    "set_normal",
                    this._t("action.door_normal"),
                    "mdi:door-closed"
                  )}
                  ${this._renderDoorButton(
                    door,
                    "lock",
                    this._t("action.door_lock"),
                    "mdi:lock"
                  )}
                </div>

                <div class="door-raw-note">
                  ${this._t("door.raw_note")}
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  async _callDoorButton(entityId, doorName, actionLabel) {
    if (!this._hass || !entityId) {
      return;
    }

    if (
      this._config.confirm_actions &&
      !window.confirm(
        this._t("confirm.door", {
          action: actionLabel,
          name: doorName,
        })
      )
    ) {
      return;
    }

    await this._hass.callService(
      "button",
      "press",
      {
        entity_id: entityId,
      }
    );
  }

  _renderTabs() {
    const hasDoors = this._getDoors().length > 0;

    if (!hasDoors && this._activeTab === "doors") {
      this._activeTab = "system";
    }

    const tabs = [
      ["system", this._t("tab.general")],
      ["areas", this._t("tab.areas")],
      ["zones", this._t("tab.detectors")],
      ...(hasDoors ? [["doors", this._t("tab.doors")]] : []),
      ["technical", this._t("tab.system")],
    ];

    return `<div class="tabs">${tabs.map(([id, label]) => `
      <button type="button" class="tab ${this._activeTab === id ? "active" : ""}" data-tab="${id}">
        ${this._escapeHtml(label)}
      </button>
    `).join("")}</div>`;
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
      (zone) =>
        zone.state === "on" ||
        zone.eventTamper === true
    ).length;

    const controls =
      this._config.show_controls
        ? `
          <div class="alarm-controls system-controls">
            <button
              type="button"
              class="control-button"
              data-service="alarm_disarm"
              data-entity="${this._escapeHtml(this._config.entity)}"
            >
              <ha-icon icon="mdi:lock-open-variant"></ha-icon>
              <span>${this._t("action.disarm")}</span>
            </button>

            <button
              type="button"
              class="control-button primary"
              data-service="alarm_arm_away"
              data-entity="${this._escapeHtml(this._config.entity)}"
            >
              <ha-icon icon="mdi:lock"></ha-icon>
              <span>${this._t("action.full_arm")}</span>
            </button>
          </div>
        `
        : "";

    const areaSummary = areas.length
      ? this._tCount("group.area_count", areas.length)
      : this._t("group.no_area");
    const detectorSummary = zones.length
      ? this._tCount("group.detector_count", zones.length)
      : this._t("group.no_detector");

    return `
      <div class="system-view">
        <div class="system-panel">
          <div class="system-state ${this._stateClass(state)}">
            ${this._escapeHtml(this._stateLabel(state))}
          </div>

          <ha-icon
            class="system-icon ${this._stateClass(state)}"
            icon="${this._escapeHtml(this._stateIcon(state))}"
          ></ha-icon>

          <div class="system-summary">
            ${areaSummary} · ${detectorSummary}
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <ha-icon icon="mdi:shield-home-outline"></ha-icon>
            <div>
              <div class="summary-value">${areas.length}</div>
              <div class="summary-label">${this._t("tab.areas")}</div>
            </div>
          </div>

          <div class="summary-card">
            <ha-icon icon="mdi:motion-sensor"></ha-icon>
            <div>
              <div class="summary-value">${zones.length}</div>
              <div class="summary-label">
                ${this._t("tab.detectors")}
                ${
                  activeZones
                    ? `<span class="warning"> · ${this._tCount("group.active_count", activeZones)}</span>`
                    : ""
                }
              </div>
            </div>
          </div>

          <div class="summary-card">
            <ha-icon icon="mdi:shield-alert-outline"></ha-icon>
            <div>
              <div class="summary-value">${tampers.length}</div>
              <div class="summary-label">
                ${this._t("group.tampers")}
                ${
                  activeTampers
                    ? `<span class="danger"> · ${this._t("group.in_fault", { count: activeTampers })}</span>`
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

  _partSetLabel(areaEntity, part) {
    const attrs = areaEntity?.stateObj?.attributes || {};
    const attributeName = part === "a" ? "partset_a_name" : "partset_b_name";
    const value = attrs[attributeName];

    return value != null && String(value).trim()
      ? String(value).trim()
      : this._t(part === "a" ? "state.part_a" : "state.part_b");
  }

  _renderAreaControls(area, areaEntity) {
    if (!this._config.show_controls || !areaEntity) {
      return "";
    }

    const { entityId, stateObj } = areaEntity;
    const attrs = stateObj?.attributes || {};
    const state = stateObj?.state || "unknown";

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
          data-entity="${this._escapeHtml(entityId)}"
          data-name="${this._escapeHtml(area.name)}"
        >
          <ha-icon icon="mdi:lock"></ha-icon>
          <span>${this._t("action.arm")}</span>
        </button>
      `);

      if (attrs.partset_a_enabled === true) {
        const label = this._partSetLabel(areaEntity, "a");
        buttons.push(`
          <button
            type="button"
            class="control-button"
            data-service="alarm_arm_home"
            data-entity="${this._escapeHtml(entityId)}"
            data-name="${this._escapeHtml(area.name)}"
            data-action-label="${this._escapeHtml(label)}"
          >
            <ha-icon icon="mdi:shield-home"></ha-icon>
            <span>${this._escapeHtml(label)}</span>
          </button>
        `);
      }

      if (attrs.partset_b_enabled === true) {
        const label = this._partSetLabel(areaEntity, "b");
        buttons.push(`
          <button
            type="button"
            class="control-button"
            data-service="alarm_arm_night"
            data-entity="${this._escapeHtml(entityId)}"
            data-name="${this._escapeHtml(area.name)}"
            data-action-label="${this._escapeHtml(label)}"
          >
            <ha-icon icon="mdi:weather-night"></ha-icon>
            <span>${this._escapeHtml(label)}</span>
          </button>
        `);
      }
    } else if (stableArmedStates.has(state)) {
      buttons.push(`
        <button
          type="button"
          class="control-button"
          data-service="alarm_disarm"
          data-entity="${this._escapeHtml(entityId)}"
          data-name="${this._escapeHtml(area.name)}"
        >
          <ha-icon icon="mdi:lock-open-variant"></ha-icon>
          <span>${this._t("action.disarm")}</span>
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
          <ha-icon icon="mdi:shield-home-outline"></ha-icon>
          <div>${this._t("area.none")}</div>
        </div>
      `;
    }

    return `
      <div class="list area-list">
        ${areas
          .map((area) => {
            const areaZones = zones.filter(
              (zone) => String(zone.areaId) === String(area.id)
            );

            const normalZones = areaZones.filter(
              (zone) =>
                zone.zoneType !== "tamper" &&
                zone.deviceClass !== "tamper"
            );

            const tampers = areaZones.filter(
              (zone) =>
                zone.zoneType === "tamper" ||
                zone.deviceClass === "tamper"
            );

            const activeZones = normalZones.filter(
              (zone) => zone.state === "on"
            ).length;

            const activeTampers = tampers.filter(
              (zone) =>
                zone.state === "on" ||
                zone.eventTamper === true
            ).length;

            const areaEntity = this._getAreaAlarmEntity(area.id);

            const mode =
              areaEntity?.stateObj?.attributes?.mode_name ??
              area.modeName ??
              areaEntity?.stateObj?.attributes?.mode ??
              area.mode ??
              "unknown";

            const renderedState = areaEntity?.stateObj?.state || null;
            const stateClass = renderedState
              ? this._stateClass(renderedState)
              : this._modeClass(mode);

            const icon = renderedState
              ? this._stateIcon(renderedState)
              : stateClass === "ok"
                ? "mdi:lock-open-variant"
                : "mdi:lock";

            const label =
              renderedState === "armed_home"
                ? this._partSetLabel(areaEntity, "a")
                : renderedState === "armed_night"
                  ? this._partSetLabel(areaEntity, "b")
                  : renderedState === "disarmed"
                    ? this._t("state.disarmed_masc")
                    : renderedState
                      ? this._stateLabel(renderedState)
                      : this._modeLabel(mode);

            return `
              <div class="area-card">
                <div class="area-card-header">
                  <div class="area-card-title">${this._escapeHtml(area.name)}</div>
                  <div class="badge ${stateClass}">${this._escapeHtml(label)}</div>
                </div>

                <div class="area-lock">
                  <ha-icon class="${stateClass}" icon="${this._escapeHtml(icon)}"></ha-icon>
                </div>

                <div class="area-meta">
                  <span>${this._tCount("group.detector_count", normalZones.length)}</span>
                  ${
                    activeZones
                      ? `<span class="warning">${this._tCount("group.active_count", activeZones)}</span>`
                      : `<span class="ok">${this._t("group.rest")}</span>`
                  }
                  ${
                    activeTampers
                      ? `<span class="danger">${this._t("area.tamper")}</span>`
                      : ""
                  }
                </div>

                ${this._lastAreaChange(areaEntity?.stateObj)}
                ${this._renderAreaControls(area, areaEntity)}
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  _renderZoneRow(zone) {
    const stateInfo = this._zoneStateInfo(zone);

    return `
      <div class="zone-row">
        <div class="zone-icon ${stateInfo.className}">
          <ha-icon icon="${this._escapeHtml(this._zoneIcon(zone))}"></ha-icon>
        </div>

        <div class="zone-main">
          <div class="zone-name">${this._escapeHtml(zone.name)}</div>
          <div class="zone-area">${this._escapeHtml(this._areaName(zone.areaId))}</div>
        </div>

        <div class="zone-state ${stateInfo.className}">
          ${this._escapeHtml(stateInfo.label)}
        </div>
      </div>
    `;
  }

  _renderZones() {
    const zones = this._getNormalZones();
    const tampers = this._getTamperZones();

    if (!zones.length && !tampers.length) {
      return `
        <div class="empty-state">
          <ha-icon icon="mdi:motion-sensor-off"></ha-icon>
          <div>${this._t("zone.none")}</div>
        </div>
      `;
    }

    return `
      <div class="zones-view">
        ${
          zones.length
            ? `
              <div class="group-title">
                ${this._t("group.detectors")}
                <span>${zones.length}</span>
              </div>
              <div class="zone-list">
                ${zones.map((zone) => this._renderZoneRow(zone)).join("")}
              </div>
            `
            : ""
        }

        ${
          tampers.length
            ? `
              <div class="group-title tamper-title">
                ${this._t("group.tampers")}
                <span>${tampers.length}</span>
              </div>
              <div class="zone-list tamper-list">
                ${tampers.map((zone) => this._renderZoneRow(zone)).join("")}
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

      case "doors":
        return this._getDoors().length
          ? this._renderDoors()
          : this._renderSystem();

      case "technical":
        return this._renderTechnicalSystem();

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
          gap: 8px;
          min-width: 0;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 12px;
        }

        .summary-card ha-icon {
          --mdc-icon-size: 28px;
          flex: 0 0 auto;
        }

        .summary-card > div {
          min-width: 0;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.1;
        }

        .summary-label {
          max-width: 100%;
          color: var(--secondary-text-color);
          font-size: 11px;
          line-height: 1.25;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: normal;
          hyphens: auto;
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

        .engineer-warning {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--divider-color);
        }

        .technical-system-view {
          display: grid;
          gap: 18px;
        }

        .technical-section {
          padding-top: 15px;
        }

        .technical-section-title {
          margin-bottom: 8px;
          color: var(--secondary-text-color);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .technical-row {
          display: grid;
          grid-template-columns: minmax(130px, 0.7fr) minmax(0, 1.3fr);
          gap: 14px;
          padding: 6px 0;
          border-bottom: 1px solid color-mix(
            in srgb,
            var(--divider-color) 55%,
            transparent
          );
        }

        .technical-row:last-child {
          border-bottom: 0;
        }

        .technical-label {
          color: var(--secondary-text-color);
          font-size: 12px;
        }

        .technical-value {
          min-width: 0;
          overflow-wrap: anywhere;
          text-align: right;
          font-size: 13px;
          font-weight: 600;
        }

        .ats-list,
        .atp-list,
        .xbus-list {
          display: grid;
          gap: 10px;
        }

        .ats-card,
        .atp-card,
        .xbus-card {
          padding: 12px;
          border-radius: 11px;
          background: var(
            --secondary-background-color,
            rgba(127, 127, 127, 0.08)
          );
        }

        .atp-list {
          margin-top: 10px;
          padding-left: 10px;
          border-left: 2px solid var(--divider-color);
        }

        .atp-card {
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
        }

        .ats-title,
        .atp-title,
        .xbus-title {
          font-weight: 700;
        }

        .xbus-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
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

        .door-list {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(300px, 1fr)
          );
          gap: 14px;
        }

        .door-card {
          padding: 18px;
          border-radius: 14px;
          background: var(
            --secondary-background-color,
            rgba(127, 127, 127, 0.08)
          );
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

        .door-areas {
          margin-top: 3px;
        }

        .door-icon {
          --mdc-icon-size: 38px;
        }

        .door-state-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
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

        .door-zone ha-icon {
          --mdc-icon-size: 18px;
        }

        .door-controls {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 16px;
        }

        .door-raw-note {
          margin-top: 14px;
          line-height: 1.4;
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

        @media (max-width: 520px) {
          .door-list,
          .door-controls,
          .door-state-grid {
            grid-template-columns: 1fr;
          }
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

          .technical-row {
            grid-template-columns: 1fr;
            gap: 2px;
          }

          .technical-value {
            text-align: left;
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
    if (!this._config || !this._hass) {
      return;
    }

    const stateObj = this._getAlarmEntity();

    if (!stateObj) {
      this.innerHTML = `
        <ha-card>
          <div style="padding:16px">
            ${this._escapeHtml(
              this._t("card.entity_not_found", {
                entity: this._config.entity,
              })
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
            </div>
          </div>

          ${this._renderTabs()}

          <div class="content">
            ${this._renderActiveView()}
          </div>
        </div>
      </ha-card>
    `;

    this.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        this._activeTab = button.dataset.tab;
        this._saveActiveTab(this._activeTab);
        this._render();
      });
    });

    this.querySelectorAll("[data-service]").forEach((button) => {
      button.addEventListener("click", () => {
        this._callAlarmService(
          button.dataset.service,
          button.dataset.entity || this._config.entity,
          button.dataset.name || null,
          button.dataset.actionLabel || null
        );
      });
    });

    this.querySelectorAll("[data-door-entity]").forEach((button) => {
      button.addEventListener("click", () => {
        this._callDoorButton(
          button.dataset.doorEntity,
          button.dataset.doorName || this._t("door.fallback_name"),
          button.dataset.doorAction || this._t("action.execute")
        );
      });
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

  _t(key, variables = {}, fallback = key) {
    if (typeof spcFlexCTranslate === "function") {
      return spcFlexCTranslate(this._hass, key, variables, fallback);
    }
    return fallback;
  }

  _changed() {
    const config = {
      ...this._config,

      entity:
        this.querySelector("#entity")?.value || "",

      name:
        this.querySelector("#name")?.value || undefined,

      show_controls: Boolean(
        this.querySelector("#show_controls")?.checked
      ),

      confirm_actions: Boolean(
        this.querySelector("#confirm_actions")?.checked
      ),
    };

    this._config = config;

    this.dispatchEvent(
      new CustomEvent(
        "config-changed",
        {
          detail: { config },
          bubbles: true,
          composed: true,
        }
      )
    );
  }

  _render() {
    if (!this._config || !this._hass) {
      return;
    }

    const options = Object.keys(this._hass.states)
      .filter((id) => id.startsWith("alarm_control_panel."))
      .map((id) => {
        const stateObj = this._hass.states[id];
        const name = stateObj?.attributes?.friendly_name || id;

        return `
          <option
            value="${this._escapeHtml(id)}"
            ${id === this._config.entity ? "selected" : ""}
          >
            ${this._escapeHtml(name)}
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
          ${this._t("editor.entity")}
          <select id="entity">
            <option value="">${this._t("editor.select_entity")}</option>
            ${options}
          </select>
        </label>

        <label>
          ${this._t("editor.name")}
          <input
            id="name"
            type="text"
            value="${this._escapeHtml(this._config.name || "")}"
            placeholder="SPC FlexC"
          >
        </label>

        <label class="toggle">
          <input
            id="show_controls"
            type="checkbox"
            ${this._config.show_controls !== false ? "checked" : ""}
          >
          ${this._t("editor.show_controls")}
        </label>

        <label class="toggle">
          <input
            id="confirm_actions"
            type="checkbox"
            ${this._config.confirm_actions !== false ? "checked" : ""}
          >
          ${this._t("editor.confirm_actions")}
        </label>

        <div class="help">
          ${this._t("editor.help")}
        </div>
      </div>
    `;

    this.querySelectorAll("input, select").forEach((element) => {
      element.addEventListener("change", () => this._changed());
      element.addEventListener("input", () => this._changed());
    });
  }
}

if (!customElements.get("spc-flexc-card")) {
  customElements.define("spc-flexc-card", SpcFlexCCard);
}

if (!customElements.get("spc-flexc-card-editor")) {
  customElements.define("spc-flexc-card-editor", SpcFlexCCardEditor);
}

window.customCards = window.customCards || [];

if (!window.customCards.some((card) => card.type === "spc-flexc-card")) {
  window.customCards.push({
    type: "spc-flexc-card",
    name: "SPC FlexC Card",
    description: "",
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

/* SPC FlexC Card v1.0.5 extensions: Mapping Gates, door supervision and zone inhibition. */

const spcFlexCBaseLoadActiveTab = SpcFlexCCard.prototype._loadActiveTab;
const spcFlexCBaseGetZones = SpcFlexCCard.prototype._getZones;
const spcFlexCBaseGetDoors = SpcFlexCCard.prototype._getDoors;
const spcFlexCBaseStyles = SpcFlexCCard.prototype._styles;
const spcFlexCBaseRender = SpcFlexCCard.prototype._render;

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
          (mgId != null ? this._t("output.name", { id: mgId }) : entityId),
        state: stateObj.state,
      };
    })
    .sort((a, b) => Number(a.id) - Number(b.id));
};

SpcFlexCCard.prototype._getZones = function () {
  const zones = spcFlexCBaseGetZones.call(this);
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
          ${inhibited ? `<span class="zone-operating-badge warning">${this._t("zone.inhibited")}</span>` : ""}
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
  if (value === 0) return this._t("state.normal");
  if (value === 1) return this._t("door.access_forbidden");
  if (value === 2) return this._t("door.free_access");
  return mode == null ? "—" : String(mode);
};

SpcFlexCCard.prototype._renderDoors = function () {
  const doors = this._getDoors();
  if (!doors.length) {
    return `
      <div class="empty-state">
        <ha-icon icon="mdi:door-closed-lock"></ha-icon>
        <div>${this._t("door.none")}</div>
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
              <div class="door-state-label">${this._t("door.status")}</div>
              <div class="door-state-value">${this._escapeHtml(door.status ?? "—")}</div>
            </div>
            <div class="door-state-card">
              <div class="door-state-label">${this._t("door.mode")}</div>
              <div class="door-state-value">${this._escapeHtml(this._doorModeLabel(door.mode))}</div>
            </div>
            <div class="door-state-card">
              <div class="door-state-label">${this._t("door.dps")}</div>
              <div class="door-state-value">${this._escapeHtml(door.dpsInput ?? "—")}</div>
            </div>
            <div class="door-state-card">
              <div class="door-state-label">${this._t("door.drs")}</div>
              <div class="door-state-value">${this._escapeHtml(door.drsInput ?? "—")}</div>
            </div>
          </div>
          ${door.zoneName ? `
            <div class="door-zone">
              <ha-icon icon="mdi:shield-home-outline"></ha-icon>
              <span>${this._t("zone.name", { id: door.zoneId ?? "" })}${door.zoneId != null ? " · " : ""}${this._escapeHtml(door.zoneName)}</span>
            </div>
          ` : ""}
          <div class="door-raw-note">
            ${this._t("door.supervision_note")}
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
        <div>${this._t("output.none")}</div>
      </div>
    `;
  }

  return `
    <div class="outputs-view">
      <div class="group-title">${this._t("tab.outputs")} <span>${outputs.length}</span></div>
      <div class="output-list">
        ${outputs.map((output) => {
          const isOn = output.state === "on";
          const unavailable = ["unknown", "unavailable"].includes(output.state);
          const stateLabel = output.state === "unavailable"
            ? this._t("state.unavailable")
            : output.state === "unknown"
              ? this._t("state.unknown_short")
              : isOn
                ? this._t("state.on")
                : this._t("state.off");
          return `
            <div class="output-row">
              <div class="output-icon ${unavailable ? "muted" : isOn ? "ok" : "muted"}">
                <ha-icon icon="mdi:electric-switch"></ha-icon>
              </div>
              <div class="output-main">
                <div class="output-name">${this._escapeHtml(output.name)}</div>
                <div class="output-id">${this._t("output.mapping_gate")} ${this._escapeHtml(output.id ?? "—")}</div>
              </div>
              <div class="output-state ${unavailable ? "muted" : isOn ? "ok" : "muted"}">
                ${this._escapeHtml(stateLabel)}
              </div>
              ${this._config.show_controls === false ? "" : `
                <div class="output-controls">
                  <button type="button" class="output-button${isOn ? " active" : ""}"
                    data-mg-entity="${this._escapeHtml(output.entityId)}"
                    data-mg-name="${this._escapeHtml(output.name)}" data-mg-action="on">${this._t("state.on")}</button>
                  <button type="button" class="output-button${!isOn && !unavailable ? " active" : ""}"
                    data-mg-entity="${this._escapeHtml(output.entityId)}"
                    data-mg-name="${this._escapeHtml(output.name)}" data-mg-action="off">${this._t("state.off")}</button>
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
    ["system", this._t("tab.general")],
    ["areas", this._t("tab.areas")],
    ["zones", this._t("tab.detectors")],
    ...(hasDoors ? [["doors", this._t("tab.doors")]] : []),
    ...(hasOutputs ? [["outputs", this._t("tab.outputs")]] : []),
    ["technical", this._t("tab.system")],
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
  const actionLabel = action === "on" ? this._t("action.activate") : this._t("action.deactivate");
  const prompt = this._t("confirm.mapping_gate", { action: actionLabel, name });
  if (this._config.confirm_actions && !window.confirm(prompt)) return;
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
        button.dataset.mgName || this._t("output.fallback_name"),
        button.dataset.mgAction
      );
    });
  });
};

/* SPC FlexC Card v1.0.5 zone grouping extension. */

const spcFlexCZoneGroupsBaseStyles = SpcFlexCCard.prototype._styles;
const spcFlexCZoneGroupsBaseRender = SpcFlexCCard.prototype._render;

SpcFlexCCard.prototype._zoneGroupsStorageKey = function () {
  const entity = this._config?.entity;
  return entity ? `spc-flexc-card:${entity}:zone-groups` : null;
};

SpcFlexCCard.prototype._loadZoneGroupStates = function () {
  if (this._spcZoneGroupStates) return this._spcZoneGroupStates;

  this._spcZoneGroupStates = {};
  const key = this._zoneGroupsStorageKey();
  if (!key) return this._spcZoneGroupStates;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        this._spcZoneGroupStates = parsed;
      }
    }
  } catch {
    // Keep in-memory state when persistent browser storage is unavailable.
  }

  return this._spcZoneGroupStates;
};

SpcFlexCCard.prototype._saveZoneGroupStates = function () {
  const key = this._zoneGroupsStorageKey();
  if (!key) return;

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(this._spcZoneGroupStates || {})
    );
  } catch {
    // Home Assistant can still keep the state until the card is recreated.
  }
};

SpcFlexCCard.prototype._zoneGroupExpanded = function (areaId, totalZones) {
  const states = this._loadZoneGroupStates();
  const key = String(areaId);

  if (Object.prototype.hasOwnProperty.call(states, key)) {
    return states[key] === true;
  }

  // Keep small installations familiar while large panels start compact.
  return totalZones <= 40;
};

SpcFlexCCard.prototype._setZoneGroupExpanded = function (areaId, expanded) {
  const states = this._loadZoneGroupStates();
  states[String(areaId)] = Boolean(expanded);
  this._saveZoneGroupStates();
};

SpcFlexCCard.prototype._getZoneGroups = function () {
  const zones = this._getZones();
  const areas = this._getAreas();
  const groups = new Map();

  for (const area of areas) {
    groups.set(String(area.id), {
      id: String(area.id),
      name: area.name,
      numericId: area.numericId,
      zones: [],
    });
  }

  for (const zone of zones) {
    const key = String(zone.areaId);
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        name: this._areaName(zone.areaId),
        numericId: Number(zone.areaId),
        zones: [],
      });
    }
    groups.get(key).zones.push(zone);
  }

  return Array.from(groups.values())
    .filter((group) => group.zones.length > 0)
    .sort((a, b) => {
      if (Number.isFinite(a.numericId) && Number.isFinite(b.numericId)) {
        return a.numericId - b.numericId;
      }
      return a.name.localeCompare(b.name);
    });
};

SpcFlexCCard.prototype._renderZones = function () {
  const groups = this._getZoneGroups();
  const totalZones = groups.reduce((count, group) => count + group.zones.length, 0);

  if (!totalZones) {
    return `
      <div class="empty-state">
        <ha-icon icon="mdi:motion-sensor-off"></ha-icon>
        <div>${this._t("zone.none")}</div>
      </div>
    `;
  }

  const allExpanded = groups.every((group) =>
    this._zoneGroupExpanded(group.id, totalZones)
  );

  return `
    <div class="zones-view grouped-zones-view">
      <div class="zone-groups-toolbar">
        <div class="group-title">
          ${this._t("group.detectors")}
          <span>${totalZones}</span>
        </div>
        <button
          type="button"
          class="zone-groups-toggle-all"
          data-zone-groups-action="${allExpanded ? "collapse" : "expand"}"
        >
          ${this._t(allExpanded ? "group.collapse_all" : "group.expand_all")}
        </button>
      </div>

      <div class="zone-groups-list">
        ${groups.map((group) => {
          const expanded = this._zoneGroupExpanded(group.id, totalZones);
          const normalZones = group.zones.filter(
            (zone) => zone.zoneType !== "tamper" && zone.deviceClass !== "tamper"
          );
          const tampers = group.zones.filter(
            (zone) => zone.zoneType === "tamper" || zone.deviceClass === "tamper"
          );
          const activeZones = normalZones.filter((zone) => zone.state === "on").length;
          const activeTampers = tampers.filter(
            (zone) => zone.state === "on" || zone.eventTamper === true
          ).length;
          const unavailable = group.zones.filter(
            (zone) => ["unknown", "unavailable"].includes(zone.state)
          ).length;

          return `
            <section class="zone-group${expanded ? " expanded" : " collapsed"}">
              <button
                type="button"
                class="zone-group-header"
                data-zone-group-id="${this._escapeHtml(group.id)}"
                aria-expanded="${expanded ? "true" : "false"}"
              >
                <ha-icon
                  class="zone-group-chevron"
                  icon="${expanded ? "mdi:chevron-down" : "mdi:chevron-right"}"
                ></ha-icon>

                <div class="zone-group-title-wrap">
                  <div class="zone-group-title">${this._escapeHtml(group.name)}</div>
                  <div class="zone-group-meta">
                    ${this._tCount("group.detector_count", normalZones.length)}
                    ${tampers.length ? ` · ${this._tCount("group.tamper_count", tampers.length)}` : ""}
                  </div>
                </div>

                <div class="zone-group-summary">
                  ${activeZones ? `<span class="warning">${this._tCount("group.active_count", activeZones)}</span>` : ""}
                  ${activeTampers ? `<span class="danger">${this._tCount("group.fault_count", activeTampers)}</span>` : ""}
                  ${unavailable ? `<span class="muted">${this._tCount("group.unavailable_count", unavailable)}</span>` : ""}
                  ${!activeZones && !activeTampers && !unavailable ? `<span class="ok">${this._t("group.rest")}</span>` : ""}
                </div>
              </button>

              ${expanded ? `
                <div class="zone-group-content">
                  ${normalZones.length ? `
                    <div class="zone-list">
                      ${normalZones.map((zone) => this._renderZoneRow(zone)).join("")}
                    </div>
                  ` : ""}

                  ${tampers.length ? `
                    <div class="group-title tamper-title">
                      ${this._t("group.tampers")}
                      <span>${tampers.length}</span>
                    </div>
                    <div class="zone-list tamper-list">
                      ${tampers.map((zone) => this._renderZoneRow(zone)).join("")}
                    </div>
                  ` : ""}
                </div>
              ` : ""}
            </section>
          `;
        }).join("")}
      </div>
    </div>
  `;
};

SpcFlexCCard.prototype._styles = function () {
  return `${spcFlexCZoneGroupsBaseStyles.call(this)}
    <style>
      .zone-groups-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .zone-groups-toggle-all, .zone-group-header { appearance:none; border:0; font:inherit; color:inherit; cursor:pointer; }
      .zone-groups-toggle-all { padding:6px 9px; border-radius:8px; background:var(--secondary-background-color,rgba(127,127,127,.08)); color:var(--primary-color); font-size:12px; font-weight:700; }
      .zone-groups-list { display:grid; gap:10px; }
      .zone-group { overflow:hidden; border:1px solid var(--divider-color); border-radius:12px; }
      .zone-group-header { display:grid; grid-template-columns:28px minmax(0,1fr) auto; align-items:center; gap:10px; width:100%; padding:12px; background:var(--secondary-background-color,rgba(127,127,127,.06)); text-align:left; }
      .zone-group-header:hover { background:var(--secondary-background-color,rgba(127,127,127,.1)); }
      .zone-group-chevron { --mdc-icon-size:22px; color:var(--secondary-text-color); }
      .zone-group-title-wrap { min-width:0; }
      .zone-group-title { overflow:hidden; font-size:15px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }
      .zone-group-meta { margin-top:2px; color:var(--secondary-text-color); font-size:11px; }
      .zone-group-summary { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:4px 9px; font-size:12px; font-weight:700; text-align:right; }
      .zone-group-content { display:grid; gap:8px; padding:9px; }
      .zone-group-content .tamper-title { margin:8px 3px 0; }
      @media (max-width:520px) {
        .zone-group-header { grid-template-columns:24px minmax(0,1fr); }
        .zone-group-summary { grid-column:2; justify-content:flex-start; text-align:left; }
        .zone-groups-toolbar { align-items:flex-start; }
      }
    </style>`;
};

SpcFlexCCard.prototype._render = function () {
  spcFlexCZoneGroupsBaseRender.call(this);

  this.querySelectorAll("[data-zone-group-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const areaId = button.dataset.zoneGroupId;
      const expanded = button.getAttribute("aria-expanded") === "true";
      this._setZoneGroupExpanded(areaId, !expanded);
      this._render();
    });
  });

  this.querySelectorAll("[data-zone-groups-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const expand = button.dataset.zoneGroupsAction === "expand";
      const groups = this._getZoneGroups();
      for (const group of groups) this._setZoneGroupExpanded(group.id, expand);
      this._render();
    });
  });
};

/* SPC FlexC Card v1.0.5 translations. */

const SPC_FLEXC_CARD_TRANSLATIONS = {
  fr: {
    "card.description": "Carte de contrôle visuelle pour l’intégration Home Assistant SPC FlexC.",
    "card.entity_not_found": "Entité introuvable : {entity}",
    "tab.general": "Général",
    "tab.areas": "Secteurs",
    "tab.detectors": "Détecteurs",
    "tab.doors": "Portes",
    "tab.outputs": "Sorties",
    "tab.system": "Système",
    "state.disarmed": "Désarmée",
    "state.disarmed_masc": "Désarmé",
    "state.armed": "Armée",
    "state.armed_masc": "Armé",
    "state.part_a": "Partiel A",
    "state.part_b": "Partiel B",
    "state.partial": "Partiel",
    "state.alarm": "ALARME",
    "state.arming": "Armement…",
    "state.disarming": "Désarmement…",
    "state.pending": "Temporisation",
    "state.unavailable": "Indisponible",
    "state.unknown": "État inconnu",
    "state.unknown_short": "Inconnu",
    "state.normal": "Normal",
    "state.on": "Activé",
    "state.off": "Désactivé",
    "state.connected": "Connectée",
    "state.disconnected": "Déconnectée",
    "state.ok": "OK",
    "state.inactive": "Inactif",
    "state.fault": "Défaut",
    "state.isolated": "Isolé",
    "state.not_isolated": "Non isolé",
    "zone.motion": "Mouvement",
    "zone.rest": "Repos",
    "zone.open": "Ouvert",
    "zone.closed": "Fermé",
    "zone.smoke": "Fumée détectée",
    "zone.heat": "Chaleur détectée",
    "zone.active": "Actif",
    "zone.tamper": "AUTOPROTECTION",
    "zone.inhibited": "INHIBÉ",
    "zone.none": "Aucune zone SPC découverte.",
    "zone.name": "Zone {id}",
    "area.none": "Aucun secteur SPC disponible.",
    "area.name": "Secteur {id}",
    "area.last_set": "Dernier armement",
    "area.last_unset": "Dernier désarmement",
    "area.tamper": "Autoprotection",
    "door.none": "Aucune porte SPC découverte.",
    "door.name": "Porte {id}",
    "door.fallback_name": "Porte SPC",
    "door.status": "État",
    "door.mode": "Mode",
    "door.dps": "DPS",
    "door.drs": "DRS",
    "door.access_forbidden": "Accès interdit",
    "door.free_access": "Accès libre",
    "door.unknown_area": "Association secteur inconnue",
    "door.supervision_note": "Supervision FlexC uniquement. Les commandes de mode de porte ne sont pas présentées comme une commande physique de serrure.",
    "door.raw_note": "État et Mode sont affichés tels que fournis par SPC tant que leur signification n’est pas validée sur matériel réel.",
    "output.none": "Aucune sortie SPC (Mapping Gate) découverte.",
    "output.name": "Sortie {id}",
    "output.fallback_name": "Sortie SPC",
    "output.mapping_gate": "Mapping Gate",
    "group.detectors": "Détecteurs",
    "group.tampers": "Autoprotections",
    "group.expand_all": "Tout développer",
    "group.collapse_all": "Tout réduire",
    "group.rest": "Au repos",
    "group.detector_count.one": "{count} détecteur",
    "group.detector_count.other": "{count} détecteurs",
    "group.area_count.one": "{count} secteur",
    "group.area_count.other": "{count} secteurs",
    "group.tamper_count.one": "{count} autoprotection",
    "group.tamper_count.other": "{count} autoprotections",
    "group.active_count.one": "{count} actif",
    "group.active_count.other": "{count} actifs",
    "group.fault_count.one": "{count} défaut",
    "group.fault_count.other": "{count} défauts",
    "group.unavailable_count.one": "{count} indisponible",
    "group.unavailable_count.other": "{count} indisponibles",
    "group.in_fault": "{count} en défaut",
    "group.no_area": "Aucun secteur",
    "group.no_detector": "Aucun détecteur",
    "system.health": "État et défauts",
    "system.connection": "Connexion FlexC",
    "system.state_unknown": "État non déterminé",
    "system.entity_missing": "Entité non exposée",
    "system.engineer_active": "Mode ingénieur actif",
    "system.engineer_detail": "L’état est remonté en temps réel par la centrale.",
    "system.active_faults": "Défauts actifs",
    "system.no_fault": "Aucun défaut actif",
    "system.faults_unknown": "Défauts système non déterminés : métadonnées indisponibles.",
    "system.card": "Carte SPC FlexC",
    "system.panel": "Centrale",
    "system.manufacturer": "Fabricant",
    "system.model": "Modèle",
    "system.firmware": "Firmware",
    "system.hardware": "Matériel",
    "system.serial": "N° de série",
    "system.power": "Alimentation",
    "system.ac_frequency": "Fréquence secteur",
    "system.battery_voltage": "Tension batterie",
    "system.aux_voltage": "Tension auxiliaire",
    "system.aux_current": "Courant auxiliaire",
    "system.communication": "Communication FlexC",
    "system.state": "État",
    "system.ats_used": "ATS utilisé",
    "system.last_tx": "Dernière transmission réussie",
    "system.xbus": "X-BUS",
    "system.xbus_id": "ID X-BUS",
    "system.sia_address": "Adresse SIA",
    "system.tamper": "Autoprotection",
    "system.tamper_isolation": "Isolement autoprotection",
    "system.rf": "RF",
    "system.modem": "Modem",
    "action.disarm": "Désarmer",
    "action.full_arm": "Armement total",
    "action.arm": "Armer",
    "action.activate": "Activer",
    "action.deactivate": "Désactiver",
    "action.execute": "Exécuter la commande",
    "action.door_momentary": "Ouverture momentanée",
    "action.door_permanent": "Ouverture permanente",
    "action.door_normal": "Retour au mode normal",
    "action.door_lock": "Verrouiller",
    "confirm.generic": "Exécuter l'action sur {name} ?",
    "confirm.disarm": "Désarmer {name} ?",
    "confirm.full_arm": "Armer complètement {name} ?",
    "confirm.part_set": "Activer {action} sur {name} ?",
    "confirm.mapping_gate": "{action} — {name} ?",
    "confirm.door": "{action} — {name} ?",
    "editor.entity": "Entité d'alarme",
    "editor.select_entity": "Sélectionner une entité",
    "editor.name": "Nom de la carte",
    "editor.show_controls": "Afficher les commandes d'alarme",
    "editor.confirm_actions": "Confirmer les actions d'armement/désarmement",
    "editor.help": "Les secteurs sont récupérés depuis l'entité d'alarme. Les détecteurs SPC sont découverts automatiquement parmi les binary_sensor possédant les attributs zone_id, area_id et spc_zone_type. Les diagnostics et informations techniques sont rattachés à la même intégration via les registres Home Assistant quand ceux-ci sont disponibles.",
  },
  en: {
    "card.description": "Visual alarm control card for the SPC FlexC Home Assistant integration.",
    "card.entity_not_found": "Entity not found: {entity}",
    "tab.general": "General",
    "tab.areas": "Areas",
    "tab.detectors": "Detectors",
    "tab.doors": "Doors",
    "tab.outputs": "Outputs",
    "tab.system": "System",
    "state.disarmed": "Disarmed",
    "state.disarmed_masc": "Disarmed",
    "state.armed": "Armed",
    "state.armed_masc": "Armed",
    "state.part_a": "Part Set A",
    "state.part_b": "Part Set B",
    "state.partial": "Part set",
    "state.alarm": "ALARM",
    "state.arming": "Arming…",
    "state.disarming": "Disarming…",
    "state.pending": "Pending",
    "state.unavailable": "Unavailable",
    "state.unknown": "Unknown state",
    "state.unknown_short": "Unknown",
    "state.normal": "Normal",
    "state.on": "On",
    "state.off": "Off",
    "state.connected": "Connected",
    "state.disconnected": "Disconnected",
    "state.ok": "OK",
    "state.inactive": "Inactive",
    "state.fault": "Fault",
    "state.isolated": "Isolated",
    "state.not_isolated": "Not isolated",
    "zone.motion": "Motion",
    "zone.rest": "Idle",
    "zone.open": "Open",
    "zone.closed": "Closed",
    "zone.smoke": "Smoke detected",
    "zone.heat": "Heat detected",
    "zone.active": "Active",
    "zone.tamper": "TAMPER",
    "zone.inhibited": "INHIBITED",
    "zone.none": "No SPC zone discovered.",
    "zone.name": "Zone {id}",
    "area.none": "No SPC area available.",
    "area.name": "Area {id}",
    "area.last_set": "Last arm",
    "area.last_unset": "Last disarm",
    "area.tamper": "Tamper",
    "door.none": "No SPC door discovered.",
    "door.name": "Door {id}",
    "door.fallback_name": "SPC door",
    "door.status": "Status",
    "door.mode": "Mode",
    "door.dps": "DPS",
    "door.drs": "DRS",
    "door.access_forbidden": "Access forbidden",
    "door.free_access": "Free access",
    "door.unknown_area": "Unknown area association",
    "door.supervision_note": "FlexC supervision only. Door mode commands are not presented as physical lock commands.",
    "door.raw_note": "Status and Mode are displayed as provided by SPC until their meaning is validated on real hardware.",
    "output.none": "No SPC output (Mapping Gate) discovered.",
    "output.name": "Output {id}",
    "output.fallback_name": "SPC output",
    "output.mapping_gate": "Mapping Gate",
    "group.detectors": "Detectors",
    "group.tampers": "Tampers",
    "group.expand_all": "Expand all",
    "group.collapse_all": "Collapse all",
    "group.rest": "Idle",
    "group.detector_count.one": "{count} detector",
    "group.detector_count.other": "{count} detectors",
    "group.area_count.one": "{count} area",
    "group.area_count.other": "{count} areas",
    "group.tamper_count.one": "{count} tamper",
    "group.tamper_count.other": "{count} tampers",
    "group.active_count.one": "{count} active",
    "group.active_count.other": "{count} active",
    "group.fault_count.one": "{count} fault",
    "group.fault_count.other": "{count} faults",
    "group.unavailable_count.one": "{count} unavailable",
    "group.unavailable_count.other": "{count} unavailable",
    "group.in_fault": "{count} in fault",
    "group.no_area": "No area",
    "group.no_detector": "No detector",
    "system.health": "State and faults",
    "system.connection": "FlexC connection",
    "system.state_unknown": "State unavailable",
    "system.entity_missing": "Entity not exposed",
    "system.engineer_active": "Engineer mode active",
    "system.engineer_detail": "The state is reported in real time by the panel.",
    "system.active_faults": "Active faults",
    "system.no_fault": "No active fault",
    "system.faults_unknown": "System faults unavailable: metadata is not available.",
    "system.card": "SPC FlexC Card",
    "system.panel": "Panel",
    "system.manufacturer": "Manufacturer",
    "system.model": "Model",
    "system.firmware": "Firmware",
    "system.hardware": "Hardware",
    "system.serial": "Serial number",
    "system.power": "Power",
    "system.ac_frequency": "AC frequency",
    "system.battery_voltage": "Battery voltage",
    "system.aux_voltage": "Auxiliary voltage",
    "system.aux_current": "Auxiliary current",
    "system.communication": "FlexC communication",
    "system.state": "State",
    "system.ats_used": "ATS used",
    "system.last_tx": "Last successful transmission",
    "system.xbus": "X-BUS",
    "system.xbus_id": "X-BUS ID",
    "system.sia_address": "SIA address",
    "system.tamper": "Tamper",
    "system.tamper_isolation": "Tamper isolation",
    "system.rf": "RF",
    "system.modem": "Modem",
    "action.disarm": "Disarm",
    "action.full_arm": "Full set",
    "action.arm": "Arm",
    "action.activate": "Activate",
    "action.deactivate": "Deactivate",
    "action.execute": "Run command",
    "action.door_momentary": "Open momentarily",
    "action.door_permanent": "Open permanently",
    "action.door_normal": "Return to normal mode",
    "action.door_lock": "Lock",
    "confirm.generic": "Run the action on {name}?",
    "confirm.disarm": "Disarm {name}?",
    "confirm.full_arm": "Full set {name}?",
    "confirm.part_set": "Activate {action} on {name}?",
    "confirm.mapping_gate": "{action} — {name}?",
    "confirm.door": "{action} — {name}?",
    "editor.entity": "Alarm entity",
    "editor.select_entity": "Select an entity",
    "editor.name": "Card name",
    "editor.show_controls": "Show alarm controls",
    "editor.confirm_actions": "Confirm arm/disarm actions",
    "editor.help": "Areas are read from the alarm entity. SPC detectors are discovered automatically from binary_sensor entities exposing zone_id, area_id and spc_zone_type. Diagnostics and technical information are associated with the same integration through the Home Assistant registries when available.",
  },
};

function spcFlexCFormatTranslation(template, variables = {}) {
  let result = String(template ?? "");

  for (const [name, value] of Object.entries(variables)) {
    result = result.split(`{${name}}`).join(String(value));
  }

  return result;
}

function spcFlexCLanguage(hass) {
  const language = String(
    hass?.locale?.language || navigator.language || "en"
  ).toLowerCase();

  return language.startsWith("fr") ? "fr" : "en";
}

function spcFlexCTranslate(hass, key, variables = {}, fallback = key) {
  const language = spcFlexCLanguage(hass);
  const template =
    SPC_FLEXC_CARD_TRANSLATIONS[language]?.[key] ??
    SPC_FLEXC_CARD_TRANSLATIONS.en[key] ??
    fallback;

  return spcFlexCFormatTranslation(template, variables);
}

const spcFlexCCardRegistration = window.customCards?.find(
  (card) => card.type === "spc-flexc-card"
);

if (spcFlexCCardRegistration) {
  spcFlexCCardRegistration.description = spcFlexCTranslate(
    null,
    "card.description"
  );
}

/* SPC FlexC Card v1.0.5 render scheduler. */

const spcFlexCImmediateRender = SpcFlexCCard.prototype._render;
const spcFlexCBaseDisconnectedCallback =
  SpcFlexCCard.prototype.disconnectedCallback;

SpcFlexCCard.prototype._showCardVersion = function () {
  if (this.querySelector(".spc-card-version")) {
    return;
  }

  const panelSection =
    this.querySelector('[data-technical-section="panel"]') ||
    Array.from(this.querySelectorAll(".technical-section")).find(
      (section) =>
        section.querySelector(".technical-section-title")?.textContent.trim() ===
        this._t("system.panel")
    );

  if (!panelSection) {
    return;
  }

  const versionRow = document.createElement("div");
  versionRow.className = "technical-row spc-card-version";
  versionRow.innerHTML = `
    <div class="technical-label">${this._escapeHtml(this._t("system.card"))}</div>
    <div class="technical-value">${this._escapeHtml(CARD_VERSION)}</div>
  `;

  panelSection
    .querySelector(".technical-section-title")
    ?.insertAdjacentElement("afterend", versionRow);
};

SpcFlexCCard.prototype._render = function () {
  if (this._spcRenderFrame != null) {
    return;
  }

  const render = () => {
    this._spcRenderFrame = null;
    this._spcRenderUsesAnimationFrame = false;
    spcFlexCImmediateRender.call(this);
    this._showCardVersion();
  };

  if (typeof window.requestAnimationFrame === "function") {
    this._spcRenderUsesAnimationFrame = true;
    this._spcRenderFrame = window.requestAnimationFrame(render);
  } else {
    this._spcRenderUsesAnimationFrame = false;
    this._spcRenderFrame = window.setTimeout(render, 0);
  }
};

SpcFlexCCard.prototype.disconnectedCallback = function () {
  if (this._spcRenderFrame != null) {
    if (
      this._spcRenderUsesAnimationFrame &&
      typeof window.cancelAnimationFrame === "function"
    ) {
      window.cancelAnimationFrame(this._spcRenderFrame);
    } else {
      window.clearTimeout(this._spcRenderFrame);
    }

    this._spcRenderFrame = null;
    this._spcRenderUsesAnimationFrame = false;
  }

  spcFlexCBaseDisconnectedCallback.call(this);
};
