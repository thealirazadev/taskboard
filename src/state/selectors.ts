import type { Board, Card, Column, PersistedState } from '../types/board';

export interface CardLocation {
  boardId: string;
  columnId: string;
  index: number;
}

export function selectBoards(state: PersistedState): Board[] {
  return state.boardOrder.flatMap((boardId) => {
    const board = state.boards[boardId];
    return board ? [board] : [];
  });
}

export function selectBoardById(
  state: PersistedState,
  boardId: string,
): Board | null {
  return state.boards[boardId] ?? null;
}

export function selectActiveBoard(state: PersistedState): Board | null {
  return state.activeBoardId
    ? selectBoardById(state, state.activeBoardId)
    : null;
}

export function selectColumnsForBoard(
  state: PersistedState,
  boardId: string,
): Column[] {
  const board = selectBoardById(state, boardId);
  if (!board) {
    return [];
  }

  return board.columnOrder.flatMap((columnId) => {
    const column = board.columns[columnId];
    return column ? [column] : [];
  });
}

export function selectColumnById(
  state: PersistedState,
  boardId: string,
  columnId: string,
): Column | null {
  return state.boards[boardId]?.columns[columnId] ?? null;
}

export function selectCardsForColumn(
  state: PersistedState,
  boardId: string,
  columnId: string,
): Card[] {
  const board = selectBoardById(state, boardId);
  const column = board?.columns[columnId];
  if (!board || !column) {
    return [];
  }

  return column.cardIds.flatMap((cardId) => {
    const card = board.cards[cardId];
    return card ? [card] : [];
  });
}

export function selectCardById(
  state: PersistedState,
  boardId: string,
  cardId: string,
): Card | null {
  return state.boards[boardId]?.cards[cardId] ?? null;
}

export function selectCardLocation(
  state: PersistedState,
  boardId: string,
  cardId: string,
): CardLocation | null {
  const board = selectBoardById(state, boardId);
  if (!board || !board.cards[cardId]) {
    return null;
  }

  for (const columnId of board.columnOrder) {
    const index = board.columns[columnId]?.cardIds.indexOf(cardId) ?? -1;
    if (index >= 0) {
      return { boardId, columnId, index };
    }
  }

  return null;
}

export function selectHasBoards(state: PersistedState): boolean {
  return state.boardOrder.length > 0;
}
