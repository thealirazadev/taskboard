import { useBoardState } from '../hooks/useBoardState';
import { BoardView } from './board/BoardView';
import { ErrorBanner } from './common/ErrorBanner';

export function AppShell() {
  const { notice, dismissNotice, resetStorage } = useBoardState();

  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <header className="mx-auto mb-6 max-w-screen-2xl">
        <h1 className="text-2xl font-bold">taskboard</h1>
        <p className="mt-1 text-sm text-muted">
          A private board for focused work.
        </p>
      </header>
      <div className="mx-auto max-w-screen-2xl">
        {notice ? (
          <ErrorBanner
            message={notice.message}
            actionLabel={notice.canReset ? 'Start fresh' : undefined}
            onAction={notice.canReset ? resetStorage : undefined}
            onDismiss={notice.isDismissible ? dismissNotice : undefined}
          />
        ) : null}
        <BoardView />
      </div>
    </main>
  );
}
