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
    default:
      return state;
  }
}
