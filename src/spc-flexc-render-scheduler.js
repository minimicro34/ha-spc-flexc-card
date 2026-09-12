/* SPC FlexC Card v1.0.4 render scheduler. */

const spcFlexCImmediateRender = SpcFlexCCard.prototype._render;
const spcFlexCBaseDisconnectedCallback =
  SpcFlexCCard.prototype.disconnectedCallback;

SpcFlexCCard.prototype._showCardVersion = function () {
  const diagnosticsBlock = this.querySelector(".diagnostics-block");

  if (!diagnosticsBlock || diagnosticsBlock.querySelector(".spc-card-version")) {
    return;
  }

  const versionRow = document.createElement("div");
  versionRow.className = "diagnostic-row spc-card-version";
  versionRow.innerHTML = `
    <ha-icon class="muted" icon="mdi:card-account-details-outline"></ha-icon>
    <div class="diagnostic-main">
      <div class="diagnostic-name">SPC FlexC Card</div>
      <div class="diagnostic-detail muted">Version ${CARD_VERSION}</div>
    </div>
  `;
  diagnosticsBlock.appendChild(versionRow);
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
