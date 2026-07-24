# Roadmap

This roadmap describes direction, not delivery dates. Priorities may change as
browser behavior, maintenance capacity, and real-world evidence change. Work is
not considered released until it appears in a tagged version and the
[changelog](CHANGELOG.md).

## Status vocabulary

- **Candidate:** versioned source on `main` awaiting its tag and publication.
- **Next:** intended after the next stable release, subject to evidence.
- **Explore:** a prototype or research question, not a product commitment.

## 5.0.0 candidate: a dependable foundation

The 5.0.0 candidate makes the existing effect easier to adopt and safer to run
in long-lived applications. The following work is implemented on `main`, but
is not stable until it ships in a tagged npm release:

- Keep `metallicss(element)` as the single-element renderer and add explicit
  `mount`, `unmount`, `observe`, and `refresh` lifecycle APIs.
- Publish the built-in `presets` map and add `--metallicss-color`,
  `--metallicss-angle`, `--metallicss-intensity`, and
  `--metallicss-resolution`.
- Preserve `.metallicss` auto-initialization as the low-friction path.
- Use capability detection and observer fallbacks instead of requiring every
  observer API.
- Cancel stale rendering work, skip equivalent renders, and release object
  URLs, generated Canvases, observers, listeners, frames, and timers.
- Cap render resolution and Canvas dimensions, coalesce observer work, and
  enforce raw, gzip, and Brotli bundle budgets.
- Provide ESM type declarations, reproducible build checks, package smoke
  tests, Node/SSR tests, and Playwright coverage for Chromium, Firefox, and
  WebKit.
- Build a repository-owned material lab with local serving, accessibility
  checks, and a GitHub Pages deployment workflow, now live at
  [mikaei.github.io/metallicss](https://mikaei.github.io/metallicss/).
- Establish contribution, conduct, governance, support, security, ownership,
  issue, pull-request, roadmap, release, and sponsorship documentation.

Release gates still open:

- Create a matching `v5.0.0` tag and GitHub release, then publish the reviewed
  package to npm with provenance.
- Complete the supported browser matrix and record any degraded modes.
- Publish repeatable render benchmarks and a reviewed performance baseline.
- Validate the versioned commit, generated artifacts, changelog, Git tag, and
  npm package as one release.

## Next: performance and expressive control

- Coalesce redundant mutations and resizes into one current render.
- Cache immutable textures and equivalent rendering work across elements.
- Revisit device-pixel-ratio and resolution budgets using real workload data.
- Publish repeatable benchmarks for startup, resize storms, large element sets,
  and cleanup.
- Make custom material palettes and lighting controls stable enough for design
  systems while keeping sensible fallback styles.
- Publish a tested browser support matrix and a documented degraded mode.
- Provide small framework examples only where they demonstrate correct mount
  and cleanup behavior; keep the core framework-independent.

## Explore: CSS Houdini Paint Worklet

A Paint Worklet is a natural experiment for an effect controlled by CSS, but
it is not yet the default plan. The exploration should:

1. Prototype a worklet driven by registered, typed custom properties.
2. Compare visual parity, first paint, resize cost, memory, and shipped bytes
   against the Canvas/SVG renderer.
3. Test real support and failure behavior across the project's browser matrix.
4. Preserve the existing renderer as a progressive-enhancement fallback.
5. Avoid changing the public API merely to accommodate the prototype.

The Houdini backend can graduate only if it improves measured user outcomes,
has a maintainable test strategy, and fails safely in browsers that do not
support it. Until then it belongs in an experimental entry point and carries no
compatibility guarantee.

## Longer-term questions

- Can the embedded textures be generated or encoded more efficiently without
  losing the character of the finish?
- Which quality controls are meaningful to authors, and which should remain
  internal implementation details?
- Can expensive rendering move off the main thread without increasing bundle
  cost or weakening compatibility?
- What extension mechanism would permit community presets without turning the
  core into a general-purpose shader framework?

## Non-goals

- Replacing semantic HTML with a Canvas scene graph.
- Becoming a general 3D engine or UI framework.
- Requiring a framework, build service, or runtime network dependency.
- Claiming pixel-identical output across browser rendering engines.
- Shipping an experimental backend without a tested fallback and cleanup path.

## Proposing roadmap changes

Open a feature issue that explains the user problem, evidence, maintenance
cost, compatibility impact, and a measurable success criterion. Roadmap changes
follow the decision process in [GOVERNANCE.md](GOVERNANCE.md).
