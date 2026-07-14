import { createContext } from 'react';
import type { ReactNode } from 'react';

import { useBoardStorage } from '../hooks/useBoardStorage';
import type { BoardStorageValue } from '../hooks/useBoardStorage';

export type BoardContextValue = BoardStorageValue;

export const BoardContext = createContext<BoardContextValue | null>(null);

interface BoardProviderProps {
  children: ReactNode;
}

export function BoardProvider({ children }: BoardProviderProps) {
  const value = useBoardStorage();

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}
