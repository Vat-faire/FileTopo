import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import TerrainMap from "./components/TerrainMap";
import { createDemoSnapshot } from "./lib/demo";
import type { AppHealth, CollectionSnapshot, NodeDto } from "./types";

type Locale = "fr" | "en";

const copy = {
  fr: {
    eyebrow: "Cartographie locale de fichiers",
    title: "Votre arborescence devient un territoire.",
    intro: "Explorez la structure, le poids et les zones denses de vos dossiers sans envoyer vos données ailleurs.",
    demo: "Démonstration", fixture: "Fixture synthétique",
    search: "Rechercher un fichier ou un dossier",
    map: "Carte topographique", index: "Index accessible",
    nodes: "éléments", size: "volume indexé", local: "traitement local",
    selected: "Repère sélectionné",
    noSelection: "Sélectionnez un relief sur la carte ou un élément dans la liste.",
    empty: "Aucun élément ne correspond à la recherche.", loading: "Construction du territoire…",
    synthetic: "Données synthétiques seulement",
    privacy: "Aucun contenu de fichier n’est ouvert par cette démonstration.",
  },
  en: {
    eyebrow: "Local file cartography",
    title: "Your file tree becomes a territory.",
    intro: "Explore the structure, weight, and dense areas of your folders without sending your data elsewhere.",
    demo: "Demo", fixture: "Synthetic fixture",
    search: "Search for a file or folder",
    map: "Topographic map", index: "Accessible index",
    nodes: "items", size: "indexed volume", local: "local processing",
    selected: "Selected landmark",
    noSelection: "Select a relief on the map or an item in the list.",
    empty: "No item matches this search.", loading: "Building the territory…",
    synthetic: "Synthetic data only",
    privacy: "This demonstration never opens file contents.",
  },
} as const;

