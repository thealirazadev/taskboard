import type { PersistedState } from '../types/board';
import type { Result } from '../types/result';
import { BOARD_STORAGE_KEY } from './constants';
import { readStorage, removeStorage, writeStorage } from './localStorageDriver';
import type { StorageError } from './localStorageDriver';
import { migrateToCurrentVersion } from './migrations';
import type { MigrationError } from './migrations';
import { validatePersistedState } from './schema';
import type { SchemaError } from './schema';

export { BOARD_STORAGE_KEY, CURRENT_SCHEMA_VERSION } from './constants';

export type PersistenceError =
  | { kind: 'storage'; error: StorageError }
  | { kind: 'serialize'; cause: unknown }
  | { kind: 'parse'; cause: unknown }
  | { kind: 'migration'; error: MigrationError }
  | { kind: 'schema'; error: SchemaError };

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

export function deserializeState(
  serializedState: string,
): Result<PersistedState, PersistenceError> {
  const parseResult = parseSerializedState(serializedState);
  if (!parseResult.ok) {
    return parseResult;
  }

  const migrationResult = migrateToCurrentVersion(parseResult.value);
  if (!migrationResult.ok) {
    return {
      ok: false,
      error: { kind: 'migration', error: migrationResult.error },
    };
  }

  const schemaResult = validatePersistedState(migrationResult.value);
  return schemaResult.ok
    ? schemaResult
    : { ok: false, error: { kind: 'schema', error: schemaResult.error } };
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

export function loadPersistedState(): Result<
  PersistedState | null,
  PersistenceError
> {
  const readResult = readSerializedState();
  if (!readResult.ok) {
    return readResult;
  }

  if (readResult.value === null) {
    return { ok: true, value: null };
  }

  return deserializeState(readResult.value);
}

export function clearPersistedState(): Result<void, PersistenceError> {
  const result = removeStorage(BOARD_STORAGE_KEY);
  return result.ok
    ? result
    : { ok: false, error: { kind: 'storage', error: result.error } };
}
