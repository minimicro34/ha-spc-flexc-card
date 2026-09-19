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
  if (this._spcRenderFrame != null) {
    return;
  }

  const render = () => {
    this._spcRenderFrame = null;
    this._spcRenderUsesAnimationFrame = false;

    const scrollPositions = this._captureScrollPositions();

    // Keep the already-painted card shell when the active tab has not changed.
    // The legacy renderer still builds the fresh view so every extension keeps
    // its normal post-processing and event listeners, but before the browser can
    // paint we transplant only the new content into the existing ha-card. This
    // avoids detaching/recreating the complete card on every SPC zone event.
    const previousHaCard = this.querySelector(":scope > ha-card");
    const previousContent = previousHaCard?.querySelector(".content") || null;
    const previousActiveTab = previousHaCard?.querySelector("[data-tab].active")?.dataset?.tab || null;
    const previousTabIds = previousHaCard
      ? Array.from(previousHaCard.querySelectorAll("[data-tab]"), (item) => item.dataset.tab).join("|")
      : "";

    // The legacy renderer replaces the complete card DOM with innerHTML on
    // every HA update. Keep the host at its current rendered height while the
    // replacement custom elements are attached/upgraded. Without this guard,
    // the dashboard briefly reflows and produces a visible vertical jump on
    // every tab, even when the user's scrollTop is restored afterwards.
    const previousMinHeight = this.style.minHeight;
    const renderedHeight = this.getBoundingClientRect().height;
    if (renderedHeight > 0) {
      this.style.minHeight = `${renderedHeight}px`;
    }

    spcFlexCImmediateRender.call(this);

    const freshHaCard = this.querySelector(":scope > ha-card");
    const freshContent = freshHaCard?.querySelector(".content") || null;
    const freshActiveTab = freshHaCard?.querySelector("[data-tab].active")?.dataset?.tab || null;
    const freshTabIds = freshHaCard
      ? Array.from(freshHaCard.querySelectorAll("[data-tab]"), (item) => item.dataset.tab).join("|")
      : "";

    if (
      previousHaCard &&
      previousContent &&
      freshContent &&
      previousActiveTab === freshActiveTab &&
      previousTabIds === freshTabIds
    ) {
      previousContent.replaceWith(freshContent);
      this.replaceChildren(previousHaCard);
    }

    this._showCardVersion();
    this._restoreScrollPositions(scrollPositions);

    if (this._spcScrollRestoreFrame != null &&
        typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(this._spcScrollRestoreFrame);
    }

    this._spcScrollRestoreFrame = window.requestAnimationFrame?.(() => {
      this._spcScrollRestoreFrame = null;
      this._restoreScrollPositions(scrollPositions);

      // Release the temporary layout lock only after the replacement DOM has
      // had a frame to settle. Restore scroll once more after releasing it in
      // case the new content legitimately has a different height.
      this.style.minHeight = previousMinHeight;
      this._spcLayoutReleaseFrame = window.requestAnimationFrame?.(() => {
        this._spcLayoutReleaseFrame = null;
        this._restoreScrollPositions(scrollPositions);
      }) ?? null;
    }) ?? null;
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

  if (
    this._spcScrollRestoreFrame != null &&
    typeof window.cancelAnimationFrame === "function"
  ) {
    window.cancelAnimationFrame(this._spcScrollRestoreFrame);
    this._spcScrollRestoreFrame = null;
  }

  if (
    this._spcLayoutReleaseFrame != null &&
    typeof window.cancelAnimationFrame === "function"
  ) {
    window.cancelAnimationFrame(this._spcLayoutReleaseFrame);
    this._spcLayoutReleaseFrame = null;
  }

  this.style.minHeight = "";
  spcFlexCBaseDisconnectedCallback.call(this);
};
