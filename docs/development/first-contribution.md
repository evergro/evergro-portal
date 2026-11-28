---
title: First contribution
---
How a change goes from an idea to a commit in this repo. Every change follows a spec, one phase at a time.

## 1. Before you start

- Read the global rules (`~/.claude/CLAUDE.md`), then [`AGENTS.md`](../../AGENTS.md) and [`ARCHITECTURE.md`](../../ARCHITECTURE.md).
- [Run it locally](run-locally.md).

## 2. Pick a phase

1. Open [`specs/README.md`](../../specs/README.md) and take the first spec that is not done.
2. Read the whole spec. Run its **Phase 0** first: it checks the spec against the real site.
3. Do one phase only. Stop when it is done.

## 3. Make the change

1. Create a branch: `feat/`, `fix/`, `docs/` or `chore/`, then a short name.
2. Write the test with the code. Fixing a bug? Add a test, revert the fix, watch it fail, then restore the fix.
3. Run the checks:

| Check | Command |
| :--- | :--- |
| Python lint | `ruff check .` and `ruff format --check .` |
| Backend tests | `bench --site evergro.local run-tests --app portal` |
| Type check | `npm run typecheck` in `frontend/` |
| Component tests | `npm test` in `frontend/` |
| Browser tests | `npm run test:e2e` in `frontend/` (see [Run it locally](run-locally.md#5-run-the-tests)) |
| Build | `npm run build` in `frontend/` |

4. Check the change by hand in the built app, as the spec's hand check says.

## 4. Commit

1. Tick the phase in the spec's **Progress** and note what changed from the plan.
2. Update the docs and screenshots for what you changed. See [`DOCS.md`](../../DOCS.md).
3. Run `python3 scripts/generate_tree.py --write` if you added or removed files.
4. Commit with `type(scope): summary`, for example `fix(schedule): keep tab on refresh`. Never push to `main`.

## Related pages

- [`specs/README.md`](../../specs/README.md)
- [`DOCS.md`](../../DOCS.md)
