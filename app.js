const STORAGE_KEY = "evenfeed-config";
const PREVIEW_MESSAGE = "evenfeed-preview-config";
const segmentCatalog = {
  "local-fans": "Local fans",
  "premium-buyers": "Premium buyers",
  "family-outings": "Family outings",
  "music-lovers": "Music lovers",
  "last-minute": "Last minute buyers",
};

const DEFAULT_CONFIG = {
  mode: "demo",
  widget: {
    title: "Featured offers",
    subtitle: "Connected ticketing inventory, ready for checkout.",
    theme: "coral",
    layout: "stack",
    maxItems: 6,
    showPrice: true,
  },
  filters: {
    keyword: "",
    city: "Chicago",
    classification: "",
    startDate: "2026-03-11",
    daysOut: 45,
  },
  collection: {
    name: "Chicago weekend picks",
    subtitle: "A tight collection of high-intent offers for the current market.",
    segment: "local-fans",
    goal: "conversion",
    selectedEventIds: ["tm-001", "tm-002", "tc-002", "tm-004"],
    featuredEventId: "tm-001",
  },
  providers: {
    ticketmaster: {
      enabled: true,
      apiKey: "",
      source: "",
      countryCode: "US",
    },
    ticketscom: {
      enabled: true,
      baseUrl: "/api/providers/ticketscom",
      tenant: "demo-club",
      token: "",
    },
  },
  api: {
    configEndpoint: "/api/integrations/config",
    feedEndpoint: "/api/feed/events",
    refreshEndpoint: "/api/feed/refresh",
  },
};

const DEMO_EVENTS = [
  {
    id: "tm-001",
    provider: "Ticketmaster",
    providerKey: "ticketmaster",
    title: "Chicago Fire FC vs Austin FC",
    venue: "Soldier Field",
    city: "Chicago",
    dateTime: "2026-03-19T19:30:00-05:00",
    priceFrom: 39,
    category: "sports",
    url: "https://www.ticketmaster.com/",
    imageUrl: "https://images.pexels.com/photos/33715952/pexels-photo-33715952.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gradient: "var(--card-sunset)",
    badge: "MLS",
  },
  {
    id: "tm-002",
    provider: "Ticketmaster",
    providerKey: "ticketmaster",
    title: "Kali Uchis - North American Tour",
    venue: "United Center",
    city: "Chicago",
    dateTime: "2026-03-22T20:00:00-05:00",
    priceFrom: 72,
    category: "music",
    url: "https://www.ticketmaster.com/",
    imageUrl: "https://images.pexels.com/photos/167605/pexels-photo-167605.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gradient: "var(--card-night)",
    badge: "Music",
  },
  {
    id: "tc-001",
    provider: "Tickets.com",
    providerKey: "ticketscom",
    title: "Chicago Dogs Opening Weekend",
    venue: "Impact Field",
    city: "Rosemont",
    dateTime: "2026-03-28T18:00:00-05:00",
    priceFrom: 24,
    category: "sports",
    url: "https://www.tickets.com/",
    imageUrl: "https://images.pexels.com/photos/33715952/pexels-photo-33715952.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gradient: "var(--card-cool)",
    badge: "Baseball",
  },
  {
    id: "tc-002",
    provider: "Tickets.com",
    providerKey: "ticketscom",
    title: "Broadway in Chicago: Hadestown",
    venue: "CIBC Theatre",
    city: "Chicago",
    dateTime: "2026-03-25T19:00:00-05:00",
    priceFrom: 65,
    category: "theatre",
    url: "https://www.tickets.com/",
    imageUrl: "https://images.pexels.com/photos/31474150/pexels-photo-31474150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gradient: "var(--card-warm)",
    badge: "Theatre",
  },
  {
    id: "tm-003",
    provider: "Ticketmaster",
    providerKey: "ticketmaster",
    title: "Bluey Live Adventure",
    venue: "Rosemont Theatre",
    city: "Rosemont",
    dateTime: "2026-04-04T13:00:00-05:00",
    priceFrom: 31,
    category: "family",
    url: "https://www.ticketmaster.com/",
    imageUrl: "https://images.pexels.com/photos/31474150/pexels-photo-31474150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gradient: "var(--card-bright)",
    badge: "Family",
  },
  {
    id: "tc-003",
    provider: "Tickets.com",
    providerKey: "ticketscom",
    title: "Chicago Symphony: New Frontiers",
    venue: "Symphony Center",
    city: "Chicago",
    dateTime: "2026-04-09T19:30:00-05:00",
    priceFrom: 54,
    category: "music",
    url: "https://www.tickets.com/",
    imageUrl: "https://images.pexels.com/photos/7095719/pexels-photo-7095719.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gradient: "var(--card-sky)",
    badge: "Orchestra",
  },
  {
    id: "tm-004",
    provider: "Ticketmaster",
    providerKey: "ticketmaster",
    title: "WNBA Preseason Showcase",
    venue: "Wintrust Arena",
    city: "Chicago",
    dateTime: "2026-04-12T18:30:00-05:00",
    priceFrom: 28,
    category: "sports",
    url: "https://www.ticketmaster.com/",
    imageUrl: "https://images.pexels.com/photos/4500123/pexels-photo-4500123.jpeg?auto=compress&cs=tinysrgb&w=1200",
    gradient: "var(--card-sport)",
    badge: "Basketball",
  },
];

