interface ErrorBannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({
  message,
  actionLabel,
  onAction,
  onDismiss,
}: ErrorBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-4 flex flex-col gap-3 rounded-md border border-danger bg-surface p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="break-words text-foreground">{message}</p>
      <div className="flex shrink-0 gap-2">
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="min-h-10 rounded-md bg-danger px-4 py-2 font-medium text-danger-contrast hover:opacity-90"
          >
            {actionLabel}
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-10 rounded-md border border-border bg-surface px-4 py-2 font-medium hover:bg-background"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
