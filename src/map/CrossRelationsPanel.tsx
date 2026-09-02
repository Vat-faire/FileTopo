import type {
  BrainNodeRef,
  CrossSuggestionEdge,
  NodeCrossRelationEntry,
  NodeCrossRelations,
  RelationProvenance,
} from "./types";
import { PROVENANCE_LABELS, relationTypeLabel } from "./relations";
import { crossEntryKey, groupCrossByType, otherEndIsDisplayed } from "./crossRelations";

/**
 * The inter-brain relations panel — `TASK-0020` §4.7, criterion `M7`.
 *
 * A **separate section**, not a fifth group inside the intra-brain one. That is
 * the criterion: « le panneau distingue interne / inter-cerveaux », and the
 * surest way for two things to stay distinguishable is for them never to be
 * rendered by the same component.
 *
 * Four things are true of every entry here, and each one is frozen:
 *
 * * **Both brains are named, in words.** Not an id, not a colour: « Cerveau
 *   Alpha → Cerveau Gamma ». `M7` asks for source brain and target brain, and a
 *   reader must not have to know that `brain-gamma` is the orange one.
 * * **Direction is a grouping, not a hint.** Outgoing and incoming come from
 *   two separate queries; neither is derived from the other.
 * * **Provenance is on screen**, in words. For a `DETERMINISTIC` relation the
 *   rule and version are consultable in the same place; for an `APPROVED` one
 *   the panel says an explicit approval created it and **invents no rule**.
 * * **A target that is not displayed is said so**, in words — « hors de la
 *   vue » — and stays activable. `M9` turns that activation into a navigation:
 *   the brain joins the composition and the endpoint is selected. It creates,
 *   modifies and approves **nothing**.
 *
 * Every entry is a `<button>`: reachable by keyboard because it is a button,
 * not because a key handler was bolted on. `M8` and `M9` press them for real.
 */

interface CrossRelationsPanelProps {
  relations: NodeCrossRelations | null;
  loading: boolean;
  /** The composition, so the panel can say what is on screen and what is not. */
  displayedBrainIds: readonly string[];
  /** Navigation. Adds the brain to the view when it is not displayed. */
  onNavigate: (target: BrainNodeRef | { brainId: string; endpointKey: string }) => void;
  onApprove: (suggestionKey: string) => void;
  approving: string | null;
}

function ProvenanceBadge({ provenance }: { provenance: RelationProvenance }) {
  const glyph = provenance === "DETERMINISTIC" ? "◆" : "●";
  return (
    <span className={`relation__provenance relation__provenance--${provenance.toLowerCase()}`}>
      <span aria-hidden="true">{glyph}</span> {PROVENANCE_LABELS[provenance]}
    </span>
  );
}

/** The other brain, named — never an identifier, never a colour alone. */
function BrainTag({
  icon,
  displayName,
  displayed,
}: {
  icon: string;
  displayName: string;
  displayed: boolean;
}) {
  return (
    <span className="cross-relation__brain">
      <span aria-hidden="true">{icon}</span> {displayName}
      {displayed ? null : (
        <span className="cross-relation__offscreen"> — hors de la vue</span>
      )}
    </span>
  );
}

