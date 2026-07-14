import { useState } from 'react';
import type { FormEvent } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import { createId } from '../../lib/id';
import { logger } from '../../lib/logger';
import { validateTitle } from '../../lib/validation';

interface AddCardFormProps {
  boardId: string;
  columnId: string;
  columnTitle: string;
}

export function AddCardForm({
  boardId,
  columnId,
  columnTitle,
}: AddCardFormProps) {
  const { dispatch, showError } = useBoardState();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const errorId = `add-card-${columnId}-error`;

  function closeForm(): void {
    setIsOpen(false);
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
      logger.error('A card id could not be created.', {
        error: idResult.error,
      });
      showError('The card could not be created. Please try again.');
      return;
    }

    const timestamp = Date.now();
    dispatch({
      type: 'ADD_CARD',
      boardId,
      columnId,
      card: {
        id: idResult.value,
        title: titleResult.value,
        description: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    });
    closeForm();
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-3 min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-background"
      >
        Add card
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3" noValidate>
      <div>
        <label
          htmlFor={`add-card-${columnId}-title`}
          className="mb-2 block text-sm font-medium"
        >
          Card title for {columnTitle}
        </label>
        <input
          id={`add-card-${columnId}-title`}
          autoFocus
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (validationError) {
              setValidationError(null);
            }
          }}
          aria-invalid={validationError ? true : undefined}
          aria-describedby={validationError ? errorId : undefined}
          className="min-h-10 w-full rounded-sm border border-border bg-surface px-3 py-2 text-base focus:border-accent"
        />
        {validationError ? (
          <p id={errorId} className="mt-2 text-sm text-danger">
            {validationError}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="min-h-10 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
        >
          Add card
        </button>
        <button
          type="button"
          onClick={closeForm}
          className="min-h-10 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
