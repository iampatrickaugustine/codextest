const STORAGE_KEY = "evenfeed-config";
const PREVIEW_MESSAGE = "evenfeed-preview-config";

const DEFAULT_CONFIG = {
  mode: "demo",
  widget: {
    title: "Live event inventory",
    subtitle: "Unified tickets from your primary providers.",
    theme: "night-market",
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
});

function initAdminPage() {
  const form = document.getElementById("settings-form");
  const iframe = document.getElementById("widget-preview");
  const previewTableBody = document.getElementById("preview-table-body");
  const embedCodeEl = document.getElementById("embed-code");
  const activityLogEl = document.getElementById("activity-log");
  const contractConfigEl = document.getElementById("contract-config");
  const contractEventsEl = document.getElementById("contract-events");

  syncFormFromConfig(document, state.config);
  renderContractExamples(contractConfigEl, contractEventsEl, state.config);
  renderEmbedCode(embedCodeEl, state.config);

  document.querySelectorAll("[data-path]").forEach((field) => {
    field.addEventListener("input", handleFormChange);
    field.addEventListener("change", handleFormChange);
  });

  document.getElementById("refresh-preview").addEventListener("click", async () => {
    addLog("Preview refresh requested.");
    await refreshAdminPreview({ notifyFrame: true });
  });

  document.getElementById("save-draft").addEventListener("click", () => {
    persistConfig(state.config);
    addLog("Draft saved locally for the widget preview.");
    renderActivityLog(activityLogEl);
  });

  document.getElementById("reset-config").addEventListener("click", async () => {
    state.config = clone(DEFAULT_CONFIG);
    persistConfig(state.config);
    syncFormFromConfig(document, state.config);
    renderContractExamples(contractConfigEl, contractEventsEl, state.config);
    renderEmbedCode(embedCodeEl, state.config);
    addLog("Demo configuration reset to defaults.");
    await refreshAdminPreview({ notifyFrame: true });
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

  iframe.addEventListener("load", () => {
    notifyPreviewFrame();
  });

  refreshAdminPreview({ notifyFrame: true }).then(() => {
    renderPreviewTable(previewTableBody, state.events, state.config);
    renderActivityLog(activityLogEl);
  });
}

function initWidgetPage() {
  const refreshButton = document.getElementById("widget-refresh");
  refreshButton.addEventListener("click", async () => {
    await renderWidget({ announce: true });
  });

  window.addEventListener("storage", async (event) => {
    if (event.key === STORAGE_KEY) {
      state.config = loadStoredConfig();
      await renderWidget();
    }
  });

  window.addEventListener("message", async (event) => {
    if (!event.data || event.data.type !== PREVIEW_MESSAGE) {
      return;
    }

    state.config = sanitizeConfig(event.data.payload);
    persistConfig(state.config);
    await renderWidget();
  });

  renderWidget();
}

async function handleFormChange(event) {
  const path = event.target.dataset.path;

  if (!path) {
    return;
  }

  setConfigValue(state.config, path, readFieldValue(event.target));
  persistConfig(state.config);
  renderContractExamples(
    document.getElementById("contract-config"),
    document.getElementById("contract-events"),
    state.config
  );
  renderEmbedCode(document.getElementById("embed-code"), state.config);
  await refreshAdminPreview({ notifyFrame: true, silent: true });
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

async function renderWidget({ announce = false } = {}) {
  const feedbackEl = document.getElementById("widget-feedback");
  const eventsEl = document.getElementById("widget-events");
  const widgetRoot = document.getElementById("widget-root");
  const titleEl = document.getElementById("widget-title-text");
  const subtitleEl = document.getElementById("widget-subtitle-text");
  const modeChipEl = document.getElementById("widget-mode-chip");
  const providerChipEl = document.getElementById("widget-provider-chip");
  const filterChipEl = document.getElementById("widget-filter-chip");

  const mergedConfig = applyQueryOverrides(state.config, window.location.search);
  widgetRoot.dataset.theme = mergedConfig.widget.theme;
  widgetRoot.dataset.layout = mergedConfig.widget.layout;
  titleEl.textContent = mergedConfig.widget.title;
  subtitleEl.textContent = mergedConfig.widget.subtitle;
  modeChipEl.textContent = labelizeMode(mergedConfig.mode);
  providerChipEl.textContent = `${getEnabledProviders(mergedConfig).length} providers`;
  filterChipEl.textContent = mergedConfig.filters.city || "All cities";
  feedbackEl.textContent = "Loading feed...";
  eventsEl.innerHTML = "";

  try {
    const events = await loadUnifiedFeed(mergedConfig);
    feedbackEl.textContent =
      events.length > 0
        ? `${events.length} events ready`
        : "No events matched the current provider and filter setup.";

    eventsEl.innerHTML = events
      .map((event) => renderWidgetCard(event, mergedConfig))
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
    return loadApiFeed(config);
  }

  if (config.mode === "direct") {
    return loadDirectFeed(config);
  }

  return filterAndSortEvents(DEMO_EVENTS, config);
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
    .sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime))
    .slice(0, Number(config.widget.maxItems || 6));
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

function renderWidgetCard(event, config) {
  return `
    <article class="event-card">
      <div class="event-art" style="background:${event.gradient};">
        <span>${escapeHtml(event.badge || event.category || "Live")}</span>
      </div>
      <div class="event-body">
        <div class="event-meta">
          <span class="provider-pill">${escapeHtml(event.provider)}</span>
          <span class="date-pill">${formatEventDate(event.dateTime)}</span>
        </div>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.venue)} · ${escapeHtml(event.city)}</p>
        <div class="event-foot">
          <strong>${formatPrice(event.priceFrom, config.widget.showPrice)}</strong>
          <a href="${escapeHtml(event.url)}" target="_blank" rel="noreferrer">View tickets</a>
        </div>
      </div>
    </article>
  `;
}

function updateSummaryCards(config, events) {
  setText("summary-mode", labelizeMode(config.mode));
  setText("summary-providers", `${getEnabledProviders(config).length}`);
  setText("summary-theme", labelize(config.widget.theme));
  setText("summary-count", `${events.length}`);
  setText("summary-title", config.widget.title);
  setText("summary-city", config.filters.city || "All cities");
  setText("summary-layout", labelize(config.widget.layout));
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
  return {
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
