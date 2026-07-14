import type { Result } from '../types/result';

export interface IdError {
  kind: 'id-unavailable';
  cause: unknown;
}

export function createId(): Result<string, IdError> {
  try {
    if (typeof globalThis.crypto?.randomUUID !== 'function') {
      return {
        ok: false,
        error: { kind: 'id-unavailable', cause: null },
      };
    }

    return { ok: true, value: globalThis.crypto.randomUUID() };
  } catch (cause: unknown) {
    return { ok: false, error: { kind: 'id-unavailable', cause } };
  }
}
