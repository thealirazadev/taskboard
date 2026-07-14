import type { Result } from '../types/result';

export type StorageOperation = 'get' | 'set' | 'remove';
export type StorageErrorKind = 'unavailable' | 'quota' | 'failed';

export interface StorageError {
  operation: StorageOperation;
  kind: StorageErrorKind;
  cause: unknown;
}

function storageError(
  operation: StorageOperation,
  kind: StorageErrorKind,
  cause: unknown,
): StorageError {
  return { operation, kind, cause };
}

function getStorage(
  operation: StorageOperation,
): Result<Storage, StorageError> {
  try {
    if (typeof window === 'undefined') {
      return {
        ok: false,
        error: storageError(operation, 'unavailable', null),
      };
    }

    return { ok: true, value: window.localStorage };
  } catch (cause: unknown) {
    return {
      ok: false,
      error: storageError(operation, 'unavailable', cause),
    };
  }
}

function isQuotaExceededError(cause: unknown): boolean {
  return (
    cause instanceof DOMException &&
    (cause.name === 'QuotaExceededError' ||
      cause.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

export function readStorage(key: string): Result<string | null, StorageError> {
  const storageResult = getStorage('get');
  if (!storageResult.ok) {
    return storageResult;
  }

  try {
    return { ok: true, value: storageResult.value.getItem(key) };
  } catch (cause: unknown) {
    return {
      ok: false,
      error: storageError('get', 'failed', cause),
    };
  }
}

export function writeStorage(
  key: string,
  value: string,
): Result<void, StorageError> {
  const storageResult = getStorage('set');
  if (!storageResult.ok) {
    return storageResult;
  }

  try {
    storageResult.value.setItem(key, value);
    return { ok: true, value: undefined };
  } catch (cause: unknown) {
    return {
      ok: false,
      error: storageError(
        'set',
        isQuotaExceededError(cause) ? 'quota' : 'failed',
        cause,
      ),
    };
  }
}

export function removeStorage(key: string): Result<void, StorageError> {
  const storageResult = getStorage('remove');
  if (!storageResult.ok) {
    return storageResult;
  }

  try {
    storageResult.value.removeItem(key);
    return { ok: true, value: undefined };
  } catch (cause: unknown) {
    return {
      ok: false,
      error: storageError('remove', 'failed', cause),
    };
  }
}