const state = {
  config: loadStoredConfig(),
  events: [],
  logs: [],
};

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "admin") {
    initAdminPage();
  }

  if (page === "widget") {
    initWidgetPage();
  }

  if (page === "checkout") {
    initCheckoutPage();
  }

  if (page === "offer") {
    initOfferPage();
  }
});

function initAdminPage() {
  const iframe = document.getElementById("widget-preview");
  const previewTableBody = document.getElementById("preview-table-body");
  const embedCodeEl = document.getElementById("embed-code");
  const activityLogEl = document.getElementById("activity-log");
  const contractConfigEl = document.getElementById("contract-config");
  const contractEventsEl = document.getElementById("contract-events");
  const offerSelectorEl = document.getElementById("offer-selector");
  const featuredOfferSelectEl = document.getElementById("featured-offer-select");

  syncFormFromConfig(document, state.config);
  renderCollectionControls(offerSelectorEl, featuredOfferSelectEl, state.config);
  renderContractExamples(contractConfigEl, contractEventsEl, state.config);
  renderEmbedCode(embedCodeEl, state.config);

  document.querySelectorAll("[data-path]").forEach((field) => {
    field.addEventListener("input", handleFormChange);
    field.addEventListener("change", handleFormChange);
  });

  const refreshButton = document.getElementById("refresh-preview");
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      addLog("Preview refresh requested.");
      await refreshAdminPreview({ notifyFrame: Boolean(iframe) });
    });
  }

  document.getElementById("save-draft").addEventListener("click", () => {
    persistConfig(state.config);
    addLog("Draft saved locally for the widget preview.");
    renderActivityLog(activityLogEl);
  });

  document.getElementById("reset-config").addEventListener("click", async () => {
    state.config = clone(DEFAULT_CONFIG);
    persistConfig(state.config);
    syncFormFromConfig(document, state.config);
    renderCollectionControls(offerSelectorEl, featuredOfferSelectEl, state.config);
    renderContractExamples(contractConfigEl, contractEventsEl, state.config);
    renderEmbedCode(embedCodeEl, state.config);
    addLog("Demo configuration reset to defaults.");
    await refreshAdminPreview({ notifyFrame: Boolean(iframe) });
  });

  document.getElementById("push-config").addEventListener("click", async () => {
    try {
      if (state.config.mode !== "api") {
        addLog("Push skipped because the console is not in API managed mode.");
        renderActivityLog(activityLogEl);
        return;
      }

      const response = await fetch(state.config.api.configEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.config),
      });

      if (!response.ok) {
        throw new Error(`Config endpoint returned ${response.status}`);
      }

      addLog(`Configuration posted to ${state.config.api.configEndpoint}.`);
    } catch (error) {
      addLog(`Unable to push config. ${error.message}`);
    }

    renderActivityLog(activityLogEl);
  });

  document.getElementById("copy-embed").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(embedCodeEl.value);
      addLog("Embed snippet copied to the clipboard.");
    } catch (error) {
      addLog("Clipboard copy failed. Select the snippet manually.");
    }

    renderActivityLog(activityLogEl);
  });

  if (iframe) {
    iframe.addEventListener("load", () => {
      notifyPreviewFrame();
    });
  }

  refreshAdminPreview({ notifyFrame: Boolean(iframe) }).then(() => {
    renderPreviewTable(previewTableBody, state.events, state.config);
    renderActivityLog(activityLogEl);
  });

  offerSelectorEl?.addEventListener("change", async (event) => {
    const input = event.target.closest("input[data-event-id]");
    if (!input) {
      return;
    }

    const selected = Array.from(
      offerSelectorEl.querySelectorAll("input[data-event-id]:checked")
    ).map((checkbox) => checkbox.dataset.eventId);

    state.config.collection.selectedEventIds = selected;

    if (!selected.includes(state.config.collection.featuredEventId)) {
      state.config.collection.featuredEventId = selected[0] || "";
    }

    persistConfig(state.config);
    renderCollectionControls(offerSelectorEl, featuredOfferSelectEl, state.config);
    renderContractExamples(contractConfigEl, contractEventsEl, state.config);
    renderEmbedCode(embedCodeEl, state.config);
    await refreshAdminPreview({ notifyFrame: Boolean(iframe), silent: true });
  });

}

function initWidgetPage() {
  const refreshButtons = Array.from(document.querySelectorAll(".widget-refresh"));
  refreshButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      await renderWidgetShowcase({ announce: true });
    });
  });

  document.getElementById("refresh-showcase")?.addEventListener("click", async () => {
    await renderWidgetShowcase({ announce: true });
  });

  window.addEventListener("storage", async (event) => {
    if (event.key === STORAGE_KEY) {
      state.config = loadStoredConfig();
      await renderWidgetShowcase();
    }
  });

  window.addEventListener("message", async (event) => {
    if (!event.data || event.data.type !== PREVIEW_MESSAGE) {
      return;
    }

    state.config = sanitizeConfig(event.data.payload);
    persistConfig(state.config);
    await renderWidgetShowcase();
  });

  renderWidgetShowcase();
}