function CrossEntryRow({
  entry,
  selfBrainName,
  displayedBrainIds,
  onNavigate,
}: {
  entry: NodeCrossRelationEntry;
  selfBrainName: string;
  displayedBrainIds: readonly string[];
  onNavigate: CrossRelationsPanelProps["onNavigate"];
}) {
  const displayed = otherEndIsDisplayed(entry, displayedBrainIds);
  const outgoing = entry.direction === "outgoing";
  // Source and target, spelled out in the reading order of the relation rather
  // than in the order of the panel's sections: an incoming relation reads
  // « Gamma → ce nœud », and reversing that on screen would be inventing an
  // inverse in the one place a reader would believe it.
  const sourceName = outgoing ? selfBrainName : entry.other.brainDisplayName;
  const targetName = outgoing ? entry.other.brainDisplayName : selfBrainName;

  return (
    <li className="cross-relation">
      <button
        type="button"
        className="relation__link cross-relation__link"
        // Everything a scenario needs to check `M7`, `M8` and `M9` read off the
        // control that is actually activated — never reconstructed from an
        // ordering the panel happens to use.
        data-cross-entry="true"
        data-endpoint-key={entry.other.key}
        data-endpoint-brain-id={entry.other.brainId}
        data-endpoint-node-id={entry.other.nodeId ?? ""}
        data-endpoint-displayed={displayed ? "true" : "false"}
        data-direction={entry.direction}
        data-provenance={entry.provenance}
        data-relation-type={entry.relationType}
        data-source-brain-id={outgoing ? "self" : entry.other.brainId}
        data-target-brain-id={outgoing ? entry.other.brainId : "self"}
        // The accessible name carries the whole claim, so a screen reader hears
        // « inter-cerveaux », the direction and the provenance without seeing a
        // single colour.
        aria-label={
          `relation inter-cerveaux ${outgoing ? "sortante" : "entrante"}, ` +
          `de ${sourceName} vers ${targetName}, ` +
          `${relationTypeLabel(entry.relationType)}, ` +
          `provenance ${PROVENANCE_LABELS[entry.provenance]}, ` +
          `nœud ${entry.other.name}` +
          (displayed ? "" : `, cerveau ${entry.other.brainDisplayName} hors de la vue`)
        }
        onClick={() =>
          onNavigate(
            entry.other.nodeId !== null && displayed
              ? { brainId: entry.other.brainId, nodeId: entry.other.nodeId }
              : { brainId: entry.other.brainId, endpointKey: entry.other.key },
          )
        }
      >
        <span className="relation__direction" aria-hidden="true">
          {outgoing ? "→" : "←"}
        </span>
        <span className="cross-relation__endpoints" aria-hidden="true">
          {sourceName} <span className="cross-relation__arrow">⇒</span> {targetName}
        </span>
        <span className="relation__name">{entry.other.name}</span>
        <ProvenanceBadge provenance={entry.provenance} />
      </button>
      <p className="cross-relation__meta">
        <BrainTag
          icon={entry.other.brainIcon}
          displayName={entry.other.brainDisplayName}
          displayed={displayed}
        />
        <span className="cross-relation__type">{relationTypeLabel(entry.relationType)}</span>
      </p>
      {entry.provenance === "DETERMINISTIC" ? (
        <p className="relation__rule">
          Règle : <code>{entry.ruleName}</code> version <code>{entry.ruleVersion}</code>
        </p>
      ) : (
        <p className="relation__rule relation__rule--approved">
          Approuvée par une action explicite
          {entry.suggestionKey ? (
            <>
              {" "}
              (<code>{entry.suggestionKey}</code>)
            </>
          ) : null}
          . Aucune règle déterministe.
        </p>
      )}
      {displayed ? null : (
        <p className="cross-relation__hint">
          Activer cette relation <strong>ajoute {entry.other.brainDisplayName} à la vue</strong>{" "}
          et y sélectionne la cible. C'est une navigation : rien n'est créé, modifié ni approuvé.
        </p>
      )}
    </li>
  );
}

