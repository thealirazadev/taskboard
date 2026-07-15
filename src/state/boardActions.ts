import type { Card, Column, PersistedState } from '../types/board';

export type BoardAction =
  | { type: 'REPLACE_STATE'; state: PersistedState }
  | { type: 'RESET_STATE' }
  | { type: 'ADD_CARD'; boardId: string; columnId: string; card: Card }
  | {
      type: 'UPDATE_CARD';
      boardId: string;
      cardId: string;
      title: string;
      description: string;
      updatedAt: number;
    }
  | { type: 'DELETE_CARD'; boardId: string; cardId: string; updatedAt: number }
  | {
      type: 'RENAME_COLUMN';
      boardId: string;
      columnId: string;
      title: string;
      updatedAt: number;
    }
  | { type: 'ADD_COLUMN'; boardId: string; column: Column; updatedAt: number }
  | {
      type: 'DELETE_COLUMN';
      boardId: string;
      columnId: string;
      updatedAt: number;
    };
