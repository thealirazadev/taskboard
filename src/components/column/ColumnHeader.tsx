import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import { useConfirm } from '../../hooks/useConfirm';
import { validateTitle } from '../../lib/validation';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ColumnHeaderProps {
  boardId: string;
  columnId: string;
  headingId: string;
  title: string;
  cardCount: number;
}

export function ColumnHeader({
  boardId,
  columnId,
  headingId,
  title,
  cardCount,
}: ColumnHeaderProps) {
  const { dispatch } = useBoardState();
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { pending, confirm, respondConfirm, respondCancel } = useConfirm();
  const cardLabel = cardCount === 1 ? '1 card' : `${cardCount} cards`;
  const errorId = `column-${columnId}-name-error`;

  // The heading only exists in the DOM once renaming ends, so focus is
  // restored from an effect rather than immediately after setIsRenaming.
  const wasRenamingRef = useRef(false);
  useEffect(() => {
    if (wasRenamingRef.current && !isRenaming) {
      document.getElementById(headingId)?.focus();
    }
    wasRenamingRef.current = isRenaming;
  }, [isRenaming, headingId]);

  function startRenaming(): void {
    setDraftTitle(title);
    setValidationError(null);
    setIsRenaming(true);
  }

  function cancelRenaming(): void {
    setIsRenaming(false);
    setValidationError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const titleResult = validateTitle(draftTitle);
    if (!titleResult.ok) {
      setValidationError(titleResult.error);
      return;
    }

    dispatch({
      type: 'RENAME_COLUMN',
      boardId,
      columnId,
      title: titleResult.value,
      updatedAt: Date.now(),
    });
    setIsRenaming(false);
  }

  async function handleDeleteColumn(): Promise<void> {
    const cardWarning =
      cardCount > 0
        ? ` This also deletes ${cardCount === 1 ? 'its 1 card' : `its ${cardCount} cards`}.`
        : '';
    const confirmed = await confirm({
      title: `Delete "${title}" column?`,
      description: `This removes the column.${cardWarning} This action cannot be undone.`,
      confirmLabel: 'Delete column',
    });

    if (!confirmed) {
      return;
    }

    dispatch({
      type: 'DELETE_COLUMN',
      boardId,
      columnId,
      updatedAt: Date.now(),
    });
    document.getElementById(`board-${boardId}-heading`)?.focus();
  }

  if (isRenaming) {
    return (
      <form onSubmit={handleSubmit} className="mb-3 space-y-2" noValidate>
        <label htmlFor={`column-${columnId}-name`} className="sr-only">
          Column name
        </label>
        <input
          id={`column-${columnId}-name`}
          autoFocus
          value={draftTitle}
          onChange={(event) => {
            setDraftTitle(event.target.value);
            if (validationError) {
              setValidationError(null);
            }
          }}
          aria-invalid={validationError ? true : undefined}
          aria-describedby={validationError ? errorId : undefined}
          className="min-h-10 w-full rounded-sm border border-border bg-surface px-3 py-2 text-lg font-semibold focus:border-accent"
        />
        {validationError ? (
          <p id={errorId} className="text-sm text-danger">
            {validationError}
          </p>
        ) : null}
        <div className="flex gap-2">
          <button
            type="submit"
            className="min-h-10 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
          >
            Save name
          </button>
          <button
            type="button"
            onClick={cancelRenaming}
            className="min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-background"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3
          id={headingId}
          tabIndex={-1}
          className="min-w-0 break-words text-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {title}
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-muted">{cardLabel}</span>
          <button
            type="button"
            aria-label={`Rename column ${title}`}
            onClick={startRenaming}
            className="min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-background"
          >
            Rename
          </button>
          <button
            type="button"
            aria-label={`Delete column ${title}`}
            onClick={handleDeleteColumn}
            className="min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-danger hover:bg-background"
          >
            Delete
          </button>
        </div>
      </header>
      {pending ? (
        <ConfirmDialog
          title={pending.title}
          description={pending.description}
          confirmLabel={pending.confirmLabel}
          onConfirm={respondConfirm}
          onCancel={respondCancel}
        />
      ) : null}
    </>
  );
}
