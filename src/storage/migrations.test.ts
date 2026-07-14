import { describe, expect, it } from 'vitest';

import { migrateToCurrentVersion, runMigrations } from './migrations';

describe('migrations', () => {
  it('passes the current version through unchanged', () => {
    const state = { version: 1, value: 'kept' };

    expect(migrateToCurrentVersion(state)).toEqual({ ok: true, value: state });
  });

  it('runs migrations in order', () => {
    const result = runMigrations({ version: 1, steps: [] }, 3, {
      1: (value) => ({
        ok: true,
        value: {
          ...(value as { version: number; steps: string[] }),
          version: 2,
          steps: ['one'],
        },
      }),
      2: (value) => ({
        ok: true,
        value: {
          ...(value as { version: number; steps: string[] }),
          version: 3,
          steps: ['one', 'two'],
        },
      }),
    });

    expect(result).toEqual({
      ok: true,
      value: { version: 3, steps: ['one', 'two'] },
    });
  });

  it('rejects invalid, future, and unsupported older versions', () => {
    expect(runMigrations({}, 1, {})).toEqual({
      ok: false,
      error: { kind: 'invalid-version' },
    });
    expect(runMigrations({ version: 2 }, 1, {})).toEqual({
      ok: false,
      error: { kind: 'unsupported-version', version: 2 },
    });
    expect(runMigrations({ version: 0 }, 1, {})).toEqual({
      ok: false,
      error: { kind: 'missing-migration', version: 0 },
    });
  });

  it('reports thrown and invalid migration results', () => {
    const cause = new Error('migration failed');
    expect(
      runMigrations({ version: 0 }, 1, {
        0: () => {
          throw cause;
        },
      }),
    ).toEqual({
      ok: false,
      error: { kind: 'migration-failed', version: 0, cause },
    });

    expect(
      runMigrations({ version: 0 }, 1, {
        0: () => ({ ok: true, value: { version: 0 } }),
      }),
    ).toEqual({
      ok: false,
      error: { kind: 'invalid-migration-result', version: 0 },
    });
  });
});
