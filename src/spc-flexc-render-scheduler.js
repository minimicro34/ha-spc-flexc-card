/* SPC FlexC Card render scheduler. */

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

SpcFlexCCard.prototype._captureScrollPositions = function () {
  const positions = [];
  const seen = new Set();
  let node = this;

  while (node) {
    const parent = node.parentElement || node.getRootNode?.()?.host || null;
    if (!parent || seen.has(parent)) {
      break;
    }

    seen.add(parent);

    if (
      parent.scrollHeight > parent.clientHeight ||
      parent.scrollWidth > parent.clientWidth
    ) {
      positions.push({
        element: parent,
        top: parent.scrollTop,
        left: parent.scrollLeft,
      });
    }

    node = parent;
  }

  const scrollingElement = document.scrollingElement;
  if (scrollingElement && !seen.has(scrollingElement)) {
    positions.push({
      element: scrollingElement,
      top: scrollingElement.scrollTop,
      left: scrollingElement.scrollLeft,
    });
  }

  return positions;
};

SpcFlexCCard.prototype._restoreScrollPositions = function (positions) {
  for (const position of positions || []) {
    const { element, top, left } = position;
    if (!element?.isConnected) {
      continue;
    }

    if (element.scrollTop !== top) {
      element.scrollTop = top;
    }
    if (element.scrollLeft !== left) {
      element.scrollLeft = left;
    }
  }
};

SpcFlexCCard.prototype._render = function () {
  // Home Assistant can deliver the same zone change twice to the card: first
  // through the direct state_changed subscription and then through the hass
  // property update. Keep the immediate live update, but briefly coalesce the
  // follow-up render so the whole card is not rebuilt twice in quick succession.
  if (this._spcRenderFrame != null) {
    return;
  }

  const render = () => {
    this._spcRenderFrame = null;
    this._spcRenderUsesAnimationFrame = false;

    const scrollPositions = this._captureScrollPositions();
    spcFlexCImmediateRender.call(this);
    this._showCardVersion();
    this._restoreScrollPositions(scrollPositions);

    this._spcScrollRestoreFrame = window.requestAnimationFrame?.(() => {
      this._spcScrollRestoreFrame = null;
      this._restoreScrollPositions(scrollPositions);
    }) ?? null;

    // One HA hass update generally follows the live event almost immediately.
    // A short quiet period collapses that duplicate while staying well below a
    // perceptible UI delay for unrelated state changes.
    this._spcRenderQuietUntil = Date.now() + 40;
  };

  const delay = Math.max(0, (this._spcRenderQuietUntil || 0) - Date.now());

  if (delay > 0) {
    this._spcRenderUsesAnimationFrame = false;
    this._spcRenderFrame = window.setTimeout(render, delay);
  } else if (typeof window.requestAnimationFrame === "function") {
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

  if (
    this._spcScrollRestoreFrame != null &&
    typeof window.cancelAnimationFrame === "function"
  ) {
    window.cancelAnimationFrame(this._spcScrollRestoreFrame);
    this._spcScrollRestoreFrame = null;
  }

  this._spcRenderQuietUntil = 0;
  spcFlexCBaseDisconnectedCallback.call(this);
};
