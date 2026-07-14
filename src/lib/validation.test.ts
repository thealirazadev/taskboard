import { describe, expect, it } from 'vitest';

import { validateTitle } from './validation';

describe('validateTitle', () => {
  it('trims and accepts a non-empty title', () => {
    expect(validateTitle('  Plan work  ')).toEqual({
      ok: true,
      value: 'Plan work',
    });
  });

  it('rejects empty and whitespace-only titles', () => {
    expect(validateTitle('')).toEqual({ ok: false, error: 'Enter a title.' });
    expect(validateTitle('   ')).toEqual({
      ok: false,
      error: 'Enter a title.',
    });
  });

  it('accepts long titles without imposing an undocumented limit', () => {
    const title = 'x'.repeat(10_000);
    expect(validateTitle(title)).toEqual({ ok: true, value: title });
  });
});
