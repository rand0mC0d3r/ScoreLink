# Module: Discovery and themes

**Navigate:** [Index](../index.md) · [Overview](../overview.md) · [Cycles](../cycles.md) · [Dependencies](../dependencies.md)

Glob-based discovery of theme definitions, and the registry used to load them.

16 files. Cross-module edges: 3 incoming, 1 outgoing. Grey dashed nodes are files in other modules; clicking one opens that module's page.

```mermaid
flowchart LR
  subgraph sg0["src/discovery"]
    n_src_discovery_globLoader_ts["globLoader.ts"]
    n_src_discovery_registry_ts["registry.ts"]
    n_src_discovery_registryTypes_ts["registryTypes.ts"]
    n_src_discovery_themeDiscovery_ts["themeDiscovery.ts"]
    n_src_discovery_themeRegistry_ts["themeRegistry.ts"]
    n_src_discovery_utils_ts["discovery/utils.ts"]
  end
  subgraph sg1["src/themes"]
    n_src_themes_barbie_theme_ts["barbie.theme.ts"]
    n_src_themes_catppuccin_theme_ts["catppuccin.theme.ts"]
    n_src_themes_debug_ts["debug.ts"]
    n_src_themes_default_theme_ts["default.theme.ts"]
    n_src_themes_dracula_theme_ts["dracula.theme.ts"]
    n_src_themes_index_ts["index.ts"]
    n_src_themes_monokai_theme_ts["monokai.theme.ts"]
    n_src_themes_solarized_theme_ts["solarized.theme.ts"]
    n_src_themes_tokyoNight_theme_ts["tokyoNight.theme.ts"]
    n_src_themes_utils_ts["themes/utils.ts"]
  end
  subgraph sg2["Outside: State and hooks"]
    n_src_context_ThemeContext_tsx["ThemeContext.tsx"]
    n_src_hooks_utils_ts["hooks/utils.ts"]
  end
  subgraph sg3["Outside: Toolbars"]
    n_src_middleware_tools_PopoverTools_ThemeMenu_tsx["ThemeMenu.tsx"]
  end
  n_src_context_ThemeContext_tsx --> n_src_themes_index_ts
  n_src_discovery_globLoader_ts --> n_src_hooks_utils_ts
  n_src_discovery_registryTypes_ts --> n_src_discovery_registry_ts
  n_src_discovery_themeDiscovery_ts --> n_src_discovery_globLoader_ts
  n_src_discovery_themeDiscovery_ts -.-> n_src_discovery_registryTypes_ts
  n_src_discovery_themeDiscovery_ts --> n_src_discovery_themeRegistry_ts
  n_src_discovery_themeDiscovery_ts --> n_src_discovery_utils_ts
  n_src_discovery_themeDiscovery_ts ==> n_src_themes_barbie_theme_ts
  n_src_discovery_themeDiscovery_ts ==> n_src_themes_catppuccin_theme_ts
  n_src_discovery_themeDiscovery_ts ==> n_src_themes_default_theme_ts
  n_src_discovery_themeDiscovery_ts ==> n_src_themes_dracula_theme_ts
  n_src_discovery_themeDiscovery_ts ==> n_src_themes_monokai_theme_ts
  n_src_discovery_themeDiscovery_ts ==> n_src_themes_solarized_theme_ts
  n_src_discovery_themeDiscovery_ts ==> n_src_themes_tokyoNight_theme_ts
  n_src_discovery_themeRegistry_ts --> n_src_discovery_registry_ts
  n_src_discovery_themeRegistry_ts -.-> n_src_discovery_registryTypes_ts
  n_src_discovery_utils_ts -.-> n_src_discovery_globLoader_ts
  n_src_middleware_tools_PopoverTools_ThemeMenu_tsx --> n_src_discovery_themeDiscovery_ts
  n_src_middleware_tools_PopoverTools_ThemeMenu_tsx --> n_src_themes_index_ts
  n_src_themes_barbie_theme_ts --> n_src_themes_utils_ts
  n_src_themes_catppuccin_theme_ts --> n_src_themes_utils_ts
  n_src_themes_default_theme_ts --> n_src_themes_utils_ts
  n_src_themes_dracula_theme_ts --> n_src_themes_utils_ts
  n_src_themes_index_ts --> n_src_discovery_themeRegistry_ts
  n_src_themes_index_ts --> n_src_themes_default_theme_ts
  n_src_themes_monokai_theme_ts --> n_src_themes_utils_ts
  n_src_themes_solarized_theme_ts --> n_src_themes_utils_ts
  n_src_themes_tokyoNight_theme_ts --> n_src_themes_utils_ts
  click n_src_discovery_globLoader_ts "../../../src/discovery/globLoader.ts" "src/discovery/globLoader.ts"
  click n_src_discovery_registry_ts "../../../src/discovery/registry.ts" "src/discovery/registry.ts"
  click n_src_discovery_registryTypes_ts "../../../src/discovery/registryTypes.ts" "src/discovery/registryTypes.ts"
  click n_src_discovery_themeDiscovery_ts "../../../src/discovery/themeDiscovery.ts" "src/discovery/themeDiscovery.ts"
  click n_src_discovery_themeRegistry_ts "../../../src/discovery/themeRegistry.ts" "src/discovery/themeRegistry.ts"
  click n_src_discovery_utils_ts "../../../src/discovery/utils.ts" "src/discovery/utils.ts"
  click n_src_themes_barbie_theme_ts "../../../src/themes/barbie.theme.ts" "src/themes/barbie.theme.ts"
  click n_src_themes_catppuccin_theme_ts "../../../src/themes/catppuccin.theme.ts" "src/themes/catppuccin.theme.ts"
  click n_src_themes_debug_ts "../../../src/themes/debug.ts" "src/themes/debug.ts"
  click n_src_themes_default_theme_ts "../../../src/themes/default.theme.ts" "src/themes/default.theme.ts"
  click n_src_themes_dracula_theme_ts "../../../src/themes/dracula.theme.ts" "src/themes/dracula.theme.ts"
  click n_src_themes_index_ts "../../../src/themes/index.ts" "src/themes/index.ts"
  click n_src_themes_monokai_theme_ts "../../../src/themes/monokai.theme.ts" "src/themes/monokai.theme.ts"
  click n_src_themes_solarized_theme_ts "../../../src/themes/solarized.theme.ts" "src/themes/solarized.theme.ts"
  click n_src_themes_tokyoNight_theme_ts "../../../src/themes/tokyoNight.theme.ts" "src/themes/tokyoNight.theme.ts"
  click n_src_themes_utils_ts "../../../src/themes/utils.ts" "src/themes/utils.ts"
  click n_src_context_ThemeContext_tsx "state-hooks.md" "src/context/ThemeContext.tsx (module: State and hooks)"
  click n_src_hooks_utils_ts "state-hooks.md" "src/hooks/utils.ts (module: State and hooks)"
  click n_src_middleware_tools_PopoverTools_ThemeMenu_tsx "toolbars.md" "src/middleware/tools/PopoverTools/ThemeMenu.tsx (module: Toolbars)"
  class n_src_context_ThemeContext_tsx,n_src_hooks_utils_ts,n_src_middleware_tools_PopoverTools_ThemeMenu_tsx ext
  linkStyle 1,3,17 stroke:#c62828,stroke-width:2px,color:#c62828
  classDef mod fill:#e8f0fe,stroke:#3b6fb6,color:#000
  classDef ext fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:4 3,color:#333
  classDef store fill:#fff7e0,stroke:#b58900,color:#000
  classDef sym fill:#f3e8ff,stroke:#7e57c2,color:#000
  classDef hookdef fill:#e0f7fa,stroke:#00838f,color:#000
  classDef entry fill:#e6f4ea,stroke:#2e7d32,color:#000
  classDef pipe fill:#e3f2fd,stroke:#1565c0,color:#000
```

