// Static dependency analyzer for ScoreLink.
// Uses the TypeScript compiler API already present as a devDependency.
// Writes a JSON graph to stdout.
// Usage (from anywhere): node scripts/architecture/analyze.mjs > /tmp/graph.json
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(root, 'package.json'));
const ts = require('typescript');

const toRel = (p) => path.relative(root, p).split(path.sep).join('/');
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage']);
const MODULE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css']);

// ---- inventory -------------------------------------------------------------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!EXCLUDE_DIRS.has(e.name)) walk(path.join(dir, e.name), out);
    } else {
      const ext = path.extname(e.name);
      if (MODULE_EXT.has(ext)) out.push(path.join(dir, e.name));
    }
  }
  return out;
}
const srcRoot = path.join(root, 'src');
const inventory = walk(srcRoot).map((p) => path.resolve(p)).sort();
const inventorySet = new Set(inventory);

// ---- program ---------------------------------------------------------------
const cfg = ts.getParsedCommandLineOfConfigFile(path.join(root, 'tsconfig.app.json'), {}, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (d) => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n')); },
});
const program = ts.createProgram({ rootNames: cfg.fileNames, options: cfg.options });
const checker = program.getTypeChecker();

// Minimal glob matcher ('**' and '*' only) used for import.meta.glob patterns.
function matchGlob(pattern, absFile, fromDir) {
  const target = path.resolve(fromDir, pattern);
  // Convert the glob (relative to fromDir) into a regex over absolute paths.
  const parts = target.split(path.sep);
  let re = '';
  for (const part of parts) {
    if (part === '**') re += '(?:[^/]+/)*';
    else re += part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '/';
  }
  re = '^' + re.replace(/\/$/, '') + '$';
  return new RegExp(re).test(absFile);
}

// ---- collect data ----------------------------------------------------------
const files = new Map(); // rel -> info
for (const abs of inventory) {
  files.set(toRel(abs), { id: toRel(abs), abs, exports: [], isBarrel: false });
}
const edges = new Map(); // key -> {from,to,kinds:Set,forms:Set,names:Set}
const externals = new Map(); // pkg -> Set(files)
const unresolved = [];
const viaBarrel = [];
const jsx = [];
const hookUses = [];
const globEdges = [];
const outsideScope = [];

function addEdge(from, to, kind, form, name) {
  if (from === to) return;
  const key = `${from}|${to}`;
  if (!edges.has(key)) edges.set(key, { from, to, kinds: new Set(), forms: new Set(), names: new Set() });
  const e = edges.get(key);
  e.kinds.add(kind);
  if (form) e.forms.add(form);
  if (name) e.names.add(name);
}

function resolveSpec(spec, containingAbs) {
  const r = ts.resolveModuleName(spec, containingAbs, cfg.options, ts.sys).resolvedModule;
  if (r && !r.isExternalLibraryImport) return { kind: 'local', abs: path.resolve(r.resolvedFileName) };
  if (r && r.isExternalLibraryImport) return { kind: 'external', pkg: pkgName(spec) };
  // Fallback for non-TS assets (e.g. ./index.css) that TS does not resolve.
  if (spec.startsWith('.') || spec.startsWith('@/')) {
    const base = spec.startsWith('@/') ? path.join(srcRoot, spec.slice(2)) : path.resolve(path.dirname(containingAbs), spec);
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return { kind: 'local', abs: base };
    return { kind: 'unresolved' };
  }
  return { kind: 'external', pkg: pkgName(spec) };
}
function pkgName(spec) {
  const p = spec.split('/');
  return spec.startsWith('@') ? p.slice(0, 2).join('/') : p[0];
}

function declFileOf(node) {
  let sym = checker.getSymbolAtLocation(node);
  if (!sym) return null;
  if (sym.flags & ts.SymbolFlags.Alias) {
    try { sym = checker.getAliasedSymbol(sym); } catch { return null; }
  }
  const decl = sym.declarations?.[0];
  return decl ? path.resolve(decl.getSourceFile().fileName) : null;
}

