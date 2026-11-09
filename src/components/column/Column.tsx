import { useDroppable } from '@dnd-kit/core';
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
  /** A filter hides some cards; positions would be wrong, so sorting is paused. */
  filtering?: boolean;
}

/** Empty columns have no sortable card to register as a drop target, so this
 * placeholder registers one directly. */
function EmptyColumnDropTarget({ columnId }: { columnId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnId}-empty`,
    data: { type: 'card', cardId: '', columnId },
  });

  return (
    <li
      ref={setNodeRef}
      className={`rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted ${
        isOver ? 'border-accent bg-drop-target' : 'border-border'
      }`}
    >
      No cards. Add one below.
    </li>
  );
}

export function Column({
  boardId,
  column,
  cards,
  filtering = false,
}: ColumnProps) {
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
        disabled={filtering}
      >
        <ul aria-label={`${column.title} cards`} className="space-y-2">
          {cards.length === 0 && filtering ? (
            <li className="px-3 py-6 text-center text-sm text-muted">
              No matching cards.
            </li>
          ) : cards.length === 0 ? (
            <EmptyColumnDropTarget columnId={column.id} />
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
