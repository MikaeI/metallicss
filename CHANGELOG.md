# Changelog

All notable user-visible changes to MetalliCSS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

Nothing yet.

## [5.0.0] - 2026-07-24

The package metadata and generated artifacts on `main` are prepared for
5.0.0. This version remains unreleased until the matching Git tag and npm
package are published; npm `latest` is still 4.0.3.

### Breaking changes and migration from 4.x

- The package is ESM-only and exposes typed ESM entry points. Replace CommonJS
  `require()` calls with `import`; browser consumers should load it as a module.
- Node-based consumers and project tooling require Node.js 22 or newer. The
  browser runtime itself does not require Node.js.
- Existing `.metallicss` markup, `--metal`, `--convexity`, and the default
  single-element renderer remain compatible. The new lifecycle helpers are
  named exports, and the preset map is exported as `presets`.

### Added

- Managed lifecycle through `mount(element)`, its returned
  `{ render, destroy }` controller, and `unmount(element)`.
- Subtree lifecycle through `observe(root)` and `refresh(root)`.
- Public, frozen `presets` export for the built-in materials.
- `--metallicss-color`, `--metallicss-angle`,
  `--metallicss-intensity`, and `--metallicss-resolution` controls.
- Unitless-degree and `deg`, `turn`, `rad`, and `grad` lighting angles.
- ESM type declarations for the renderer, lifecycle APIs, options, controller,
  roots, and presets.
- Repository-owned interactive demo source, local server, staging command, and
  Pages deployment workflow. Public Pages availability remains pending
  repository configuration.
- Node, SSR, package-consumer, bundle-budget, and Playwright test coverage.
- Contribution, governance, support, security, conduct, roadmap, issue, pull
  request, ownership, and sponsorship documentation.

### Changed

- Expanded the README with quick-start, API, CSS, lifecycle, platform,
  accessibility, support, and project-status guidance.
- Replaced user-agent gating with capability detection and optional observer
  fallbacks.
- Added deterministic cleanup, stale-render cancellation, equivalent-render
  skipping, observer coalescing, render-resolution limits, and Canvas dimension
  limits.
- Prepared the renderer and API work as the 5.0.0 release candidate while
  retaining an explicit tag-and-publication release boundary.

### Removed

- References to the retired project website and its remotely hosted README
  artwork.

## [4.0.3] - 2024-03-31

Legacy package baseline. The repository did not preserve a detailed changelog
or matching release tag for this version, so historical changes are not
reconstructed here.
