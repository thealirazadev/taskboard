import { useBoardState } from '../../hooks/useBoardState';
import {
  selectActiveBoard,
  selectCardsForColumn,
  selectColumnsForBoard,
} from '../../state/selectors';
import { Column } from '../column/Column';
import { EmptyState } from '../common/EmptyState';

export function BoardView() {
  const { state } = useBoardState();
  const board = selectActiveBoard(state);

  if (!board) {
    return (
      <EmptyState
        heading="No boards yet"
        description="Create a board to organize your work into clear next steps."
      />
    );
  }

  const headingId = `board-${board.id}-heading`;
  const columns = selectColumnsForBoard(state, board.id);

  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-screen-2xl">
      <h2 id={headingId} className="mb-4 text-xl font-semibold">
        {board.title}
      </h2>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
        {columns.map((column) => {
          return (
            <Column
              key={column.id}
              boardId={board.id}
              column={column}
              cards={selectCardsForColumn(state, board.id, column.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
