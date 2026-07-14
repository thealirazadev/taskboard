import { describe, expect, it } from 'vitest';

import type { PersistedState } from '../types/board';
import { boardReducer, createEmptyState } from './boardReducer';

describe('boardReducer', () => {
  it('creates the versioned empty state', () => {
    expect(createEmptyState()).toEqual({
      version: 1,
      boards: {},
      boardOrder: [],
      activeBoardId: null,
    });
  });

  it('replaces state without mutating the previous state', () => {
    const previousState = createEmptyState();
    const nextState: PersistedState = {
      ...createEmptyState(),
      boardOrder: [],
    };

    expect(
      boardReducer(previousState, { type: 'REPLACE_STATE', state: nextState }),
    ).toBe(nextState);
    expect(previousState).toEqual(createEmptyState());
  });

  it('resets to a new empty state', () => {
    const previousState: PersistedState = {
      version: 1,
      boards: {},
      boardOrder: [],
      activeBoardId: null,
    };

    const nextState = boardReducer(previousState, { type: 'RESET_STATE' });
    expect(nextState).toEqual(createEmptyState());
    expect(nextState).not.toBe(previousState);
  });
});
