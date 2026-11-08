---
name: focus-diagram
description: Generate a Mermaid focus diagram for the active source file (imports, consumers, components, hooks, settings keys) and place it next to that file as <name>.focus.mmd, with navigation back to docs/architecture/index.md. Use when the user asks for a diagram, architecture view, or dependency map of a single file.
---

# Focus diagram for the active file

Produce one Mermaid `flowchart LR` diagram centred on the active file, in the same style as [docs/architecture/focus/secondStage.mmd](../../../docs/architecture/focus/secondStage.mmd). Write it next to the file as `<basename>.focus.mmd`. For example, `src/main/secondStage.tsx` gets `src/main/secondStage.focus.mmd`.

Source code is the only source of truth. Never add an edge that the analyzer or a read of the file does not support.

## Steps

1. **Identify the active file.** Use the file the user has open or tagged. It must be under `src/`. If it isn't, stop and say so.

2. **Run the analyzer** from the repo root and save the output to a temp file:
   ```bash
   node scripts/architecture/analyze.mjs > /tmp/focus-graph.json
   ```
   The JSON has these fields. Use only these:
   - `edges`: `{from, to, kinds, forms, names}`. Static, type, dynamic, and re-export imports. `kinds` includes `value`, `type`, `jsx`, `hook-use`, `dynamic`, and `reexport`.
   - `jsx`: `{from, to, component}`. JSX usage.
   - `hookUses`: `{from, to, hook}`. Hook calls.
   - `externals`: `{<package>: [files that import it]}`.
   - `nodes`: `{id, dir, exports, isBarrel}`.
   - `cycles`: cycle groups.

   Delete the temp file when you finish.

3. **Collect the facts for the focus file:**
   - **Outgoing:** every edge with `from` equal to the file.
   - **Incoming (consumers):** every edge with `to` equal to the file.
   - **Externals:** packages whose list contains the file.
   - **Settings keys:** if the file uses `useSettingsStoreSelector` or `useSettings`, read the file and list each `s.<key>` read and each key written through `setSetting`. Confirm each key by reading the code, not by name alone.
   - **Cycles:** any cycle group that contains the file.

4. **Compute relative paths** from the output folder (the active file's folder). Use `path.relative` logic, with `/` separators. Every `click` target and every navigation link is relative to the `.mmd` file location, which is the same folder as the active file. Mermaid resolves them against the page that renders the diagram. For the index, use the path from the output folder to `docs/architecture/index.md`.

5. **Write the diagram** with the `create` tool. Use this structure:
   - Top: nav nodes `🧭 Index` and `🗺️ Overview`, each with a `click` to the docs pages.
   - One `subgraph` per group, with an emoji title:
     - `🚀 Consumers` for files that import the focus file.
     - `🚦 <focus file>` for the focus file node. Name the file node `f_<id>`. Include its exported symbols and internal functions as nodes when they matter.
     - One group per imported area, such as `🧱 Shared components`, `🪝 Hooks`, or `🎨 Themes`. Use the emoji from the module list in `scripts/architecture/render.mjs` (`MODULES`) when the file belongs to one of those modules.
     - `🗄️ State` for settings keys and the store file, if the file uses the store.
     - `📦 <package> (external)` for each npm package the file imports.
   - Edges:
     - `-->` for static imports and JSX rendering.
     - `-.->` for reads and hook use.
     - `<-->` for keys both read and written.
     - `==>` for dynamic imports.
     - `-.->` for type-only imports.
     - No edge labels.
   - `click` lines for every file node, with relative paths.
   - `classDef main` for the focus file, and `classDef store` for settings keys.
   - Keep node IDs unique and built from the file name, for example `f_secondStage`.
   - Keep the diagram small. If it grows past about 25 nodes, leave out the least important consumers and say so in your reply.

6. **Validate:**
   - Parse the diagram with Mermaid 11 in a temp directory outside the repo. Do not add a dependency to the repo. Use the same jsdom setup as the existing architecture checks.
   - Check that every `click` target exists relative to the `.mmd` file.
   - Delete the temp directory.

## Rules

- Do not edit application source. The only new file is `<basename>.focus.mmd` next to the active file.
- Do not add npm dependencies.
- Do not invent edges, consumers, or settings keys.
- Only comment in the diagram when the meaning is not obvious.
- Do not run `render.mjs` or edit generated docs unless the user asks.
- After you write the file, report its path, the node and edge counts, and anything unresolved.
