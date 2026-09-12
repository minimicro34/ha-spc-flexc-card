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
    "door.status": "Status",
    "door.mode": "Mode",
    "door.dps": "DPS",
    "door.drs": "DRS",
    "door.access_forbidden": "Accès interdit",
    "door.free_access": "Accès libre",
    "door.unknown_area": "Association secteur inconnue",
    "door.supervision_note": "Supervision FlexC uniquement. Les commandes de mode de porte ne sont pas présentées comme une commande physique de serrure.",
    "door.raw_note": "Status et Mode sont affichés tels que fournis par SPC tant que leur signification n’est pas validée sur matériel réel.",
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

SpcFlexCCard.prototype._language = function () {
  return spcFlexCLanguage(this._hass);
};

SpcFlexCCard.prototype._t = function (key, variables = {}, fallback = key) {
  return spcFlexCTranslate(this._hass, key, variables, fallback);
};

SpcFlexCCard.prototype._tCount = function (key, count, variables = {}) {
  const suffix = Number(count) === 1 ? "one" : "other";
  return this._t(`${key}.${suffix}`, { count, ...variables });
};

SpcFlexCCard.prototype._stateLabel = function (state) {
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
};

SpcFlexCCard.prototype._modeLabel = function (mode) {
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
};

SpcFlexCCard.prototype._getAreas = function () {
  const alarm = this._getAlarmEntity();
  const rawAreas = alarm?.attributes?.areas;
  if (!rawAreas || typeof rawAreas !== "object") return [];

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
      if (Number.isFinite(a.numericId) && Number.isFinite(b.numericId)) {
        return a.numericId - b.numericId;
      }
      return a.name.localeCompare(b.name);
    });
};

SpcFlexCCard.prototype._areaName = function (areaId) {
  const id = String(areaId);
  const area = this._getAreas().find((candidate) => String(candidate.id) === id);
  return area?.name || this._t("area.name", { id });
};

SpcFlexCCard.prototype._zoneStateInfo = function (zone) {
  const active = zone.state === "on";
  const isTamper = zone.zoneType === "tamper" || zone.deviceClass === "tamper";
  const tamperActive = zone.eventTamper === true || (isTamper && active);

  if (isTamper) {
    return {
      label: tamperActive ? this._t("zone.tamper") : this._t("state.normal"),
      className: tamperActive ? "danger" : "ok",
    };
  }
  if (zone.state === "unavailable") {
    return { label: this._t("state.unavailable"), className: "muted" };
  }
  if (zone.state === "unknown") {
    return { label: this._t("state.unknown_short"), className: "muted" };
  }

  switch (zone.deviceClass) {
    case "motion":
    case "occupancy":
      return {
        label: active ? this._t("zone.motion") : this._t("zone.rest"),
        className: active ? "warning" : "ok",
      };
    case "door":
    case "window":
    case "opening":
      return {
        label: active ? this._t("zone.open") : this._t("zone.closed"),
        className: active ? "warning" : "ok",
      };
    case "smoke":
      return {
        label: active ? this._t("zone.smoke") : this._t("state.normal"),
        className: active ? "danger" : "ok",
      };
    case "heat":
      return {
        label: active ? this._t("zone.heat") : this._t("state.normal"),
        className: active ? "danger" : "ok",
      };
    default:
      return {
        label: active ? this._t("zone.active") : this._t("zone.rest"),
        className: active ? "warning" : "ok",
      };
  }
};

SpcFlexCCard.prototype._lastAreaChange = function (stateObj) {
  if (!stateObj) return "";

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
  const formattedTime = this._formatDateTime(attrs[`${prefix}_time`]);
  if (!formattedTime) return "";

  const userName = String(attrs[`${prefix}_user_name`] ?? "").trim();
  const userId = String(attrs[`${prefix}_user_id`] ?? "").trim();
  const user = userName || userId || null;

  return `
    <div class="last-change">
      <div class="last-change-label">${this._escapeHtml(this._t(labelKey))}</div>
      <div class="last-change-value">
        ${this._escapeHtml(formattedTime)}
        ${user ? `<span class="last-change-user"> · ${this._escapeHtml(user)}</span>` : ""}
      </div>
    </div>
  `;
};