function CrossDirectionSection({
  title,
  hint,
  entries,
  count,
  selfBrainName,
  displayedBrainIds,
  onNavigate,
}: {
  title: string;
  hint: string;
  entries: NodeCrossRelationEntry[];
  count: number;
  selfBrainName: string;
  displayedBrainIds: readonly string[];
  onNavigate: CrossRelationsPanelProps["onNavigate"];
}) {
  return (
    <section className="relations__direction" aria-label={`${title} (${count})`}>
      <h3 className="relations__subtitle">
        {title} <span className="relations__count">{count}</span>
      </h3>
      <p className="relations__hint">{hint}</p>
      {entries.length === 0 ? (
        <p className="details__empty">Aucune.</p>
      ) : (
        groupCrossByType(entries).map(([relationType, group]) => (
          <div key={relationType} className="relations__type-group">
            <h4 className="relations__type">
              {relationTypeLabel(relationType)}{" "}
              <span className="relations__count">{group.length}</span>
            </h4>
            <ul className="relations__list">
              {group.map((entry) => (
                <CrossEntryRow
                  key={crossEntryKey(entry)}
                  entry={entry}
                  selfBrainName={selfBrainName}
                  displayedBrainIds={displayedBrainIds}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}

function CrossSuggestionRow({
  suggestion,
  onApprove,
  approving,
}: {
  suggestion: CrossSuggestionEdge;
  onApprove: (suggestionKey: string) => void;
  approving: string | null;
}) {
  const busy = approving === suggestion.suggestionKey;
  return (
    <li className="suggestion cross-suggestion" data-cross-suggestion={suggestion.suggestionKey}>
      <div className="suggestion__head">
        <span className="suggestion__tag">suggestion</span>
        <span className="suggestion__state">non établie</span>
        <span className="cross-suggestion__tag">inter-cerveaux</span>
      </div>
      <p className="suggestion__body">
        <span className="suggestion__endpoints">
          {suggestion.source.brainDisplayName} · {suggestion.source.name}{" "}
          <span aria-hidden="true">⇢</span> {suggestion.target.brainDisplayName} ·{" "}
          {suggestion.target.name}
        </span>
        <span className="suggestion__type">{relationTypeLabel(suggestion.relationType)}</span>
      </p>
      <p className="suggestion__basis">Origine synthétique : {suggestion.basis}</p>
      <div className="suggestion__actions">
        <button
          type="button"
          className="suggestion__approve"
          data-cross-approve={suggestion.suggestionKey}
          disabled={busy}
          aria-label={
            `approuver la suggestion inter-cerveaux ${suggestion.suggestionKey}, ` +
            `de ${suggestion.source.brainDisplayName} vers ${suggestion.target.brainDisplayName}`
          }
          onClick={() => onApprove(suggestion.suggestionKey)}
        >
          {busy ? "Approbation…" : `Approuver ${suggestion.suggestionKey}`}
        </button>
      </div>
    </li>
  );
}

export default function CrossRelationsPanel({
  relations,
  loading,
  displayedBrainIds,
  onNavigate,
  onApprove,
  approving,
}: CrossRelationsPanelProps) {
  if (loading) {
    return (
      <section className="relations cross-relations" aria-label="Relations inter-cerveaux">
        <h2 className="relations__title">Relations inter-cerveaux</h2>
        <p className="details__empty">Lecture des relations inter-cerveaux…</p>
      </section>
    );
  }
  if (!relations) {
    return (
      <section className="relations cross-relations" aria-label="Relations inter-cerveaux">
        <h2 className="relations__title">Relations inter-cerveaux</h2>
        <p className="details__empty">
          Sélectionnez un bloc pour voir ses relations vers d'autres cerveaux.
        </p>
      </section>
    );
  }

  const selfBrainName = "ce cerveau";

  return (
    <section className="relations cross-relations" aria-label="Relations inter-cerveaux">
      <h2 className="relations__title">Relations inter-cerveaux</h2>
      <p className="relations__hint">
        Une relation inter-cerveaux relie ce nœud à un nœud d'un <strong>autre</strong> cerveau.
        Elle ne fusionne rien, et elle existe même si l'autre cerveau n'est pas affiché.
      </p>
      <p className="relations__totals" data-testid="cross-relation-totals">
        {relations.outgoingCount} sortante(s) · {relations.incomingCount} entrante(s) ·{" "}
        {relations.suggestions.length} suggestion(s) <strong>non comptée(s)</strong>
      </p>

      <CrossDirectionSection
        title="Sortantes — vers un autre cerveau"
        hint="Ce nœud pointe vers :"
        entries={relations.outgoing}
        count={relations.outgoingCount}
        selfBrainName={selfBrainName}
        displayedBrainIds={displayedBrainIds}
        onNavigate={onNavigate}
      />
      <CrossDirectionSection
        title="Entrantes — depuis un autre cerveau"
        hint="Pointent vers ce nœud :"
        entries={relations.incoming}
        count={relations.incomingCount}
        selfBrainName={selfBrainName}
        displayedBrainIds={displayedBrainIds}
        onNavigate={onNavigate}
      />

      <section
        className="relations__suggestions cross-relations__suggestions"
        aria-label="Suggestions inter-cerveaux non établies"
      >
        <h3 className="relations__subtitle">
          Suggestions inter-cerveaux — non établies{" "}
          <span className="relations__count">{relations.suggestions.length}</span>
        </h3>
        <p className="relations__hint">
          Une suggestion <strong>n'est pas une relation</strong> : elle n'entre dans aucun compte
          ci-dessus et n'est dessinée comme aucune arête établie tant qu'elle n'est pas approuvée.
        </p>
        {relations.suggestions.length === 0 ? (
          <p className="details__empty">Aucune.</p>
        ) : (
          <ul className="relations__list">
            {relations.suggestions.map((suggestion) => (
              <CrossSuggestionRow
                key={suggestion.suggestionKey}
                suggestion={suggestion}
                onApprove={onApprove}
                approving={approving}
              />
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
