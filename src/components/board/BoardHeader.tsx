import { useState } from 'react';
import type { FormEvent } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import { createId } from '../../lib/id';
import { logger } from '../../lib/logger';
import { validateTitle } from '../../lib/validation';

interface BoardHeaderProps {
  boardId: string;
  boardTitle: string;
  headingId: string;
}

export function BoardHeader({
  boardId,
  boardTitle,
  headingId,
}: BoardHeaderProps) {
  const { dispatch, showError } = useBoardState();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const errorId = `board-${boardId}-add-column-error`;

  function closeForm(): void {
    setIsAdding(false);
    setTitle('');
    setValidationError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const titleResult = validateTitle(title);
    if (!titleResult.ok) {
      setValidationError(titleResult.error);
      return;
    }

    const idResult = createId();
    if (!idResult.ok) {
      logger.error('A column id could not be created.', {
        error: idResult.error,
      });
      showError('The column could not be created. Please try again.');
      return;
    }

    dispatch({
      type: 'ADD_COLUMN',
      boardId,
      column: { id: idResult.value, title: titleResult.value, cardIds: [] },
      updatedAt: Date.now(),
    });
    closeForm();
  }

  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <h2
        id={headingId}
        tabIndex={-1}
        className="text-xl font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {boardTitle}
      </h2>
      {isAdding ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-start gap-2"
          noValidate
        >
          <div>
            <label
              htmlFor={`board-${boardId}-add-column-title`}
              className="sr-only"
            >
              Column name
            </label>
            <input
              id={`board-${boardId}-add-column-title`}
              autoFocus
              placeholder="Column name"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (validationError) {
                  setValidationError(null);
                }
              }}
              aria-invalid={validationError ? true : undefined}
              aria-describedby={validationError ? errorId : undefined}
              className="min-h-10 rounded-sm border border-border bg-surface px-3 py-2 text-base focus:border-accent"
            />
            {validationError ? (
              <p id={errorId} className="mt-2 text-sm text-danger">
                {validationError}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="min-h-10 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
          >
            Add column
          </button>
          <button
            type="button"
            onClick={closeForm}
            className="min-h-10 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="min-h-10 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background"
        >
          Add column
        </button>
      )}
    </div>
  );
}
