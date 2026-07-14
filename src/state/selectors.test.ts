import { describe, expect, it } from 'vitest';

import type { PersistedState } from '../types/board';
import {
  selectActiveBoard,
  selectBoardById,
  selectBoards,
  selectCardById,
  selectCardLocation,
  selectCardsForColumn,
  selectColumnById,
  selectColumnsForBoard,
  selectHasBoards,
} from './selectors';

const state: PersistedState = {
  version: 1,
  boardOrder: ['board-2', 'board-1'],
  activeBoardId: 'board-1',
  boards: {
    'board-1': {
      id: 'board-1',
      title: 'First',
      columnOrder: ['column-2', 'column-1'],
      columns: {
        'column-1': { id: 'column-1', title: 'One', cardIds: [] },
        'column-2': {
          id: 'column-2',
          title: 'Two',
          cardIds: ['card-1'],
        },
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
    'board-2': {
      id: 'board-2',
      title: 'Second',
      columnOrder: [],
      columns: {},
      cards: {},
      createdAt: 1,
      updatedAt: 1,
    },
  },
};

describe('selectors', () => {
  it('derives boards and columns in their stored order', () => {
    expect(selectBoards(state).map((board) => board.id)).toEqual([
      'board-2',
      'board-1',
    ]);
    expect(
      selectColumnsForBoard(state, 'board-1').map((column) => column.id),
    ).toEqual(['column-2', 'column-1']);
  });

  it('selects active and identified entities', () => {
    expect(selectActiveBoard(state)?.id).toBe('board-1');
    expect(selectBoardById(state, 'board-2')?.title).toBe('Second');
    expect(selectColumnById(state, 'board-1', 'column-1')?.title).toBe('One');
    expect(selectCardById(state, 'board-1', 'card-1')?.title).toBe('Task');
  });

  it('derives ordered cards and their location', () => {
    expect(
      selectCardsForColumn(state, 'board-1', 'column-2').map((card) => card.id),
    ).toEqual(['card-1']);
    expect(selectCardLocation(state, 'board-1', 'card-1')).toEqual({
      boardId: 'board-1',
      columnId: 'column-2',
      index: 0,
    });
  });

  it('returns safe empty values for missing entities', () => {
    expect(selectBoardById(state, 'missing')).toBeNull();
    expect(selectColumnsForBoard(state, 'missing')).toEqual([]);
    expect(selectCardsForColumn(state, 'board-1', 'missing')).toEqual([]);
    expect(selectCardLocation(state, 'board-1', 'missing')).toBeNull();
    expect(selectHasBoards(state)).toBe(true);
    expect(selectHasBoards({ ...state, boardOrder: [] })).toBe(false);
  });
});
