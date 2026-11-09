import { useId, useState } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import {
  selectActiveBoard,
  selectCardsForColumn,
  selectColumnsForBoard,
} from '../../state/selectors';
import { Column } from '../column/Column';
import { EmptyState } from '../common/EmptyState';
import { BoardDndContext } from './BoardDndContext';
import { BoardHeader } from './BoardHeader';
import type { Card } from '../../types/board';

/** Case-insensitive match on title or description; an empty query matches all. */
export function matchesQuery(card: Card, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    card.title.toLowerCase().includes(needle) ||
    card.description.toLowerCase().includes(needle)
  );
}

export function BoardView() {
  const { state } = useBoardState();
  const board = selectActiveBoard(state);
  const [query, setQuery] = useState('');
  const filterId = useId();

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
  const filtering = query.trim() !== '';
  const cardsByColumn = columns.map((column) => {
    const all = selectCardsForColumn(state, board.id, column.id);
    return {
      column,
      all,
      shown: all.filter((card) => matchesQuery(card, query)),
    };
  });
  const matchCount = cardsByColumn.reduce((sum, c) => sum + c.shown.length, 0);

  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-screen-2xl">
      <BoardHeader
        boardId={board.id}
        boardTitle={board.title}
        headingId={headingId}
      />
      {columns.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label htmlFor={filterId} className="text-sm font-medium">
            Filter cards
          </label>
          <input
            id={filterId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title or description"
            className="w-64 max-w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
          />
          <p aria-live="polite" className="text-sm text-muted">
            {filtering
              ? `${matchCount} matching ${matchCount === 1 ? 'card' : 'cards'}. Dragging is paused while filtering.`
              : ''}
          </p>
        </div>
      )}
      {columns.length === 0 ? (
        <EmptyState
          heading="This board has no columns"
          description="Add a column to start organizing cards."
        />
      ) : (
        <BoardDndContext boardId={board.id}>
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start md:overflow-x-auto md:pb-2">
            {cardsByColumn.map(({ column, shown }) => (
              <div key={column.id} className="min-w-0 md:w-80 md:shrink-0">
                <Column
                  boardId={board.id}
                  column={column}
                  cards={shown}
                  filtering={filtering}
                />
              </div>
            ))}
          </div>
        </BoardDndContext>
      )}
    </section>
  );
}
