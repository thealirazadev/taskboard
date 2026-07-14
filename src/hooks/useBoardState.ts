import { useContext } from 'react';

import { BoardContext } from '../state/BoardContext';
import type { BoardContextValue } from '../state/BoardContext';

export function useBoardState(): BoardContextValue {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardState must be used inside BoardProvider.');
  }

  return context;
}
