import type { ChangeEvent } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import { useConfirm } from '../../hooks/useConfirm';
import { logger } from '../../lib/logger';
import { validatePersistedState } from '../../storage/schema';
import type { PersistedState } from '../../types/board';
import { ConfirmDialog } from '../common/ConfirmDialog';

function downloadJson(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function readImportFile(
  file: File,
  onParsed: (state: PersistedState | null) => void,
  onError: (message: string, cause: unknown) => void,
): void {
  const reader = new FileReader();
  reader.onload = () => {
    const text = typeof reader.result === 'string' ? reader.result : '';
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (cause) {
      onError(
        'That file is not valid JSON. Existing data was not changed.',
        cause,
      );
      onParsed(null);
      return;
    }

    const result = validatePersistedState(parsed);
    if (!result.ok) {
      onError(
        'That file is not a valid taskboard export. Existing data was not changed.',
        result.error,
      );
      onParsed(null);
      return;
    }

    onParsed(result.value);
  };
  reader.onerror = () => {
    onError('That file could not be read. Please try again.', reader.error);
    onParsed(null);
  };
  reader.readAsText(file);
}

export function DataTransfer() {
  const { state, dispatch, showError } = useBoardState();
  const { pending, confirm, respondConfirm, respondCancel } = useConfirm();

  function handleExport(): void {
    try {
      if (typeof URL.createObjectURL !== 'function') {
        throw new Error('URL.createObjectURL is unavailable.');
      }
      downloadJson('taskboard-export.json', JSON.stringify(state, null, 2));
    } catch (cause) {
      logger.error('Board data could not be exported.', { error: cause });
      showError('Your board data could not be exported. Please try again.');
    }
  }

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) {
      return;
    }

    readImportFile(
      file,
      (importedState) => {
        if (!importedState) {
          return;
        }
        void (async () => {
          const confirmed = await confirm({
            title: 'Replace all board data?',
            description:
              'Importing replaces every board currently saved with the contents of this file. This action cannot be undone.',
            confirmLabel: 'Replace data',
          });
          if (confirmed) {
            dispatch({ type: 'REPLACE_STATE', state: importedState });
          }
        })();
      },
      (message, cause) => {
        logger.warn('Board data could not be imported.', { error: cause });
        showError(message);
      },
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        className="min-h-10 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background"
      >
        Export data
      </button>
      <label className="min-h-10 cursor-pointer rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background">
        Import data
        <input
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelected}
          className="sr-only"
        />
      </label>
      {pending ? (
        <ConfirmDialog
          title={pending.title}
          description={pending.description}
          confirmLabel={pending.confirmLabel}
          onConfirm={respondConfirm}
          onCancel={respondCancel}
        />
      ) : null}
    </div>
  );
}
