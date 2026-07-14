import { createContext, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';

import type { PersistedState } from '../types/board';
import type { BoardAction } from './boardActions';
import { boardReducer, createEmptyState } from './boardReducer';

export interface BoardContextValue {
  state: PersistedState;
  dispatch: Dispatch<BoardAction>;
}

export const BoardContext = createContext<BoardContextValue | null>(null);

interface BoardProviderProps {
  children: ReactNode;
  initialState?: PersistedState;
}

export function BoardProvider({
  children,
  initialState = createEmptyState(),
}: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}
