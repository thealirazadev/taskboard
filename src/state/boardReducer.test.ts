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

  it('updates a card without mutating its previous value', () => {
    const card = {
      id: 'card-1',
      title: 'Before',
      description: '',
      createdAt: 1,
      updatedAt: 1,
    };
    const state: PersistedState = {
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
              cardIds: ['card-1'],
            },
          },
          cards: { 'card-1': card },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    };

    const nextState = boardReducer(state, {
      type: 'UPDATE_CARD',
      boardId: 'board-1',
      cardId: 'card-1',
      title: '  After  ',
      description: 'Details',
      updatedAt: 2,
    });

    expect(nextState.boards['board-1']?.cards['card-1']).toEqual({
      ...card,
      title: 'After',
      description: 'Details',
      updatedAt: 2,
    });
    expect(state.boards['board-1']?.cards['card-1']).toBe(card);

    expect(
      boardReducer(nextState, {
        type: 'UPDATE_CARD',
        boardId: 'board-1',
        cardId: 'card-1',
        title: 'After',
        description: 'Details',
        updatedAt: 3,
      }),
    ).toBe(nextState);
    expect(
      boardReducer(nextState, {
        type: 'UPDATE_CARD',
        boardId: 'board-1',
        cardId: 'missing',
        title: 'Task',
        description: '',
        updatedAt: 3,
      }),
    ).toBe(nextState);
  });

  it('deletes a card and removes it from its column', () => {
    const card = {
      id: 'card-1',
      title: 'Task',
      description: '',
      createdAt: 1,
      updatedAt: 1,
    };
    const state: PersistedState = {
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
              cardIds: ['card-1'],
            },
          },
          cards: { 'card-1': card },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    };

    const nextState = boardReducer(state, {
      type: 'DELETE_CARD',
      boardId: 'board-1',
      cardId: 'card-1',
      updatedAt: 2,
    });

    expect(nextState.boards['board-1']?.cards).toEqual({});
    expect(nextState.boards['board-1']?.columns['column-1']?.cardIds).toEqual(
      [],
    );
    expect(nextState.boards['board-1']?.updatedAt).toBe(2);
    expect(state.boards['board-1']?.cards).toEqual({ 'card-1': card });
    expect(state.boards['board-1']?.columns['column-1']?.cardIds).toEqual([
      'card-1',
    ]);
  });

  it('ignores deleting a card that does not exist', () => {
    const state = createEmptyState();

    expect(
      boardReducer(state, {
        type: 'DELETE_CARD',
        boardId: 'missing',
        cardId: 'missing',
        updatedAt: 1,
      }),
    ).toBe(state);
  });

  it('renames a column without mutating the previous state', () => {
    const state: PersistedState = {
      version: 1,
      boardOrder: ['board-1'],
      activeBoardId: 'board-1',
      boards: {
        'board-1': {
          id: 'board-1',
          title: 'Board',
          columnOrder: ['column-1'],
          columns: {
            'column-1': { id: 'column-1', title: 'To Do', cardIds: [] },
          },
          cards: {},
          createdAt: 1,
          updatedAt: 1,
        },
      },
    };

    const nextState = boardReducer(state, {
      type: 'RENAME_COLUMN',
      boardId: 'board-1',
      columnId: 'column-1',
      title: '  Doing  ',
      updatedAt: 2,
    });

    expect(nextState.boards['board-1']?.columns['column-1']?.title).toBe(
      'Doing',
    );
    expect(nextState.boards['board-1']?.updatedAt).toBe(2);
    expect(state.boards['board-1']?.columns['column-1']?.title).toBe('To Do');
  });

  it('ignores invalid or no-op column renames', () => {
    const state: PersistedState = {
      version: 1,
      boardOrder: ['board-1'],
      activeBoardId: 'board-1',
      boards: {
        'board-1': {
          id: 'board-1',
          title: 'Board',
          columnOrder: ['column-1'],
          columns: {
            'column-1': { id: 'column-1', title: 'To Do', cardIds: [] },
          },
          cards: {},
          createdAt: 1,
          updatedAt: 1,
        },
      },
    };

    expect(
      boardReducer(state, {
        type: 'RENAME_COLUMN',
        boardId: 'board-1',
        columnId: 'column-1',
        title: '   ',
        updatedAt: 2,
      }),
    ).toBe(state);
    expect(
      boardReducer(state, {
        type: 'RENAME_COLUMN',
        boardId: 'board-1',
        columnId: 'column-1',
        title: 'To Do',
        updatedAt: 2,
      }),
    ).toBe(state);
    expect(
      boardReducer(state, {
        type: 'RENAME_COLUMN',
        boardId: 'board-1',
        columnId: 'missing',
        title: 'Doing',
        updatedAt: 2,
      }),
    ).toBe(state);
  });
});
