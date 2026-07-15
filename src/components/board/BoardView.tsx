import { useBoardState } from '../../hooks/useBoardState';
import {
  selectActiveBoard,
  selectCardsForColumn,
  selectColumnsForBoard,
} from '../../state/selectors';
import { Column } from '../column/Column';
import { EmptyState } from '../common/EmptyState';
import { BoardHeader } from './BoardHeader';

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
      <BoardHeader
        boardId={board.id}
        boardTitle={board.title}
        headingId={headingId}
      />
      {columns.length === 0 ? (
        <EmptyState
          heading="This board has no columns"
          description="Add a column to start organizing cards."
        />
      ) : (
        <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start md:overflow-x-auto md:pb-2">
          {columns.map((column) => (
            <div key={column.id} className="min-w-0 md:w-80 md:shrink-0">
              <Column
                boardId={board.id}
                column={column}
                cards={selectCardsForColumn(state, board.id, column.id)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
