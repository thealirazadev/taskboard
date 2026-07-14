import { useState } from 'react';
import type { FormEvent } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import { validateTitle } from '../../lib/validation';
import type { Card } from '../../types/board';
import { Modal } from '../common/Modal';

interface CardEditorProps {
  boardId: string;
  card: Card;
  onClose: () => void;
}

export function CardEditor({ boardId, card, onClose }: CardEditorProps) {
  const { dispatch } = useBoardState();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [validationError, setValidationError] = useState<string | null>(null);
  const errorId = `edit-card-${card.id}-error`;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const titleResult = validateTitle(title);
    if (!titleResult.ok) {
      setValidationError(titleResult.error);
      return;
    }

    dispatch({
      type: 'UPDATE_CARD',
      boardId,
      cardId: card.id,
      title: titleResult.value,
      description,
      updatedAt: Date.now(),
    });
    onClose();
  }

  return (
    <Modal title={`Edit ${card.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor={`edit-card-${card.id}-title`}
            className="mb-2 block text-sm font-medium"
          >
            Title
          </label>
          <input
            id={`edit-card-${card.id}-title`}
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
        <div>
          <label
            htmlFor={`edit-card-${card.id}-description`}
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>
          <textarea
            id={`edit-card-${card.id}-description`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="max-h-80 min-h-24 w-full resize-y rounded-sm border border-border bg-surface px-3 py-2 text-base focus:border-accent"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-md border border-border bg-surface px-4 py-2 font-medium hover:bg-background"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-10 rounded-md bg-accent px-4 py-2 font-medium text-accent-contrast hover:bg-accent-hover"
          >
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
