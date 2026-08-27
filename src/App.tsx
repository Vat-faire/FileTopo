import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import TerrainMap from "./components/TerrainMap";
import { createDemoSnapshot } from "./lib/demo";
import { resolveInitialLocale, storeLocale, type Locale } from "./lib/locale";
import type { AppHealth, CollectionSnapshot, CollectionSummary, IndexProgress, NodeDto, NodePage } from "./types";

const PAGE_SIZE = 120;

const copy = {
  fr: {
    eyebrow: "Cartographie locale de fichiers",
    title: "Votre arborescence devient un territoire.",
    intro: "Explorez la structure, le poids et les zones denses de vos dossiers sans envoyer vos données ailleurs.",
    demo: "Démonstration", fixture: "Fixture synthétique", add: "Ajouter une collection", indexNow: "Indexer maintenant", cancel: "Annuler",
    search: "Rechercher un fichier ou un dossier",
    map: "Carte topographique", index: "Index accessible",
    detail: "Niveau de détail", lessDetail: "Réduire le détail", moreDetail: "Augmenter le détail",
    demoLocal: "Démonstration locale", parallelNavigation: "Navigation parallèle", home: "accueil", sourcePicker: "Choisir une source", type: "Type", selectedSize: "Taille", children: "Enfants", root: "Racine", skipped: "Ignoré", privacyLocal: "Le contenu des fichiers n’est jamais lu pendant l’indexation.",
    nodes: "éléments", size: "volume indexé", local: "traitement local",
    selected: "Repère sélectionné",
    noSelection: "Sélectionnez un relief sur la carte ou un élément dans la liste.",
    empty: "Aucun élément ne correspond à la recherche.", loading: "Construction du territoire…",
    synthetic: "Données synthétiques seulement",
    localCollection: "Collection locale indexée", reveal: "Afficher dans l’Explorateur", diagnostics: "éléments ignorés ou illisibles",
    privacy: "Aucun contenu de fichier n’est ouvert par cette démonstration.",
    collectionReady: "Racine ajoutée. L’indexation attend votre confirmation.",
    allKinds: "Tous", kindFilter: "Type d’élément", folders: "Dossiers", files: "Fichiers", onlineOnly: "En ligne", unseenOnly: "Non vus", results: "résultats", previous: "Précédent", next: "Suivant",
  },
  en: {
    eyebrow: "Local file cartography",
    title: "Your file tree becomes a territory.",
    intro: "Explore the structure, weight, and dense areas of your folders without sending your data elsewhere.",
    demo: "Demo", fixture: "Synthetic fixture", add: "Add a collection", indexNow: "Index now", cancel: "Cancel",
    search: "Search for a file or folder",
    map: "Topographic map", index: "Accessible index",
    detail: "Detail level", lessDetail: "Reduce detail", moreDetail: "Increase detail",
    demoLocal: "Local demonstration", parallelNavigation: "Parallel navigation", home: "home", sourcePicker: "Choose a source", type: "Type", selectedSize: "Size", children: "Children", root: "Root", skipped: "Skipped", privacyLocal: "File contents are never read during indexing.",
    nodes: "items", size: "indexed volume", local: "local processing",
    selected: "Selected landmark",
    noSelection: "Select a relief on the map or an item in the list.",
    empty: "No item matches this search.", loading: "Building the territory…",
    synthetic: "Synthetic data only",
    localCollection: "Indexed local collection", reveal: "Show in File Explorer", diagnostics: "skipped or unreadable items",
    privacy: "This demonstration never opens file contents.",
    collectionReady: "Root added. Indexing is waiting for your confirmation.",
    allKinds: "All", kindFilter: "Item type", folders: "Folders", files: "Files", onlineOnly: "Online", unseenOnly: "Unseen", results: "results", previous: "Previous", next: "Next",
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
  const [locale, setLocale] = useState<Locale>(() => resolveInitialLocale());
  const [snapshot, setSnapshot] = useState<CollectionSnapshot | null>(null);
  const [health, setHealth] = useState<AppHealth | null>(null);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [indexingId, setIndexingId] = useState<string | null>(null);
  const [visitedNodes, setVisitedNodes] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"" | "directory" | "file">("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [unseenOnly, setUnseenOnly] = useState(false);
  const [remotePage, setRemotePage] = useState<NodePage | null>(null);
  const [pageOffset, setPageOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const t = copy[locale];

  // An explicit choice outranks the system language and survives restarts.
  const chooseLocale = (next: Locale) => {
    setLocale(next);
    storeLocale(next);
  };

  // Assistive technologies rely on the document language, not on the button.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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

  const persistentSnapshot = Boolean(
    snapshot && activeCollectionId && snapshot.collectionId === activeCollectionId,
  );

  useEffect(() => {
    if (!persistentSnapshot || !activeCollectionId) {
      setRemotePage(null);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      invoke<NodePage>("query_collection_nodes", {
        request: {
          collectionId: activeCollectionId,
          query,
          kind: kindFilter || null,
          onlineOnly: onlineOnly ? true : null,
          unseenOnly,
          limit: PAGE_SIZE,
          offset: pageOffset,
        },
      }).then((page) => active && setRemotePage(page)).catch(() => active && setRemotePage(null));
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [activeCollectionId, kindFilter, onlineOnly, pageOffset, persistentSnapshot, query, unseenOnly]);

  useEffect(() => {
    if (!indexingId) return;
    const timer = window.setInterval(() => {
      invoke<IndexProgress | null>("index_progress", { collectionId: indexingId })
        .then((progress) => progress && setVisitedNodes(progress.visitedNodes))
        .catch(() => undefined);
    }, 250);
    return () => window.clearInterval(timer);
  }, [indexingId]);

  useEffect(() => {
    invoke<CollectionSummary[]>("list_collections")
      .then((items) => {
        setCollections(items);
        setActiveCollectionId((current) => current ?? items[0]?.id ?? null);
      })
      .catch(() => setCollections([]));
  }, []);

  const filteredNodes = useMemo(() => {
    if (!snapshot) return [];
    const normalized = query.trim().toLocaleLowerCase(locale);
    return snapshot.nodes
      .filter((node) => node.kind !== "root")
      .filter((node) => !normalized || node.name.toLocaleLowerCase(locale).includes(normalized)
        || node.relativePath.toLocaleLowerCase(locale).includes(normalized))
      .filter((node) => !kindFilter || node.kind === kindFilter)
      .filter((node) => !onlineOnly || node.onlineOnly)
      .filter((node) => !unseenOnly || !node.seen)
      .slice(0, 120);
  }, [kindFilter, locale, onlineOnly, query, snapshot, unseenOnly]);

  const displayedNodes = remotePage?.items ?? filteredNodes;
  const snapshotLabel = snapshot?.collectionId === "fixture-demo"
    ? t.fixture
    : snapshot?.collectionId.startsWith("demo-")
      ? t.demoLocal
      : (snapshot?.name ?? "FileTopo");

  const selected = snapshot?.nodes.find((node) => node.id === selectedId)
    ?? remotePage?.items.find((node) => node.id === selectedId)
    ?? null;

  async function loadCollection(command: "demo_snapshot" | "scan_synthetic_fixture") {
    setLoading(true);
    setNotice(null);
    try {
      setRemotePage(null);
      setSnapshot(await invoke<CollectionSnapshot>(command));
    } catch {
      setSnapshot(createDemoSnapshot(command === "demo_snapshot" ? 128 : 48));
      setNotice(locale === "fr" ? "Simulation de l’aperçu Web" : "Web preview simulation");
    } finally {
      setSelectedId(null);
      setQuery("");
      setPageOffset(0);
      setLoading(false);
    }
  }

  async function chooseCollection() {
    setNotice(null);
    try {
      const created = await invoke<CollectionSummary | null>("choose_collection");
      if (!created) return;
      setCollections((current) => {
        const withoutDuplicate = current.filter((item) => item.id !== created.id);
        return [...withoutDuplicate, created];
      });
      setActiveCollectionId(created.id);
      setPageOffset(0);
      setNotice(t.collectionReady);
    } catch {
      setNotice(locale === "fr" ? "La collection n’a pas pu être ajoutée." : "The collection could not be added.");
    }
  }

  async function indexActiveCollection() {
    if (!activeCollectionId) return;
    setLoading(true);
    setIndexingId(activeCollectionId);
    setVisitedNodes(0);
    setNotice(null);
    try {
      const next = await invoke<CollectionSnapshot>("index_collection", { collectionId: activeCollectionId });
      setRemotePage(null);
      setSnapshot(next);
      const refreshed = await invoke<CollectionSummary[]>("list_collections");
      setCollections(refreshed);
    } catch (error) {
      const cancelled = String(error).includes("scan_cancelled");
      setNotice(cancelled
        ? (locale === "fr" ? "Indexation annulée sans index partiel." : "Indexing cancelled without a partial index.")
        : (locale === "fr" ? "L’indexation n’a pas pu être terminée." : "Indexing could not be completed."));
    } finally {
      setIndexingId(null);
      setLoading(false);
    }
  }

  async function cancelActiveIndexing() {
    if (!indexingId) return;
    await invoke<boolean>("cancel_indexing", { collectionId: indexingId }).catch(() => false);
    setNotice(locale === "fr" ? "Annulation en cours…" : "Cancelling…");
  }

  function selectNode(nodeId: number) {
    setSelectedId(nodeId);
    if (!persistentSnapshot || !activeCollectionId) return;
    void invoke<boolean>("mark_node_seen", { collectionId: activeCollectionId, nodeId }).catch(() => false);
    setSnapshot((current) => current ? {
      ...current,
      nodes: current.nodes.map((node) => node.id === nodeId ? { ...node, seen: true } : node),
    } : current);
    setRemotePage((current) => {
      if (!current) return current;
      if (unseenOnly) {
        return { ...current, items: current.items.filter((node) => node.id !== nodeId), total: Math.max(0, current.total - 1) };
      }
      return { ...current, items: current.items.map((node) => node.id === nodeId ? { ...node, seen: true } : node) };
    });
  }

  async function revealSelected() {
    if (!selected || !activeCollectionId || !persistentSnapshot) return;
    try {
      await invoke<boolean>("reveal_indexed_node", { collectionId: activeCollectionId, nodeId: selected.id });
    } catch {
      setNotice(locale === "fr" ? "Cet élément n’est plus disponible ou ne peut pas être affiché." : "This item is no longer available or cannot be shown.");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#main-map" aria-label={`FileTopo — ${t.home}`}>
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>FileTopo</span>
        </a>
        <div className="topbar-actions">
          <span className="privacy-chip"><span aria-hidden="true">●</span> {t.local}</span>
          <button
            className="language-button"
            type="button"
            lang={locale === "fr" ? "en" : "fr"}
            aria-label={locale === "fr" ? "Switch to English" : "Afficher l’interface en français"}
            onClick={() => chooseLocale(locale === "fr" ? "en" : "fr")}
          >
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
        <div className="hero-actions" aria-label={t.sourcePicker}>
          <button className="primary-button" type="button" onClick={() => loadCollection("demo_snapshot")}>{t.demo}</button>
          {health?.syntheticFixtureAvailable && (
            <button className="secondary-button" type="button" onClick={() => loadCollection("scan_synthetic_fixture")}>{t.fixture}</button>
          )}
          <button className="secondary-button" type="button" onClick={chooseCollection}>{t.add}</button>
        </div>
      </section>

      {collections.length > 0 && (
        <section className="collection-bar" aria-label={locale === "fr" ? "Collections locales" : "Local collections"}>
          <div className="collection-tabs">
            {collections.map((collection) => (
              <button
                key={collection.id}
                className={collection.id === activeCollectionId ? "active" : ""}
                type="button"
                onClick={() => { setActiveCollectionId(collection.id); setPageOffset(0); }}
              >
                <i style={{ background: collection.color }} />
                <span><strong>{collection.name}</strong><small>{collection.nodeCount} {t.nodes}</small></span>
              </button>
            ))}
          </div>
          <button
            className="index-button"
            type="button"
            onClick={indexingId ? cancelActiveIndexing : indexActiveCollection}
            disabled={!activeCollectionId || (loading && !indexingId)}
          >
            {indexingId ? `${t.cancel} · ${visitedNodes} ${t.nodes}` : t.indexNow}
          </button>
        </section>
      )}

      <section className="status-row" aria-live="polite">
        <div><strong>{snapshot?.nodeCount ?? "—"}</strong><span>{t.nodes}</span></div>
        <div><strong>{snapshot ? formatBytes(snapshot.totalSizeBytes, locale) : "—"}</strong><span>{t.size}</span></div>
        <div><strong>{health?.sqliteVersion ?? "local"}</strong><span>SQLite</span></div>
        <p><span aria-hidden="true">✦</span> {persistentSnapshot ? t.localCollection : t.synthetic}{snapshot?.diagnostics.length ? ` · ${snapshot.diagnostics.length} ${t.diagnostics}` : ""}{notice ? ` · ${notice}` : ""}</p>
      </section>

      <section className="workspace" id="main-map">
        <article className="map-card" aria-labelledby="map-heading">
          <div className="panel-heading">
            <div><p className="section-kicker">{snapshotLabel}</p><h2 id="map-heading">{t.map}</h2></div>
            <div className="map-legend" aria-label="Légende">
              <span><i className="legend-directory" /> {t.folders}</span>
              <span><i className="legend-file" /> {t.files}</span>
              <span><i className="legend-cloud" /> {t.onlineOnly}</span>
            </div>
          </div>
          <div className="map-stage">
            {loading || !snapshot
              ? <div className="loading-state"><span />{t.loading}</div>
              : <TerrainMap snapshot={snapshot} selectedId={selectedId} onSelect={selectNode} detailLabel={t.detail} lessDetailLabel={t.lessDetail} moreDetailLabel={t.moreDetail} />}
            <div className="north-arrow" aria-hidden="true"><span>N</span><i /></div>
          </div>
          <p className="privacy-note">{persistentSnapshot ? t.privacyLocal : t.privacy}</p>
        </article>

        <aside className="index-card" aria-labelledby="index-heading">
          <div className="panel-heading compact">
            <div><p className="section-kicker">{t.parallelNavigation}</p><h2 id="index-heading">{t.index}</h2></div>
          </div>
          <label className="search-field">
            <span aria-hidden="true">⌕</span><span className="sr-only">{t.search}</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPageOffset(0); }} placeholder={t.search} />
          </label>
          <div className="filter-row" aria-label={locale === "fr" ? "Filtres" : "Filters"}>
            <select aria-label={t.kindFilter} value={kindFilter} onChange={(event) => { setKindFilter(event.target.value as "" | "directory" | "file"); setPageOffset(0); }}>
              <option value="">{t.allKinds}</option>
              <option value="directory">{t.folders}</option>
              <option value="file">{t.files}</option>
            </select>
            <label><input type="checkbox" checked={onlineOnly} onChange={(event) => { setOnlineOnly(event.target.checked); setPageOffset(0); }} /> {t.onlineOnly}</label>
            <label><input type="checkbox" checked={unseenOnly} onChange={(event) => { setUnseenOnly(event.target.checked); setPageOffset(0); }} /> {t.unseenOnly}</label>
            {remotePage && (
              <span className="page-controls">
                <button type="button" aria-label={t.previous} disabled={remotePage.offset === 0} onClick={() => setPageOffset(Math.max(0, pageOffset - PAGE_SIZE))}>‹</button>
                <span>{remotePage.total === 0 ? 0 : remotePage.offset + 1}–{Math.min(remotePage.offset + remotePage.items.length, remotePage.total)} / {remotePage.total}</span>
                <button type="button" aria-label={t.next} disabled={remotePage.offset + remotePage.items.length >= remotePage.total} onClick={() => setPageOffset(pageOffset + PAGE_SIZE)}>›</button>
              </span>
            )}
          </div>
          <div className="node-list" role="listbox" aria-label={t.index}>
            {displayedNodes.map((node) => (
              <NodeRow key={node.id} node={node} locale={locale} selected={node.id === selectedId} onSelect={() => selectNode(node.id)} />
            ))}
            {!loading && displayedNodes.length === 0 && <p className="empty-state">{t.empty}</p>}
          </div>
          <section className="selection-card" aria-labelledby="selection-heading">
            <p id="selection-heading">{t.selected}</p>
            {selected ? (
              <div>
                <strong>{selected.name}</strong><span>{selected.relativePath || "/"}</span>
                <dl>
                  <div><dt>{t.type}</dt><dd>{selected.kind === "directory" ? t.folders : selected.kind === "file" ? t.files : selected.kind === "root" ? t.root : t.skipped}</dd></div>
                  <div><dt>{t.selectedSize}</dt><dd>{formatBytes(selected.sizeBytes, locale)}</dd></div>
                  <div><dt>{t.children}</dt><dd>{selected.childCount}</dd></div>
                </dl>
                {persistentSnapshot && selected.kind !== "skipped" && (
                  <button className="reveal-button" type="button" onClick={revealSelected}>{t.reveal}</button>
                )}
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
    <button className={`node-row${selected ? " selected" : ""}${node.seen ? "" : " unseen"}`} type="button" role="option" aria-selected={selected} onClick={onSelect}>
      <span className={`node-icon ${node.kind}`} aria-hidden="true">{node.kind === "directory" ? "◆" : "·"}</span>
      <span className="node-copy"><strong>{node.name}</strong><small>{node.relativePath}</small></span>
      <span className="node-meta">{node.onlineOnly ? "☁" : formatBytes(node.sizeBytes, locale)}</span>
    </button>
  );
}

export default App;
