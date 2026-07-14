import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PersistedState } from '../types/board';
import { removeStorage } from './localStorageDriver';
import {
  BOARD_STORAGE_KEY,
  clearPersistedState,
  deserializeState,
  loadPersistedState,
  parseSerializedState,
  persistState,
  readSerializedState,
  serializeState,
} from './persistence';

const emptyState: PersistedState = {
  version: 1,
  boards: {},
  boardOrder: [],
  activeBoardId: null,
};

afterEach(() => {
  vi.restoreAllMocks();
  removeStorage(BOARD_STORAGE_KEY);
});

describe('persistence', () => {
  it('serializes and parses a state without changing it', () => {
    const serializedResult = serializeState(emptyState);
    expect(serializedResult.ok).toBe(true);
    if (!serializedResult.ok) {
      return;
    }

    expect(parseSerializedState(serializedResult.value)).toEqual({
      ok: true,
      value: emptyState,
    });
  });

  it('returns a parse error for malformed JSON', () => {
    const result = parseSerializedState('{broken');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('parse');
    }
  });

  it('returns a serialization error when JSON conversion fails', () => {
    const cause = new Error('serialize failed');
    vi.spyOn(JSON, 'stringify').mockImplementation(() => {
      throw cause;
    });

    expect(serializeState(emptyState)).toEqual({
      ok: false,
      error: { kind: 'serialize', cause },
    });
  });

  it('reads no state on first run', () => {
    clearPersistedState();

    expect(readSerializedState()).toEqual({ ok: true, value: null });
  });

  it('writes and clears the versioned state', () => {
    expect(persistState(emptyState)).toEqual({ ok: true, value: undefined });
    expect(readSerializedState()).toEqual({
      ok: true,
      value: JSON.stringify(emptyState),
    });

    expect(clearPersistedState()).toEqual({ ok: true, value: undefined });
    expect(readSerializedState()).toEqual({ ok: true, value: null });
  });

  it('deserializes and loads validated state', () => {
    const serializedState = JSON.stringify(emptyState);
    expect(deserializeState(serializedState)).toEqual({
      ok: true,
      value: emptyState,
    });

    persistState(emptyState);
    expect(loadPersistedState()).toEqual({ ok: true, value: emptyState });
  });

  it('rejects wrong-shaped and unsupported saved data', () => {
    const schemaResult = deserializeState(
      JSON.stringify({ ...emptyState, boardOrder: ['missing'] }),
    );
    expect(schemaResult.ok).toBe(false);
    if (!schemaResult.ok) {
      expect(schemaResult.error.kind).toBe('schema');
    }

    const migrationResult = deserializeState(
      JSON.stringify({ ...emptyState, version: 2 }),
    );
    expect(migrationResult.ok).toBe(false);
    if (!migrationResult.ok) {
      expect(migrationResult.error.kind).toBe('migration');
    }
  });
});
