# Security policy

## Supported versions

Security fixes are targeted at the latest published major version and at the
5.0.0 candidate on `main`. Older major versions should be upgraded before a
fix is requested.

| Version                  | Security support              |
| ------------------------ | ----------------------------- |
| `main` / 5.0.0 candidate | Reviewed while in development |
| 4.x (latest npm major)   | Supported                     |
| Older majors             | Not supported                 |

Support means the maintainers will assess credible reports and, when possible,
prepare a fix or mitigation. It is not a warranty or service-level agreement.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting from the repository's **Security**
tab when it is available. Otherwise email
[`metallicssdev@gmail.com`](mailto:metallicssdev@gmail.com). Use a neutral
subject line if the existence of the issue is sensitive, and do not include
exploit details in a public issue, discussion, or comment.

Include as much of the following as is safe:

- A concise description of the issue and its impact.
- Affected MetalliCSS version, entry point, browser, and operating system.
- Minimal reproduction steps or a proof of concept.
- Whether the issue affects the npm package, demo, repository automation, or
  another distribution channel.
- Known mitigations and any disclosure deadline you are working under.

The maintainers aim to acknowledge a report within five business days and
provide an initial triage within ten business days. These are response targets,
not guarantees. Reporters should receive an update at least every fourteen days
while an accepted issue remains unresolved.

## Disclosure process

The maintainer will validate the report, agree on severity and disclosure
timing with the reporter when practical, prepare fixes for supported versions,
and publish a GitHub security advisory or release note. Credit is offered unless
the reporter prefers anonymity.

Please allow a reasonable remediation window before public disclosure. If the
maintainer cannot reproduce the issue or considers it out of scope, the
response should explain why and identify any additional evidence that could
change the assessment.

## Scope

Useful reports include vulnerabilities in the distributed renderer, demo,
release process, dependency chain, or repository automation. General browser
bugs, denial of service requiring an already compromised page, and reports that
only restate automated scanner output without a credible impact may be closed
as out of scope.

There is currently no paid bug bounty. Good-faith research that avoids privacy
violations, data destruction, service disruption, and access beyond what is
needed to demonstrate the issue will not be pursued by the project merely for
reporting a vulnerability responsibly.