function initOfferPage() {
  const event = getOfferEvent();
  const buyCta = document.getElementById("offer-buy-cta");
  const descriptionEl = document.getElementById("offer-description");
  const highlightsEl = document.getElementById("offer-highlights");

  document.getElementById("offer-title").textContent = event.title;
  document.getElementById("offer-subtitle").textContent = getOfferSubtitle(event);
  document.getElementById("offer-heading").textContent = event.title;
  document.getElementById("offer-location").textContent = `${event.venue} · ${event.city}`;
  document.getElementById("offer-date").textContent = formatEventDate(event.dateTime);
  document.getElementById("offer-price").textContent = formatPrice(event.priceFrom, true);
  document.getElementById("offer-badge").textContent = event.badge || labelize(event.category || "live");
  document.getElementById("offer-collection").textContent = event.collectionName || state.config.collection.name;
  document.getElementById("offer-segment").textContent =
    segmentCatalog[event.segment || state.config.collection.segment] ||
    segmentCatalog["local-fans"];
  document.getElementById("offer-art").innerHTML =
    `<img class="offer-image" src="${resolveEventImage(event)}" alt="${escapeHtml(event.title)}">`;

  descriptionEl.textContent = getOfferDescription(event);
  highlightsEl.innerHTML = getOfferHighlights(event)
    .map((item) => `<div class="offer-highlight"><span class="status-label">${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`)
    .join("");

  if (buyCta) {
    buyCta.href = buildCheckoutUrl(event);
  }
}

