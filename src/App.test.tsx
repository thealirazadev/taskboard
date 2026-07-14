import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { BOARD_STORAGE_KEY } from './storage/constants';
import {
  readStorage,
  removeStorage,
  writeStorage,
} from './storage/localStorageDriver';
import { persistState } from './storage/persistence';
import type { PersistedState } from './types/board';

vi.mock('./lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn() },
}));

function createSavedState(): PersistedState {
  return {
    version: 1,
    boardOrder: ['board-personal'],
    activeBoardId: 'board-personal',
    boards: {
      'board-personal': {
        id: 'board-personal',
        title: 'Personal tasks',
        columnOrder: ['column-todo', 'column-progress', 'column-done'],
        columns: {
          'column-todo': {
            id: 'column-todo',
            title: 'To Do',
            cardIds: [],
          },
          'column-progress': {
            id: 'column-progress',
            title: 'In Progress',
            cardIds: [],
          },
          'column-done': {
            id: 'column-done',
            title: 'Done',
            cardIds: [],
          },
        },
        cards: {},
        createdAt: 1,
        updatedAt: 1,
      },
    },
  };
}

function createSavedStateWithCard(): PersistedState {
  const state = createSavedState();
  const board = state.boards['board-personal']!;
  board.columns['column-todo']!.cardIds = ['card-task'];
  board.cards['card-task'] = {
    id: 'card-task',
    title: 'Initial task',
    description: 'Initial details',
    createdAt: 1,
    updatedAt: 1,
  };
  return state;
}

beforeEach(() => {
  removeStorage(BOARD_STORAGE_KEY);
});

afterEach(() => {
  removeStorage(BOARD_STORAGE_KEY);
});

describe('App', () => {
  it('renders the application heading and first-run empty state', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'taskboard' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'No boards yet' }),
    ).toBeInTheDocument();
  });

  it('loads a validated board from storage', () => {
    persistState(createSavedState());

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Personal tasks' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'In Progress' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
  });

  it('adds a card with a validated title', async () => {
    const user = userEvent.setup();
    persistState(createSavedState());
    render(<App />);
    const todoColumn = screen.getByRole('region', { name: 'To Do' });

    await user.click(
      within(todoColumn).getByRole('button', { name: 'Add card' }),
    );
    await user.type(
      within(todoColumn).getByRole('textbox', {
        name: 'Card title for To Do',
      }),
      'Plan the week',
    );
    await user.click(
      within(todoColumn).getByRole('button', { name: 'Add card' }),
    );

    expect(
      within(todoColumn).getByRole('heading', { name: 'Plan the week' }),
    ).toBeInTheDocument();
  });

  it('blocks a whitespace-only card title with an inline error', async () => {
    const user = userEvent.setup();
    persistState(createSavedState());
    render(<App />);
    const todoColumn = screen.getByRole('region', { name: 'To Do' });

    await user.click(
      within(todoColumn).getByRole('button', { name: 'Add card' }),
    );
    await user.type(
      within(todoColumn).getByRole('textbox', {
        name: 'Card title for To Do',
      }),
      '   ',
    );
    await user.click(
      within(todoColumn).getByRole('button', { name: 'Add card' }),
    );

    expect(within(todoColumn).getByText('Enter a title.')).toBeInTheDocument();
    expect(within(todoColumn).getByRole('textbox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('edits a card title and description in an accessible dialog', async () => {
    const user = userEvent.setup();
    persistState(createSavedStateWithCard());
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: 'Edit card Initial task' }),
    );
    expect(
      screen.getByRole('dialog', { name: 'Edit Initial task' }),
    ).toBeInTheDocument();
    const titleInput = screen.getByRole('textbox', { name: 'Title' });
    const descriptionInput = screen.getByRole('textbox', {
      name: 'Description',
    });
    expect(titleInput).toHaveFocus();

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated task');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated details');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(
      screen.getByRole('heading', { name: 'Updated task' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Updated details')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Edit card Updated task' }),
    ).toHaveFocus();
  });

  it('traps focus and restores it when card editing is cancelled', async () => {
    const user = userEvent.setup();
    persistState(createSavedStateWithCard());
    render(<App />);
    const editButton = screen.getByRole('button', {
      name: 'Edit card Initial task',
    });

    await user.click(editButton);
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveFocus();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(editButton).toHaveFocus();
  });

  it('keeps corrupt data until the user starts fresh', async () => {
    const user = userEvent.setup();
    writeStorage(BOARD_STORAGE_KEY, '{broken');

    render(<App />);

    expect(
      screen.getByText(/saved board data could not be opened/i),
    ).toBeInTheDocument();
    expect(readStorage(BOARD_STORAGE_KEY)).toEqual({
      ok: true,
      value: '{broken',
    });

    await user.click(screen.getByRole('button', { name: 'Start fresh' }));

    expect(
      screen.queryByText(/saved board data could not be opened/i),
    ).not.toBeInTheDocument();
    expect(readStorage(BOARD_STORAGE_KEY)).toEqual({ ok: true, value: null });
  });

  it('continues in memory when local storage is unavailable', () => {
    const storageDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'localStorage',
    );
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('blocked');
      },
    });

    try {
      render(<App />);

      expect(
        screen.getByText(/local storage is unavailable/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'No boards yet' }),
      ).toBeInTheDocument();
    } finally {
      if (storageDescriptor) {
        Object.defineProperty(window, 'localStorage', storageDescriptor);
      }
    }
  });
});
