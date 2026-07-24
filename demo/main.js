const CUSTOM_MATERIAL = "custom";
const PRESET_COLORS = Object.freeze({
  silver: "#f4f7fa",
  steel: "#d9e0e7",
  chrome: "#ffffff",
  gold: "#f5c451",
  copper: "#cf7546",
  lead: "#77818d",
  titanium: "#a7a9b4",
  gunmetal: "#53606d",
});
const DEFAULTS = Object.freeze({
  metal: "silver",
  convexity: 5,
  color: PRESET_COLORS.silver,
  angle: 315,
  intensity: 1,
  resolution: 1,
  radius: 72,
  size: 500,
});

const MATERIALS = new Set([...Object.keys(PRESET_COLORS), CUSTOM_MATERIAL]);
const QUERY_KEYS = Object.keys(DEFAULTS);
const NUMBER_RULES = Object.freeze({
  convexity: { min: -12, max: 12, step: 1 },
  angle: { min: 0, max: 360, step: 1 },
  intensity: { min: 0.25, max: 2, step: 0.05 },
  resolution: { min: 0.5, max: 2, step: 0.25 },
  radius: { min: 0, max: 160, step: 1 },
  size: { min: 160, max: 560, step: 8 },
});

const form = document.querySelector("#lab-controls");
const surface = document.querySelector("#metal-preview");
const codeOutput = document.querySelector("#code-output");
const rendererStatus = document.querySelector("#renderer-status");
const rendererStatusText = rendererStatus?.querySelector("span:last-child");
const copyStatus = document.querySelector("#copy-status");
const copyCodeButton = document.querySelector("#copy-code");
const copyLinkButton = document.querySelector("#copy-link");
const resetButton = document.querySelector("#reset-demo");
const renderTargets = Array.from(
  document.querySelectorAll("[data-metal-target], .examples-grid .metallicss"),
);
const formControls = Object.fromEntries(
  Array.from(form?.elements || [])
    .filter(
      (control) => control instanceof HTMLInputElement || control instanceof HTMLSelectElement,
    )
    .filter((control) => control.name)
    .map((control) => [control.name, control]),
);

let state = readUrlState();
let renderFunction;
let explicitRenderFrame = 0;
let announcementTimer;

function clampToRule(value, fallback, rule) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;

  const clamped = Math.min(rule.max, Math.max(rule.min, parsed));
  const stepped = rule.min + Math.round((clamped - rule.min) / rule.step) * rule.step;
  return Number(stepped.toFixed(4));
}

function normalizeColor(value) {
  const candidate = String(value || "").trim();
  const withHash = candidate.startsWith("#") ? candidate : `#${candidate}`;
  return /^#[\da-f]{6}$/i.test(withHash) ? withHash.toLowerCase() : DEFAULTS.color;
}

function normalizeState(candidate) {
  const requestedMaterial = candidate.metal === "neutral" ? CUSTOM_MATERIAL : candidate.metal;
  const metal = MATERIALS.has(requestedMaterial) ? requestedMaterial : DEFAULTS.metal;
  const normalized = {
    metal,
    color: metal === CUSTOM_MATERIAL ? normalizeColor(candidate.color) : PRESET_COLORS[metal],
  };

  for (const [name, rule] of Object.entries(NUMBER_RULES)) {
    normalized[name] = clampToRule(candidate[name], DEFAULTS[name], rule);
  }

  return normalized;
}

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const candidate = {};

  for (const key of QUERY_KEYS) {
    candidate[key] = params.get(key) ?? DEFAULTS[key];
  }

  return normalizeState(candidate);
}

function readFormState() {
  return normalizeState({
    metal: formControls.metal?.value,
    convexity: formControls.convexity?.value,
    color: formControls.color?.value,
    angle: formControls.angle?.value,
    intensity: formControls.intensity?.value,
    resolution: formControls.resolution?.value,
    radius: formControls.radius?.value,
    size: formControls.size?.value,
  });
}

