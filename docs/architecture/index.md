# Architecture explorer

**Navigate:** [Overview](overview.md)

Start here. Every page links back to this index. Diagrams are generated from source imports and exports, not from file names.

## Diagrams

| Diagram | What it shows |
|---|---|
| [Overview](overview.md) | Entry point, modules, module relationships, state and storage boundaries, data flows. |
| [Complete map](all.md) | Every file and edge in one map, with entry, store, pipeline, and hook roles marked. |
| [File dependencies](dependencies.md) | All 70 files and 126 edges, grouped by directory. |
| [React components](components.md) | JSX component usage between files. |
| [Hooks](hooks.md) | Custom hook definitions and consumers. |
| [Stores](stores.md) | The settings store, its exports, consumers, and keys. |
| [Store properties](store-properties.md) | Hand-written table and diagram of every settings store property with readers, writers, and persistence. Not regenerated. |
| [secondStage.tsx focus](./focus/secondStage.md) | Hand-written view centred on `src/main/secondStage.tsx`: imports, renders, settings keys, and parent. Not regenerated. |
| [Pipeline](pipeline.md) | Pipeline stages, shared components, and settings keys. |
| [Circular dependencies](cycles.md) | 1 cycle component(s), 1 elementary cycle(s). |

## Module diagrams

| Module | Files | Purpose |
|---|---|---|
| [Pipeline components](modules/pipeline-components.md) | 11 | Reusable widgets used by the four pipeline stages (pickers, page views, composer). |
| [Pipeline nodes (stages)](modules/pipeline-nodes.md) | 6 | The pipeline router (`index.tsx`), the step buttons, and the four stage screens. |
| [Windows](modules/windows.md) | 8 | Overlay windows (settings, new-version notice) and the header. |
| [Toolbars](modules/toolbars.md) | 6 | Toolbar buttons and popovers (theme, locale, settings toggle). |
| [Shared components](modules/shared-components.md) | 6 | Generic UI primitives (chips, toggles, settings section). |
| [State and hooks](modules/state-hooks.md) | 6 | The settings store, theme context, and custom hooks. |
| [Discovery and themes](modules/discovery-themes.md) | 16 | Glob-based discovery of theme definitions, and the registry used to load them. |
| [Library and locales](modules/lib-locales.md) | 5 | Store factory, IndexedDB file storage, i18n loader, and locale JSON. |
| [App shell and entry](modules/app-shell.md) | 6 | Entry point (`src/main.tsx`), providers, and the layout shell. |

## Analysis summary

- Files analysed: 70 (52 with imports), under `src/`.
- File-level dependency edges: 126 (value 112, type-only 5, re-export 1, dynamic 9, JSX 60, hook use 21).
- Glob-expanded imports: 16 (theme and locale loaders).
- Barrel-resolved edges: 0.
- Circular dependencies: 1 static-value cycle component(s) with 9 files; 1 elementary cycle(s). See [Circular dependencies](cycles.md).
- Unresolved imports: 0.
- External packages: 18 (@mui/material, @tanstack/react-hotkeys, @tanstack/react-query, @vercel/analytics, @vercel/speed-insights, driver.js, flexlayout-react, i18next, leaflet, lucide-react, pdf-lib, react, react-dom, react-i18next, react-intersection-observer, unique-names-generator, uplot, workbox-window).

## Discrepancies and limitations

- No existing `docs/architecture/` content existed at analysis time, so there was nothing to reconcile.
- Analysis covers the working tree: `src/main/firstStage.tsx` has an uncommitted edit, and `src/main/GdeltNews15Min.tsx` is untracked.
- `@/main` resolves to `src/main.tsx`, not `src/main/index.tsx`. This is the source of the main cycle (see [cycles](cycles.md)).
- Files outside `src/` (`vite.config.ts`, `eslint.config.js`, `scripts/`, `sw.js`) are not in the graph.
- Settings-key references on the pipeline and store pages are name-based and do not verify read versus write direction.

## Viewing locally

1. Open this file (`docs/architecture/index.md`) in an editor preview or on GitHub. The `.md` pages embed the Mermaid diagrams in fenced `mermaid` blocks.
2. In VS Code, the built-in Markdown preview does not render Mermaid. Install a Mermaid-capable Markdown preview extension, then open the preview (Ctrl+Shift+V).
3. The `.mmd` files hold the same diagram source for Mermaid Live Editor (https://mermaid.live) or `npx -y @mermaid-js/mermaid-cli -i overview.mmd -o overview.svg`, which needs no change to the repo.
4. Mermaid `click` links need an interactive renderer. Use the Navigate links at the top and bottom of each page when clicks are disabled.
5. Regenerate after source changes, from the repo root: `node scripts/architecture/analyze.mjs > /tmp/graph.json && node scripts/architecture/render.mjs /tmp/graph.json`.

**Navigate:** [Overview](overview.md)
