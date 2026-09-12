/* SPC FlexC Card v1.0.5 translations. */

const SPC_FLEXC_CARD_TRANSLATIONS = {
  fr: {
    "card.description": "Carte de contrôle visuelle pour l’intégration Home Assistant SPC FlexC.",
    "tab.general": "Général",
    "tab.areas": "Secteurs",
    "tab.detectors": "Détecteurs",
    "tab.doors": "Portes",
    "tab.outputs": "Sorties",
    "tab.system": "Système",
    "state.disarmed": "Désarmée",
    "state.armed": "Armée",
    "state.part_a": "Partiel A",
    "state.part_b": "Partiel B",
    "state.alarm": "ALARME",
    "state.arming": "Armement…",
    "state.disarming": "Désarmement…",
    "state.pending": "Temporisation",
    "state.unavailable": "Indisponible",
    "state.unknown": "État inconnu",
    "state.unknown_short": "Inconnu",
    "state.disarmed_masc": "Désarmé",
    "state.armed_masc": "Armé",
    "state.partial": "Partiel",
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
    "door.none": "Aucune porte SPC découverte.",
    "door.name": "Porte {id}",
    "output.none": "Aucune sortie SPC (Mapping Gate) découverte.",
    "output.name": "Sortie {id}",
    "output.fallback_name": "Sortie SPC",
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
    "door.status": "Status",
    "door.mode": "Mode",
    "door.dps": "DPS",
    "door.drs": "DRS",
    "door.access_forbidden": "Accès interdit",
    "door.free_access": "Accès libre",
    "door.unknown_area": "Association secteur inconnue",
    "door.supervision_note": "Supervision FlexC uniquement. Les commandes de mode de porte ne sont pas présentées comme une commande physique de serrure.",
    "door.raw_note": "Status et Mode sont affichés tels que fournis par SPC tant que leur signification n’est pas validée sur matériel réel.",
    "output.mapping_gate": "Mapping Gate",
    "editor.entity": "Entité d'alarme",
    "editor.select_entity": "Sélectionner une entité",
    "editor.name": "Nom de la carte",
    "editor.show_controls": "Afficher les commandes d'alarme",
    "editor.confirm_actions": "Confirmer les actions d'armement/désarmement",
    "editor.help": "Les secteurs sont récupérés depuis l'entité d'alarme. Les détecteurs SPC sont découverts automatiquement parmi les binary_sensor possédant les attributs zone_id, area_id et spc_zone_type. Les diagnostics et informations techniques sont rattachés à la même intégration via les registres Home Assistant quand ceux-ci sont disponibles.",
  },
  en: {
    "card.description": "Visual alarm control card for the SPC FlexC Home Assistant integration.",
    "tab.general": "General",
    "tab.areas": "Areas",
    "tab.detectors": "Detectors",
    "tab.doors": "Doors",
    "tab.outputs": "Outputs",
    "tab.system": "System",
    "state.disarmed": "Disarmed",
    "state.armed": "Armed",
    "state.part_a": "Part Set A",
    "state.part_b": "Part Set B",
    "state.alarm": "ALARM",
    "state.arming": "Arming…",
    "state.disarming": "Disarming…",
    "state.pending": "Pending",
    "state.unavailable": "Unavailable",
    "state.unknown": "Unknown state",
    "state.unknown_short": "Unknown",
    "state.disarmed_masc": "Disarmed",
    "state.armed_masc": "Armed",
    "state.partial": "Part set",
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
    "door.none": "No SPC door discovered.",
    "door.name": "Door {id}",
    "output.none": "No SPC output (Mapping Gate) discovered.",
    "output.name": "Output {id}",
    "output.fallback_name": "SPC output",
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
    "door.status": "Status",
    "door.mode": "Mode",
    "door.dps": "DPS",
    "door.drs": "DRS",
    "door.access_forbidden": "Access forbidden",
    "door.free_access": "Free access",
    "door.unknown_area": "Unknown area association",
    "door.supervision_note": "FlexC supervision only. Door mode commands are not presented as physical lock commands.",
    "door.raw_note": "Status and Mode are displayed as provided by SPC until their meaning is validated on real hardware.",
    "output.mapping_gate": "Mapping Gate",
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

SpcFlexCCard.prototype._language = function () {
  return spcFlexCLanguage(this._hass);
};

SpcFlexCCard.prototype._t = function (key, variables = {}, fallback = key) {
  const language = this._language();
  const template =
    SPC_FLEXC_CARD_TRANSLATIONS[language]?.[key] ??
    SPC_FLEXC_CARD_TRANSLATIONS.en[key] ??
    fallback;
  return spcFlexCFormatTranslation(template, variables);
};

SpcFlexCCard.prototype._tCount = function (key, count, variables = {}) {
  const form = new Intl.PluralRules(this._language()).select(Number(count));
  const suffix = form === "one" ? "one" : "other";
  return this._t(`${key}.${suffix}`, { count, ...variables });
};

function spcFlexCBuildLegacyTextMap() {
  const map = new Map();
  const fr = SPC_FLEXC_CARD_TRANSLATIONS.fr;
  const en = SPC_FLEXC_CARD_TRANSLATIONS.en;

  for (const key of Object.keys(fr)) {
    if (!fr[key].includes("{") && en[key] != null) {
      map.set(fr[key], en[key]);
    }
  }

  const templatePairs = [
    ["area.name", "id"],
    ["door.name", "id"],
    ["output.name", "id"],
    ["zone.name", "id"],
  ];

  for (let id = 0; id <= 512; id += 1) {
    for (const [key, variable] of templatePairs) {
      map.set(
        spcFlexCFormatTranslation(fr[key], { [variable]: id }),
        spcFlexCFormatTranslation(en[key], { [variable]: id })
      );
    }
  }

  const countKeys = [
    "group.detector_count",
    "group.area_count",
    "group.tamper_count",
    "group.active_count",
    "group.fault_count",
    "group.unavailable_count",
  ];

  for (let count = 0; count <= 512; count += 1) {
    const suffix = count === 1 ? "one" : "other";
    for (const key of countKeys) {
      map.set(
        spcFlexCFormatTranslation(fr[`${key}.${suffix}`], { count }),
        spcFlexCFormatTranslation(en[`${key}.${suffix}`], { count })
      );
    }
    map.set(
      spcFlexCFormatTranslation(fr["group.in_fault"], { count }),
      spcFlexCFormatTranslation(en["group.in_fault"], { count })
    );
  }

  return map;
}

const SPC_FLEXC_CARD_LEGACY_TEXT_MAP = spcFlexCBuildLegacyTextMap();

SpcFlexCCard.prototype._translateCardText = function (value) {
  if (this._language() === "fr") return value;

  const source = String(value ?? "");
  const trimmed = source.trim();
  if (!trimmed) return source;

  const translated = SPC_FLEXC_CARD_LEGACY_TEXT_MAP.get(trimmed);
  return translated == null ? source : source.replace(trimmed, translated);
};

const spcFlexCI18nBaseRender = SpcFlexCCard.prototype._render;
SpcFlexCCard.prototype._render = function () {
  spcFlexCI18nBaseRender.call(this);

  if (this._language() === "fr") return;

  const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    node.nodeValue = this._translateCardText(node.nodeValue);
  }
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

const spcFlexCI18nBaseAlarmService = SpcFlexCCard.prototype._callAlarmService;
SpcFlexCCard.prototype._callAlarmService = async function (
  service,
  entityId = this._config?.entity,
  displayName = null,
  actionLabel = null
) {
  if (!this._hass || !entityId) return;

  const stateObj = this._hass.states[entityId];
  const name =
    displayName ||
    stateObj?.attributes?.friendly_name ||
    this._config?.name ||
    entityId;

  let prompt = this._t("confirm.generic", { name });
  if (service === "alarm_disarm") {
    prompt = this._t("confirm.disarm", { name });
  } else if (service === "alarm_arm_away") {
    prompt = this._t("confirm.full_arm", { name });
  } else if (service === "alarm_arm_home") {
    prompt = this._t("confirm.part_set", {
      action: actionLabel || this._t("state.part_a"),
      name,
    });
  } else if (service === "alarm_arm_night") {
    prompt = this._t("confirm.part_set", {
      action: actionLabel || this._t("state.part_b"),
      name,
    });
  }

  if (this._config.confirm_actions && !window.confirm(prompt)) return;
  await this._hass.callService("alarm_control_panel", service, {
    entity_id: entityId,
  });
};

const spcFlexCI18nBaseMappingGate = SpcFlexCCard.prototype._callMappingGate;
SpcFlexCCard.prototype._callMappingGate = async function (entityId, name, action) {
  if (!this._hass || !entityId || !["on", "off"].includes(action)) return;
  const actionLabel =
    action === "on" ? this._t("action.activate") : this._t("action.deactivate");
  const prompt = this._t("confirm.mapping_gate", {
    action: actionLabel,
    name,
  });
  if (this._config.confirm_actions && !window.confirm(prompt)) return;
  await this._hass.callService("switch", action === "on" ? "turn_on" : "turn_off", {
    entity_id: entityId,
  });
};

const spcFlexCI18nEditorBaseRender = SpcFlexCCardEditor.prototype._render;
SpcFlexCCardEditor.prototype._render = function () {
  spcFlexCI18nEditorBaseRender.call(this);

  if (spcFlexCLanguage(this._hass) === "fr") return;

  const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const source = String(node.nodeValue || "");
    const trimmed = source.trim();
    const translated = SPC_FLEXC_CARD_LEGACY_TEXT_MAP.get(trimmed);
    if (translated != null) {
      node.nodeValue = source.replace(trimmed, translated);
    }
  }
};

const spcFlexCCardRegistration = window.customCards?.find(
  (card) => card.type === "spc-flexc-card"
);
if (spcFlexCCardRegistration) {
  const language = spcFlexCLanguage(null);
  spcFlexCCardRegistration.description =
    SPC_FLEXC_CARD_TRANSLATIONS[language]["card.description"];
}
