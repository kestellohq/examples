# Kestello examples: instructions for AI agents

Example plugins (`plugins/`) and themes (`themes/`) for Kestello. People copy from them, so they show the recommended way to do each thing and nothing else. People follow the same rules, in [CONTRIBUTING.md](CONTRIBUTING.md).

## Before you start

1. Run `sh tools/setup.sh`. It puts Kestello in `kestello/` (ignored by Git); read its `AGENTS.md` and load the skills in `kestello/.agents/skills/`, above all `write-plugin`, `write-theme`, `add-block`, `admin-page` and `testing`.
2. Kestello's hard rules apply: no Composer and no PHP dependencies, only the public API, every fix starts with a failing test, text people see goes through `__()`, and the admin design rules.

## Working rules

- Never push, tag or publish unless asked in so many words. Commit locally.
- Conventional Commits scoped by example (`fix(catalog): …`), with no AI assistant trailers.
- After changing a `.vue` file, run `sh tools/build.sh` and commit `assets/build/` with the change.
- Keep `hello` small. A new idea that needs room goes in `catalog` or a new example.
- Don't change `kestello/`: it is Kestello's repository. When an example needs an extension point core lacks, that is an issue there.
- When you change what an example shows, check the pages in kestellohq/docs that link to it.

## Done when

- [ ] `sh tools/check.sh` passes, and `sh tools/build.sh` leaves nothing to commit.
- [ ] The example still reads well top to bottom: comments say why, not what.
