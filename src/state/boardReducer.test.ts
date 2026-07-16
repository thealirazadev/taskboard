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

  function createBoard(id: string, title: string) {
    return {
      id,
      title,
      columnOrder: [],
      columns: {},
      cards: {},
      createdAt: 1,
      updatedAt: 1,
    };
  }

  it('adds a board and makes it active', () => {
    const state = createEmptyState();

    const nextState = boardReducer(state, {
      type: 'ADD_BOARD',
      board: createBoard('board-1', 'Personal'),
    });

    expect(nextState.boardOrder).toEqual(['board-1']);
    expect(nextState.boards['board-1']?.title).toBe('Personal');
    expect(nextState.activeBoardId).toBe('board-1');
    expect(state.boardOrder).toEqual([]);
  });

  it('adds a second board without affecting the first board', () => {
    const state = boardReducer(createEmptyState(), {
      type: 'ADD_BOARD',
      board: createBoard('board-1', 'Personal'),
    });

    const nextState = boardReducer(state, {
      type: 'ADD_BOARD',
      board: createBoard('board-2', 'Work'),
    });

    expect(nextState.boardOrder).toEqual(['board-1', 'board-2']);
    expect(nextState.boards['board-1']).toBe(state.boards['board-1']);
    expect(nextState.activeBoardId).toBe('board-2');
  });

  it('ignores adding a board with a blank title', () => {
    const state = createEmptyState();

    expect(
      boardReducer(state, {
        type: 'ADD_BOARD',
        board: createBoard('board-1', '   '),
      }),
    ).toBe(state);
  });

  it('switches the active board', () => {
    let state = boardReducer(createEmptyState(), {
      type: 'ADD_BOARD',
      board: createBoard('board-1', 'Personal'),
    });
    state = boardReducer(state, {
      type: 'ADD_BOARD',
      board: createBoard('board-2', 'Work'),
    });

    const nextState = boardReducer(state, {
      type: 'SWITCH_BOARD',
      boardId: 'board-1',
    });

    expect(nextState.activeBoardId).toBe('board-1');
  });

  it('ignores switching to a board that does not exist', () => {
    const state = boardReducer(createEmptyState(), {
      type: 'ADD_BOARD',
      board: createBoard('board-1', 'Personal'),
    });

    expect(
      boardReducer(state, { type: 'SWITCH_BOARD', boardId: 'missing' }),
    ).toBe(state);
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

  it('adds a validated column to the end of a board', () => {
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
    const column = { id: 'column-2', title: 'Doing', cardIds: [] };

    const nextState = boardReducer(state, {
      type: 'ADD_COLUMN',
      boardId: 'board-1',
      column,
      updatedAt: 2,
    });

    expect(nextState.boards['board-1']?.columnOrder).toEqual([
      'column-1',
      'column-2',
    ]);
    expect(nextState.boards['board-1']?.columns['column-2']).toBe(column);
    expect(nextState.boards['board-1']?.updatedAt).toBe(2);
    expect(state.boards['board-1']?.columnOrder).toEqual(['column-1']);
  });

  it('ignores invalid column additions', () => {
    const state = createEmptyState();
    const column = { id: 'column-1', title: 'Doing', cardIds: [] };

    expect(
      boardReducer(state, {
        type: 'ADD_COLUMN',
        boardId: 'missing',
        column,
        updatedAt: 1,
      }),
    ).toBe(state);
    expect(
      boardReducer(state, {
        type: 'ADD_COLUMN',
        boardId: 'missing',
        column: { ...column, title: '  ' },
        updatedAt: 1,
      }),
    ).toBe(state);
  });

  it('deletes a column along with its cards', () => {
    const state: PersistedState = {
      version: 1,
      boardOrder: ['board-1'],
      activeBoardId: 'board-1',
      boards: {
        'board-1': {
          id: 'board-1',
          title: 'Board',
          columnOrder: ['column-1', 'column-2'],
          columns: {
            'column-1': {
              id: 'column-1',
              title: 'To Do',
              cardIds: ['card-1'],
            },
            'column-2': { id: 'column-2', title: 'Done', cardIds: [] },
          },
          cards: {
            'card-1': {
              id: 'card-1',
              title: 'Task',
              description: '',
              createdAt: 1,
              updatedAt: 1,
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    };

    const nextState = boardReducer(state, {
      type: 'DELETE_COLUMN',
      boardId: 'board-1',
      columnId: 'column-1',
      updatedAt: 2,
    });

    expect(nextState.boards['board-1']?.columnOrder).toEqual(['column-2']);
    expect(nextState.boards['board-1']?.columns).toEqual({
      'column-2': { id: 'column-2', title: 'Done', cardIds: [] },
    });
    expect(nextState.boards['board-1']?.cards).toEqual({});
    expect(nextState.boards['board-1']?.updatedAt).toBe(2);
    expect(state.boards['board-1']?.columnOrder).toEqual([
      'column-1',
      'column-2',
    ]);
    expect(state.boards['board-1']?.cards).toHaveProperty('card-1');
  });

  it('ignores deleting a column that does not exist', () => {
    const state = createEmptyState();

    expect(
      boardReducer(state, {
        type: 'DELETE_COLUMN',
        boardId: 'missing',
        columnId: 'missing',
        updatedAt: 1,
      }),
    ).toBe(state);
  });

  function createTwoColumnState(): PersistedState {
    return {
      version: 1,
      boardOrder: ['board-1'],
      activeBoardId: 'board-1',
      boards: {
        'board-1': {
          id: 'board-1',
          title: 'Board',
          columnOrder: ['column-1', 'column-2'],
          columns: {
            'column-1': {
              id: 'column-1',
              title: 'To Do',
              cardIds: ['card-1', 'card-2'],
            },
            'column-2': { id: 'column-2', title: 'Done', cardIds: [] },
          },
          cards: {
            'card-1': {
              id: 'card-1',
              title: 'First',
              description: '',
              createdAt: 1,
              updatedAt: 1,
            },
            'card-2': {
              id: 'card-2',
              title: 'Second',
              description: '',
              createdAt: 1,
              updatedAt: 1,
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    };
  }

  it('reorders a card within the same column', () => {
    const state = createTwoColumnState();

    const nextState = boardReducer(state, {
      type: 'MOVE_CARD',
      boardId: 'board-1',
      cardId: 'card-1',
      fromColumnId: 'column-1',
      toColumnId: 'column-1',
      toIndex: 1,
      updatedAt: 2,
    });

    expect(nextState.boards['board-1']?.columns['column-1']?.cardIds).toEqual([
      'card-2',
      'card-1',
    ]);
    expect(nextState.boards['board-1']?.updatedAt).toBe(2);
    expect(state.boards['board-1']?.columns['column-1']?.cardIds).toEqual([
      'card-1',
      'card-2',
    ]);
  });

  it('moves a card into another column, including an empty one', () => {
    const state = createTwoColumnState();

    const nextState = boardReducer(state, {
      type: 'MOVE_CARD',
      boardId: 'board-1',
      cardId: 'card-1',
      fromColumnId: 'column-1',
      toColumnId: 'column-2',
      toIndex: 0,
      updatedAt: 2,
    });

    expect(nextState.boards['board-1']?.columns['column-1']?.cardIds).toEqual([
      'card-2',
    ]);
    expect(nextState.boards['board-1']?.columns['column-2']?.cardIds).toEqual([
      'card-1',
    ]);
    expect(state.boards['board-1']?.columns['column-2']?.cardIds).toEqual([]);
  });

  it('ignores moving a card that does not exist in the source column', () => {
    const state = createTwoColumnState();

    expect(
      boardReducer(state, {
        type: 'MOVE_CARD',
        boardId: 'board-1',
        cardId: 'missing-card',
        fromColumnId: 'column-1',
        toColumnId: 'column-2',
        toIndex: 0,
        updatedAt: 2,
      }),
    ).toBe(state);
  });

  it('ignores moving a card to a column that does not exist', () => {
    const state = createTwoColumnState();

    expect(
      boardReducer(state, {
        type: 'MOVE_CARD',
        boardId: 'board-1',
        cardId: 'card-1',
        fromColumnId: 'column-1',
        toColumnId: 'missing-column',
        toIndex: 0,
        updatedAt: 2,
      }),
    ).toBe(state);
  });

  it('is a no-op when dropping a card back at its original index', () => {
    const state = createTwoColumnState();

    expect(
      boardReducer(state, {
        type: 'MOVE_CARD',
        boardId: 'board-1',
        cardId: 'card-1',
        fromColumnId: 'column-1',
        toColumnId: 'column-1',
        toIndex: 0,
        updatedAt: 2,
      }),
    ).toBe(state);
  });
});
