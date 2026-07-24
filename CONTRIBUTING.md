# Contributing to MetalliCSS

Thank you for helping make MetalliCSS more useful, dependable, and welcoming.
Changes of every size are valuable when they are focused and verifiable.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- Search existing issues and pull requests before opening a duplicate.
- Use the bug form for reproducible defects and the feature form for proposals.
- Read [SUPPORT.md](SUPPORT.md) before filing a usage question as a bug.
- Report vulnerabilities privately according to [SECURITY.md](SECURITY.md).
- Open an issue before investing in a breaking API change, a new rendering
  backend, or a large new dependency.

Maintainers may close proposals that conflict with the project's non-goals, but
should explain the relevant tradeoff or roadmap decision.

## Development setup

You need Git, Node.js 22 or newer, npm, and the browsers used by the Playwright
test suite.

```sh
git clone https://github.com/MikaeI/metallicss.git
cd metallicss
npm ci
npx playwright install
npm test
```

The browser build targets ES2020. Node.js is contributor tooling rather than a
runtime requirement for people loading MetalliCSS in a browser.

To run the repository-owned demo, start the local server and open
<http://127.0.0.1:4173>:

```sh
npm run dev
```

Use `npx playwright install --with-deps` when the host also needs Playwright's
system packages, as CI does.

## Useful commands

The scripts in `package.json` are authoritative.

| Command                       | Purpose                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| `npm run build`               | Produce the distributable browser files.                       |
| `npm run build:check`         | Verify generated output is current and reproducible.           |
| `npm run lint`                | Run static lint checks.                                        |
| `npm run format:check`        | Check repository formatting without rewriting files.           |
| `npm test`                    | Run the default test suite.                                    |
| `npm run test:unit`           | Run focused unit coverage.                                     |
| `npm run test:ssr`            | Verify importing the package is safe in a server context.      |
| `npm run test:package`        | Exercise the package as a consumer would receive it.           |
| `npm run test:browser`        | Run Playwright coverage in Chromium, Firefox, and WebKit.      |
| `npm run test:browser:update` | Intentionally update browser snapshots after reviewing output. |
| `npm run check:bundle`        | Enforce the shipped-size budget.                               |
| `npm run pages:stage`         | Stage the demo exactly as it will be deployed.                 |
| `npm run dev`                 | Serve the demo and repository assets locally on port 4173.     |

Before submitting a change, run `npm run format:check`, `npm run lint`,
`npm test`, `npm run build:check`, and `npm run check:bundle` when they
cover it. CI must be able to reproduce the result from `npm ci` on a clean
checkout.

## Repository expectations

- Source files are the authority. Do not hand-edit minified files.
- `dist/` is generated. When it is tracked, include regenerated output in the
  same pull request and make sure a clean build produces no diff.
- Runtime dependencies carry a high bar. Prefer browser primitives and measure
  the cost of any dependency proposal.
- Keep the renderer usable as progressive enhancement. Base content must remain
  semantic and accessible without the effect.
- Every observer, object URL, animation frame, worker, or event listener needs a
  defined cleanup path.
- Feature detection is preferred to user-agent detection.

## Choosing the right test

Rendering changes need more than a unit test. Depending on the change, include:

- Unit coverage for parsing, configuration, scheduling, and lifecycle logic.
- Real-browser coverage for Canvas, SVG, resize, mutation, and cleanup behavior.
- Visual fixtures for materials, convex and concave depth, border radii,
  resizing, hidden elements, and high-density displays.
- A benchmark or bundle-size comparison for work that affects rendering cost,
  memory use, startup, or shipped bytes.
- Keyboard and contrast checks for demo changes.

Visual pull requests should include before-and-after screenshots or recordings.
If output changes intentionally, explain why the new result is correct rather
than merely updating a snapshot.

## Public API changes

The exports and custom properties documented in the README are public API.
Changes to them should:

1. Begin with an issue that states the user problem and compatibility impact.
2. Include tests for the new and existing behavior.
3. Update the README and any relevant examples.
4. Add an entry under `Unreleased` in [CHANGELOG.md](CHANGELOG.md).
5. Identify the appropriate Semantic Versioning impact.

Exploratory work, including CSS Houdini prototypes, should remain behind an
explicit experimental boundary until it meets the roadmap's graduation
criteria.

## Pull requests

Keep pull requests small enough to review. In the description, explain the
problem, the chosen approach, alternatives considered, and how the change was
verified. Separate broad formatting or generated-file churn from behavioral
changes when practical.

Draft pull requests are welcome for early design feedback. A pull request is
ready for final review when:

- Relevant checks pass from a clean checkout.
- Tests cover failure and cleanup paths as well as the happy path.
- Documentation and the changelog reflect user-visible behavior.
- Generated output is current and reproducible.
- Security, accessibility, compatibility, and performance implications are
  called out explicitly.

The project does not currently require a contributor license agreement or
Developer Certificate of Origin sign-off. You retain copyright in your
contribution and license it to the project under the repository's MIT license.

## Commits and releases

Write commit and pull-request titles as short, imperative descriptions of the
change. Maintainers may squash a pull request to keep history readable.

Only maintainers publish releases. Release commits, tags, generated artifacts,
the changelog, and npm metadata must describe the same version. Never include
npm tokens, signing keys, or other credentials in the repository.

## Getting help

If setup or contribution instructions are unclear, open a documentation issue
with the command you ran, the full error, your operating system, and your Node
and browser versions. That is a documentation defect worth fixing.
