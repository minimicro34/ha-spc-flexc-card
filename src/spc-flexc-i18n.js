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
    "area.none": "Aucun secteur SPC disponible.",
    "area.last_set": "Dernier armement",
    "area.last_unset": "Dernier désarmement",
    "door.none": "Aucune porte SPC découverte.",
    "output.none": "Aucune sortie SPC (Mapping Gate) découverte.",
    "group.detectors": "Détecteurs",
    "group.tampers": "Autoprotections",
    "group.expand_all": "Tout développer",
    "group.collapse_all": "Tout réduire",
    "group.rest": "Au repos",
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
    "area.none": "No SPC area available.",
    "area.last_set": "Last arm",
    "area.last_unset": "Last disarm",
    "door.none": "No SPC door discovered.",
    "output.none": "No SPC output (Mapping Gate) discovered.",
    "group.detectors": "Detectors",
    "group.tampers": "Tampers",
    "group.expand_all": "Expand all",
    "group.collapse_all": "Collapse all",
    "group.rest": "Idle",
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

const SPC_FLEXC_CARD_TEXT_KEYS = new Map(
  Object.entries(SPC_FLEXC_CARD_TRANSLATIONS.fr).map(([key, value]) => [value, key])
);

SpcFlexCCard.prototype._language = function () {
  const language = String(
    this._hass?.locale?.language || navigator.language || "en"
  ).toLowerCase();
  return language.startsWith("fr") ? "fr" : "en";
};

SpcFlexCCard.prototype._t = function (key, fallback = key) {
  const language = this._language();
  return (
    SPC_FLEXC_CARD_TRANSLATIONS[language]?.[key] ||
    SPC_FLEXC_CARD_TRANSLATIONS.en[key] ||
    fallback
  );
};

SpcFlexCCard.prototype._translateCardText = function (value) {
  if (this._language() === "fr") return value;

  const source = String(value ?? "");
  const trimmed = source.trim();
  if (!trimmed) return source;

  const directKey = SPC_FLEXC_CARD_TEXT_KEYS.get(trimmed);
  if (directKey) {
    return source.replace(trimmed, this._t(directKey, trimmed));
  }

  let translated = trimmed
    .replace(/\b(\d+) secteurs\b/g, "$1 areas")
    .replace(/\b(\d+) secteur\b/g, "$1 area")
    .replace(/\b(\d+) détecteurs\b/g, "$1 detectors")
    .replace(/\b(\d+) détecteur\b/g, "$1 detector")
    .replace(/\b(\d+) autoprotections\b/g, "$1 tampers")
    .replace(/\b(\d+) autoprotection\b/g, "$1 tamper")
    .replace(/\b(\d+) actifs\b/g, "$1 active")
    .replace(/\b(\d+) actif\b/g, "$1 active")
    .replace(/\b(\d+) défauts\b/g, "$1 faults")
    .replace(/\b(\d+) défaut\b/g, "$1 fault")
    .replace(/\b(\d+) indisponibles\b/g, "$1 unavailable")
    .replace(/\b(\d+) indisponible\b/g, "$1 unavailable")
    .replace(/\b(\d+) en défaut\b/g, "$1 in fault")
    .replace(/^Aucun secteur$/, "No area")
    .replace(/^Aucun détecteur$/, "No detector")
    .replace(/^Secteur (\d+)$/, "Area $1")
    .replace(/^Porte (\d+)$/, "Door $1")
    .replace(/^Sortie (\d+)$/, "Output $1")
    .replace(/^Zone (\d+)$/, "Zone $1");

  return translated === trimmed ? source : source.replace(trimmed, translated);
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

const spcFlexCI18nBaseAlarmService = SpcFlexCCard.prototype._callAlarmService;
SpcFlexCCard.prototype._callAlarmService = async function (
  service,
  entityId = this._config?.entity,
  displayName = null,
  actionLabel = null
) {
  if (this._language() === "fr") {
    return spcFlexCI18nBaseAlarmService.call(
      this,
      service,
      entityId,
      displayName,
      actionLabel
    );
  }

  if (!this._hass || !entityId) return;
  const stateObj = this._hass.states[entityId];
  const name =
    displayName ||
    stateObj?.attributes?.friendly_name ||
    this._config?.name ||
    entityId;

  let prompt = `Run the action on ${name}?`;
  if (service === "alarm_disarm") prompt = `Disarm ${name}?`;
  if (service === "alarm_arm_away") prompt = `Full set ${name}?`;
  if (service === "alarm_arm_home") {
    prompt = `Activate ${actionLabel || "Part Set A"} on ${name}?`;
  }
  if (service === "alarm_arm_night") {
    prompt = `Activate ${actionLabel || "Part Set B"} on ${name}?`;
  }

  if (this._config.confirm_actions && !window.confirm(prompt)) return;
  await this._hass.callService("alarm_control_panel", service, {
    entity_id: entityId,
  });
};

const spcFlexCI18nBaseMappingGate = SpcFlexCCard.prototype._callMappingGate;
SpcFlexCCard.prototype._callMappingGate = async function (entityId, name, action) {
  if (this._language() === "fr") {
    return spcFlexCI18nBaseMappingGate.call(this, entityId, name, action);
  }

  if (!this._hass || !entityId || !["on", "off"].includes(action)) return;
  const label = action === "on" ? this._t("action.activate") : this._t("action.deactivate");
  if (this._config.confirm_actions && !window.confirm(`${label} — ${name}?`)) return;
  await this._hass.callService("switch", action === "on" ? "turn_on" : "turn_off", {
    entity_id: entityId,
  });
};

const spcFlexCI18nEditorBaseRender = SpcFlexCCardEditor.prototype._render;
SpcFlexCCardEditor.prototype._render = function () {
  spcFlexCI18nEditorBaseRender.call(this);

  const language = String(
    this._hass?.locale?.language || navigator.language || "en"
  ).toLowerCase();
  if (language.startsWith("fr")) return;

  const french = SPC_FLEXC_CARD_TRANSLATIONS.fr;
  const english = SPC_FLEXC_CARD_TRANSLATIONS.en;
  const byText = new Map(
    Object.keys(french).map((key) => [french[key], english[key]])
  );

  const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const source = String(node.nodeValue || "");
    const trimmed = source.trim();
    if (byText.has(trimmed)) {
      node.nodeValue = source.replace(trimmed, byText.get(trimmed));
    }
  }
};

const spcFlexCCardRegistration = window.customCards?.find(
  (card) => card.type === "spc-flexc-card"
);
if (spcFlexCCardRegistration) {
  const language = String(navigator.language || "en").toLowerCase();
  spcFlexCCardRegistration.description = language.startsWith("fr")
    ? SPC_FLEXC_CARD_TRANSLATIONS.fr["card.description"]
    : SPC_FLEXC_CARD_TRANSLATIONS.en["card.description"];
}