SpcFlexCCard.prototype._renderSystemDiagnostics = function () {
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
      </div>`;
  } else if (!diagnostics.connection) {
    connectionHtml = `
      <div class="diagnostic-row">
        <ha-icon class="muted" icon="mdi:lan"></ha-icon>
        <div class="diagnostic-main">
          <div class="diagnostic-name">${this._t("system.connection")}</div>
          <div class="diagnostic-detail muted">${this._t("system.entity_missing")}</div>
        </div>
      </div>`;
  } else {
    const connected = diagnostics.connection.stateObj.state === "on";
    connectionHtml = `
      <div class="diagnostic-row">
        <ha-icon class="${connected ? "ok" : "danger"}" icon="${connected ? "mdi:lan-connect" : "mdi:lan-disconnect"}"></ha-icon>
        <div class="diagnostic-main">
          <div class="diagnostic-name">${this._t("system.connection")}</div>
          <div class="diagnostic-detail ${connected ? "ok" : "danger"}">${this._t(connected ? "state.connected" : "state.disconnected")}</div>
        </div>
      </div>`;
  }

  const engineerHtml = diagnostics.engineerMode?.stateObj?.state === "on"
    ? `<div class="diagnostic-row engineer-warning">
        <ha-icon class="warning" icon="mdi:account-hard-hat"></ha-icon>
        <div class="diagnostic-main">
          <div class="diagnostic-name warning">${this._t("system.engineer_active")}</div>
          <div class="diagnostic-detail muted">${this._t("system.engineer_detail")}</div>
        </div>
      </div>`
    : "";

  const faultsHtml = !diagnostics.scopeAvailable
    ? `<div class="fault-ok muted"><ha-icon icon="mdi:information-outline"></ha-icon><span>${this._t("system.faults_unknown")}</span></div>`
    : diagnostics.faults.length
      ? `<div class="fault-header danger">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span>${this._t("system.active_faults")}</span>
          <span class="fault-count">${diagnostics.faults.length}</span>
        </div>
        <div class="fault-list">
          ${diagnostics.faults.map((fault) => `<div class="fault-row danger"><ha-icon icon="mdi:alert"></ha-icon><span>${this._escapeHtml(fault.friendlyName)}</span></div>`).join("")}
        </div>`
      : `<div class="fault-ok ok"><ha-icon icon="mdi:check-circle"></ha-icon><span>${this._t("system.no_fault")}</span></div>`;

  return `<div class="diagnostics-block"><div class="group-title">${this._t("system.health")}</div>${connectionHtml}${engineerHtml}${faultsHtml}</div>`;
};

SpcFlexCCard.prototype._atpStateLabel = function (atp) {
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
};

SpcFlexCCard.prototype._renderFlexcCommunication = function () {
  const atsList = this._getFlexcCommunication();
  if (!atsList.length) return "";

  return `
    <div class="technical-section">
      <div class="technical-section-title">${this._t("system.communication")}</div>
      <div class="ats-list">
        ${atsList.map((ats) => {
          const atsLabel = ats.ungrouped
            ? ats.name
            : `ATS ${ats.id ?? "?"}${ats.name ? ` — ${ats.name}` : ""}`;
          return `<div class="ats-card">
            <div class="ats-title">${this._escapeHtml(atsLabel)}</div>
            ${ats.atps.length ? `<div class="atp-list">
              ${ats.atps.map((atp) => {
                const atpLabel = `ATP ${atp.displayId ?? "?"}${atp.name ? ` — ${atp.name}` : ""}`;
                const stateInfo = this._atpStateLabel(atp);
                const formattedTx = this._formatDateTime(atp.lastTxOkTimestamp);
                return `<div class="atp-card">
                  <div class="atp-title">${this._escapeHtml(atpLabel)}</div>
                  ${stateInfo ? this._technicalLine(this._t("system.state"), stateInfo.label, stateInfo.className) : ""}
                  ${ats.ungrouped ? "" : this._technicalLine(this._t("system.ats_used"), atsLabel)}
                  ${this._technicalLine(this._t("system.last_tx"), formattedTx)}
                </div>`;
              }).join("")}
            </div>` : ""}
          </div>`;
        }).join("")}
      </div>
    </div>`;
};

SpcFlexCCard.prototype._renderXBusDevices = function () {
  const devices = this._getXBusDevices();
  if (!devices.length) return "";

  return `
    <div class="technical-section">
      <div class="technical-section-title">${this._t("system.xbus")}</div>
      <div class="xbus-list">
        ${devices.map((device) => {
          const title = device.name || `X-BUS ${device.id}`;
          const fault = device.tamperFault === true;
          const isolated = device.tamperIsolated === true;
          return `<div class="xbus-card">
            <div class="xbus-title"><span>${this._escapeHtml(title)}</span><span class="${fault ? "danger" : "ok"}">${this._t(fault ? "state.fault" : "state.ok")}</span></div>
            ${this._technicalLine(this._t("system.xbus_id"), device.id)}
            ${this._technicalLine(this._t("system.sia_address"), device.siaAddress)}
            ${device.tamperFault !== null ? this._technicalLine(this._t("system.tamper"), this._t(fault ? "state.fault" : "state.ok"), fault ? "danger" : "ok") : ""}
            ${device.tamperIsolated !== null ? this._technicalLine(this._t("system.tamper_isolation"), this._t(isolated ? "state.isolated" : "state.not_isolated"), isolated ? "warning" : "ok") : ""}
          </div>`;
        }).join("")}
      </div>
    </div>`;
};

SpcFlexCCard.prototype._renderTechnicalSystem = function () {
  const scope = this._diagnosticScope;
  const device = scope?.device || {};

  const identityLines = [
    this._technicalLine(this._t("system.manufacturer"), device.manufacturer),
    this._technicalLine(this._t("system.model"), device.model || device.model_id),
    this._technicalLine(this._t("system.firmware"), device.sw_version),
    this._technicalLine(this._t("system.hardware"), device.hw_version),
    this._technicalLine(this._t("system.serial"), device.serial_number),
  ].join("");

  const acFrequency = this._findIntegrationState([/ac[_\s-]*frequency/i, /fr[ée]quence.*secteur/i]);
  const batteryVoltage = this._findIntegrationState([/battery[_\s-]*voltage/i, /tension.*batterie/i]);
  const auxVoltage = this._findIntegrationState([/aux[_\s-]*voltage/i, /tension.*aux/i]);
  const auxCurrent = this._findIntegrationState([/aux[_\s-]*current/i, /courant.*aux/i]);

  const powerLines = [
    this._entityTechnicalLine(this._t("system.ac_frequency"), acFrequency),
    this._entityTechnicalLine(this._t("system.battery_voltage"), batteryVoltage),
    this._entityTechnicalLine(this._t("system.aux_voltage"), auxVoltage),
    this._entityTechnicalLine(this._t("system.aux_current"), auxCurrent),
  ].join("");

  const rfEntities = this._scopedStates(true).filter(({ entityId, stateObj }) => /\brf\b|radio/i.test(`${entityId} ${stateObj.attributes?.friendly_name || ""}`));
  const modemEntities = this._scopedStates(true).filter(({ entityId, stateObj }) => /modem/i.test(`${entityId} ${stateObj.attributes?.friendly_name || ""}`));

  const renderEntityList = (title, entities) => {
    const rows = entities
      .filter(({ stateObj }) => this._valueWithUnit(stateObj) !== null)
      .map(({ stateObj }) => this._technicalLine(stateObj.attributes?.friendly_name || this._t("system.state"), this._valueWithUnit(stateObj)))
      .join("");
    return rows ? `<div class="technical-section"><div class="technical-section-title">${this._escapeHtml(title)}</div>${rows}</div>` : "";
  };

  const identitySection = identityLines
    ? `<div class="technical-section" data-technical-section="panel"><div class="technical-section-title">${this._t("system.panel")}</div>${identityLines}</div>`
    : "";
  const powerSection = powerLines
    ? `<div class="technical-section"><div class="technical-section-title">${this._t("system.power")}</div>${powerLines}</div>`
    : "";

  const content = [
    identitySection,
    powerSection,
    this._renderFlexcCommunication(),
    this._renderXBusDevices(),
    renderEntityList(this._t("system.rf"), rfEntities),
    renderEntityList(this._t("system.modem"), modemEntities),
  ].join("");

  return content ? `<div class="technical-system-view">${content}</div>` : "";
};

SpcFlexCCard.prototype._callAlarmService = async function (
  service,
  entityId = this._config?.entity,
  displayName = null,
  actionLabel = null
) {
  if (!this._hass || !entityId) return;

  const stateObj = this._hass.states[entityId];
  const name = displayName || stateObj?.attributes?.friendly_name || this._config?.name || entityId;
  let prompt = this._t("confirm.generic", { name });

  if (service === "alarm_disarm") {
    prompt = this._t("confirm.disarm", { name });
  } else if (service === "alarm_arm_away") {
    prompt = this._t("confirm.full_arm", { name });
  } else if (service === "alarm_arm_home") {
    prompt = this._t("confirm.part_set", { action: actionLabel || this._t("state.part_a"), name });
  } else if (service === "alarm_arm_night") {
    prompt = this._t("confirm.part_set", { action: actionLabel || this._t("state.part_b"), name });
  }

  if (this._config.confirm_actions && !window.confirm(prompt)) return;
  await this._hass.callService("alarm_control_panel", service, { entity_id: entityId });
};

const spcFlexCI18nGetDoors = SpcFlexCCard.prototype._getDoors;
SpcFlexCCard.prototype._getDoors = function () {
  return spcFlexCI18nGetDoors.call(this).map((door) => {
    if (!door.zoneName && door.name === `Porte ${door.id}`) {
      return { ...door, name: this._t("door.name", { id: door.id }) };
    }
    return door;
  });
};

SpcFlexCCard.prototype._doorAreasLabel = function (door) {
  const first = door.areaName || (door.areaId != null ? this._areaName(door.areaId) : null);
  const second = door.areaSide1Name || (door.areaSide1 != null ? this._areaName(door.areaSide1) : null);
  if (first && second && first !== second) return `${first} ↔ ${second}`;
  return first || second || this._t("door.unknown_area");
};

SpcFlexCCard.prototype._callDoorButton = async function (entityId, doorName, actionLabel) {
  if (!this._hass || !entityId) return;
  const prompt = this._t("confirm.door", { action: actionLabel, name: doorName });
  if (this._config.confirm_actions && !window.confirm(prompt)) return;
  await this._hass.callService("button", "press", { entity_id: entityId });
};

SpcFlexCCard.prototype._partSetLabel = function (areaEntity, part) {
  const attrs = areaEntity?.stateObj?.attributes || {};
  const attributeName = part === "a" ? "partset_a_name" : "partset_b_name";
  const value = attrs[attributeName];
  if (value != null && String(value).trim()) return String(value).trim();
  return this._t(part === "a" ? "state.part_a" : "state.part_b");
};

SpcFlexCCard.prototype._renderSystem = function () {
  const alarm = this._getAlarmEntity();
  const state = alarm?.state || "unknown";
  const areas = this._getAreas();
  const zones = this._getNormalZones();
  const tampers = this._getTamperZones();
  const activeZones = zones.filter((zone) => zone.state === "on").length;
  const activeTampers = tampers.filter((zone) => zone.state === "on" || zone.eventTamper === true).length;

  const controls = this._config.show_controls
    ? `<div class="alarm-controls system-controls">
        <button type="button" class="control-button" data-service="alarm_disarm" data-entity="${this._escapeHtml(this._config.entity)}"><ha-icon icon="mdi:lock-open-variant"></ha-icon><span>${this._t("action.disarm")}</span></button>
        <button type="button" class="control-button primary" data-service="alarm_arm_away" data-entity="${this._escapeHtml(this._config.entity)}"><ha-icon icon="mdi:lock"></ha-icon><span>${this._t("action.full_arm")}</span></button>
      </div>`
    : "";

  const areaSummary = areas.length ? this._tCount("group.area_count", areas.length) : this._t("group.no_area");
  const detectorSummary = zones.length ? this._tCount("group.detector_count", zones.length) : this._t("group.no_detector");

  return `
    <div class="system-view">
      <div class="system-panel">
        <div class="system-state ${this._stateClass(state)}">${this._escapeHtml(this._stateLabel(state))}</div>
        <ha-icon class="system-icon ${this._stateClass(state)}" icon="${this._escapeHtml(this._stateIcon(state))}"></ha-icon>
        <div class="system-summary">${areaSummary} · ${detectorSummary}</div>
      </div>
      <div class="summary-grid">
        <div class="summary-card"><ha-icon icon="mdi:shield-home-outline"></ha-icon><div><div class="summary-value">${areas.length}</div><div class="summary-label">${this._t("tab.areas")}</div></div></div>
        <div class="summary-card"><ha-icon icon="mdi:motion-sensor"></ha-icon><div><div class="summary-value">${zones.length}</div><div class="summary-label">${this._t("tab.detectors")}${activeZones ? `<span class="warning"> · ${this._tCount("group.active_count", activeZones)}</span>` : ""}</div></div></div>
        <div class="summary-card"><ha-icon icon="mdi:shield-alert-outline"></ha-icon><div><div class="summary-value">${tampers.length}</div><div class="summary-label">${this._t("group.tampers")}${activeTampers ? `<span class="danger"> · ${this._t("group.in_fault", { count: activeTampers })}</span>` : ""}</div></div></div>
      </div>
      ${this._renderSystemDiagnostics()}
      ${controls}
    </div>`;
};

SpcFlexCCard.prototype._renderAreaControls = function (area, areaEntity) {
  if (!this._config.show_controls || !areaEntity) return "";

  const { entityId, stateObj } = areaEntity;
  const attrs = stateObj?.attributes || {};
  const state = stateObj?.state || "unknown";
  const stableArmedStates = new Set(["armed_away", "armed_home", "armed_night", "armed_vacation", "armed_custom_bypass"]);
  const buttons = [];

  if (state === "disarmed") {
    buttons.push(`<button type="button" class="control-button primary" data-service="alarm_arm_away" data-entity="${this._escapeHtml(entityId)}" data-name="${this._escapeHtml(area.name)}"><ha-icon icon="mdi:lock"></ha-icon><span>${this._t("action.arm")}</span></button>`);
    if (attrs.partset_a_enabled === true) {
      const label = this._partSetLabel(areaEntity, "a");
      buttons.push(`<button type="button" class="control-button" data-service="alarm_arm_home" data-entity="${this._escapeHtml(entityId)}" data-name="${this._escapeHtml(area.name)}" data-action-label="${this._escapeHtml(label)}"><ha-icon icon="mdi:shield-home"></ha-icon><span>${this._escapeHtml(label)}</span></button>`);
    }
    if (attrs.partset_b_enabled === true) {
      const label = this._partSetLabel(areaEntity, "b");
      buttons.push(`<button type="button" class="control-button" data-service="alarm_arm_night" data-entity="${this._escapeHtml(entityId)}" data-name="${this._escapeHtml(area.name)}" data-action-label="${this._escapeHtml(label)}"><ha-icon icon="mdi:weather-night"></ha-icon><span>${this._escapeHtml(label)}</span></button>`);
    }
  } else if (stableArmedStates.has(state)) {
    buttons.push(`<button type="button" class="control-button" data-service="alarm_disarm" data-entity="${this._escapeHtml(entityId)}" data-name="${this._escapeHtml(area.name)}"><ha-icon icon="mdi:lock-open-variant"></ha-icon><span>${this._t("action.disarm")}</span></button>`);
  }

  return buttons.length ? `<div class="area-controls">${buttons.join("")}</div>` : "";
};

SpcFlexCCard.prototype._renderAreas = function () {
  const areas = this._getAreas();
  const zones = this._getZones();
  if (!areas.length) {
    return `<div class="empty-state"><ha-icon icon="mdi:shield-home-outline"></ha-icon><div>${this._t("area.none")}</div></div>`;
  }

  return `<div class="list area-list">${areas.map((area) => {
    const areaZones = zones.filter((zone) => String(zone.areaId) === String(area.id));
    const normalZones = areaZones.filter((zone) => zone.zoneType !== "tamper" && zone.deviceClass !== "tamper");
    const tampers = areaZones.filter((zone) => zone.zoneType === "tamper" || zone.deviceClass === "tamper");
    const activeZones = normalZones.filter((zone) => zone.state === "on").length;
    const activeTampers = tampers.filter((zone) => zone.state === "on" || zone.eventTamper === true).length;
    const areaEntity = this._getAreaAlarmEntity(area.id);
    const mode = areaEntity?.stateObj?.attributes?.mode_name ?? area.modeName ?? areaEntity?.stateObj?.attributes?.mode ?? area.mode ?? "unknown";
    const renderedState = areaEntity?.stateObj?.state || null;
    const stateClass = renderedState ? this._stateClass(renderedState) : this._modeClass(mode);
    const icon = renderedState ? this._stateIcon(renderedState) : stateClass === "ok" ? "mdi:lock-open-variant" : "mdi:lock";
    const label = renderedState === "armed_home"
      ? this._partSetLabel(areaEntity, "a")
      : renderedState === "armed_night"
        ? this._partSetLabel(areaEntity, "b")
        : renderedState === "disarmed"
          ? this._t("state.disarmed_masc")
          : renderedState
            ? this._stateLabel(renderedState)
            : this._modeLabel(mode);

    return `<div class="area-card">
      <div class="area-card-header"><div class="area-card-title">${this._escapeHtml(area.name)}</div><div class="badge ${stateClass}">${this._escapeHtml(label)}</div></div>
      <div class="area-lock"><ha-icon class="${stateClass}" icon="${this._escapeHtml(icon)}"></ha-icon></div>
      <div class="area-meta">
        <span>${this._tCount("group.detector_count", normalZones.length)}</span>
        ${activeZones ? `<span class="warning">${this._tCount("group.active_count", activeZones)}</span>` : `<span class="ok">${this._t("group.rest")}</span>`}
        ${activeTampers ? `<span class="danger">${this._t("area.tamper")}</span>` : ""}
      </div>
      ${this._lastAreaChange(areaEntity?.stateObj)}
      ${this._renderAreaControls(area, areaEntity)}
    </div>`;
  }).join("")}</div>`;
};

const spcFlexCI18nBaseRender = SpcFlexCCard.prototype._render;
SpcFlexCCard.prototype._render = function () {
  if (this._config && this._hass && !this._getAlarmEntity()) {
    this.innerHTML = `<ha-card><div style="padding:16px">${this._escapeHtml(this._t("card.entity_not_found", { entity: this._config.entity }))}</div></ha-card>`;
    return;
  }
  spcFlexCI18nBaseRender.call(this);
};

SpcFlexCCardEditor.prototype._render = function () {
  if (!this._config || !this._hass) return;
  const t = (key, variables = {}) => spcFlexCTranslate(this._hass, key, variables);
  const options = Object.keys(this._hass.states)
    .filter((id) => id.startsWith("alarm_control_panel."))
    .map((id) => {
      const stateObj = this._hass.states[id];
      const name = stateObj?.attributes?.friendly_name || id;
      return `<option value="${this._escapeHtml(id)}" ${id === this._config.entity ? "selected" : ""}>${this._escapeHtml(name)} (${this._escapeHtml(id)})</option>`;
    })
    .join("");

  this.innerHTML = `
    <style>
      .editor { display:grid; gap:16px; }
      label { display:grid; gap:6px; }
      input, select { box-sizing:border-box; width:100%; padding:9px; }
      .toggle { display:flex; align-items:center; gap:9px; }
      .toggle input { width:auto; }
      .help { color:var(--secondary-text-color); font-size:12px; line-height:1.4; }
    </style>
    <div class="editor">
      <label>${t("editor.entity")}<select id="entity"><option value="">${t("editor.select_entity")}</option>${options}</select></label>
      <label>${t("editor.name")}<input id="name" type="text" value="${this._escapeHtml(this._config.name || "")}" placeholder="SPC FlexC"></label>
      <label class="toggle"><input id="show_controls" type="checkbox" ${this._config.show_controls !== false ? "checked" : ""}>${t("editor.show_controls")}</label>
      <label class="toggle"><input id="confirm_actions" type="checkbox" ${this._config.confirm_actions !== false ? "checked" : ""}>${t("editor.confirm_actions")}</label>
      <div class="help">${t("editor.help")}</div>
    </div>`;

  this.querySelectorAll("input, select").forEach((element) => {
    element.addEventListener("change", () => this._changed());
    element.addEventListener("input", () => this._changed());
  });
};

const spcFlexCCardRegistration = window.customCards?.find(
  (card) => card.type === "spc-flexc-card"
);
if (spcFlexCCardRegistration) {
  spcFlexCCardRegistration.description = spcFlexCTranslate(
    null,
    "card.description"
  );
}
