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
    default:
      return state;
  }
}
