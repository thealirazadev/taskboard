import { useBoardState } from '../../hooks/useBoardState';
import { logger } from '../../lib/logger';

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

export function DataTransfer() {
  const { state, showError } = useBoardState();

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        className="min-h-10 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background"
      >
        Export data
      </button>
    </div>
  );
}