function initCheckoutPage() {
  const event = getCheckoutEvent();
  const quantityEl = document.getElementById("checkout-quantity");
  const formEl = document.getElementById("checkout-form");
  const resultEl = document.getElementById("checkout-result");
  const resultCopyEl = document.getElementById("checkout-result-copy");

  renderCheckoutEvent(event, Number(quantityEl?.value || 2));

  quantityEl?.addEventListener("change", () => {
    renderCheckoutEvent(event, Number(quantityEl.value || 1));
  });

  formEl?.addEventListener("submit", (eventObject) => {
    eventObject.preventDefault();
    const firstName = document.getElementById("checkout-first-name")?.value?.trim() || "Guest";
    const quantity = Number(quantityEl?.value || 1);
    const total = formatCheckoutTotal(event.priceFrom, quantity);

    resultCopyEl.textContent =
      `${firstName}, your mock order for ${quantity} ticket` +
      `${quantity > 1 ? "s" : ""} to ${event.title} is confirmed at ${total}.`;
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

async function handleFormChange(event) {
  const path = event.target.dataset.path;

  if (!path) {
    return;
  }

  setConfigValue(state.config, path, readFieldValue(event.target));
  persistConfig(state.config);
  renderCollectionControls(
    document.getElementById("offer-selector"),
    document.getElementById("featured-offer-select"),
    state.config
  );
  renderContractExamples(
    document.getElementById("contract-config"),
    document.getElementById("contract-events"),
    state.config
  );
  renderEmbedCode(document.getElementById("embed-code"), state.config);
  await refreshAdminPreview({
    notifyFrame: Boolean(document.getElementById("widget-preview")),
    silent: true,
  });
}

async function refreshAdminPreview({ notifyFrame = false, silent = false } = {}) {
  try {
    state.events = await loadUnifiedFeed(state.config);
    if (!silent) {
      addLog(`Loaded ${state.events.length} events for preview.`);
    }
  } catch (error) {
    state.events = [];
    addLog(`Preview failed. ${error.message}`);
  }

  renderPreviewTable(document.getElementById("preview-table-body"), state.events, state.config);
  renderActivityLog(document.getElementById("activity-log"));
  updateSummaryCards(state.config, state.events);

  if (notifyFrame) {
    notifyPreviewFrame();
  }
}

async function renderWidgetShowcase({ announce = false } = {}) {
  const baseConfig = applyQueryOverrides(state.config, window.location.search);
  const widgetShells = Array.from(document.querySelectorAll(".widget-shell"));

  await Promise.all(
    widgetShells.map((shell) => renderWidgetShell(shell, baseConfig, { announce }))
  );
}

async function renderWidgetShell(shell, baseConfig, { announce = false } = {}) {
  const feedbackEl = shell.querySelector(".widget-feedback");
  const eventsEl = shell.querySelector(".widget-events");
  const titleEl = shell.querySelector(".widget-title-text");
  const subtitleEl = shell.querySelector(".widget-subtitle-text");
  const collectionChipEl = shell.querySelector(".widget-collection-chip");
  const segmentChipEl = shell.querySelector(".widget-segment-chip");
  const filterChipEl = shell.querySelector(".widget-filter-chip");
  const kickerEl = shell.querySelector(".widget-kicker");

  const config = clone(baseConfig);
  const limitOverride = Number(shell.dataset.limitOverride || config.widget.maxItems);
  const layoutOverride = shell.dataset.layoutOverride || config.widget.layout;
  const titleOverride = shell.dataset.variantTitle || config.widget.title;
  const subtitleOverride = shell.dataset.variantSubtitle || config.collection.subtitle || config.widget.subtitle;

  config.widget.maxItems = limitOverride;
  config.widget.layout = layoutOverride;

  shell.dataset.theme = config.widget.theme;
  shell.dataset.layout = config.widget.layout;
  titleEl.textContent = titleOverride;
  subtitleEl.textContent = subtitleOverride;
  collectionChipEl.textContent = config.collection.name;
  segmentChipEl.textContent = segmentCatalog[config.collection.segment] || "Audience";
  filterChipEl.textContent = config.filters.city || "All cities";
  if (kickerEl) {
    kickerEl.textContent = titleOverride;
  }

  feedbackEl.textContent = "Loading feed...";
  eventsEl.innerHTML = "";

  try {
    const events = await loadUnifiedFeed(config);
    feedbackEl.textContent =
      events.length > 0
        ? `${events.length} offers ready`
        : "No events matched the current provider and filter setup.";

    eventsEl.innerHTML = events
      .map((event) => renderWidgetCard(enrichEventForView(event, config)))
      .join("");
  } catch (error) {
    feedbackEl.textContent = `Feed unavailable. ${error.message}`;
  }

  if (announce) {
    feedbackEl.textContent = `${feedbackEl.textContent} Refreshed at ${new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}.`;
  }
}

async function loadUnifiedFeed(config) {
  if (config.mode === "api") {
    return applyCollectionRules(await loadApiFeed(config), config).slice(0, Number(config.widget.maxItems || 6));
  }

  if (config.mode === "direct") {
    return applyCollectionRules(await loadDirectFeed(config), config).slice(0, Number(config.widget.maxItems || 6));
  }

  return applyCollectionRules(filterAndSortEvents(DEMO_EVENTS, config), config).slice(0, Number(config.widget.maxItems || 6));
}

async function loadApiFeed(config) {
  const params = new URLSearchParams({
    city: config.filters.city,
    classification: config.filters.classification,
    keyword: config.filters.keyword,
    limit: String(config.widget.maxItems),
  });

  const response = await fetch(`${config.api.feedEndpoint}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Feed endpoint returned ${response.status}`);
  }

  const payload = await response.json();
  const events = Array.isArray(payload.events) ? payload.events : [];
  return filterAndSortEvents(events, config);
}

async function loadDirectFeed(config) {
  const enabledProviders = getEnabledProviders(config);
  const eventSets = [];

  if (enabledProviders.includes("ticketmaster")) {
    if (config.providers.ticketmaster.apiKey) {
      try {
        const ticketmasterEvents = await loadDirectTicketmaster(config);
        eventSets.push(ticketmasterEvents);
      } catch (error) {
        addLog(`Ticketmaster direct mode fell back to demo data. ${error.message}`);
        eventSets.push(filterAndSortEvents(DEMO_EVENTS.filter((event) => event.providerKey === "ticketmaster"), config));
      }
    } else {
      eventSets.push(filterAndSortEvents(DEMO_EVENTS.filter((event) => event.providerKey === "ticketmaster"), config));
    }
  }

  if (enabledProviders.includes("ticketscom")) {
    eventSets.push(filterAndSortEvents(DEMO_EVENTS.filter((event) => event.providerKey === "ticketscom"), config));
  }

  return mergeEventSets(eventSets, config.widget.maxItems);
}

async function loadDirectTicketmaster(config) {
  const params = new URLSearchParams({
    apikey: config.providers.ticketmaster.apiKey,
    size: String(config.widget.maxItems),
    sort: "date,asc",
  });

  if (config.filters.keyword) {
    params.set("keyword", config.filters.keyword);
  }

  if (config.filters.city) {
    params.set("city", config.filters.city);
  }

  if (config.filters.classification) {
    params.set("classificationName", config.filters.classification);
  }

  if (config.filters.startDate) {
    params.set("startDateTime", new Date(config.filters.startDate).toISOString());
  }

  if (config.providers.ticketmaster.countryCode) {
    params.set("countryCode", config.providers.ticketmaster.countryCode);
  }

  if (config.providers.ticketmaster.source) {
    params.set("source", config.providers.ticketmaster.source);
  }

  const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Ticketmaster returned ${response.status}`);
  }

  const payload = await response.json();
  const rawEvents = payload._embedded?.events || [];

  return rawEvents.map((event) => ({
    id: event.id,
    provider: "Ticketmaster",
    providerKey: "ticketmaster",
    title: event.name,
    venue: event._embedded?.venues?.[0]?.name || "Venue pending",
    city: event._embedded?.venues?.[0]?.city?.name || config.filters.city || "Unknown city",
    dateTime: event.dates?.start?.dateTime || `${config.filters.startDate}T19:00:00-05:00`,
    priceFrom: event.priceRanges?.[0]?.min || null,
    category:
      event.classifications?.[0]?.segment?.name?.toLowerCase() ||
      config.filters.classification ||
      "live",
    url: event.url,
    gradient: "var(--card-night)",
    badge: event.classifications?.[0]?.genre?.name || "Live",
  }));
}

function applyCollectionRules(events, config) {
  const selectedIds = config.collection?.selectedEventIds || [];
  const featuredId = config.collection?.featuredEventId || "";
  const filtered = selectedIds.length
    ? events.filter((event) => selectedIds.includes(event.id))
    : events;

  return filtered
    .slice()
    .sort((left, right) => {
      if (left.id === featuredId) {
        return -1;
      }
      if (right.id === featuredId) {
        return 1;
      }
      return new Date(left.dateTime) - new Date(right.dateTime);
    });
}

function enrichEventForView(event, config) {
  return {
    ...event,
    showPrice: config.widget.showPrice,
    collectionName: config.collection.name,
    segment: config.collection.segment,
  };
}

function filterAndSortEvents(events, config) {
  const startDate = config.filters.startDate ? new Date(config.filters.startDate) : null;
  const maxDate = startDate
    ? new Date(startDate.getTime() + Number(config.filters.daysOut || 30) * 24 * 60 * 60 * 1000)
    : null;
  const cityNeedle = config.filters.city.trim().toLowerCase();
  const keywordNeedle = config.filters.keyword.trim().toLowerCase();
  const classificationNeedle = config.filters.classification.trim().toLowerCase();

  return events
    .filter((event) => {
      if (!config.providers[event.providerKey]?.enabled) {
        return false;
      }

      if (cityNeedle && !`${event.city}`.toLowerCase().includes(cityNeedle)) {
        return false;
      }

      if (keywordNeedle && !`${event.title} ${event.venue}`.toLowerCase().includes(keywordNeedle)) {
        return false;
      }

      if (classificationNeedle && `${event.category}`.toLowerCase() !== classificationNeedle) {
        return false;
      }

      const eventDate = new Date(event.dateTime);

      if (startDate && eventDate < startDate) {
        return false;
      }

      if (maxDate && eventDate > maxDate) {
        return false;
      }

      return true;
    })
    .sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime));
}

function mergeEventSets(eventSets, limit) {
  return eventSets
    .flat()
    .sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime))
    .slice(0, Number(limit || 6));
}

function renderPreviewTable(tableBody, events, config) {
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = events.length
    ? events
        .map(
          (event) => `
            <tr>
              <td>
                <strong>${escapeHtml(event.title)}</strong>
                <span>${escapeHtml(event.badge || event.category || "Live event")}</span>
              </td>
              <td>${escapeHtml(event.provider)}</td>
              <td>${formatEventDate(event.dateTime)}</td>
              <td>${escapeHtml(event.venue)}, ${escapeHtml(event.city)}</td>
              <td>${formatPrice(event.priceFrom, config.widget.showPrice)}</td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="5">No events match the current feed rules.</td>
      </tr>
    `;
}

function renderCollectionControls(container, featuredSelect, config) {
  if (container) {
    container.innerHTML = DEMO_EVENTS.map((event) => {
      const checked = (config.collection.selectedEventIds || []).includes(event.id) ? "checked" : "";
      const isFeatured = config.collection.featuredEventId === event.id;
      return `
        <label class="offer-option ${isFeatured ? "is-featured" : ""}">
          <input type="checkbox" data-event-id="${event.id}" ${checked}>
          <img class="offer-option-image" src="${resolveEventImage(event)}" alt="${escapeHtml(event.title)}">
          <span class="offer-option-copy">
            <strong>${escapeHtml(event.title)}</strong>
            <span>${escapeHtml(event.venue)} &middot; ${escapeHtml(event.city)}</span>
          </span>
        </label>
      `;
    }).join("");
  }

  if (featuredSelect) {
    const selectedIds = config.collection.selectedEventIds || [];
    const options = DEMO_EVENTS.filter((event) => selectedIds.length === 0 || selectedIds.includes(event.id));

    if (options.length && !options.some((event) => event.id === config.collection.featuredEventId)) {
      config.collection.featuredEventId = options[0].id;
    }

    featuredSelect.innerHTML = options
      .map((event) => {
        const selected = event.id === config.collection.featuredEventId ? "selected" : "";
        return `<option value="${event.id}" ${selected}>${escapeHtml(event.title)}</option>`;
      })
      .join("");
  }
}

function renderWidgetCard(event) {
  const offerUrl = buildOfferUrl(event);
  const imageUrl = resolveEventImage(event);

  return `
    <a class="event-card" href="${offerUrl}" aria-label="Open offer for ${escapeHtml(event.title)}">
      <span class="event-image-link">
        <img class="event-image" src="${imageUrl}" alt="${escapeHtml(event.title)}">
      </span>
      <div class="event-body">
        <div class="event-meta">
          <span class="date-pill">${formatEventDate(event.dateTime)}</span>
          <span class="category-pill">${escapeHtml(event.badge || event.category || "Live")}</span>
        </div>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.venue)} &middot; ${escapeHtml(event.city)}</p>
        <div class="event-foot">
          <strong>${formatPrice(event.priceFrom, event.showPrice)}</strong>
          <span class="event-link-label">View offer</span>
        </div>
      </div>
    </a>
  `;
}

function renderCheckoutEvent(event, quantity) {
  const artEl = document.getElementById("checkout-art");
  const providerEl = document.getElementById("checkout-provider");
  const titleEl = document.getElementById("checkout-title");
  const metaEl = document.getElementById("checkout-meta");
  const dateEl = document.getElementById("checkout-date");
  const priceEl = document.getElementById("checkout-price");
  const totalEl = document.getElementById("checkout-total");

  if (artEl) {
    artEl.innerHTML = `<img class="checkout-image" src="${resolveEventImage(event)}" alt="${escapeHtml(event.title)}">`;
  }

  if (providerEl) {
    providerEl.textContent = event.badge || labelize(event.category || "live");
  }

  if (titleEl) {
    titleEl.textContent = event.title;
  }

  if (metaEl) {
    metaEl.textContent = `${event.venue} - ${event.city}`;
  }

  if (dateEl) {
    dateEl.textContent = formatEventDate(event.dateTime);
  }

  if (priceEl) {
    priceEl.textContent = formatPrice(event.priceFrom, true);
  }

  if (totalEl) {
    totalEl.textContent = formatCheckoutTotal(event.priceFrom, quantity);
  }
}

function updateSummaryCards(config, events) {
  setText("summary-mode", labelizeMode(config.mode));
  setText("summary-providers", `${getEnabledProviders(config).length}`);
  setText("summary-theme", labelize(config.widget.theme));
  setText("summary-count", `${events.length}`);
  setText("summary-title", config.widget.title);
  setText("summary-city", config.filters.city || "All cities");
  setText("summary-layout", labelize(config.widget.layout));
  setText("summary-collection", config.collection.name);
  setText("summary-demo-collection", config.collection.name);
  setText("summary-segment", segmentCatalog[config.collection.segment] || "Local fans");

  const featuredEvent = DEMO_EVENTS.find((event) => event.id === config.collection.featuredEventId);
  setText("summary-featured", featuredEvent?.title || "No featured offer");
}

function renderContractExamples(configEl, eventsEl, config) {
  if (!configEl || !eventsEl) {
    return;
  }

  configEl.textContent = [
    "POST " + config.api.configEndpoint,
    JSON.stringify(
      {
        mode: config.mode,
        providers: config.providers,
        filters: config.filters,
        collection: config.collection,
        widget: config.widget,
      },
      null,
      2
    ),
  ].join("\n");

  eventsEl.textContent = [
    "GET " + config.api.feedEndpoint + "?city=" + encodeURIComponent(config.filters.city || ""),
    JSON.stringify(
      {
        events: [
          {
            id: "provider-event-id",
            provider: "Ticketmaster",
            providerKey: "ticketmaster",
            title: "Sample Event",
            venue: "Venue Name",
            city: "Chicago",
            dateTime: "2026-03-21T19:30:00-05:00",
            priceFrom: 59,
            category: "music",
            url: "https://tickets.example.com/event/123",
            badge: "Live",
          },
        ],
      },
      null,
      2
    ),
  ].join("\n");
}

function renderEmbedCode(target, config) {
  if (!target) {
    return;
  }

  const base = getEmbedBase();
  const params = new URLSearchParams({
    theme: config.widget.theme,
    layout: config.widget.layout,
    city: config.filters.city,
    keyword: config.filters.keyword,
    classification: config.filters.classification,
    limit: String(config.widget.maxItems),
  });
  const enabledProviders = getEnabledProviders(config);

  if (enabledProviders.length) {
    params.set("providers", enabledProviders.join(","));
  }

  target.value =
    `<iframe src="${base}/widget.html?${params.toString()}" ` +
    `title="EvenFeed widget" loading="lazy" style="width:100%;max-width:420px;height:720px;border:0;"></iframe>`;
}

function notifyPreviewFrame() {
  const iframe = document.getElementById("widget-preview");

  if (!iframe?.contentWindow) {
    return;
  }

  iframe.contentWindow.postMessage(
    {
      type: PREVIEW_MESSAGE,
      payload: state.config,
    },
    "*"
  );
}

function renderActivityLog(target) {
  if (!target) {
    return;
  }

  target.innerHTML = state.logs
    .slice(0, 8)
    .map((entry) => `<li>${escapeHtml(entry)}</li>`)
    .join("");
}

function syncFormFromConfig(root, config) {
  root.querySelectorAll("[data-path]").forEach((field) => {
    const value = getConfigValue(config, field.dataset.path);

    if (field.type === "checkbox") {
      field.checked = Boolean(value);
      return;
    }

    field.value = value ?? "";
  });
}

function readFieldValue(field) {
  if (field.type === "checkbox") {
    return field.checked;
  }

  if (field.type === "number") {
    return Number(field.value);
  }

  return field.value;
}

function setConfigValue(target, path, nextValue) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  let cursor = target;

  keys.forEach((key) => {
    if (!cursor[key] || typeof cursor[key] !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key];
  });

  cursor[lastKey] = nextValue;
}

function getConfigValue(target, path) {
  return path.split(".").reduce((current, key) => current?.[key], target);
}

function loadStoredConfig() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeConfig(JSON.parse(raw)) : clone(DEFAULT_CONFIG);
  } catch (error) {
    return clone(DEFAULT_CONFIG);
  }
}

function persistConfig(config) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function sanitizeConfig(candidate) {
  const sanitized = {
    ...clone(DEFAULT_CONFIG),
    ...candidate,
    widget: {
      ...clone(DEFAULT_CONFIG.widget),
      ...(candidate?.widget || {}),
    },
    filters: {
      ...clone(DEFAULT_CONFIG.filters),
      ...(candidate?.filters || {}),
    },
    collection: {
      ...clone(DEFAULT_CONFIG.collection),
      ...(candidate?.collection || {}),
    },
    providers: {
      ticketmaster: {
        ...clone(DEFAULT_CONFIG.providers.ticketmaster),
        ...(candidate?.providers?.ticketmaster || {}),
      },
      ticketscom: {
        ...clone(DEFAULT_CONFIG.providers.ticketscom),
        ...(candidate?.providers?.ticketscom || {}),
      },
    },
    api: {
      ...clone(DEFAULT_CONFIG.api),
      ...(candidate?.api || {}),
    },
  };

  const legacyThemes = {
    "night-market": "coral",
    "arena-sunset": "coral",
    "ice-house": "slate",
  };

  if (legacyThemes[sanitized.widget.theme]) {
    sanitized.widget.theme = legacyThemes[sanitized.widget.theme];
  }

  if (sanitized.widget.title === "Live event inventory") {
    sanitized.widget.title = DEFAULT_CONFIG.widget.title;
  }

  if (sanitized.widget.subtitle === "Unified tickets from your primary providers.") {
    sanitized.widget.subtitle = DEFAULT_CONFIG.widget.subtitle;
  }

  return sanitized;
}

function applyQueryOverrides(config, search) {
  const params = new URLSearchParams(search);
  const nextConfig = sanitizeConfig(config);

  if (params.get("theme")) {
    nextConfig.widget.theme = params.get("theme");
  }

  if (params.get("layout")) {
    nextConfig.widget.layout = params.get("layout");
  }

  if (params.get("city")) {
    nextConfig.filters.city = params.get("city");
  }

  if (params.get("keyword")) {
    nextConfig.filters.keyword = params.get("keyword");
  }

  if (params.get("classification")) {
    nextConfig.filters.classification = params.get("classification");
  }

  if (params.get("limit")) {
    nextConfig.widget.maxItems = Number(params.get("limit"));
  }

  if (params.get("providers")) {
    const enabled = params.get("providers").split(",");
    Object.keys(nextConfig.providers).forEach((key) => {
      nextConfig.providers[key].enabled = enabled.includes(key);
    });
  }

  return nextConfig;
}

function addLog(message) {
  const entry = `${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}  ${message}`;
  state.logs.unshift(entry);
  state.logs = state.logs.slice(0, 8);
}

function getEnabledProviders(config) {
  return Object.entries(config.providers)
    .filter(([, provider]) => provider.enabled)
    .map(([key]) => key);
}

function formatEventDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatPrice(value, showPrice) {
  if (!showPrice) {
    return "See details";
  }

  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Price on request";
  }

  return `From $${Math.round(Number(value))}`;
}

function formatCheckoutTotal(priceFrom, quantity) {
  const base = Number(priceFrom) || 0;
  const subtotal = base * Number(quantity || 1);
  const fees = subtotal * 0.12;
  return `$${Math.round(subtotal + fees)}`;
}

function labelize(value) {
  return `${value || ""}`
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function labelizeMode(value) {
  if (value === "api") {
    return "API managed";
  }

  if (value === "direct") {
    return "Browser direct";
  }

  return "Demo mode";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function getEmbedBase() {
  if (window.location.protocol.startsWith("http")) {
    return window.location.origin;
  }

  return "https://your-domain.example";
}

function buildOfferUrl(event) {
  const params = new URLSearchParams({
    id: event.id || "",
    title: event.title || "",
    venue: event.venue || "",
    city: event.city || "",
    dateTime: event.dateTime || "",
    priceFrom: String(event.priceFrom ?? ""),
    badge: event.badge || "",
    category: event.category || "",
    gradient: event.gradient || "",
    imageUrl: event.imageUrl || "",
    collectionName: event.collectionName || state.config.collection.name,
    segment: event.segment || state.config.collection.segment,
  });

  return `./offer.html?${params.toString()}`;
}

function buildCheckoutUrl(event) {
  const params = new URLSearchParams({
    id: event.id || "",
    title: event.title || "",
    venue: event.venue || "",
    city: event.city || "",
    dateTime: event.dateTime || "",
    priceFrom: String(event.priceFrom ?? ""),
    badge: event.badge || "",
    category: event.category || "",
    gradient: event.gradient || "",
    imageUrl: event.imageUrl || "",
    collectionName: event.collectionName || state.config.collection.name,
    segment: event.segment || state.config.collection.segment,
  });

  return `./checkout.html?${params.toString()}`;
}

function getOfferEvent() {
  const params = new URLSearchParams(window.location.search);
  const fallback = DEMO_EVENTS[0];

  return {
    id: params.get("id") || fallback.id,
    title: params.get("title") || fallback.title,
    venue: params.get("venue") || fallback.venue,
    city: params.get("city") || fallback.city,
    dateTime: params.get("dateTime") || fallback.dateTime,
    priceFrom: Number(params.get("priceFrom") || fallback.priceFrom),
    badge: params.get("badge") || fallback.badge,
    category: params.get("category") || fallback.category,
    gradient: params.get("gradient") || fallback.gradient,
    imageUrl: params.get("imageUrl") || fallback.imageUrl,
    collectionName: params.get("collectionName") || state.config.collection.name,
    segment: params.get("segment") || state.config.collection.segment,
  };
}

function getCheckoutEvent() {
  const params = new URLSearchParams(window.location.search);

  const fallback = DEMO_EVENTS[0];
  const candidate = {
    id: params.get("id") || fallback.id,
    title: params.get("title") || fallback.title,
    venue: params.get("venue") || fallback.venue,
    city: params.get("city") || fallback.city,
    dateTime: params.get("dateTime") || fallback.dateTime,
    priceFrom: Number(params.get("priceFrom") || fallback.priceFrom),
    badge: params.get("badge") || fallback.badge,
    category: params.get("category") || fallback.category,
    gradient: params.get("gradient") || fallback.gradient,
    imageUrl: params.get("imageUrl") || fallback.imageUrl,
    collectionName: params.get("collectionName") || state.config.collection.name,
    segment: params.get("segment") || state.config.collection.segment,
  };

  return candidate;
}

function getOfferSubtitle(event) {
  return `${segmentCatalog[event.segment] || "Selected audience"} collection · ${formatEventDate(event.dateTime)}`;
}

function getOfferDescription(event) {
  const descriptions = {
    sports: "Built for high-intent fans looking for an immediate game-day purchase path with a clear hero offer and direct checkout.",
    music: "Packaged as a high-energy concert moment, this offer is optimized for discovery and conversion inside a commerce widget.",
    theatre: "Positioned as a premium culture-night offer with strong visual storytelling and a straightforward purchase flow.",
    family: "Curated for broader household appeal, this offer works well inside family-focused campaign collections.",
  };

  return descriptions[event.category] || "Merchandised as a conversion-focused offer with a short path from discovery to checkout.";
}

function getOfferHighlights(event) {
  return [
    { label: "Venue", value: event.venue },
    { label: "Audience", value: segmentCatalog[event.segment] || "General audience" },
    { label: "Collection", value: event.collectionName || state.config.collection.name },
  ];
}

function resolveEventImage(event) {
  if (event.imageUrl) {
    return escapeHtml(event.imageUrl);
  }

  return buildEventArtwork(event);
}

function buildEventArtwork(event) {
  const palette = {
    sports: ["#1f3f68", "#4a6cf7", "#f97316"],
    music: ["#4a244f", "#ff6b6b", "#ffb347"],
    theatre: ["#5b2c17", "#f97316", "#f8c15c"],
    family: ["#185a7d", "#43cea2", "#f9ed69"],
    live: ["#22344d", "#ff6b3d", "#ffd166"],
  };
  const key = `${event.category || "live"}`.toLowerCase();
  const tones = palette[key] || palette.live;
  const badge = (event.badge || labelize(event.category || "Live")).slice(0, 20);
  const venue = (event.venue || "Live event").slice(0, 26);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${tones[0]}"/>
          <stop offset="60%" stop-color="${tones[1]}"/>
          <stop offset="100%" stop-color="${tones[2]}"/>
        </linearGradient>
      </defs>
      <rect width="640" height="400" rx="36" fill="url(#g)"/>
      <circle cx="520" cy="84" r="72" fill="rgba(255,255,255,0.14)"/>
      <circle cx="120" cy="328" r="110" fill="rgba(255,255,255,0.10)"/>
      <path d="M420 320c38-46 82-74 142-92v140H318c26-8 72-26 102-48z" fill="rgba(255,255,255,0.10)"/>
      <rect x="32" y="30" width="120" height="38" rx="19" fill="rgba(255,255,255,0.18)"/>
      <text x="52" y="54" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="white">${escapeSvgText(badge)}</text>
      <text x="36" y="314" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.88)">${escapeSvgText(venue)}</text>
      <text x="36" y="346" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="white">Buy now</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvgText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