function formatBytes(bytes: number, locale: Locale) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value)} ${units[exponent]}`;
}

function App() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [snapshot, setSnapshot] = useState<CollectionSnapshot | null>(null);
  const [health, setHealth] = useState<AppHealth | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const t = copy[locale];

  useEffect(() => {
    let active = true;
    Promise.all([invoke<AppHealth>("health"), invoke<CollectionSnapshot>("demo_snapshot")])
      .then(([nextHealth, nextSnapshot]) => {
        if (!active) return;
        setHealth(nextHealth);
        setSnapshot(nextSnapshot);
      })
      .catch(() => {
        if (!active) return;
        setSnapshot(createDemoSnapshot());
        setNotice("Aperçu Web local");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filteredNodes = useMemo(() => {
    if (!snapshot) return [];
    const normalized = query.trim().toLocaleLowerCase(locale);
    return snapshot.nodes
      .filter((node) => node.kind !== "root")
      .filter((node) => !normalized || node.name.toLocaleLowerCase(locale).includes(normalized)
        || node.relativePath.toLocaleLowerCase(locale).includes(normalized))
      .slice(0, 120);
  }, [locale, query, snapshot]);

  const selected = snapshot?.nodes.find((node) => node.id === selectedId) ?? null;

  async function loadCollection(command: "demo_snapshot" | "scan_synthetic_fixture") {
    setLoading(true);
    setNotice(null);
    try {
      setSnapshot(await invoke<CollectionSnapshot>(command));
    } catch {
      setSnapshot(createDemoSnapshot(command === "demo_snapshot" ? 128 : 48));
      setNotice(locale === "fr" ? "Simulation de l’aperçu Web" : "Web preview simulation");
    } finally {
      setSelectedId(null);
      setQuery("");
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#main-map" aria-label="FileTopo — accueil">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>FileTopo</span>
        </a>
        <div className="topbar-actions">
          <span className="privacy-chip"><span aria-hidden="true">●</span> {t.local}</span>
          <button className="language-button" type="button" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>
            {locale === "fr" ? "EN" : "FR"}
          </button>
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 id="page-title">{t.title}</h1>
          <p className="intro">{t.intro}</p>
        </div>
        <div className="hero-actions" aria-label="Choisir une source synthétique">
          <button className="primary-button" type="button" onClick={() => loadCollection("demo_snapshot")}>{t.demo}</button>
          <button className="secondary-button" type="button" onClick={() => loadCollection("scan_synthetic_fixture")}>{t.fixture}</button>
        </div>
      </section>

      <section className="status-row" aria-live="polite">
        <div><strong>{snapshot?.nodeCount ?? "—"}</strong><span>{t.nodes}</span></div>
        <div><strong>{snapshot ? formatBytes(snapshot.totalSizeBytes, locale) : "—"}</strong><span>{t.size}</span></div>
        <div><strong>{health?.sqliteVersion ?? "local"}</strong><span>SQLite</span></div>
        <p><span aria-hidden="true">✦</span> {t.synthetic}{notice ? ` · ${notice}` : ""}</p>
      </section>

      <section className="workspace" id="main-map">
        <article className="map-card" aria-labelledby="map-heading">
          <div className="panel-heading">
            <div><p className="section-kicker">{snapshot?.name ?? "FileTopo"}</p><h2 id="map-heading">{t.map}</h2></div>
            <div className="map-legend" aria-label="Légende">
              <span><i className="legend-directory" /> Dossiers</span>
              <span><i className="legend-file" /> Fichiers</span>
              <span><i className="legend-cloud" /> En ligne</span>
            </div>
          </div>
          <div className="map-stage">
            {loading || !snapshot
              ? <div className="loading-state"><span />{t.loading}</div>
              : <TerrainMap snapshot={snapshot} selectedId={selectedId} onSelect={setSelectedId} />}
            <div className="north-arrow" aria-hidden="true"><span>N</span><i /></div>
          </div>
          <p className="privacy-note">{t.privacy}</p>
        </article>

        <aside className="index-card" aria-labelledby="index-heading">
          <div className="panel-heading compact">
            <div><p className="section-kicker">Navigation parallèle</p><h2 id="index-heading">{t.index}</h2></div>
          </div>
          <label className="search-field">
            <span aria-hidden="true">⌕</span><span className="sr-only">{t.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
          </label>
          <div className="node-list" role="listbox" aria-label={t.index}>
            {filteredNodes.map((node) => (
              <NodeRow key={node.id} node={node} locale={locale} selected={node.id === selectedId} onSelect={() => setSelectedId(node.id)} />
            ))}
            {!loading && filteredNodes.length === 0 && <p className="empty-state">{t.empty}</p>}
          </div>
          <section className="selection-card" aria-labelledby="selection-heading">
            <p id="selection-heading">{t.selected}</p>
            {selected ? (
              <div>
                <strong>{selected.name}</strong><span>{selected.relativePath || "/"}</span>
                <dl>
                  <div><dt>Type</dt><dd>{selected.kind}</dd></div>
                  <div><dt>Taille</dt><dd>{formatBytes(selected.sizeBytes, locale)}</dd></div>
                  <div><dt>Enfants</dt><dd>{selected.childCount}</dd></div>
                </dl>
              </div>
            ) : <span>{t.noSelection}</span>}
          </section>
        </aside>
      </section>
    </main>
  );
}

function NodeRow({ node, locale, selected, onSelect }: {
  node: NodeDto; locale: Locale; selected: boolean; onSelect: () => void;
}) {
  return (
    <button className={`node-row${selected ? " selected" : ""}`} type="button" role="option" aria-selected={selected} onClick={onSelect}>
      <span className={`node-icon ${node.kind}`} aria-hidden="true">{node.kind === "directory" ? "◆" : "·"}</span>
      <span className="node-copy"><strong>{node.name}</strong><small>{node.relativePath}</small></span>
      <span className="node-meta">{node.onlineOnly ? "☁" : formatBytes(node.sizeBytes, locale)}</span>
    </button>
  );
}

export default App;
