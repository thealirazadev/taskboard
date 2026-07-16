import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useState } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import { useConfirm } from '../../hooks/useConfirm';
import type { Card as CardData } from '../../types/board';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CardEditor } from './CardEditor';

interface CardProps {
  boardId: string;
  columnId: string;
  card: CardData;
}

export function Card({ boardId, columnId, card }: CardProps) {
  const { dispatch } = useBoardState();
  const [isEditing, setIsEditing] = useState(false);
  const closeEditor = useCallback(() => setIsEditing(false), []);
  const { pending, confirm, respondConfirm, respondCancel } = useConfirm();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', cardId: card.id, columnId },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function handleDelete(): Promise<void> {
    const confirmed = await confirm({
      title: `Delete "${card.title}"?`,
      description: 'This removes the card. This action cannot be undone.',
      confirmLabel: 'Delete card',
    });

    if (!confirmed) {
      return;
    }

    dispatch({
      type: 'DELETE_CARD',
      boardId,
      cardId: card.id,
      updatedAt: Date.now(),
    });
    document.getElementById(`column-${columnId}-heading`)?.focus();
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group min-w-0 rounded-md border border-border bg-surface-raised p-3 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-surface ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={`Drag card ${card.title}`}
          {...attributes}
          {...listeners}
          className="mt-0.5 min-h-10 min-w-10 shrink-0 cursor-grab touch-none rounded-md border border-border bg-surface text-center text-muted hover:bg-background active:cursor-grabbing"
        >
          <span aria-hidden="true">&#8942;&#8942;</span>
        </button>
        <div className="min-w-0 flex-1">
          <h4 className="break-words text-base font-medium">{card.title}</h4>
          {card.description ? (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted">
              {card.description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          aria-label={`Edit card ${card.title}`}
          onClick={() => setIsEditing(true)}
          className="min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-background"
        >
          Edit
        </button>
        <button
          type="button"
          aria-label={`Delete card ${card.title}`}
          onClick={handleDelete}
          className="min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-danger hover:bg-background"
        >
          Delete
        </button>
      </div>
      {isEditing ? (
        <CardEditor boardId={boardId} card={card} onClose={closeEditor} />
      ) : null}
      {pending ? (
        <ConfirmDialog
          title={pending.title}
          description={pending.description}
          confirmLabel={pending.confirmLabel}
          onConfirm={respondConfirm}
          onCancel={respondCancel}
        />
      ) : null}
    </article>
  );
}
