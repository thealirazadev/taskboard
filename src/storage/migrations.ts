import type { Result } from '../types/result';
import { CURRENT_SCHEMA_VERSION } from './constants';

export type MigrationError =
  | { kind: 'invalid-version' }
  | { kind: 'unsupported-version'; version: number }
  | { kind: 'missing-migration'; version: number }
  | { kind: 'migration-failed'; version: number; cause: unknown }
  | { kind: 'invalid-migration-result'; version: number };

export type Migration = (value: unknown) => Result<unknown, MigrationError>;

function readVersion(value: unknown): number | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !('version' in value)
  ) {
    return null;
  }

  const version = value.version;
  return typeof version === 'number' && Number.isInteger(version)
    ? version
    : null;
}

export function runMigrations(
  value: unknown,
  targetVersion: number,
  migrations: Readonly<Record<number, Migration>>,
): Result<unknown, MigrationError> {
  let version = readVersion(value);
  if (version === null) {
    return { ok: false, error: { kind: 'invalid-version' } };
  }

  if (version > targetVersion) {
    return {
      ok: false,
      error: { kind: 'unsupported-version', version },
    };
  }

  let migratedValue = value;
  while (version < targetVersion) {
    const migration = migrations[version];
    if (!migration) {
      return {
        ok: false,
        error: { kind: 'missing-migration', version },
      };
    }

    let result: Result<unknown, MigrationError>;
    try {
      result = migration(migratedValue);
    } catch (cause: unknown) {
      return {
        ok: false,
        error: { kind: 'migration-failed', version, cause },
      };
    }

    if (!result.ok) {
      return result;
    }

    const nextVersion = readVersion(result.value);
    if (nextVersion !== version + 1) {
      return {
        ok: false,
        error: { kind: 'invalid-migration-result', version },
      };
    }

    migratedValue = result.value;
    version = nextVersion;
  }

  return { ok: true, value: migratedValue };
}

export function migrateToCurrentVersion(
  value: unknown,
): Result<unknown, MigrationError> {
  return runMigrations(value, CURRENT_SCHEMA_VERSION, {});
}
