import { useCallback, useEffect, useState } from 'react';

import { logger } from '../lib/logger';
import { THEME_STORAGE_KEY } from '../storage/constants';
import { readStorage, writeStorage } from '../storage/localStorageDriver';

export type Theme = 'light' | 'dark';

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

function systemTheme(): Theme {
  const prefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function readStoredTheme(): Theme | null {
  const result = readStorage(THEME_STORAGE_KEY);
  return result.ok && isTheme(result.value) ? result.value : null;
}

export interface UseThemeResult {
  theme: Theme;
  toggleTheme: () => void;
}

/**
 * Theme follows the OS preference through a CSS media query until the user
 * makes an explicit choice; that choice is then persisted and applied as a
 * class on the document root, overriding the media query.
 */
export function useTheme(): UseThemeResult {
  const [override, setOverride] = useState<Theme | null>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (override) {
      root.classList.add(override);
    }
  }, [override]);

  const toggleTheme = useCallback(() => {
    setOverride((current) => {
      const effective = current ?? systemTheme();
      const next: Theme = effective === 'dark' ? 'light' : 'dark';
      const result = writeStorage(THEME_STORAGE_KEY, next);
      if (!result.ok) {
        logger.warn('Theme preference could not be saved.', {
          error: result.error,
        });
      }
      return next;
    });
  }, []);

  return { theme: override ?? systemTheme(), toggleTheme };
}
