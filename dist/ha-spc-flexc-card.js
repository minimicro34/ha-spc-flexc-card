const CARD_VERSION = "0.1.0-dev";

class SpcFlexCCard extends HTMLElement {
  static getConfigElement() { return document.createElement("spc-flexc-card-editor"); }
  static getStubConfig(hass) {
    const entity = Object.keys(hass.states).find((id) => id.startsWith("alarm_control_panel."));
    return entity ? { entity } : {};
  }
  setConfig(config) {
    if (!config.entity) throw new Error("SPC FlexC Card requires an alarm_control_panel entity.");
    this._config = { name: "SPC FlexC", show_areas: true, show_controls: true, confirm_actions: true, ...config };
    this._render();
  }
  set hass(hass) { this._hass = hass; this._render(); }
  getCardSize() { return 4; }
  _escapeHtml(v) { return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
  _stateLabel(state) {
    return ({disarmed:"Disarmed",armed_away:"Armed",armed_home:"Part Set A",armed_night:"Part Set B",arming:"Arming",disarming:"Disarming",triggered:"Triggered",pending:"Pending",unavailable:"Unavailable",unknown:"Mixed / Unknown"})[state] || state || "Unknown";
  }
  async _callAlarmService(service) {
    if (!this._hass || !this._config) return;
    const state = this._hass.states[this._config.entity];
    const name = state?.attributes?.friendly_name || this._config.name || this._config.entity;
    const prompt = service === "alarm_arm_away" ? `Arm ${name}?` : `Disarm ${name}?`;
    if (this._config.confirm_actions && !window.confirm(prompt)) return;
    await this._hass.callService("alarm_control_panel", service, { entity_id: this._config.entity });
  }
  _areaRows(stateObj) {
    if (!this._config.show_areas) return "";
    const areas = stateObj?.attributes?.areas;
    if (!areas || typeof areas !== "object") return "";
    const rows = Object.entries(areas).map(([id,a]) => `<div class="area"><span class="area-name">${this._escapeHtml(a?.name || `Area ${id}`)}</span><span class="area-state">${this._escapeHtml(String(a?.mode_name ?? a?.mode ?? "Unknown"))}</span></div>`).join("");
    return rows ? `<div class="areas"><div class="section-title">Areas</div>${rows}</div>` : "";
  }
  _render() {
    if (!this._config || !this._hass) return;
    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) { this.innerHTML = `<ha-card><div class="card-content">Entity not found: ${this._escapeHtml(this._config.entity)}</div></ha-card>`; return; }
    const title = this._config.name || stateObj.attributes.friendly_name || "SPC FlexC";
    const controls = this._config.show_controls ? `<div class="controls"><mwc-button class="disarm" outlined>Disarm</mwc-button><mwc-button class="arm" raised>Full Set</mwc-button></div>` : "";
    this.innerHTML = `<ha-card><style>ha-card{overflow:hidden}.wrap{padding:16px}.header{display:flex;justify-content:space-between;gap:16px;align-items:center}.title{font-size:20px;font-weight:600}.state{font-weight:600;white-space:nowrap}.entity{margin-top:4px;color:var(--secondary-text-color);font-size:12px}.areas{margin-top:18px;border-top:1px solid var(--divider-color);padding-top:12px}.section-title{font-size:12px;text-transform:uppercase;color:var(--secondary-text-color);margin-bottom:6px}.area{display:flex;justify-content:space-between;gap:16px;padding:7px 0}.area-name{font-weight:500}.area-state{color:var(--secondary-text-color)}.controls{display:flex;gap:12px;margin-top:18px}.controls mwc-button{flex:1}</style><div class="wrap"><div class="header"><div><div class="title">${this._escapeHtml(title)}</div><div class="entity">${this._escapeHtml(this._config.entity)}</div></div><div class="state">${this._escapeHtml(this._stateLabel(stateObj.state))}</div></div>${this._areaRows(stateObj)}${controls}</div></ha-card>`;
    this.querySelector(".disarm")?.addEventListener("click",()=>this._callAlarmService("alarm_disarm"));
    this.querySelector(".arm")?.addEventListener("click",()=>this._callAlarmService("alarm_arm_away"));
  }
}

class SpcFlexCCardEditor extends HTMLElement {
  setConfig(config){this._config={...config};this._render();}
  set hass(hass){this._hass=hass;this._render();}
  _changed(){
    const config={...this._config,entity:this.querySelector("#entity")?.value||"",name:this.querySelector("#name")?.value||undefined,show_areas:Boolean(this.querySelector("#show_areas")?.checked),show_controls:Boolean(this.querySelector("#show_controls")?.checked),confirm_actions:Boolean(this.querySelector("#confirm_actions")?.checked)};
    this._config=config; this.dispatchEvent(new CustomEvent("config-changed",{detail:{config},bubbles:true,composed:true}));
  }
  _render(){
    if(!this._config||!this._hass)return;
    const opts=Object.keys(this._hass.states).filter(id=>id.startsWith("alarm_control_panel.")).map(id=>`<option value="${id}" ${id===this._config.entity?"selected":""}>${id}</option>`).join("");
    this.innerHTML=`<style>.editor{display:grid;gap:14px}label{display:grid;gap:6px}input,select{box-sizing:border-box;width:100%;padding:8px}.toggle{display:flex;align-items:center;gap:8px}</style><div class="editor"><label>Alarm entity<select id="entity"><option value="">Select an entity</option>${opts}</select></label><label>Card name<input id="name" type="text" value="${this._config.name||""}" placeholder="SPC FlexC"></label><label class="toggle"><input id="show_areas" type="checkbox" ${this._config.show_areas!==false?"checked":""}>Show areas</label><label class="toggle"><input id="show_controls" type="checkbox" ${this._config.show_controls!==false?"checked":""}>Show alarm controls</label><label class="toggle"><input id="confirm_actions" type="checkbox" ${this._config.confirm_actions!==false?"checked":""}>Confirm arm/disarm actions</label></div>`;
    this.querySelectorAll("input,select").forEach(el=>{el.addEventListener("change",()=>this._changed());el.addEventListener("input",()=>this._changed());});
  }
}
if(!customElements.get("spc-flexc-card"))customElements.define("spc-flexc-card",SpcFlexCCard);
if(!customElements.get("spc-flexc-card-editor"))customElements.define("spc-flexc-card-editor",SpcFlexCCardEditor);
window.customCards=window.customCards||[];
window.customCards.push({type:"spc-flexc-card",name:"SPC FlexC Card",description:"Alarm control card for the SPC FlexC Home Assistant integration.",preview:true,documentationURL:"https://github.com/minimicro34/ha-spc-flexc-card"});
console.info(`%c SPC FLEXC CARD %c ${CARD_VERSION} `,"color:white;background:#1565c0;font-weight:700;","color:#1565c0;background:white;font-weight:700;");
