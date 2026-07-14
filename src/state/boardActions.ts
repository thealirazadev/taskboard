import type { PersistedState } from '../types/board';

export type BoardAction =
  | { type: 'REPLACE_STATE'; state: PersistedState }
  | { type: 'RESET_STATE' };
