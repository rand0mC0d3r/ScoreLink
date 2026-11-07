# Architecture overview

**Navigate:** [Index](index.md) · [Dependencies](dependencies.md) · [Components](components.md) · [Hooks](hooks.md) · [Stores](stores.md) · [Pipeline](pipeline.md) · [Cycles](cycles.md)

High-level view. Entry point: [src/main.tsx](../../src/main.tsx) mounts providers and the layout shell. Red edges are part of a circular dependency between modules.

```mermaid
flowchart LR
  subgraph sg0["Entry"]
    m_app_shell["App shell and entry (6)"]
  end
  subgraph sg1["Pipeline"]
    m_pipeline_nodes["Pipeline nodes (stages) (7)"]
    m_pipeline_components["Pipeline components (11)"]
  end
  subgraph sg2["Shell UI"]
    m_windows["Windows (8)"]
    m_toolbars["Toolbars (6)"]
    m_shared_components["Shared components (6)"]
  end
  subgraph sg3["State and data"]
    m_state_hooks["State and hooks (6)"]
    m_discovery_themes["Discovery and themes (16)"]
    m_lib_locales["Library and locales (5)"]
    ov_localstorage[("localStorage: settings")]
    ov_indexeddb[("IndexedDB: PDF files")]
  end
  m_state_hooks --> m_discovery_themes
  m_state_hooks --> m_lib_locales
  m_discovery_themes --> m_state_hooks
  m_state_hooks --> m_app_shell
  m_app_shell --> m_pipeline_nodes
  m_app_shell --> m_windows
  m_app_shell --> m_state_hooks
  m_app_shell --> m_lib_locales
  m_pipeline_nodes --> m_state_hooks
  m_pipeline_components --> m_shared_components
  m_pipeline_components --> m_state_hooks
  m_pipeline_nodes --> m_pipeline_components
  m_pipeline_nodes --> m_shared_components
  m_toolbars --> m_shared_components
  m_toolbars --> m_state_hooks
  m_toolbars --> m_lib_locales
  m_toolbars --> m_discovery_themes
  m_toolbars --> m_windows
  m_windows --> m_shared_components
  m_windows --> m_pipeline_nodes
  m_windows --> m_toolbars
  m_windows --> m_state_hooks
  m_state_hooks --> ov_localstorage
  m_lib_locales --> ov_indexeddb
  click m_pipeline_components "modules/pipeline-components.md" "Pipeline components"
  click m_pipeline_nodes "modules/pipeline-nodes.md" "Pipeline nodes (stages)"
  click m_windows "modules/windows.md" "Windows"
  click m_toolbars "modules/toolbars.md" "Toolbars"
  click m_shared_components "modules/shared-components.md" "Shared components"
  click m_state_hooks "modules/state-hooks.md" "State and hooks"
  click m_discovery_themes "modules/discovery-themes.md" "Discovery and themes"
  click m_lib_locales "modules/lib-locales.md" "Library and locales"
  click m_app_shell "modules/app-shell.md" "App shell and entry"
  click ov_localstorage "stores.md" "Settings store"
  click ov_indexeddb "stores.md" "PDF storage"
  class m_pipeline_components,m_pipeline_nodes,m_windows,m_toolbars,m_shared_components,m_state_hooks,m_discovery_themes,m_lib_locales,m_app_shell mod
  class ov_localstorage,ov_indexeddb store
  linkStyle 2,3,5,16,20 stroke:#c62828,stroke-width:2px,color:#c62828
  classDef mod fill:#e8f0fe,stroke:#3b6fb6,color:#000
  classDef ext fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:4 3,color:#333
  classDef store fill:#fff7e0,stroke:#b58900,color:#000
  classDef sym fill:#f3e8ff,stroke:#7e57c2,color:#000
  classDef hookdef fill:#e0f7fa,stroke:#00838f,color:#000
  classDef entry fill:#e6f4ea,stroke:#2e7d32,color:#000
```

**Modules** (click to open each diagram):

| Module | Files | In | Out | Purpose |
|---|---|---|---|---|
| [Pipeline components](modules/pipeline-components.md) | 11 | 7 | 15 | Reusable widgets used by the four pipeline stages (pickers, page views, composer). |
| [Pipeline nodes (stages)](modules/pipeline-nodes.md) | 7 | 2 | 12 | The pipeline router (`index.tsx`), the step buttons, and the four stage screens. |
| [Windows](modules/windows.md) | 8 | 4 | 13 | Overlay windows (settings, new-version notice) and the header. |
| [Toolbars](modules/toolbars.md) | 6 | 7 | 17 | Toolbar buttons and popovers (theme, locale, settings toggle). |
| [Shared components](modules/shared-components.md) | 6 | 18 | 0 | Generic UI primitives (chips, toggles, settings section). |
| [State and hooks](modules/state-hooks.md) | 6 | 23 | 6 | The settings store, theme context, and custom hooks. |
| [Discovery and themes](modules/discovery-themes.md) | 16 | 3 | 1 | Glob-based discovery of theme definitions, and the registry used to load them. |
| [Library and locales](modules/lib-locales.md) | 5 | 6 | 0 | Store factory, IndexedDB file storage, i18n loader, and locale JSON. |
| [App shell and entry](modules/app-shell.md) | 6 | 1 | 7 | Entry point (`src/main.tsx`), providers, and the layout shell. |

**Major data flows:** the settings store (`localStorage`) drives `pipelineStep` and the pipeline stages; PDF files are kept in IndexedDB; theme definitions are discovered through globs and loaded into the theme context.

**Navigate:** [Index](index.md) · [Dependencies](dependencies.md) · [Components](components.md) · [Hooks](hooks.md) · [Stores](stores.md) · [Pipeline](pipeline.md) · [Cycles](cycles.md)