function syncControls() {
  for (const [name, control] of Object.entries(formControls)) {
    if (name in state) control.value = String(state[name]);
  }

  setOutput("value-color", state.color);
  setOutput("value-convexity", String(state.convexity));
  setOutput("value-radius", `${state.radius}px`);
  setOutput("value-size", `${state.size}px max`);
  setOutput("value-angle", `${state.angle}°`);
  setOutput("value-intensity", state.intensity.toFixed(2));
  setOutput("value-resolution", `${state.resolution.toFixed(2)}×`);
}

function setOutput(id, value) {
  const output = document.getElementById(id);
  if (output) output.textContent = value;
}

function readableTextColor(color) {
  const channels = color
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;

  return luminance > 0.179 ? "#090b0d" : "#f7fafc";
}

function applyState() {
  if (!surface) return;

  if (state.metal === CUSTOM_MATERIAL) {
    surface.style.removeProperty("--metal");
    surface.style.setProperty("--metallicss-color", state.color);
  } else {
    surface.style.setProperty("--metal", state.metal);
    surface.style.removeProperty("--metallicss-color");
  }

  surface.style.setProperty("--convexity", String(state.convexity));
  surface.style.setProperty("--metallicss-angle", `${state.angle}deg`);
  surface.style.setProperty("--metallicss-intensity", String(state.intensity));
  surface.style.setProperty("--metallicss-resolution", String(state.resolution));
  surface.style.setProperty("--demo-color", state.color);
  surface.style.setProperty("--demo-size", `${state.size}px`);
  surface.style.setProperty(
    "--demo-highlight-opacity",
    String(Math.min(0.52, 0.05 + state.intensity * 0.15).toFixed(3)),
  );
  surface.style.color = readableTextColor(state.color);
  surface.style.backgroundColor = state.color;
  surface.style.borderRadius = `${state.radius}px`;
  surface.dataset.material = state.metal;
  surface.dataset.resolution = String(state.resolution);

  if (codeOutput) codeOutput.textContent = createSnippet();
  requestExplicitRender();
}

function createSnippet() {
  const materialDeclaration =
    state.metal === CUSTOM_MATERIAL
      ? `--metallicss-color: ${state.color};`
      : `--metal: ${state.metal};`;

  return `<script type="module">
  import { metallicss } from "metallicss";

  metallicss(document.querySelector(".metallicss"));
</script>

<div class="metallicss" style="
  ${materialDeclaration}
  --convexity: ${state.convexity};
  --metallicss-angle: ${state.angle}deg;
  --metallicss-intensity: ${state.intensity};
  --metallicss-resolution: ${state.resolution};
  width: min(100%, ${state.size}px);
  aspect-ratio: 5 / 3;
  color: ${readableTextColor(state.color)};
  background-color: ${state.color};
  border-radius: ${state.radius}px;
">
  Your content
</div>`;
}

function statesMatch(left, right, key) {
  return left[key] === right[key];
}

function writeUrlState() {
  const url = new URL(window.location.href);

  for (const key of QUERY_KEYS) {
    if (key === "color" && state.metal !== CUSTOM_MATERIAL) {
      url.searchParams.delete(key);
      continue;
    }

    if (statesMatch(state, DEFAULTS, key)) {
      url.searchParams.delete(key);
      continue;
    }

    const value = key === "color" ? state[key].slice(1) : String(state[key]);
    url.searchParams.set(key, value);
  }

  window.history.replaceState({ metallicss: state }, "", url);
}

function syncDemo({ updateUrl = false } = {}) {
  syncControls();
  applyState();
  if (updateUrl) writeUrlState();
}

function setRendererStatus(message, status = "loading") {
  if (!rendererStatus || !rendererStatusText) return;

  rendererStatus.classList.toggle("is-ready", status === "ready");
  rendererStatus.classList.toggle("is-error", status === "error");
  rendererStatusText.textContent = message;
}

function invokeRenderer(target) {
  if (typeof renderFunction !== "function") return;

  try {
    const result = renderFunction(target);
    if (result && typeof result.catch === "function") {
      result.catch((error) => {
        console.error("MetalliCSS render failed", error);
        if (target === surface) {
          setRendererStatus("Render failed — see console", "error");
        }
      });
    }
  } catch (error) {
    console.error("MetalliCSS render failed", error);
    if (target === surface) {
      setRendererStatus("Render failed — see console", "error");
    }
  }
}

