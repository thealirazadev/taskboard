import { Column } from '../column/Column';
import type { Board } from '../../types/board';

interface BoardViewProps {
  board: Board;
}

export function BoardView({ board }: BoardViewProps) {
  const headingId = `board-${board.id}-heading`;

  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-screen-2xl">
      <h2 id={headingId} className="mb-4 text-xl font-semibold">
        {board.title}
      </h2>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
        {board.columnOrder.map((columnId) => {
          const column = board.columns[columnId];

          if (!column) {
            return null;
          }

          return (
            <Column
              key={column.id}
              column={column}
              cards={column.cardIds.flatMap((cardId) => {
                const card = board.cards[cardId];
                return card ? [card] : [];
              })}
            />
          );
        })}
      </div>
    </section>
  );
}