**Imports and reverse dependencies (file level):**

| File | Imports | Imported by |
|---|---|---|
| [globLoader.ts](../../../src/discovery/globLoader.ts) | [hooks/utils.ts](../../../src/hooks/utils.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts), [discovery/utils.ts](../../../src/discovery/utils.ts) |
| [registry.ts](../../../src/discovery/registry.ts) | — | [registryTypes.ts](../../../src/discovery/registryTypes.ts), [themeRegistry.ts](../../../src/discovery/themeRegistry.ts) |
| [registryTypes.ts](../../../src/discovery/registryTypes.ts) | [registry.ts](../../../src/discovery/registry.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts), [themeRegistry.ts](../../../src/discovery/themeRegistry.ts) |
| [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts) | [globLoader.ts](../../../src/discovery/globLoader.ts), [registryTypes.ts](../../../src/discovery/registryTypes.ts), [themeRegistry.ts](../../../src/discovery/themeRegistry.ts), [discovery/utils.ts](../../../src/discovery/utils.ts), [barbie.theme.ts](../../../src/themes/barbie.theme.ts), [catppuccin.theme.ts](../../../src/themes/catppuccin.theme.ts), [default.theme.ts](../../../src/themes/default.theme.ts), [dracula.theme.ts](../../../src/themes/dracula.theme.ts), [monokai.theme.ts](../../../src/themes/monokai.theme.ts), [solarized.theme.ts](../../../src/themes/solarized.theme.ts), [tokyoNight.theme.ts](../../../src/themes/tokyoNight.theme.ts) | [ThemeMenu.tsx](../../../src/middleware/tools/PopoverTools/ThemeMenu.tsx) |
| [themeRegistry.ts](../../../src/discovery/themeRegistry.ts) | [registry.ts](../../../src/discovery/registry.ts), [registryTypes.ts](../../../src/discovery/registryTypes.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts), [index.ts](../../../src/themes/index.ts) |
| [discovery/utils.ts](../../../src/discovery/utils.ts) | [globLoader.ts](../../../src/discovery/globLoader.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts) |
| [barbie.theme.ts](../../../src/themes/barbie.theme.ts) | [themes/utils.ts](../../../src/themes/utils.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts) |
| [catppuccin.theme.ts](../../../src/themes/catppuccin.theme.ts) | [themes/utils.ts](../../../src/themes/utils.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts) |
| [debug.ts](../../../src/themes/debug.ts) | — | — |
| [default.theme.ts](../../../src/themes/default.theme.ts) | [themes/utils.ts](../../../src/themes/utils.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts), [index.ts](../../../src/themes/index.ts) |
| [dracula.theme.ts](../../../src/themes/dracula.theme.ts) | [themes/utils.ts](../../../src/themes/utils.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts) |
| [index.ts](../../../src/themes/index.ts) | [themeRegistry.ts](../../../src/discovery/themeRegistry.ts), [default.theme.ts](../../../src/themes/default.theme.ts) | [ThemeContext.tsx](../../../src/context/ThemeContext.tsx), [ThemeMenu.tsx](../../../src/middleware/tools/PopoverTools/ThemeMenu.tsx) |
| [monokai.theme.ts](../../../src/themes/monokai.theme.ts) | [themes/utils.ts](../../../src/themes/utils.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts) |
| [solarized.theme.ts](../../../src/themes/solarized.theme.ts) | [themes/utils.ts](../../../src/themes/utils.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts) |
| [tokyoNight.theme.ts](../../../src/themes/tokyoNight.theme.ts) | [themes/utils.ts](../../../src/themes/utils.ts) | [themeDiscovery.ts](../../../src/discovery/themeDiscovery.ts) |
| [themes/utils.ts](../../../src/themes/utils.ts) | — | [barbie.theme.ts](../../../src/themes/barbie.theme.ts), [catppuccin.theme.ts](../../../src/themes/catppuccin.theme.ts), [default.theme.ts](../../../src/themes/default.theme.ts), [dracula.theme.ts](../../../src/themes/dracula.theme.ts), [monokai.theme.ts](../../../src/themes/monokai.theme.ts), [solarized.theme.ts](../../../src/themes/solarized.theme.ts), [tokyoNight.theme.ts](../../../src/themes/tokyoNight.theme.ts) |

**Navigate:** [Index](../index.md) · [Overview](../overview.md) · [Cycles](../cycles.md) · [Dependencies](../dependencies.md)
