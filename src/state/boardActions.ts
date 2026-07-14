import type { Card, PersistedState } from '../types/board';

export type BoardAction =
  | { type: 'REPLACE_STATE'; state: PersistedState }
  | { type: 'RESET_STATE' }
  | { type: 'ADD_CARD'; boardId: string; columnId: string; card: Card };
