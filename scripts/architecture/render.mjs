// Renders docs/architecture/* from the analyzer JSON.
// Usage (from anywhere):
//   node scripts/architecture/analyze.mjs > /tmp/graph.json
//   node scripts/architecture/render.mjs /tmp/graph.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const graphPath = process.argv[2];
if (!graphPath) {
  console.error('Usage: node scripts/architecture/render.mjs <graph.json>');
  process.exit(1);
}
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(REPO, 'docs/architecture');
const SETTINGS = 'src/context/settingsStore.ts';
const STORE_FACTORY = 'src/lib/createLocalStorageStoreNg.tsx';
const FILE_STORAGE = 'src/lib/fileStorage.ts';
const TYPE_EXPORTS = new Set(['LibrettoReflowSelection', 'ReflowPreviewSegment']);

const g = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const ids = g.nodes.map(n => n.id).sort();
const nodeById = new Map(g.nodes.map(n => [n.id, n]));

// ---------- labels and ids ----------
const base = p => p.split('/').pop();
const baseCount = new Map();
for (const id of ids) baseCount.set(base(id), (baseCount.get(base(id)) || 0) + 1);
const labelOf = id => (baseCount.get(base(id)) > 1 ? id.replace(/^src\//, '') : base(id));
const nid = id => 'n_' + id.replace(/[^A-Za-z0-9]/g, '_');
const esc = s => String(s).replace(/"/g, "'");

// ---------- modules ----------
const MODULES = [
  { id: 'pipeline-components', title: 'Pipeline components', icon: '🧩', test: p => p.startsWith('src/main/components/'),
    intro: 'Reusable widgets used by the four pipeline stages (pickers, page views, composer).',
    related: [['Pipeline', 'pipeline'], ['Components', 'components'], ['Stores', 'stores']] },
  { id: 'pipeline-nodes', title: 'Pipeline nodes (stages)', icon: '🚦', test: p => p.startsWith('src/main/'),
    intro: 'The pipeline router (`index.tsx`), the step buttons, and the four stage screens.',
    related: [['Pipeline', 'pipeline'], ['Stores', 'stores'], ['Components', 'components']] },
  { id: 'windows', title: 'Windows', icon: '🪟', test: p => p.startsWith('src/middleware/windows/'),
    intro: 'Overlay windows (settings, new-version notice) and the header.',
    related: [['Components', 'components'], ['Hooks', 'hooks'], ['Cycles', 'cycles']] },
  { id: 'toolbars', title: 'Toolbars', icon: '🛠️', test: p => p.startsWith('src/middleware/tools/'),
    intro: 'Toolbar buttons and popovers (theme, locale, settings toggle).',
    related: [['Components', 'components'], ['Hooks', 'hooks'], ['Cycles', 'cycles']] },
  { id: 'shared-components', title: 'Shared components', icon: '🧱', test: p => p.startsWith('src/components/'),
    intro: 'Generic UI primitives (chips, toggles, settings section).',
    related: [['Components', 'components'], ['Hooks', 'hooks']] },
  { id: 'state-hooks', title: 'State and hooks', icon: '🗄️', test: p => /^src\/(context|hooks)\//.test(p),
    intro: 'The settings store, theme context, and custom hooks.',
    related: [['Stores', 'stores'], ['Hooks', 'hooks'], ['Cycles', 'cycles']] },
  { id: 'discovery-themes', title: 'Discovery and themes', icon: '🎨', test: p => /^src\/(discovery|themes)\//.test(p),
    intro: 'Glob-based discovery of theme definitions, and the registry used to load them.',
    related: [['Cycles', 'cycles'], ['Dependencies', 'dependencies']] },
  { id: 'lib-locales', title: 'Library and locales', icon: '🌐', test: p => /^src\/(lib|locales)\//.test(p),
    intro: 'Store factory, IndexedDB file storage, i18n loader, and locale JSON.',
    related: [['Stores', 'stores'], ['Dependencies', 'dependencies']] },
  { id: 'app-shell', title: 'App shell and entry', icon: '🚀', test: () => true,
    intro: 'Entry point (`src/main.tsx`), providers, and the layout shell.',
    related: [['Overview', 'overview'], ['Cycles', 'cycles'], ['Dependencies', 'dependencies']] },
];
const moduleOf = id => MODULES.find(m => m.test(id)).id;
const modTitle = Object.fromEntries(MODULES.map(m => [m.id, m.title]));
const modOf = new Map(ids.map(id => [id, moduleOf(id)]));

// ---------- edges ----------
const fileEdges = [];
{
  const seen = new Set();
  for (const e of g.edges) {
    const k = e.from + '\u0000' + e.to;
    if (seen.has(k)) continue;
    seen.add(k);
    fileEdges.push({ from: e.from, to: e.to, kinds: e.kinds, names: e.names || [] });
  }
}
const edgesOut = new Map(ids.map(i => [i, []]));
const edgesIn = new Map(ids.map(i => [i, []]));
for (const e of fileEdges) { edgesOut.get(e.from).push(e.to); edgesIn.get(e.to).push(e.from); }
// Runtime edges: anything that is not type-only and not a dynamic import.
const runtime = e => e.kinds.some(k => k !== 'type' && k !== 'dynamic');
const arrowOf = e => (runtime(e) ? '-->' : e.kinds.includes('dynamic') ? '==>' : '-.->');

// ---------- cycles (from analyzer, SCC on static value edges) ----------
const sccs = g.cycles.staticValue.map(c => c.members);
const sccIndex = new Map();
sccs.forEach((m, i) => m.forEach(id => sccIndex.set(id, i)));
const cycleEdge = e => runtime(e) && sccIndex.has(e.from) && sccIndex.get(e.from) === sccIndex.get(e.to);
// Edge colour by import kind; a cycle edge overrides the kind colour.
const EDGE_STYLE = {
  cycle: 'stroke:#c62828,stroke-width:2px,color:#c62828',
  hook: 'stroke:#e65100,stroke-width:1.5px,color:#e65100',
  jsx: 'stroke:#2e7d32,stroke-width:1.5px,color:#2e7d32',
  dynamic: 'stroke:#6a1b9a,stroke-width:2px,color:#6a1b9a',
  reexport: 'stroke:#00838f,stroke-width:1.5px,color:#00838f',
  value: 'stroke:#37474f,stroke-width:1px',
  type: 'stroke:#9e9e9e,stroke-width:1px,color:#757575',
};
const EDGE_LEGEND = '**Edge colours:** red = circular · orange = hook use · green = JSX component · purple = dynamic `import()` or glob · teal = re-export · dark grey = value import · light grey dotted = type-only import.';
const edgeStyle = e => {
  if (cycleEdge(e)) return EDGE_STYLE.cycle;
  if (e.kinds.includes('hook-use')) return EDGE_STYLE.hook;
  if (e.kinds.includes('jsx')) return EDGE_STYLE.jsx;
  if (e.kinds.includes('dynamic')) return EDGE_STYLE.dynamic;
  if (e.kinds.includes('reexport')) return EDGE_STYLE.reexport;
  return runtime(e) ? EDGE_STYLE.value : EDGE_STYLE.type;
};

function elementaryCycles(members, edges, cap = 500) {
  const set = new Set(members);
  const adj = new Map(members.map(m => [m, []]));
  for (const e of edges) if (set.has(e.from) && set.has(e.to) && e.from !== e.to) adj.get(e.from).push(e.to);
  const out = [];
  for (const s of [...members].sort()) {
    const stack = [s];
    const onPath = new Set([s]);
    const dfs = v => {
      for (const w of adj.get(v)) {
        if (out.length >= cap) return;
        if (w === s) out.push([...stack]);
        else if (w > s && !onPath.has(w)) {
          stack.push(w); onPath.add(w);
          dfs(w);
          stack.pop(); onPath.delete(w);
        }
      }
    };
    dfs(s);
  }
  return out;
}
const cycleList = sccs.flatMap(m => elementaryCycles(m, fileEdges.filter(runtime)));

// ---------- hooks, stores, jsx, store keys ----------
const hookByEdge = new Map();
for (const h of g.hookUses) {
  const k = h.from + '\u0000' + h.to;
  if (!hookByEdge.has(k)) hookByEdge.set(k, new Set());
  hookByEdge.get(k).add(h.hook);
}
const hookNamesFor = (from, to) => [...(hookByEdge.get(from + '\u0000' + to) || [])];
const hookDefs = new Set(g.hookUses.map(h => h.to));

const storeSrc = fs.readFileSync(path.join(REPO, SETTINGS), 'utf8');
const storeKeys = [...storeSrc.match(/type SettingsStore = \{([\s\S]*?)\n\}/)[1].matchAll(/^\s+(\w+)\??:/gm)].map(m => m[1]);
const pipelineFiles = ids.filter(id => id.startsWith('src/main/'));
const keyRefs = new Map(); // key -> files
for (const k of storeKeys) {
  const re = new RegExp(`\\b${k}\\b`);
  for (const f of pipelineFiles) {
    if (re.test(fs.readFileSync(path.join(REPO, f), 'utf8'))) {
      if (!keyRefs.has(k)) keyRefs.set(k, []);
      keyRefs.get(k).push(f);
    }
  }
}

// ---------- diagram builder ----------
const CLASSDEFS = [
  'classDef mod fill:#e8f0fe,stroke:#3b6fb6,color:#000',
  'classDef ext fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:4 3,color:#333',
  'classDef store fill:#fff7e0,stroke:#b58900,color:#000',
  'classDef sym fill:#f3e8ff,stroke:#7e57c2,color:#000',
  'classDef hookdef fill:#e0f7fa,stroke:#00838f,color:#000',
  'classDef entry fill:#e6f4ea,stroke:#2e7d32,color:#000',
  'classDef pipe fill:#e3f2fd,stroke:#1565c0,color:#000',
];

const groupByDir = fileIds => {
  const m = new Map();
  for (const id of fileIds) {
    const d = id.split('/').slice(0, -1).join('/');
    if (!m.has(d)) m.set(d, []);
    m.get(d).push(id);
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([d, list]) => [d, list.sort()]);
};

function makeDiagram(fromDepth) {
  const items = new Map();
  const groups = [];
  const edges = [];
  const add = o => {
    if (!items.has(o.id)) items.set(o.id, o);
    else if (o.cls) items.get(o.id).cls = o.cls;
    return o.id;
  };
  const file = (id, cls) => add({ id: nid(id), label: labelOf(id), shape: 'rect', href: srcHref(id, fromDepth), tip: id, cls });
  const custom = (id, label, o = {}) => add({ id, label, shape: o.shape || 'rect', href: o.href, tip: o.tip || label, cls: o.cls });
  const dirGroups = (fileIds, cls, prefix = '') => {
    for (const [d, list] of groupByDir(fileIds)) {
      groups.push({ title: prefix + d, ids: list.map(i => file(i, cls && cls(i))) });
    }
  };
  const group = (title, nodeIds) => groups.push({ title, ids: nodeIds });
  const link = (from, to, o = {}) => edges.push({ from, to, arrow: o.arrow || '-->', label: o.label, style: o.style || (o.hl ? EDGE_STYLE.cycle : null) });
  const render = () => {
    const out = ['flowchart LR'];
    const inGroup = new Set();
    groups.forEach((gp, i) => {
      out.push(`  subgraph sg${i}["${esc(gp.title)}"]`);
      for (const n of gp.ids) {
        if (inGroup.has(n)) continue;
        inGroup.add(n);
        out.push('    ' + decl(items.get(n)));
      }
      out.push('  end');
    });
    for (const [id, it] of items) if (!inGroup.has(id)) out.push('  ' + decl(it));
    const byStyle = new Map();
    edges.forEach((e, i) => {
      out.push(`  ${e.from} ${e.arrow}${e.label ? `|"${esc(e.label)}"|` : ''} ${e.to}`);
      if (e.style) byStyle.set(e.style, [...(byStyle.get(e.style) || []), i]);
    });
    for (const [id, it] of items) if (it.href) out.push(`  click ${id} "${it.href}" "${esc(it.tip)}"`);
    const byCls = {};
    for (const [id, it] of items) if (it.cls) (byCls[it.cls] ||= []).push(id);
    for (const c of Object.keys(byCls)) out.push(`  class ${byCls[c].join(',')} ${c}`);
    for (const [style, idxs] of byStyle) out.push(`  linkStyle ${idxs.join(',')} ${style}`);
    out.push(...CLASSDEFS.map(c => '  ' + c));
    return out.join('\n');
  };
  return { file, custom, dirGroups, group, link, render, items, edges, groups };
}

function decl(it) {
  return it.shape === 'db' ? `${it.id}[("${esc(it.label)}")]` : `${it.id}["${esc(it.label)}"]`;
}

// ---------- paths ----------
function srcHref(id, fromDepth) {
  return (fromDepth === 'root' ? '../../' : '../../../') + id;
}
function rel(fromDepth, target) {
  if (fromDepth === 'root') return `${target}.md`;
  return target.startsWith('modules/') ? `${target.slice(8)}.md` : `../${target}.md`;
}
const srcLink = (id, fromDepth) => `[${labelOf(id)}](${srcHref(id, fromDepth)})`;

function navLine(page) {
  const d = page.depth;
  const links = [['Index', 'index'], ['Overview', 'overview'], ...(page.related || [])]
    .filter(([, s]) => s !== page.slug)
    .map(([label, s]) => `[${label}](${rel(d, s)})`);
  return `**Navigate:** ${links.join(' · ')}`;
}

const pages = [];
const writePage = p => {
  const mdPath = path.join(OUT, p.slug + '.md');
  fs.mkdirSync(path.dirname(mdPath), { recursive: true });
  const nav = navLine(p);
  const parts = [`# ${p.title}`, '', nav, '', p.intro || '', ''];
  if (p.diagram) parts.push('```mermaid', p.diagram, '```', '');
  if (p.notes) parts.push(p.notes, '');
  parts.push(nav, '');
  fs.writeFileSync(mdPath, parts.join('\n'));
  if (p.diagram && p.mmd !== false) fs.writeFileSync(path.join(OUT, p.slug + '.mmd'), p.diagram + '\n');
  pages.push(p);
};

// ---------- 1. dependencies (full file-level graph) ----------
{
  const d = makeDiagram('root');
  d.dirGroups(ids);
  for (const e of fileEdges) d.link(nid(e.from), nid(e.to), { arrow: arrowOf(e), style: edgeStyle(e) });
  const cyc = fileEdges.filter(cycleEdge).length;
  writePage({
    slug: 'dependencies', depth: 'root', title: 'File dependency graph',
    related: [['Index', 'index'], ['Cycles', 'cycles'], ['Components', 'components'], ['Hooks', 'hooks'], ['Stores', 'stores'], ['Pipeline', 'pipeline']],
    intro: `All ${ids.length} analysed files (grouped by directory) and ${fileEdges.length} file-level edges. Red edges are part of a circular dependency (${cyc} edges). Per-module views with reverse dependencies are in the [module pages](./modules/).`,
    diagram: d.render(),
    notes: [
      '**Legend:** solid = runtime import (value, re-export, JSX, hook use) · dotted = type-only import · thick = dynamic `import()` or glob-expanded import.',
      '',
      EDGE_LEGEND,
      '',
      '**Dynamic and glob imports:**',
      '',
      '| Importing file | Pattern | Resolved to |',
      '|---|---|---|',
      ...g.globEdges.map(e => `| ${srcLink(e.from, 'root')} | \`${e.pattern}\` | ${srcLink(e.to, 'root')} |`),
      '',
      '**Barrel files:** `src/discovery/registryTypes.ts` re-exports `./registry` (`export *`). No consumer imports a symbol through it, so no barrel-resolved edges exist in this repository.',
    ].join('\n'),
  });
}

// ---------- 2. components (JSX usage) ----------
{
  const jsxEdges = fileEdges.filter(e => e.kinds.includes('jsx'));
  const d = makeDiagram('root');
  const involved = [...new Set(jsxEdges.flatMap(e => [e.from, e.to]))];
  d.dirGroups(involved);
  for (const e of jsxEdges) d.link(nid(e.from), nid(e.to), { style: edgeStyle(e) });
  const rows = [...new Map(g.jsx.map(j => [j.from + '|' + j.to + '|' + j.component, j])).values()]
    .sort((a, b) => a.from.localeCompare(b.from) || a.component.localeCompare(b.component));
  writePage({
    slug: 'components', depth: 'root', title: 'React component dependencies',
    related: [['Dependencies', 'dependencies'], ['Hooks', 'hooks'], ['Overview', 'overview']],
    intro: `Component-to-component usage in JSX: ${jsxEdges.length} file pairs, ${rows.length} distinct component usages.`,
    diagram: d.render(),
    notes: [
      '<details><summary>Component usage table</summary>', '',
      '| Used in | Component | Defined in |', '|---|---|---|',
      ...rows.map(r => `| ${srcLink(r.from, 'root')} | \`${r.component}\` | ${srcLink(r.to, 'root')} |`),
      '', '</details>',
    ].join('\n'),
  });
}

// ---------- 3. hooks ----------
{
  const hookEdges = fileEdges.filter(e => hookNamesFor(e.from, e.to).length);
  const d = makeDiagram('root');
  const involved = [...new Set(hookEdges.flatMap(e => [e.from, e.to]))];
  d.dirGroups(involved, id => (hookDefs.has(id) ? 'hookdef' : undefined));
  for (const e of hookEdges) d.link(nid(e.from), nid(e.to), { label: hookNamesFor(e.from, e.to).sort().join(', '), style: edgeStyle(e) });
  const defs = g.hookUses.length ? [...new Set(g.hookUses.map(h => h.hook))].sort() : [];
  writePage({
    slug: 'hooks', depth: 'root', title: 'Custom hooks',
    related: [['Stores', 'stores'], ['Components', 'components'], ['Overview', 'overview']],
    intro: `Custom hook definitions and their consumers. Hook definitions are shown in cyan. ${defs.length} hooks are used across ${hookEdges.length} consumer→definition pairs.`,
    diagram: d.render(),
    notes: [
      '| Hook | Defined in | Consumers |', '|---|---|---|',
      ...defs.map(h => {
        const defFile = g.hookUses.find(x => x.hook === h).to;
        const consumers = [...new Set(g.hookUses.filter(x => x.hook === h).map(x => x.from))].sort();
        return `| \`${h}\` | ${srcLink(defFile, 'root')} | ${consumers.map(c => srcLink(c, 'root')).join(', ')} |`;
      }),
    ].join('\n'),
  });
}

// ---------- 4. stores ----------
{
  const exportsOf = nodeById.get(SETTINGS).exports.filter(x => !TYPE_EXPORTS.has(x));
  const d = makeDiagram('root');
  const storeFiles = [SETTINGS, STORE_FACTORY, FILE_STORAGE];
  const storeNodes = storeFiles.map(f => d.file(f, 'store'));
  d.group('State store (src/context, src/lib)', storeNodes);
  const sym = name => d.custom(`s_${name}`, name, { cls: 'sym', tip: `${SETTINGS} export ${name}` });
  const symGroups = {
    'Selectors and hooks': exportsOf.filter(x => /^use/.test(x)),
    'Actions': exportsOf.filter(x => /^(get|set|export|import|persist)/.test(x) && x !== 'getReflowPreviewSegments'),
    'Provider and helpers': exportsOf.filter(x => x === 'SettingsProvider' || x === 'getReflowPreviewSegments'),
  };
  for (const [title, names] of Object.entries(symGroups)) {
    d.group(`${title} (${SETTINGS.split('/').pop()})`, names.map(sym));
    for (const n of names) d.link(nid(SETTINGS), sym(n), { arrow: '-->' });
  }
  const ls = d.custom('st_localstorage', 'localStorage (settings)', { shape: 'db', cls: 'store' });
  const idb = d.custom('st_indexeddb', 'IndexedDB (PDF files)', { shape: 'db', cls: 'store' });
  d.link(nid(STORE_FACTORY), ls, { arrow: '-->' });
  d.link(nid(FILE_STORAGE), idb, { arrow: '-->' });
  for (const e of fileEdges) if (storeFiles.includes(e.from) && storeFiles.includes(e.to)) d.link(nid(e.from), nid(e.to), { arrow: arrowOf(e) });
  const consumers = [...new Set(fileEdges.filter(e => e.to === SETTINGS && e.from !== SETTINGS).map(e => e.from))];
  const exportSet = new Set(exportsOf);
  d.dirGroups(consumers.filter(c => !storeFiles.includes(c)));
  for (const e of fileEdges.filter(x => x.to === SETTINGS && x.from !== SETTINGS)) {
    const names = [...new Set([...e.names, ...hookNamesFor(e.from, e.to)])].filter(n => exportSet.has(n));
    if (!names.length) d.link(nid(e.from), nid(SETTINGS), { arrow: arrowOf(e) });
    for (const n of names) d.link(nid(e.from), sym(n), { arrow: arrowOf(e) });
  }
  const keyRows = storeKeys.map(k => `| \`${k}\` | ${(keyRefs.get(k) || []).map(f => srcLink(f, 'root')).join(', ') || '—'} |`);
  writePage({
    slug: 'stores', depth: 'root', title: 'State stores',
    related: [['Hooks', 'hooks'], ['Pipeline', 'pipeline'], ['Overview', 'overview']],
    intro: 'One store: `settingsStore` (created by `createLocalStorageStoreNg`). Persistence is `localStorage`; PDFs go to IndexedDB through `fileStorage`. Symbols are exports of `settingsStore.ts`; consumer edges point at the symbols they import.',
    diagram: d.render(),
    notes: [
      '**Store keys** (`SettingsStore` type) and the pipeline files that reference them (name-based, direction not verified):', '',
      '| Key | Referenced in |', '|---|---|', ...keyRows,
    ].join('\n'),
  });
}

// ---------- 5. pipeline ----------
{
  const d = makeDiagram('root');
  const pipeSet = new Set(pipelineFiles);
  const related = new Set();
  for (const e of fileEdges) {
    if (pipeSet.has(e.from) || pipeSet.has(e.to)) {
      related.add(e.from); related.add(e.to);
    }
  }
  d.dirGroups([...related].filter(f => !pipeSet.has(f)), undefined, 'Shared dependencies: ');
  d.dirGroups([...pipeSet]);
  for (const e of fileEdges) if (pipeSet.has(e.from) || pipeSet.has(e.to)) d.link(nid(e.from), nid(e.to), { arrow: arrowOf(e) });
  const keyNodes = [];
  for (const [k, files] of keyRefs) {
    const kid = d.custom(`k_${k}`, `settings.${k}`, { cls: 'store' });
    keyNodes.push(kid);
    for (const f of files) d.link(nid(f), kid, { arrow: '-.->' });
  }
  d.group('Settings keys shared by pipeline', keyNodes);
  const stageRows = [
    ['0', 'Load PDF', 'src/main/firstStage.tsx'],
    ['1', 'Split In page', 'src/main/secondStage.tsx'],
    ['2', 'Add Libretto', 'src/main/thirdStage.tsx'],
    ['3', 'Review', 'src/main/fourthStage.tsx'],
  ];
  writePage({
    slug: 'pipeline', depth: 'root', title: 'Pipeline',
    related: [['Pipeline nodes', 'modules/pipeline-nodes'], ['Pipeline components', 'modules/pipeline-components'], ['Stores', 'stores'], ['Overview', 'overview']],
    intro: `The pipeline is a four-step flow driven by \`pipelineStep\` in the settings store. \`src/main/index.tsx\` renders one stage per step value. Edges show imports; dashed edges show settings keys referenced by a pipeline file.`,
    diagram: d.render(),
    notes: [
      '| Step | Label | Stage file |', '|---|---|---|',
      ...stageRows.map(([s, l, f]) => `| ${s} | ${l} | ${srcLink(f, 'root')} |`),
      '',
      'Note: `src/main/GdeltNews15Min.tsx` is untracked and `src/main/firstStage.tsx` has uncommitted changes in the working tree; both are included.',
    ].join('\n'),
  });
}

// ---------- 6. module diagrams ----------
const moduleStats = {};
for (const m of MODULES) {
  const members = ids.filter(id => modOf.get(id) === m.id);
  const memberSet = new Set(members);
  const touching = fileEdges.filter(e => memberSet.has(e.from) || memberSet.has(e.to));
  const external = [...new Set(touching.flatMap(e => [e.from, e.to]))].filter(id => !memberSet.has(id));
  const incoming = fileEdges.filter(e => !memberSet.has(e.from) && memberSet.has(e.to)).length;
  const outgoing = fileEdges.filter(e => memberSet.has(e.from) && !memberSet.has(e.to)).length;
  moduleStats[m.id] = { files: members.length, incoming, outgoing };
  const d = makeDiagram('module');
  d.dirGroups(members, id => (hookDefs.has(id) ? 'hookdef' : undefined));
  const extByMod = new Map();
  for (const x of external) {
    const mo = modOf.get(x);
    if (!extByMod.has(mo)) extByMod.set(mo, []);
    extByMod.get(mo).push(x);
  }
  for (const [mo, list] of extByMod) {
    const nodes = list.sort().map(x => d.file(x, 'ext'));
    // Point external files at their module page.
    for (const x of list) {
      const it = d.items.get(nid(x));
      it.href = rel('module', `modules/${mo}`);
      it.tip = `${x} (module: ${modTitle[mo]})`;
    }
    d.group(`Outside: ${modTitle[mo]}`, nodes);
  }
  for (const e of touching) d.link(nid(e.from), nid(e.to), { arrow: arrowOf(e), hl: cycleEdge(e) });
  const rows = members.map(id => {
    const imps = edgesOut.get(id).map(x => srcLink(x, 'module'));
    const impBy = edgesIn.get(id).map(x => srcLink(x, 'module'));
    return `| ${srcLink(id, 'module')} | ${imps.join(', ') || '—'} | ${impBy.join(', ') || '—'} |`;
  });
  writePage({
    slug: `modules/${m.id}`, depth: 'module', title: `Module: ${m.title}`,
    related: m.related,
    intro: `${m.intro}\n\n${members.length} files. Cross-module edges: ${incoming} incoming, ${outgoing} outgoing. Grey dashed nodes are files in other modules; clicking one opens that module's page.`,
    diagram: d.render(),
    notes: [
      '**Imports and reverse dependencies (file level):**', '',
      '| File | Imports | Imported by |', '|---|---|---|',
      ...rows,
    ].join('\n'),
  });
}

// ---------- 7. overview ----------
{
  const d = makeDiagram('root');
  const modNode = m => {
    return d.custom(`m_${m.id.replace(/-/g, '_')}`, `${m.icon} ${m.title} (${moduleStats[m.id].files})`, { href: rel('root', `modules/${m.id}`), tip: m.title, cls: 'mod' });
  };
  const nodes = Object.fromEntries(MODULES.map(m => [m.id, modNode(m)]));
  const storeLs = d.custom('ov_localstorage', 'localStorage: settings', { shape: 'db', cls: 'store', href: rel('root', 'stores'), tip: 'Settings store' });
  const storeIdb = d.custom('ov_indexeddb', 'IndexedDB: PDF files', { shape: 'db', cls: 'store', href: rel('root', 'stores'), tip: 'PDF storage' });
  const entry = nodes['app-shell'];
  d.group('Entry', [entry]);
  d.group('Pipeline', [nodes['pipeline-nodes'], nodes['pipeline-components']]);
  d.group('Shell UI', [nodes['windows'], nodes['toolbars'], nodes['shared-components']]);
  d.group('State and data', [nodes['state-hooks'], nodes['discovery-themes'], nodes['lib-locales'], storeLs, storeIdb]);
  const modPairs = new Map();
  for (const e of fileEdges) {
    const a = modOf.get(e.from), b = modOf.get(e.to);
    if (a === b) continue;
    const k = a + '|' + b;
    if (!modPairs.has(k)) modPairs.set(k, { a, b, arrow: '-.->', hl: false });
    const p = modPairs.get(k);
    if (runtime(e)) p.arrow = '-->';
    if (cycleEdge(e)) p.hl = true;
  }
  for (const p of modPairs.values()) d.link(nodes[p.a], nodes[p.b], { arrow: p.arrow, hl: p.hl });
  d.link(nodes['state-hooks'], storeLs);
  d.link(nodes['lib-locales'], storeIdb);

  const rows = MODULES.map(m => `| [${m.title}](${rel('root', `modules/${m.id}`)}) | ${moduleStats[m.id].files} | ${moduleStats[m.id].incoming} | ${moduleStats[m.id].outgoing} | ${m.intro} |`);
  writePage({
    slug: 'overview', depth: 'root', title: 'Architecture overview',
    related: [['Dependencies', 'dependencies'], ['Complete map', 'all'], ['Components', 'components'], ['Hooks', 'hooks'], ['Stores', 'stores'], ['Pipeline', 'pipeline'], ['Cycles', 'cycles']],
    intro: `High-level view. Entry point: [src/main.tsx](${srcHref('src/main.tsx', 'root')}) mounts providers and the layout shell. Red edges are part of a circular dependency between modules.`,
    diagram: d.render(),
    notes: [
      '**Modules** (click to open each diagram):', '',
      '| Module | Files | In | Out | Purpose |', '|---|---|---|---|---|',
      ...rows,
      '',
      '**Major data flows:** the settings store (`localStorage`) drives `pipelineStep` and the pipeline stages; PDF files are kept in IndexedDB; theme definitions are discovered through globs and loaded into the theme context.',
    ].join('\n'),
  });
}

// ---------- 7b. complete map (all files and edges, with roles marked) ----------
{
  const d = makeDiagram('root');
  const storeFiles = new Set(['src/context/settingsStore.ts', 'src/lib/fileStorage.ts'].filter(id => ids.includes(id)));
  const roleOf = id => {
    if (id === 'src/main.tsx') return 'entry';
    if (storeFiles.has(id)) return 'store';
    if (pipelineFiles.includes(id)) return 'pipe';
    if (hookDefs.has(id)) return 'hookdef';
    return undefined;
  };
  for (const m of MODULES) {
    const members = ids.filter(id => modOf.get(id) === m.id);
    if (members.length) d.group(`${m.icon} ${m.title} (${members.length})`, members.map(id => d.file(id, roleOf(id))));
  }
  for (const e of fileEdges) d.link(nid(e.from), nid(e.to), { arrow: arrowOf(e), style: edgeStyle(e) });
  writePage({
    slug: 'all', depth: 'root', title: 'Complete architecture map',
    related: [['Overview', 'overview'], ['Dependencies', 'dependencies'], ['Components', 'components'], ['Hooks', 'hooks'], ['Stores', 'stores'], ['Pipeline', 'pipeline'], ['Cycles', 'cycles']],
    intro: `Single large map of all ${ids.length} analysed files and ${fileEdges.length} file-level edges, combining the component, hook, store, and pipeline views. Use the focused pages for detail.`,
    diagram: d.render(),
    notes: [
      '**Roles:** green = entry point (`src/main.tsx`) · amber = store and persistence files · blue = pipeline files (`src/main/`) · cyan = custom hook definitions.',
      '',
      '**Groups:** one subgraph per functional module, the same modules as the [module pages](./modules/).',
      '',
      EDGE_LEGEND,
      '',
      '**Line styles:** solid = runtime import · dotted = type-only import · thick = dynamic `import()` or glob-expanded import.',
    ].join('\n'),
  });
}

// ---------- 8. cycles ----------
{
  const members = sccs.flat();
  const memberSet = new Set(members);
  const d = makeDiagram('root');
  d.dirGroups(members);
  const cEdges = fileEdges.filter(e => cycleEdge(e));
  for (const e of cEdges) d.link(nid(e.from), nid(e.to), { hl: true });
  const cycleLines = cycleList.map((c, i) => {
    const path = [...c, c[0]];
    return `${i + 1}. ${path.map(x => `\`${labelOf(x)}\``).join(' → ')}`;
  });
  writePage({
    slug: 'cycles', depth: 'root', title: 'Circular dependencies', mmd: false,
    related: [['Dependencies', 'dependencies'], ['Overview', 'overview'], ['Index', 'index']],
    intro: `${sccs.length} strongly connected component(s), ${members.length} files, ${cEdges.length} edges inside the cycle. ${cycleList.length} elementary cycle(s) are listed below. Red edges are part of a cycle.`,
    diagram: d.render(),
    notes: [
      '**Elementary cycles** (runtime edges: value, JSX, re-export, hook use; type-only and dynamic imports excluded):', '',
      ...cycleLines,
      '',
      '**Root cause:** [src/hooks/utils.ts](../../src/hooks/utils.ts) line 1 imports `debug` from `@/main`. `@/main` resolves to [src/main.tsx](../../src/main.tsx) (file match wins over the `src/main/` directory), and `src/main.tsx` imports the layout shell, which reaches back to `hooks/utils.ts` through the windows, toolbars, and theme discovery.',
      '',
      '**Suggestion (not applied; source is not modified):** move `debug` into a module with no UI imports (for example `src/lib/debug.ts`) and re-export it from `main.tsx` if other code needs `@/main`. This removes the edge from `hooks/utils.ts` to the app shell.',
    ].join('\n'),
  });
}

// ---------- 9. index ----------
{
  const modRows = MODULES.map(m => `| [${m.title}](${rel('root', `modules/${m.id}`)}) | ${moduleStats[m.id].files} | ${m.intro} |`);
  const byKind = g.stats.edgesByKind;
  const extNames = Object.keys(g.externals).sort();
  const elementary = cycleList.length;
  const page = {
    slug: 'index', depth: 'root', title: 'Architecture explorer', related: [],
    intro: 'Start here. Every page links back to this index. Diagrams are generated from source imports and exports, not from file names.',
    notes: [
      '## Diagrams', '',
      '| Diagram | What it shows |', '|---|---|',
      `| [Overview](${rel('root', 'overview')}) | Entry point, modules, module relationships, state and storage boundaries, data flows. |`,
      `| [Complete map](${rel('root', 'all')}) | Every file and edge in one map, with entry, store, pipeline, and hook roles marked. |`,
      `| [File dependencies](${rel('root', 'dependencies')}) | All ${ids.length} files and ${fileEdges.length} edges, grouped by directory. |`,
      `| [React components](${rel('root', 'components')}) | JSX component usage between files. |`,
      `| [Hooks](${rel('root', 'hooks')}) | Custom hook definitions and consumers. |`,
      `| [Stores](${rel('root', 'stores')}) | The settings store, its exports, consumers, and keys. |`,
      `| [Pipeline](${rel('root', 'pipeline')}) | Pipeline stages, shared components, and settings keys. |`,
      `| [Circular dependencies](${rel('root', 'cycles')}) | ${sccs.length} cycle component(s), ${elementary} elementary cycle(s). |`,
      '',
      '## Module diagrams', '',
      '| Module | Files | Purpose |', '|---|---|---|',
      ...modRows,
      '',
      '## Analysis summary', '',
      `- Files analysed: ${g.stats.files} (${g.stats.filesWithImports} with imports), under \`src/\`.`,
      `- File-level dependency edges: ${fileEdges.length} (value ${byKind.value}, type-only ${byKind.type}, re-export ${byKind.reexport}, dynamic ${byKind.dynamic}, JSX ${byKind.jsx}, hook use ${byKind['hook-use']}).`,
      `- Glob-expanded imports: ${g.globEdges.length} (theme and locale loaders).`,
      `- Barrel-resolved edges: ${g.stats.edgesByKind['value-via-barrel'] + g.stats.edgesByKind['type-via-barrel'] + g.stats.edgesByKind['dynamic-via-barrel']}.`,
      `- Circular dependencies: ${sccs.length} static-value cycle component(s) with ${sccs.flat().length} files; ${elementary} elementary cycle(s). See [Circular dependencies](${rel('root', 'cycles')}).`,
      `- Unresolved imports: ${g.unresolved.length}.`,
      `- External packages: ${extNames.length} (${extNames.join(', ')}).`,
      '',
      '## Discrepancies and limitations', '',
      '- No existing `docs/architecture/` content existed at analysis time, so there was nothing to reconcile.',
      '- Analysis covers the working tree: `src/main/firstStage.tsx` has an uncommitted edit, and `src/main/GdeltNews15Min.tsx` is untracked.',
      '- `@/main` resolves to `src/main.tsx`, not `src/main/index.tsx`. This is the source of the main cycle (see [cycles](' + rel('root', 'cycles') + ')).',
      '- Files outside `src/` (`vite.config.ts`, `eslint.config.js`, `scripts/`, `sw.js`) are not in the graph.',
      '- Settings-key references on the pipeline and store pages are name-based and do not verify read versus write direction.',
      '',
      '## Viewing locally', '',
      '1. Open this file (`docs/architecture/index.md`) in an editor preview or on GitHub. The `.md` pages embed the Mermaid diagrams in fenced `mermaid` blocks.',
      '2. In VS Code, the built-in Markdown preview does not render Mermaid. Install a Mermaid-capable Markdown preview extension, then open the preview (Ctrl+Shift+V).',
      '3. The `.mmd` files hold the same diagram source for Mermaid Live Editor (https://mermaid.live) or `npx -y @mermaid-js/mermaid-cli -i overview.mmd -o overview.svg`, which needs no change to the repo.',
      '4. Mermaid `click` links need an interactive renderer. Use the Navigate links at the top and bottom of each page when clicks are disabled.',
      '5. Regenerate after source changes, from the repo root: `node scripts/architecture/analyze.mjs > /tmp/graph.json && node scripts/architecture/render.mjs /tmp/graph.json`.',
    ].join('\n'),
  };
  writePage(page);
}

console.log(`pages written: ${pages.length}`);
