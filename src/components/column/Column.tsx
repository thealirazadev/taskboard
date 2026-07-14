import { Card } from '../card/Card';
import { AddCardForm } from './AddCardForm';
import type { Card as CardData, Column as ColumnData } from '../../types/board';

interface ColumnProps {
  boardId: string;
  column: ColumnData;
  cards: CardData[];
}

export function Column({ boardId, column, cards }: ColumnProps) {
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
          tabIndex={-1}
          className="min-w-0 break-words text-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {column.title}
        </h3>
        <span className="shrink-0 text-xs font-medium text-muted">
          {cardLabel}
        </span>
      </header>
      <ul aria-label={`${column.title} cards`} className="space-y-2">
        {cards.length === 0 ? (
          <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
            No cards. Add one below.
          </li>
        ) : (
          cards.map((card) => (
            <li key={card.id}>
              <Card boardId={boardId} columnId={column.id} card={card} />
            </li>
          ))
        )}
      </ul>
      <AddCardForm
        boardId={boardId}
        columnId={column.id}
        columnTitle={column.title}
      />
    </section>
  );
}
