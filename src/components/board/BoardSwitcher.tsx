import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import { createId } from '../../lib/id';
import { logger } from '../../lib/logger';
import { validateTitle } from '../../lib/validation';
import { selectBoards } from '../../state/selectors';

const TITLE_ERROR_ID = 'new-board-title-error';

export function BoardSwitcher() {
  const { state, dispatch, showError } = useBoardState();
  const boards = selectBoards(state);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  function closeForm(): void {
    setIsCreating(false);
    setTitle('');
    setValidationError(null);
  }

  function handleSwitch(event: ChangeEvent<HTMLSelectElement>): void {
    dispatch({ type: 'SWITCH_BOARD', boardId: event.target.value });
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
      logger.error('A board id could not be created.', {
        error: idResult.error,
      });
      showError('The board could not be created. Please try again.');
      return;
    }

    const now = Date.now();
    dispatch({
      type: 'ADD_BOARD',
      board: {
        id: idResult.value,
        title: titleResult.value,
        columnOrder: [],
        columns: {},
        cards: {},
        createdAt: now,
        updatedAt: now,
      },
    });
    closeForm();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {boards.length > 0 ? (
        <div>
          <label htmlFor="board-switcher" className="sr-only">
            Switch board
          </label>
          <select
            id="board-switcher"
            value={state.activeBoardId ?? ''}
            onChange={handleSwitch}
            className="min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {isCreating ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-start gap-2"
          noValidate
        >
          <div>
            <label htmlFor="new-board-title" className="sr-only">
              Board name
            </label>
            <input
              id="new-board-title"
              autoFocus
              placeholder="Board name"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (validationError) {
                  setValidationError(null);
                }
              }}
              aria-invalid={validationError ? true : undefined}
              aria-describedby={validationError ? TITLE_ERROR_ID : undefined}
              className="min-h-10 rounded-sm border border-border bg-surface px-3 py-2 text-base focus:border-accent"
            />
            {validationError ? (
              <p id={TITLE_ERROR_ID} className="mt-2 text-sm text-danger">
                {validationError}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="min-h-10 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
          >
            Create board
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
          onClick={() => setIsCreating(true)}
          className="min-h-10 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background"
        >
          New board
        </button>
      )}
    </div>
  );
}
