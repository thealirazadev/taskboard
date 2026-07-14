import { afterEach, describe, expect, it, vi } from 'vitest';

import { createId } from './id';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createId', () => {
  it('returns an id from the browser crypto API', () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-4000-8000-000000000000',
    );

    expect(createId()).toEqual({
      ok: true,
      value: '00000000-0000-4000-8000-000000000000',
    });
  });

  it('reports a failed id generation call', () => {
    const cause = new Error('id failed');
    vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(() => {
      throw cause;
    });

    expect(createId()).toEqual({
      ok: false,
      error: { kind: 'id-unavailable', cause },
    });
  });
});
