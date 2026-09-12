/* SPC FlexC Card v1.0.5 render scheduler. */

const spcFlexCImmediateRender = SpcFlexCCard.prototype._render;
const spcFlexCBaseDisconnectedCallback =
  SpcFlexCCard.prototype.disconnectedCallback;

SpcFlexCCard.prototype._showCardVersion = function () {
  if (this.querySelector(".spc-card-version")) {
    return;
  }

  const centralSection = Array.from(
    this.querySelectorAll(".technical-section")
  ).find(
    (section) =>
      section.querySelector(".technical-section-title")?.textContent.trim() ===
      "Centrale"
  );

  if (!centralSection) {
    return;
  }

  const versionRow = document.createElement("div");
  versionRow.className = "technical-row spc-card-version";
  versionRow.innerHTML = `
    <div class="technical-label">Carte SPC FlexC</div>
    <div class="technical-value">${this._escapeHtml(CARD_VERSION)}</div>
  `;

  centralSection
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
