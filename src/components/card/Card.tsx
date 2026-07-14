import type { Card as CardData } from '../../types/board';

interface CardProps {
  card: CardData;
}

export function Card({ card }: CardProps) {
  return (
    <article className="min-w-0 rounded-md border border-border bg-surface-raised p-3 shadow-sm transition-shadow hover:shadow-md">
      <h4 className="break-words text-base font-medium">{card.title}</h4>
      {card.description ? (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted">
          {card.description}
        </p>
      ) : null}
    </article>
  );
}
