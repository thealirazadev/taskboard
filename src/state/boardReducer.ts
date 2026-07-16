import { moveBetweenArrays, moveWithinArray } from '../lib/reorder';
import { CURRENT_SCHEMA_VERSION } from '../storage/constants';
import type { PersistedState } from '../types/board';
import type { BoardAction } from './boardActions';

export function createEmptyState(): PersistedState {
  return {
    version: CURRENT_SCHEMA_VERSION,
    boards: {},
    boardOrder: [],
    activeBoardId: null,
  };
}

export function boardReducer(
  state: PersistedState,
  action: BoardAction,
): PersistedState {
  switch (action.type) {
    case 'REPLACE_STATE':
      return action.state;
    case 'RESET_STATE':
      return createEmptyState();
    case 'ADD_BOARD': {
      if (
        state.boards[action.board.id] ||
        action.board.title.trim().length === 0
      ) {
        return state;
      }

      return {
        ...state,
        boardOrder: [...state.boardOrder, action.board.id],
        boards: { ...state.boards, [action.board.id]: action.board },
        activeBoardId: action.board.id,
      };
    }
    case 'SWITCH_BOARD': {
      if (
        !state.boards[action.boardId] ||
        state.activeBoardId === action.boardId
      ) {
        return state;
      }

      return { ...state, activeBoardId: action.boardId };
    }
    case 'ADD_CARD': {
      const board = state.boards[action.boardId];
      const column = board?.columns[action.columnId];
      if (
        !board ||
        !column ||
        board.cards[action.card.id] ||
        action.card.title.trim().length === 0
      ) {
        return state;
      }

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            cards: { ...board.cards, [action.card.id]: action.card },
            columns: {
              ...board.columns,
              [column.id]: {
                ...column,
                cardIds: [...column.cardIds, action.card.id],
              },
            },
            updatedAt: action.card.updatedAt,
          },
        },
      };
    }
    case 'UPDATE_CARD': {
      const board = state.boards[action.boardId];
      const card = board?.cards[action.cardId];
      const title = action.title.trim();
      if (!board || !card || title.length === 0) {
        return state;
      }

      if (card.title === title && card.description === action.description) {
        return state;
      }

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            cards: {
              ...board.cards,
              [card.id]: {
                ...card,
                title,
                description: action.description,
                updatedAt: action.updatedAt,
              },
            },
            updatedAt: action.updatedAt,
          },
        },
      };
    }
    case 'DELETE_CARD': {
      const board = state.boards[action.boardId];
      if (!board || !board.cards[action.cardId]) {
        return state;
      }

      const columnId = board.columnOrder.find((id) =>
        board.columns[id]?.cardIds.includes(action.cardId),
      );
      const column = columnId ? board.columns[columnId] : undefined;
      if (!columnId || !column) {
        return state;
      }

      const remainingCards = { ...board.cards };
      delete remainingCards[action.cardId];

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            cards: remainingCards,
            columns: {
              ...board.columns,
              [columnId]: {
                ...column,
                cardIds: column.cardIds.filter((id) => id !== action.cardId),
              },
            },
            updatedAt: action.updatedAt,
          },
        },
      };
    }
    case 'RENAME_COLUMN': {
      const board = state.boards[action.boardId];
      const column = board?.columns[action.columnId];
      const title = action.title.trim();
      if (!board || !column || title.length === 0) {
        return state;
      }

      if (column.title === title) {
        return state;
      }

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columns: {
              ...board.columns,
              [column.id]: { ...column, title },
            },
            updatedAt: action.updatedAt,
          },
        },
      };
    }
    case 'ADD_COLUMN': {
      const board = state.boards[action.boardId];
      if (
        !board ||
        board.columns[action.column.id] ||
        action.column.title.trim().length === 0
      ) {
        return state;
      }

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columnOrder: [...board.columnOrder, action.column.id],
            columns: { ...board.columns, [action.column.id]: action.column },
            updatedAt: action.updatedAt,
          },
        },
      };
    }
    case 'DELETE_COLUMN': {
      const board = state.boards[action.boardId];
      const column = board?.columns[action.columnId];
      if (!board || !column) {
        return state;
      }

      const remainingColumns = { ...board.columns };
      delete remainingColumns[action.columnId];

      const remainingCards = { ...board.cards };
      for (const cardId of column.cardIds) {
        delete remainingCards[cardId];
      }

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columnOrder: board.columnOrder.filter(
              (id) => id !== action.columnId,
            ),
            columns: remainingColumns,
            cards: remainingCards,
            updatedAt: action.updatedAt,
          },
        },
      };
    }
    case 'MOVE_CARD': {
      const board = state.boards[action.boardId];
      const fromColumn = board?.columns[action.fromColumnId];
      const toColumn = board?.columns[action.toColumnId];
      if (!board || !fromColumn || !toColumn || !board.cards[action.cardId]) {
        return state;
      }

      const fromIndex = fromColumn.cardIds.indexOf(action.cardId);
      if (fromIndex === -1) {
        return state;
      }

      if (action.fromColumnId === action.toColumnId) {
        const toIndex = Math.min(
          Math.max(action.toIndex, 0),
          fromColumn.cardIds.length - 1,
        );
        if (toIndex === fromIndex) {
          return state;
        }

        return {
          ...state,
          boards: {
            ...state.boards,
            [board.id]: {
              ...board,
              columns: {
                ...board.columns,
                [fromColumn.id]: {
                  ...fromColumn,
                  cardIds: moveWithinArray(
                    fromColumn.cardIds,
                    fromIndex,
                    toIndex,
                  ),
                },
              },
              updatedAt: action.updatedAt,
            },
          },
        };
      }

      const { source, destination } = moveBetweenArrays(
        fromColumn.cardIds,
        toColumn.cardIds,
        fromIndex,
        action.toIndex,
      );

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columns: {
              ...board.columns,
              [fromColumn.id]: { ...fromColumn, cardIds: source },
              [toColumn.id]: { ...toColumn, cardIds: destination },
            },
            updatedAt: action.updatedAt,
          },
        },
      };
    }
    default:
      return state;
  }
}
