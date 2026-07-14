import type { Result } from '../types/result';

export function validateTitle(value: string): Result<string, string> {
  const title = value.trim();
  return title.length > 0
    ? { ok: true, value: title }
    : { ok: false, error: 'Enter a title.' };
}
