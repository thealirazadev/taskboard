import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Dispatch } from 'react';

import { logger } from '../lib/logger';
import type { BoardAction } from '../state/boardActions';
import { boardReducer, createEmptyState } from '../state/boardReducer';
import {
  clearPersistedState,
  loadPersistedState,
  persistState,
} from '../storage/persistence';
import type { PersistenceError } from '../storage/persistence';
import type { PersistedState } from '../types/board';

type StorageMode = 'writable' | 'memory-only' | 'awaiting-reset';

export interface BoardNotice {
  message: string;
  canReset: boolean;
  isDismissible: boolean;
}

interface InitialStorageState {
  state: PersistedState;
  mode: StorageMode;
  notice: BoardNotice | null;
}

export interface BoardStorageValue {
  state: PersistedState;
  dispatch: Dispatch<BoardAction>;
  notice: BoardNotice | null;
  dismissNotice: () => void;
  resetStorage: () => void;
}

function isUnavailableStorageError(error: PersistenceError): boolean {
  return (
    error.kind === 'storage' &&
    (error.error.kind === 'unavailable' || error.error.kind === 'failed')
  );
}

function createWriteNotice(error: PersistenceError): BoardNotice {
  if (error.kind === 'storage' && error.error.kind === 'quota') {
    return {
      message: 'Storage is full. Recent changes may not be saved.',
      canReset: false,
      isDismissible: true,
    };
  }

  if (isUnavailableStorageError(error)) {
    return {
      message:
        'Local storage is unavailable. Changes will stay in this tab only.',
      canReset: false,
      isDismissible: true,
    };
  }

  return {
    message: 'Recent changes could not be saved. They remain open in this tab.',
    canReset: false,
    isDismissible: true,
  };
}

function loadInitialStorageState(): InitialStorageState {
  const result = loadPersistedState();
  if (result.ok) {
    return {
      state: result.value ?? createEmptyState(),
      mode: 'writable',
      notice: null,
    };
  }

  logger.warn('Board storage could not be loaded.', { error: result.error });

  if (isUnavailableStorageError(result.error)) {
    return {
      state: createEmptyState(),
      mode: 'memory-only',
      notice: createWriteNotice(result.error),
    };
  }

  return {
    state: createEmptyState(),
    mode: 'awaiting-reset',
    notice: {
      message:
        'Saved board data could not be opened. Start fresh to use this board again.',
      canReset: true,
      isDismissible: false,
    },
  };
}

export function useBoardStorage(): BoardStorageValue {
  const initialStorageStateRef = useRef<InitialStorageState>();
  if (!initialStorageStateRef.current) {
    initialStorageStateRef.current = loadInitialStorageState();
  }

  const initialStorageState = initialStorageStateRef.current;
  const [state, dispatch] = useReducer(boardReducer, initialStorageState.state);
  const [mode, setMode] = useState<StorageMode>(initialStorageState.mode);
  const [notice, setNotice] = useState<BoardNotice | null>(
    initialStorageState.notice,
  );
  const lastPersistedStateRef = useRef(state);

  useEffect(() => {
    if (mode !== 'writable' || state === lastPersistedStateRef.current) {
      return;
    }

    const result = persistState(state);
    if (result.ok) {
      lastPersistedStateRef.current = state;
      setNotice(null);
      return;
    }

    logger.error('Board storage could not be updated.', {
      error: result.error,
    });
    setNotice(createWriteNotice(result.error));
    if (isUnavailableStorageError(result.error)) {
      setMode('memory-only');
    }
  }, [mode, state]);

  const dismissNotice = useCallback(() => {
    setNotice((currentNotice) =>
      currentNotice?.isDismissible ? null : currentNotice,
    );
  }, []);

  const resetStorage = useCallback(() => {
    const result = clearPersistedState();
    if (!result.ok) {
      logger.error('Board storage could not be reset.', {
        error: result.error,
      });
      setNotice({
        message: 'Saved board data could not be cleared. Please try again.',
        canReset: true,
        isDismissible: false,
      });
      return;
    }

    const emptyState = createEmptyState();
    lastPersistedStateRef.current = emptyState;
    dispatch({ type: 'REPLACE_STATE', state: emptyState });
    setMode('writable');
    setNotice(null);
  }, []);

  return { state, dispatch, notice, dismissNotice, resetStorage };
}
