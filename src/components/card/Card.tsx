import { useCallback, useState } from 'react';

import type { Card as CardData } from '../../types/board';
import { CardEditor } from './CardEditor';

interface CardProps {
  boardId: string;
  card: CardData;
}

export function Card({ boardId, card }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const closeEditor = useCallback(() => setIsEditing(false), []);

  return (
    <article className="group min-w-0 rounded-md border border-border bg-surface-raised p-3 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-surface">
      <h4 className="break-words text-base font-medium">{card.title}</h4>
      {card.description ? (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted">
          {card.description}
        </p>
      ) : null}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          aria-label={`Edit card ${card.title}`}
          onClick={() => setIsEditing(true)}
          className="min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-background"
        >
          Edit
        </button>
      </div>
      {isEditing ? (
        <CardEditor boardId={boardId} card={card} onClose={closeEditor} />
      ) : null}
    </article>
  );
}
