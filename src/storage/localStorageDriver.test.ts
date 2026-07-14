import { afterEach, describe, expect, it } from 'vitest';

import { readStorage, removeStorage, writeStorage } from './localStorageDriver';

const originalStorageDescriptor = Object.getOwnPropertyDescriptor(
  window,
  'localStorage',
);

function createStorage(overrides: Partial<Storage> = {}): Storage {
  return {
    length: 0,
    clear: () => undefined,
    getItem: () => null,
    key: () => null,
    removeItem: () => undefined,
    setItem: () => undefined,
    ...overrides,
  };
}

function useStorage(storage: Storage): void {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: storage,
  });
}

afterEach(() => {
  if (originalStorageDescriptor) {
    Object.defineProperty(window, 'localStorage', originalStorageDescriptor);
  }
});

describe('localStorageDriver', () => {
  it('reads stored values and missing values', () => {
    useStorage(
      createStorage({
        getItem: (key) => (key === 'present' ? 'saved' : null),
      }),
    );

    expect(readStorage('present')).toEqual({ ok: true, value: 'saved' });
    expect(readStorage('missing')).toEqual({ ok: true, value: null });
  });

  it('reports unavailable storage when access to it throws', () => {
    const cause = new Error('blocked');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw cause;
      },
    });

    expect(readStorage('key')).toEqual({
      ok: false,
      error: { operation: 'get', kind: 'unavailable', cause },
    });
  });

  it('reports a failed read', () => {
    const cause = new Error('read failed');
    useStorage(
      createStorage({
        getItem: () => {
          throw cause;
        },
      }),
    );

    expect(readStorage('key')).toEqual({
      ok: false,
      error: { operation: 'get', kind: 'failed', cause },
    });
  });

  it('reports quota errors separately from other failed writes', () => {
    const quotaCause = new DOMException('full', 'QuotaExceededError');
    useStorage(
      createStorage({
        setItem: () => {
          throw quotaCause;
        },
      }),
    );

    expect(writeStorage('key', 'value')).toEqual({
      ok: false,
      error: { operation: 'set', kind: 'quota', cause: quotaCause },
    });

    const failedCause = new Error('write failed');
    useStorage(
      createStorage({
        setItem: () => {
          throw failedCause;
        },
      }),
    );

    expect(writeStorage('key', 'value')).toEqual({
      ok: false,
      error: { operation: 'set', kind: 'failed', cause: failedCause },
    });
  });

  it('writes and removes values successfully', () => {
    const values = new Map<string, string>();
    useStorage(
      createStorage({
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key),
      }),
    );

    expect(writeStorage('key', 'value')).toEqual({
      ok: true,
      value: undefined,
    });
    expect(values.get('key')).toBe('value');
    expect(removeStorage('key')).toEqual({ ok: true, value: undefined });
    expect(values.has('key')).toBe(false);
  });

  it('reports a failed removal', () => {
    const cause = new Error('remove failed');
    useStorage(
      createStorage({
        removeItem: () => {
          throw cause;
        },
      }),
    );

    expect(removeStorage('key')).toEqual({
      ok: false,
      error: { operation: 'remove', kind: 'failed', cause },
    });
  });
});
