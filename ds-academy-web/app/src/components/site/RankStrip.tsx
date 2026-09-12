import { rankLabel } from '@/lib/format';

/**
 * Renders as a single centered strip when only one of rankOrScore/categoryRank
 * is set (a student can have a category rank before the AIR is out, or the
 * other way round), or as a two-way split when both are. Renders nothing if
 * neither is set.
 */
export function RankStrip({
  exam,
  rankOrScore,
  categoryRank,
  categoryLabel = 'CATEGORY RANK',
}: {
  exam: string;
  rankOrScore?: string;
  categoryRank?: string;
  categoryLabel?: string;
}) {
  if (!rankOrScore && !categoryRank) return null;

  if (!rankOrScore) {
    return (
      <div className="rankstrip solo">
        <div className="half">
          <b>{categoryRank}</b>
          <span>{categoryLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rankstrip${categoryRank ? '' : ' solo'}`}>
      <div className="half">
        <b>{rankOrScore}</b>
        <span>{rankLabel(exam, Boolean(categoryRank))}</span>
      </div>
      {categoryRank ? (
        <div className="half">
          <b>{categoryRank}</b>
          <span>{categoryLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