function handleSpec(fromRel, fromAbs, spec, kind, form, names, line) {
  const res = resolveSpec(spec, fromAbs);
  if (res.kind === 'external') {
    if (!externals.has(res.pkg)) externals.set(res.pkg, new Set());
    externals.get(res.pkg).add(fromRel);
    return null;
  }
  if (res.kind === 'unresolved') {
    unresolved.push({ from: fromRel, specifier: spec, line });
    return null;
  }
  const toRelPath = toRel(res.abs);
  if (!inventorySet.has(res.abs)) {
    outsideScope.push({ from: fromRel, specifier: spec, resolved: toRelPath });
    return null;
  }
  addEdge(fromRel, toRelPath, kind, form, null);
  for (const n of names) addEdge(fromRel, toRelPath, kind, form, n);
  return toRelPath;
}

for (const abs of inventory) {
  const rel = toRel(abs);
  const info = files.get(rel);
  const sf = program.getSourceFile(abs);
  let source;
  if (sf) source = sf;
  else source = ts.createSourceFile(abs, fs.readFileSync(abs, 'utf8'), ts.ScriptTarget.Latest, true,
    abs.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  if (!sf) continue; // JSON / CSS / JS are not part of the TS program; they carry no import statements we analyze

  // exports (via checker)
  const modSym = checker.getSymbolAtLocation(source);
  if (modSym) info.exports = checker.getExportsOfModule(modSym).map((s) => s.getName());

  const visit = (node) => {
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

    if (ts.isImportDeclaration(node)) {
      const spec = node.moduleSpecifier.text;
      const clause = node.importClause;
      const typeOnly = !!clause?.isTypeOnly;
      const kind = typeOnly ? 'type' : 'value';
      const forms = [];
      const names = [];
      if (!clause) forms.push('side-effect');
      if (clause?.name) { forms.push('default'); names.push(clause.name); }
      if (clause?.namedBindings) {
        if (ts.isNamespaceImport(clause.namedBindings)) forms.push('namespace');
        else { forms.push('named'); for (const el of clause.namedBindings.elements) names.push(el.name); }
      }
      const target = handleSpec(rel, abs, spec, kind, forms.join('+') || 'side-effect', names.map((n) => n.text), line);
      if (target) {
        // Barrel resolution: where does each imported symbol really live?
        for (const id of names) {
          const realFile = declFileOf(id);
          if (realFile && inventorySet.has(realFile) && toRel(realFile) !== target) {
            viaBarrel.push({ from: rel, barrel: target, to: toRel(realFile), symbol: id.text, kind });
            addEdge(rel, toRel(realFile), kind + '-via-barrel', 'resolved', id.text);
          }
        }
      }
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const spec = node.moduleSpecifier.text;
      const ec = node.exportClause;
      const form = !ec ? 'reexport-all' : ts.isNamespaceExport(ec) ? 'reexport-namespace' : 'reexport-named';
      const kind = node.isTypeOnly ? 'type' : 'reexport';
      const names = ec && ts.isNamedExports(ec) ? ec.elements.map((e) => e.name.text) : [];
      info.isBarrel = true;
      handleSpec(rel, abs, spec, kind, form, names, line);
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const arg = node.arguments[0];
        if (arg && ts.isStringLiteralLike(arg)) {
          handleSpec(rel, abs, arg.text, 'dynamic', 'dynamic-import', [], line);
        } else {
          unresolved.push({ from: rel, specifier: '<non-literal dynamic import>', line });
        }
      } else if (ts.isPropertyAccessExpression(node.expression) &&
        node.expression.expression.kind === ts.SyntaxKind.MetaProperty &&
        node.expression.name.text === 'glob') {
        const arg = node.arguments[0];
        const pats = [];
        if (arg && ts.isStringLiteralLike(arg)) pats.push(arg.text);
        if (arg && ts.isArrayLiteralExpression(arg)) for (const el of arg.elements) if (ts.isStringLiteralLike(el)) pats.push(el.text);
        for (const pat of pats) {
          const matches = inventory.filter((f) => matchGlob(pat, f, path.dirname(abs)) && f !== abs);
          for (const m of matches) {
            const to = toRel(m);
            addEdge(rel, to, 'dynamic', 'import.meta.glob', null);
            globEdges.push({ from: rel, pattern: pat, to });
          }
        }
      } else if (ts.isIdentifier(node.expression) && /^use[A-Z]/.test(node.expression.text)) {
        const to = declFileOf(node.expression);
        if (to && inventorySet.has(to) && toRel(to) !== rel) {
          hookUses.push({ from: rel, to: toRel(to), hook: node.expression.text });
          addEdge(rel, toRel(to), 'hook-use', 'hook', node.expression.text);
        }
      }
    } else if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))) {
      const tag = node.tagName;
      const tagText = tag.getText(source);
      if (/^[A-Z]/.test(tagText) || tagText.includes('.')) {
        const target = declFileOf(ts.isPropertyAccessExpression(tag) ? tag.name : tag);
        if (target && inventorySet.has(target) && toRel(target) !== rel) {
          jsx.push({ from: rel, to: toRel(target), component: tagText });
          addEdge(rel, toRel(target), 'jsx', 'component', tagText);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

// ---- reverse data, cycles --------------------------------------------------
const nodes = [...files.values()].map((f) => ({
  id: f.id, dir: path.posix.dirname(f.id), ext: path.posix.extname(f.id),
  exports: f.exports, isBarrel: f.isBarrel,
}));
const edgeList = [...edges.values()].map((e) => ({
  from: e.from, to: e.to, kinds: [...e.kinds].sort(), forms: [...e.forms].sort(), names: [...e.names].sort(),
}));

function scc(filter) {
  const adj = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edgeList) if (e.kinds.some(filter)) adj.get(e.from).push(e.to);
  let index = 0; const idx = new Map(), low = new Map(), on = new Set(), stack = [], comps = [];
  const strong = (v) => {
    idx.set(v, index); low.set(v, index); index++; stack.push(v); on.add(v);
    for (const w of adj.get(v)) {
      if (!idx.has(w)) { strong(w); low.set(v, Math.min(low.get(v), low.get(w))); }
      else if (on.has(w)) low.set(v, Math.min(low.get(v), idx.get(w)));
    }
    if (low.get(v) === idx.get(v)) {
      const comp = []; let w;
      do { w = stack.pop(); on.delete(w); comp.push(w); } while (w !== v);
      if (comp.length > 1) comps.push(comp.sort());
    }
  };
  for (const n of nodes) if (!idx.has(n.id)) strong(n.id);
  // representative cycle per component (BFS back to start within component)
  const reps = comps.map((comp) => {
    const set = new Set(comp);
    const start = comp[0];
    const parent = new Map([[start, null]]);
    const q = [start]; let cycle = null;
    while (q.length && !cycle) {
      const v = q.shift();
      for (const w of adj.get(v)) {
        if (!set.has(w)) continue;
        if (w === start) { const path = [v]; let p = v; while (parent.get(p) !== null) { p = parent.get(p); path.unshift(p); } cycle = [...path, start]; break; }
        if (!parent.has(w)) { parent.set(w, v); q.push(w); }
      }
    }
    return { members: comp, cycle };
  });
  return reps;
}

const valueCycles = scc((k) => k === 'value' || k === 'reexport');
const allCycles = scc(() => true);

const out = {
  root: root,
  stats: {
    files: nodes.length,
    filesWithImports: new Set(edgeList.map((e) => e.from)).size,
    edges: edgeList.length,
    edgesByKind: Object.fromEntries(['value', 'type', 'reexport', 'dynamic', 'hook-use', 'jsx', 'value-via-barrel', 'type-via-barrel', 'dynamic-via-barrel'].map((k) => [k, edgeList.filter((e) => e.kinds.includes(k)).length])),
    unresolved: unresolved.length,
    externalPackages: externals.size,
    cyclesStaticValue: valueCycles.length,
    cyclesAllKinds: allCycles.length,
  },
  nodes,
  edges: edgeList,
  externals: Object.fromEntries([...externals].map(([k, v]) => [k, [...v].sort()])),
  unresolved,
  viaBarrel,
  jsx,
  hookUses,
  globEdges,
  outsideScope,
  cycles: { staticValue: valueCycles, allKinds: allCycles },
};
process.stdout.write(JSON.stringify(out, null, 2));
