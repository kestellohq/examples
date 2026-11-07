# Contributing

Kestello's [contributing rules](https://github.com/kestellohq/cms/blob/main/CONTRIBUTING.md) apply here: Conventional Commits, tests for every fix, the code style and the security rules. What is different in this repository:

- **One branch, `main`.** The examples are not released; they follow Kestello's develop branch. Open pull requests against `main`.
- **Scope commits by example:** `fix(catalog): …`, `docs(hello): …`.
- **Checks and builds:** `sh tools/check.sh` must pass, and `sh tools/build.sh` must leave nothing to commit (see [README.md](README.md#develop)).
- **Clarity over cleverness.** People learn from these files; the plainest correct way wins.

Security problems: follow [Kestello's security policy](https://github.com/kestellohq/cms/blob/main/SECURITY.md), not a public issue.
