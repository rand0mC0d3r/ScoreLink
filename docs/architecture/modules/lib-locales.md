# Module: Library and locales

**Navigate:** [Index](../index.md) · [Overview](../overview.md) · [Stores](../stores.md) · [Dependencies](../dependencies.md)

Store factory, IndexedDB file storage, i18n loader, and locale JSON.

5 files. Cross-module edges: 6 incoming, 0 outgoing. Grey dashed nodes are files in other modules; clicking one opens that module's page.

```mermaid
flowchart LR
  subgraph sg0["src/lib"]
    n_src_lib_createLocalStorageStoreNg_tsx["createLocalStorageStoreNg.tsx"]
    n_src_lib_fileStorage_ts["fileStorage.ts"]
    n_src_lib_i18n_ts["i18n.ts"]
  end
  subgraph sg1["src/locales"]
    n_src_locales_de_json["de.json"]
    n_src_locales_en_json["en.json"]
  end
  subgraph sg2["Outside: State and hooks"]
    n_src_context_settingsStore_ts["settingsStore.ts"]
    n_src_hooks_useLocaleSync_ts["useLocaleSync.ts"]
  end
  subgraph sg3["Outside: App shell and entry"]
    n_src_main_tsx["main.tsx"]
  end
  subgraph sg4["Outside: Toolbars"]
    n_src_middleware_tools_MixedTools_LocaleToggle_tsx["LocaleToggle.tsx"]
  end
  n_src_context_settingsStore_ts --> n_src_lib_createLocalStorageStoreNg_tsx
  n_src_context_settingsStore_ts --> n_src_lib_fileStorage_ts
  n_src_context_settingsStore_ts -.-> n_src_lib_i18n_ts
  n_src_hooks_useLocaleSync_ts --> n_src_lib_i18n_ts
  n_src_lib_i18n_ts ==> n_src_locales_de_json
  n_src_lib_i18n_ts ==> n_src_locales_en_json
  n_src_main_tsx --> n_src_lib_i18n_ts
  n_src_middleware_tools_MixedTools_LocaleToggle_tsx --> n_src_lib_i18n_ts
  click n_src_lib_createLocalStorageStoreNg_tsx "../../../src/lib/createLocalStorageStoreNg.tsx" "src/lib/createLocalStorageStoreNg.tsx"
  click n_src_lib_fileStorage_ts "../../../src/lib/fileStorage.ts" "src/lib/fileStorage.ts"
  click n_src_lib_i18n_ts "../../../src/lib/i18n.ts" "src/lib/i18n.ts"
  click n_src_locales_de_json "../../../src/locales/de.json" "src/locales/de.json"
  click n_src_locales_en_json "../../../src/locales/en.json" "src/locales/en.json"
  click n_src_context_settingsStore_ts "state-hooks.md" "src/context/settingsStore.ts (module: State and hooks)"
  click n_src_hooks_useLocaleSync_ts "state-hooks.md" "src/hooks/useLocaleSync.ts (module: State and hooks)"
  click n_src_main_tsx "app-shell.md" "src/main.tsx (module: App shell and entry)"
  click n_src_middleware_tools_MixedTools_LocaleToggle_tsx "toolbars.md" "src/middleware/tools/MixedTools/LocaleToggle.tsx (module: Toolbars)"
  class n_src_context_settingsStore_ts,n_src_hooks_useLocaleSync_ts,n_src_main_tsx,n_src_middleware_tools_MixedTools_LocaleToggle_tsx ext
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
| [createLocalStorageStoreNg.tsx](../../../src/lib/createLocalStorageStoreNg.tsx) | — | [settingsStore.ts](../../../src/context/settingsStore.ts) |
| [fileStorage.ts](../../../src/lib/fileStorage.ts) | — | [settingsStore.ts](../../../src/context/settingsStore.ts) |
| [i18n.ts](../../../src/lib/i18n.ts) | [de.json](../../../src/locales/de.json), [en.json](../../../src/locales/en.json) | [settingsStore.ts](../../../src/context/settingsStore.ts), [useLocaleSync.ts](../../../src/hooks/useLocaleSync.ts), [main.tsx](../../../src/main.tsx), [LocaleToggle.tsx](../../../src/middleware/tools/MixedTools/LocaleToggle.tsx) |
| [de.json](../../../src/locales/de.json) | — | [i18n.ts](../../../src/lib/i18n.ts) |
| [en.json](../../../src/locales/en.json) | — | [i18n.ts](../../../src/lib/i18n.ts) |

**Navigate:** [Index](../index.md) · [Overview](../overview.md) · [Stores](../stores.md) · [Dependencies](../dependencies.md)
