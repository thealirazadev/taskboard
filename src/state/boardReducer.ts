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
    default:
      return state;
  }
}
