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

  it('adds a validated card to the end of a column', () => {
    const previousState: PersistedState = {
      version: 1,
      boardOrder: ['board-1'],
      activeBoardId: 'board-1',
      boards: {
        'board-1': {
          id: 'board-1',
          title: 'Board',
          columnOrder: ['column-1'],
          columns: {
            'column-1': {
              id: 'column-1',
              title: 'To Do',
              cardIds: [],
            },
          },
          cards: {},
          createdAt: 1,
          updatedAt: 1,
        },
      },
    };
    const card = {
      id: 'card-1',
      title: 'Task',
      description: '',
      createdAt: 2,
      updatedAt: 2,
    };

    const nextState = boardReducer(previousState, {
      type: 'ADD_CARD',
      boardId: 'board-1',
      columnId: 'column-1',
      card,
    });

    expect(nextState.boards['board-1']?.cards['card-1']).toBe(card);
    expect(nextState.boards['board-1']?.columns['column-1']?.cardIds).toEqual([
      'card-1',
    ]);
    expect(nextState.boards['board-1']?.updatedAt).toBe(2);
    expect(previousState.boards['board-1']?.cards).toEqual({});
  });

  it('ignores invalid card additions', () => {
    const state = createEmptyState();
    const card = {
      id: 'card-1',
      title: 'Task',
      description: '',
      createdAt: 1,
      updatedAt: 1,
    };

    expect(
      boardReducer(state, {
        type: 'ADD_CARD',
        boardId: 'missing',
        columnId: 'missing',
        card,
      }),
    ).toBe(state);
    expect(
      boardReducer(state, {
        type: 'ADD_CARD',
        boardId: 'missing',
        columnId: 'missing',
        card: { ...card, title: ' ' },
      }),
    ).toBe(state);
  });
});
