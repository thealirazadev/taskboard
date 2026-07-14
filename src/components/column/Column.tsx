import { Card } from '../card/Card';
import type { Card as CardData, Column as ColumnData } from '../../types/board';

interface ColumnProps {
  column: ColumnData;
  cards: CardData[];
}

export function Column({ column, cards }: ColumnProps) {
  const headingId = `column-${column.id}-heading`;
  const cardLabel = cards.length === 1 ? '1 card' : `${cards.length} cards`;

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-lg border border-border bg-surface p-3"
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3
          id={headingId}
          className="min-w-0 break-words text-lg font-semibold"
        >
          {column.title}
        </h3>
        <span className="shrink-0 text-xs font-medium text-muted">
          {cardLabel}
        </span>
      </header>
      <ul aria-label={`${column.title} cards`} className="space-y-2">
        {cards.map((card) => (
          <li key={card.id}>
            <Card card={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}
