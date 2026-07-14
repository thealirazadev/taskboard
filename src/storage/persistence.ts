import type { PersistedState } from '../types/board';
import type { Result } from '../types/result';
import { readStorage, removeStorage, writeStorage } from './localStorageDriver';
import type { StorageError } from './localStorageDriver';

export const CURRENT_SCHEMA_VERSION = 1;
export const BOARD_STORAGE_KEY = 'taskboard:v1';

export type PersistenceError =
  | { kind: 'storage'; error: StorageError }
  | { kind: 'serialize'; cause: unknown }
  | { kind: 'parse'; cause: unknown };

export function serializeState(
  state: PersistedState,
): Result<string, PersistenceError> {
  try {
    return { ok: true, value: JSON.stringify(state) };
  } catch (cause: unknown) {
    return { ok: false, error: { kind: 'serialize', cause } };
  }
}

export function parseSerializedState(
  serializedState: string,
): Result<unknown, PersistenceError> {
  try {
    return { ok: true, value: JSON.parse(serializedState) as unknown };
  } catch (cause: unknown) {
    return { ok: false, error: { kind: 'parse', cause } };
  }
}

export function readSerializedState(): Result<string | null, PersistenceError> {
  const result = readStorage(BOARD_STORAGE_KEY);
  return result.ok
    ? result
    : { ok: false, error: { kind: 'storage', error: result.error } };
}

export function persistState(
  state: PersistedState,
): Result<void, PersistenceError> {
  const serializedResult = serializeState(state);
  if (!serializedResult.ok) {
    return serializedResult;
  }

  const result = writeStorage(BOARD_STORAGE_KEY, serializedResult.value);
  return result.ok
    ? result
    : { ok: false, error: { kind: 'storage', error: result.error } };
}

export function clearPersistedState(): Result<void, PersistenceError> {
  const result = removeStorage(BOARD_STORAGE_KEY);
  return result.ok
    ? result
    : { ok: false, error: { kind: 'storage', error: result.error } };
}
