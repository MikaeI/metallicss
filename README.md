# MetalliCSS

Adaptive metallic finishes for ordinary HTML elements.

MetalliCSS reads an element's geometry and a small set of CSS custom
properties, then renders a metallic surface that follows the element. Content
stays in the DOM, the effect works as progressive enhancement, and the package
has no runtime dependencies.

The repository includes an interactive material lab in
[`index.html`](index.html). Run it locally:

```sh
npm ci
npm run dev
```

Then open <http://127.0.0.1:4173>, or use the
[live Material Lab](https://mikaei.github.io/metallicss/).

> [!IMPORTANT]
> The source tree on `main` is prepared as the 5.0.0 release candidate, but it
> remains **Unreleased** until the matching Git tag and npm package are
> published. The current npm release is still `4.0.3`. Pin a published version
> in production and consult the [changelog](CHANGELOG.md) before upgrading.

## What it does

- Preserves semantic HTML while adding a generated Canvas surface.
- Supports declarative `.metallicss` auto-initialization and explicit
  JavaScript lifecycle management.
- Adapts to element dimensions and `border-radius`.
- Provides convex, flat, and concave treatments with eight built-in materials.
- Exposes color, lighting, intensity, and render-quality controls through CSS.
- Coalesces observed changes, skips equivalent renders, and cleans up generated
  resources deterministically.

## Installation

Install the current published package:

```sh
npm install metallicss@4.0.3
```

In the 5.0.0 candidate on `main`, importing the browser entry auto-initializes
current and future elements with the `metallicss` class. npm `4.0.3` initializes
matching elements that exist when the module runs; the same markup and CSS
remain compatible:

```js
import "metallicss";
```

```html
<button class="metallicss gold-button" type="button">Deploy something shiny</button>
```

```css
.gold-button {
  min-block-size: 3rem;
  padding-inline: 1.25rem;
  border: 0;
  border-radius: 0.85rem;
  color: #201500;
  background: #d6a84b;

  --metal: gold;
  --convexity: 6;
}
```

Always provide readable foreground and fallback background colors. The element
should remain understandable if rendering is unavailable.

## CSS configuration

The renderer also reads the element's width, height, and computed
`border-radius`. Its computed `background-color` is used only when
`--metal: neutral`; other materials do not inherit it.

| Property                  | Accepted values and behavior                                                                                                                                              | Default        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `--metal`                 | `silver`, `steel`, `chrome`, `gold`, `copper`, `lead`, `titanium`, `gunmetal`, `neutral`, or another valid CSS color. `neutral` alone uses the computed background.       | `silver`       |
| `--convexity`             | Unitless depth clamped to `-24…24`; negative is concave, `0` is flat, positive is convex.                                                                                 | `4`            |
| `--metallicss-color`      | A valid CSS color that overrides the material color. Invalid values are ignored.                                                                                          | Material color |
| `--metallicss-angle`      | Lighting direction in unitless degrees or `deg`, `turn`, `rad`, or `grad`; converted to degrees, then clamped to `-3600…3600`.                                            | `90deg`        |
| `--metallicss-intensity`  | Unitless strength clamped to `0…2`.                                                                                                                                       | `1`            |
| `--metallicss-resolution` | Scale clamped to `0.25…3`. If omitted, uses device pixel ratio capped at `2`; invalid explicit values fall back to `1`. Each Canvas dimension is capped at `2048` pixels. | Automatic      |

The four `--metallicss-*` properties are part of the Unreleased 5.0.0
candidate. The legacy `--metal` and `--convexity` controls remain the
compatibility path for npm `4.0.3`.

## JavaScript API

All named exports in this section are part of the Unreleased 5.0.0 candidate
on `main`. There is no `render` alias and the preset export is plural:
`presets`.

```js
import metallicss, { mount, observe, presets, refresh, unmount } from "metallicss";
```

| Export                                        | Contract                                                                                                                                                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `metallicss(element, { force = false } = {})` | Starts a render for one `Element`. Returns its generated `HTMLCanvasElement`, or `null` when no browser window, usable size, or Canvas 2D context is available. Throws `TypeError` for a non-element. Equivalent signatures are skipped unless forced. |
| `mount(element, options?)`                    | Renders and manages one element. Returns `{ element, render(force = true), destroy() }`. Calling it again for the same element returns the existing controller.                                                                                        |
| `unmount(element)`                            | Destroys managed state and generated output. Returns `true` when anything was removed, otherwise `false`.                                                                                                                                              |
| `refresh(root = document)`                    | Force-renders matching `.metallicss` elements under a document, fragment, or element. Returns the number matched.                                                                                                                                      |
| `observe(root = document, options?)`          | Mounts current and future matching descendants. Returns a disconnect function that also unmounts elements it owns; returns a no-op function when observation is unavailable.                                                                           |
| `presets`                                     | Frozen map of the eight built-in material names to their base colors.                                                                                                                                                                                  |

Rendering completes asynchronously after the generated SVG image loads. Listen
for lifecycle events when subsequent work depends on the result.

### Mount options

| Option       | Behavior                                                                        | Default |
| ------------ | ------------------------------------------------------------------------------- | ------- |
| `debounce`   | Observer delay in milliseconds, clamped to `0…1000`.                            | `48`    |
| `observe`    | Attach available mutation, resize, and visibility observers.                    | `true`  |
| `visibility` | Pause observer-driven work while off-screen when `IntersectionObserver` exists. | `true`  |

```js
import { mount } from "metallicss";

const card = document.querySelector(".product-card");
const controller = mount(card, { debounce: 32 });

controller.render(); // Forced by default; returns a Canvas or null.
controller.destroy(); // Idempotent cleanup.
```

```js
import { observe, refresh } from "metallicss";

const panel = document.querySelector("#results");
const disconnect = observe(panel);

refresh(panel); // Returns the number of matching elements.
disconnect();
```

Prefer `mount` or `observe` for long-lived interfaces so cleanup is
explicit. Use `metallicss` for one-off rendering.

### Events

Events are dispatched on the rendered element.

| Event               | `detail`                                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| `metallicss:render` | `{ duration, width, height }`; the element also receives `data-metallicss-ready`. |
| `metallicss:error`  | `{ error }` for Canvas or generated-image failures.                               |

## Browser and platform expectations

The single-element renderer needs an attached browser `Window`, Canvas 2D,
SVG/image decoding, blobs, and object URLs. It does **not** require observer
APIs. Lifecycle helpers use feature detection: `mount` falls back from
`ResizeObserver` to the window resize event, visibility observation is
optional, and `observe` becomes a no-op without `MutationObserver`.

Treat the finish as progressive enhancement:

- Keep text, links, and controls as semantic HTML.
- Set accessible foreground and fallback background colors yourself.
- Do not use the finish as the only indication of state or meaning.
- Test your own Content Security Policy; generated image work uses `blob:`
  object URLs and an embedded `data:` texture.
- Destroy mounted renderers and disconnect subtree observers when their roots
  leave the application.

The automated browser suite covers Chromium, Firefox, and WebKit. That is test
coverage, not yet a published browser-support guarantee; a versioned
compatibility matrix is a roadmap gate.

## Performance guardrails

The renderer coalesces observed changes, cancels stale image work, skips
unchanged render signatures, caps device-pixel-ratio scaling, and limits each
Canvas dimension to 2048 pixels.

`npm run check:bundle` measures `dist/metallicss.min.js` and enforces these
budgets:

| Encoding |       Budget |
| -------- | -----------: |
| Raw      | 42,000 bytes |
| gzip -9  | 28,500 bytes |
| Brotli   | 27,000 bytes |

The check prints the current measurements in CI. Raise a budget only with an
intentional, reviewed size tradeoff.

## Project status and versioning

MetalliCSS follows [Semantic Versioning](https://semver.org/). Stable consumers
should use the npm release. Package metadata on `main` currently targets 5.0.0,
which remains a release candidate until its matching tag and npm package are
published.

See [CHANGELOG.md](CHANGELOG.md) for implemented user-visible changes and
[ROADMAP.md](ROADMAP.md) for future direction. The roadmap is not a promise of
dates.

## Contributing and support

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), follow
the [Code of Conduct](CODE_OF_CONDUCT.md), and use the issue forms for
reproducible bugs or concrete feature proposals.

- Questions and usage help: [SUPPORT.md](SUPPORT.md)
- Vulnerability reports: [SECURITY.md](SECURITY.md)
- Project decision-making: [GOVERNANCE.md](GOVERNANCE.md)

## Sponsorship

If MetalliCSS saves you time or makes a project more delightful, you can
[sponsor its maintenance on GitHub](https://github.com/sponsors/MikaeI).
Sponsorship never buys influence over security decisions, review standards, or
the roadmap.

## License

[MIT](LICENSE) © Mikael Åsbjørnsson-Stensland.
