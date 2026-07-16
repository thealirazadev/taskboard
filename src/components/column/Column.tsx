import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Card } from '../card/Card';
import { AddCardForm } from './AddCardForm';
import { ColumnHeader } from './ColumnHeader';
import type { Card as CardData, Column as ColumnData } from '../../types/board';

interface ColumnProps {
  boardId: string;
  column: ColumnData;
  cards: CardData[];
}

export function Column({ boardId, column, cards }: ColumnProps) {
  const headingId = `column-${column.id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-lg border border-border bg-surface p-3"
    >
      <ColumnHeader
        boardId={boardId}
        columnId={column.id}
        headingId={headingId}
        title={column.title}
        cardCount={cards.length}
      />
      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
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
      </SortableContext>
      <AddCardForm
        boardId={boardId}
        columnId={column.id}
        columnTitle={column.title}
      />
    </section>
  );
}
