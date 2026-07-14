interface EmptyStateProps {
  heading: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  heading,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <h2 className="text-2xl font-bold">{heading}</h2>
      <p className="mx-auto mt-2 max-w-xl text-muted">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 min-h-10 rounded-md bg-accent px-4 py-2 font-medium text-accent-contrast shadow-sm hover:bg-accent-hover"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
