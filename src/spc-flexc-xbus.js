/* SPC FlexC Card X-BUS diagnostics. */

SpcFlexCCard.prototype._getXBusDevices = function () {
  const devices = new Map();

  const ensureDevice = (deviceId) => {
    const key = String(deviceId);
    if (!devices.has(key)) {
      devices.set(key, {
        id: deviceId,
        name: null,
        serialNumber: null,
        version: null,
        siaAddress: null,
        tamperFault: null,
        tamperIsolated: null,
        entities: [],
      });
    }
    return devices.get(key);
  };

  for (const { entityId, stateObj, registryEntry } of this._scopedStates(true)) {
    const attrs = stateObj?.attributes || {};
    const uniqueId = String(registryEntry?.unique_id || "");
    const match = uniqueId.match(/_xbus_(\d+)_(.+)$/);
    const deviceId = attrs.xbus_device_id ?? match?.[1] ?? null;

    if (deviceId === null || deviceId === undefined) {
      continue;
    }

    const device = ensureDevice(deviceId);
    const field = match?.[2] || null;

    device.name =
      attrs.xbus_device_name ||
      attrs.name ||
      device.name;
    device.serialNumber = attrs.serial_number ?? device.serialNumber;
    device.version = attrs.version ?? device.version;
    device.siaAddress = attrs.sia_address ?? device.siaAddress;

    if (attrs.tamper_fault !== undefined && attrs.tamper_fault !== null) {
      device.tamperFault = attrs.tamper_fault === true;
    }
    if (attrs.tamper_isolated !== undefined && attrs.tamper_isolated !== null) {
      device.tamperIsolated = attrs.tamper_isolated === true;
    }

    if (field === "tamper_fault") {
      if (stateObj.state === "on") device.tamperFault = true;
      if (stateObj.state === "off") device.tamperFault = false;
    }
    if (field === "tamper_isolated") {
      if (stateObj.state === "on") device.tamperIsolated = true;
      if (stateObj.state === "off") device.tamperIsolated = false;
    }

    device.entities.push({
      entityId,
      stateObj,
      field,
    });
  }

  return Array.from(devices.values()).sort(
    (a, b) => Number(a.id) - Number(b.id)
  );
};

SpcFlexCCard.prototype._xBusEntityValue = function (entity) {
  const { field, stateObj } = entity;

  if (field === "tamper_fault") {
    if (stateObj.state === "on") {
      return { value: this._t("state.fault"), className: "danger" };
    }
    if (stateObj.state === "off") {
      return { value: this._t("state.ok"), className: "ok" };
    }
  }

  if (field === "tamper_isolated") {
    if (stateObj.state === "on") {
      return { value: this._t("state.isolated"), className: "warning" };
    }
    if (stateObj.state === "off") {
      return { value: this._t("state.not_isolated"), className: "ok" };
    }
  }

  return {
    value: this._valueWithUnit(stateObj),
    className: "",
  };
};

SpcFlexCCard.prototype._xBusEntityLabel = function (device, entity) {
  const friendlyName = String(
    entity.stateObj?.attributes?.friendly_name || entity.entityId
  ).trim();

  if (!device.name) {
    return friendlyName;
  }

  const prefix = `${device.name} `;
  return friendlyName.startsWith(prefix)
    ? friendlyName.slice(prefix.length)
    : friendlyName;
};

SpcFlexCCard.prototype._renderXBusDevices = function () {
  const devices = this._getXBusDevices();
  if (!devices.length) return "";

  const fieldOrder = [
    "tamper_fault",
    "tamper_isolated",
    "aux_voltage",
    "aux_current",
    "device_type",
    "hardware_id",
    "input_count",
    "output_count",
    "rf_type",
    "rf_version",
    "reader_type",
    "position_1",
    "position_2",
    "psu_type",
    "sia_address",
    "status_raw",
    "input_raw",
    "alert_raw",
    "inhibit_raw",
    "isolate_raw",
  ];

  const order = new Map(fieldOrder.map((field, index) => [field, index]));

  return `
    <div class="technical-section xbus-section">
      <div class="technical-section-title">${this._t("system.xbus")}</div>
      <div class="xbus-list">
        ${devices
          .map((device) => {
            const title = device.name || `X-BUS ${device.id}`;
            const fault = device.tamperFault === true;

            const rows = device.entities
              .filter((entity) => entity.field && entity.field !== "diagnostics")
              .sort((a, b) => {
                const aOrder = order.get(a.field) ?? Number.MAX_SAFE_INTEGER;
                const bOrder = order.get(b.field) ?? Number.MAX_SAFE_INTEGER;
                return aOrder - bOrder || a.field.localeCompare(b.field);
              })
              .map((entity) => {
                const state = this._xBusEntityValue(entity);
                if (state.value === null || state.value === undefined) return "";
                return this._technicalLine(
                  this._xBusEntityLabel(device, entity),
                  state.value,
                  state.className
                );
              })
              .join("");

            return `
              <div class="xbus-card">
                <div class="xbus-title">
                  <span>${this._escapeHtml(title)}</span>
                  ${
                    device.tamperFault === null
                      ? ""
                      : `<span class="${fault ? "danger" : "ok"}">${this._t(
                          fault ? "state.fault" : "state.ok"
                        )}</span>`
                  }
                </div>
                ${this._technicalLine(this._t("system.xbus_id"), device.id)}
                ${this._technicalLine(this._t("system.serial"), device.serialNumber)}
                ${this._technicalLine(this._t("system.firmware"), device.version)}
                ${rows}
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
};
