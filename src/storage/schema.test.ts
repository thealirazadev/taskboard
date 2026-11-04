import { describe, expect, it } from 'vitest';

import type { PersistedState } from '../types/board';
import { validatePersistedState } from './schema';

function createValidState(): PersistedState {
  return {
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
        cards: {
          'card-1': {
            id: 'card-1',
            title: 'Task',
            description: 'Details',
            createdAt: 1,
            updatedAt: 2,
          },
        },
        createdAt: 1,
        updatedAt: 2,
      },
    },
  };
}

function expectInvalid(value: unknown): void {
  const result = validatePersistedState(value);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.kind).toBe('invalid-schema');
  }
}

describe('validatePersistedState', () => {
  it('accepts valid empty and populated states', () => {
    const emptyState: PersistedState = {
      version: 1,
      boards: {},
      boardOrder: [],
      activeBoardId: null,
    };

    expect(validatePersistedState(emptyState)).toEqual({
      ok: true,
      value: emptyState,
    });

    const populatedState = createValidState();
    expect(validatePersistedState(populatedState)).toEqual({
      ok: true,
      value: populatedState,
    });
  });

  it('rejects unexpected versions and root shapes', () => {
    expectInvalid(null);
    expectInvalid({ ...createValidState(), version: 2 });
  });

  it('rejects duplicate or mismatched board ordering', () => {
    const duplicateState = createValidState();
    duplicateState.boardOrder.push('board-1');
    expectInvalid(duplicateState);

    const missingState = createValidState();
    missingState.boardOrder = [];
    expectInvalid(missingState);
  });

  it('rejects invalid active board references', () => {
    const state = createValidState();
    state.activeBoardId = 'missing';
    expectInvalid(state);

    expectInvalid({
      version: 1,
      boards: {},
      boardOrder: [],
      activeBoardId: 'missing',
    });
  });

  it('rejects map keys that do not match entity ids', () => {
    const state = createValidState();
    state.boards['board-1']!.id = 'different';
    expectInvalid(state);
  });

  it('rejects missing, duplicate, and orphaned card references', () => {
    const missingState = createValidState();
    missingState.boards['board-1']!.columns['column-1']!.cardIds = ['missing'];
    expectInvalid(missingState);

    const duplicateState = createValidState();
    const board = duplicateState.boards['board-1']!;
    board.columnOrder.push('column-2');
    board.columns['column-2'] = {
      id: 'column-2',
      title: 'Done',
      cardIds: ['card-1'],
    };
    expectInvalid(duplicateState);

    const orphanState = createValidState();
    orphanState.boards['board-1']!.columns['column-1']!.cardIds = [];
    expectInvalid(orphanState);
  });

  it('rejects ids that only exist on the object prototype', () => {
    const cardState = createValidState();
    cardState.boards['board-1']!.columns['column-1']!.cardIds = ['toString'];
    expectInvalid(cardState);

    const activeState = createValidState();
    activeState.activeBoardId = 'constructor';
    expectInvalid(activeState);
  });

  it('rejects invalid card fields and timestamps', () => {
    const blankTitleState = createValidState();
    blankTitleState.boards['board-1']!.cards['card-1']!.title = '   ';
    expectInvalid(blankTitleState);

    const timestampState = createValidState();
    timestampState.boards['board-1']!.cards['card-1']!.updatedAt = 0;
    expectInvalid(timestampState);

    const descriptionState = createValidState();
    const card = descriptionState.boards['board-1']!.cards[
      'card-1'
    ]! as unknown as {
      description: unknown;
    };
    card.description = 4;
    expectInvalid(descriptionState);
  });
});
