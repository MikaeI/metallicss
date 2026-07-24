# Governance

MetalliCSS uses lightweight, maintainer-led governance. The goal is to make
decisions in public, keep responsibility clear, and allow the model to grow as
the contributor community grows.

## Roles

### Contributors

Anyone participating through code, documentation, design, testing, issue
triage, or discussion is a contributor. Contributors are expected to follow the
[Code of Conduct](CODE_OF_CONDUCT.md) and the review standards in
[CONTRIBUTING.md](CONTRIBUTING.md).

### Maintainers

Maintainers review and merge changes, triage issues, protect security reports,
manage releases, and steward the roadmap. Maintainers are listed in
`.github/CODEOWNERS`.

### Lead maintainer

The lead maintainer, currently [@MikaeI](https://github.com/MikaeI), is the final
decision-maker when maintainers cannot reach consensus. The lead is also
responsible for npm ownership, GitHub settings, security embargoes, and adding
or removing maintainers.

## Decision process

Routine fixes and documentation changes are decided through normal pull-request
review. Significant decisions should begin in a public issue and include:

- The user problem and evidence that it matters.
- Compatibility, accessibility, security, and performance implications.
- Alternatives considered and their maintenance cost.
- A testable definition of success.
- Semantic Versioning and migration impact.

Maintainers seek rough consensus, not unanimity. When consensus is not possible,
the lead maintainer decides and records the rationale. Security embargoes,
private conduct reports, and personal information are exceptions to the public
record.

Breaking API changes, a new rendering backend, governance changes, and new
runtime dependencies always require an issue before implementation. An item in
the roadmap signals interest, not pre-approval of a particular design.

## Reviews and releases

Maintainers may not merge changes that knowingly leave required checks failing.
Authors should not be the only reviewer of security-sensitive release
automation when another maintainer is available.

Only maintainers publish releases. A release must have a versioned changelog
entry, matching Git tag and package metadata, reproducible generated artifacts,
and passing required checks. Security releases may use an abbreviated private
review process until coordinated disclosure.

## Becoming a maintainer

Maintainers are invited based on a sustained record of constructive
contributions, sound technical judgment, reliable review, respect for project
boundaries, and Code of Conduct compliance. There is no contribution-count
threshold. The lead maintainer announces appointments in a public governance
change after receiving the candidate's consent.

Maintainers may step down at any time. Access may be removed for prolonged
inactivity, compromised credentials, repeated policy violations, or conduct
that puts users or the project at risk. Except for urgent security actions, the
reason should be documented.

## Continuity

The project should avoid depending on one person's local state: build and
release instructions belong in the repository, published artifacts must be
reproducible, and critical service ownership should be recoverable.

If the lead maintainer becomes unavailable, active maintainers should first try
the private channels published in [SECURITY.md](SECURITY.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). After at least 90 days without a
response, the remaining maintainers may unanimously appoint an interim lead
and document the decision. Legal ownership of accounts and package names may
still limit what can be transferred.

## Funding and conflicts

Sponsorship supports maintenance, testing, documentation, and project
infrastructure. It does not purchase roadmap priority, favorable review, access
to vulnerability details, or exceptions to project policy. Maintainers should
disclose material conflicts of interest when proposing or deciding a change.

## Changing this document

Governance changes use the significant-decision process above and are made by
pull request. The pull request should explain why the existing model is no
longer sufficient.