function requestExplicitRender() {
  if (typeof renderFunction !== "function" || !surface) return;

  window.cancelAnimationFrame(explicitRenderFrame);
  explicitRenderFrame = window.requestAnimationFrame(() => invokeRenderer(surface));
}

async function loadRenderer() {
  const moduleUrl = new URL("../metallicss.js", import.meta.url);

  try {
    const rendererModule = await import(moduleUrl.href);
    renderFunction =
      rendererModule.metallicss ||
      rendererModule.render ||
      rendererModule.renderMetallicss ||
      (typeof rendererModule.default === "function" ? rendererModule.default : undefined);

    if (typeof renderFunction !== "function") {
      throw new TypeError("The local module does not expose a renderer function.");
    }

    document.documentElement.classList.add("renderer-loaded");
    setRendererStatus("Rendering…");
    renderTargets.forEach(invokeRenderer);
  } catch (error) {
    console.error("Unable to load MetalliCSS", error);
    document.documentElement.classList.add("renderer-error");
    setRendererStatus("CSS fallback · renderer unavailable", "error");
  }
}

async function copyText(text) {
  let clipboardError;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      clipboardError = error;
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "-100vh auto auto -100vw";
  document.body.append(textarea);
  textarea.focus({ preventScroll: true });
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    throw clipboardError || error;
  } finally {
    textarea.remove();
  }

  if (!copied) {
    throw clipboardError || new Error("The browser did not grant clipboard access.");
  }
}

function announce(message, isError = false) {
  if (!copyStatus) return;

  window.clearTimeout(announcementTimer);
  copyStatus.textContent = message;
  copyStatus.classList.toggle("is-error", isError);
  announcementTimer = window.setTimeout(() => {
    copyStatus.textContent = "";
    copyStatus.classList.remove("is-error");
  }, 4200);
}

async function handleCopy(button, text, successMessage) {
  const initialLabel = button.textContent;

  try {
    await copyText(text);
    button.textContent = "Copied";
    announce(successMessage);
  } catch (error) {
    console.error("Unable to copy", error);
    announce("Clipboard access was blocked. Select and copy the text manually.", true);
  } finally {
    window.setTimeout(() => {
      button.textContent = initialLabel;
    }, 1800);
  }
}

form?.addEventListener("input", (event) => {
  const control = event.target;
  if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;

  if (control.name === "color" && formControls.metal) {
    formControls.metal.value = CUSTOM_MATERIAL;
  }

  state = readFormState();
  syncDemo({ updateUrl: true });
});

resetButton?.addEventListener("click", () => {
  state = { ...DEFAULTS };
  syncDemo({ updateUrl: true });
  announce("Playground reset to the silver preset.");
});

copyCodeButton?.addEventListener("click", () => {
  handleCopy(copyCodeButton, createSnippet(), "Code copied to the clipboard.");
});

copyLinkButton?.addEventListener("click", () => {
  writeUrlState();
  handleCopy(copyLinkButton, window.location.href, "Shareable playground URL copied.");
});

window.addEventListener("popstate", () => {
  state = readUrlState();
  syncDemo();
});

surface?.addEventListener("metallicss:render", (event) => {
  const { height, width } = event.detail || {};

  if (Number.isFinite(width) && Number.isFinite(height)) {
    setRendererStatus(`Live · Canvas ${width}×${height}`, "ready");
  } else {
    setRendererStatus("Live · Canvas renderer", "ready");
  }
});

surface?.addEventListener("metallicss:error", (event) => {
  console.error("MetalliCSS render failed", event.detail?.error);
  setRendererStatus("Render failed — see console", "error");
});

window.addEventListener("pagehide", () => {
  window.cancelAnimationFrame(explicitRenderFrame);
  window.clearTimeout(announcementTimer);
});

if (formControls.color) {
  formControls.color.setAttribute("title", "Choosing a color switches the finish to Custom color");
}

syncDemo();
loadRenderer();
