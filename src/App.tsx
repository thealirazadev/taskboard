import { BoardView } from './components/board/BoardView';
import type { Board } from './types/board';

const staticBoard: Board = {
  id: 'board-personal',
  title: 'Personal tasks',
  columnOrder: ['column-todo', 'column-progress', 'column-done'],
  columns: {
    'column-todo': {
      id: 'column-todo',
      title: 'To Do',
      cardIds: ['card-roadmap', 'card-notes'],
    },
    'column-progress': {
      id: 'column-progress',
      title: 'In Progress',
      cardIds: ['card-prototype'],
    },
    'column-done': {
      id: 'column-done',
      title: 'Done',
      cardIds: ['card-workspace'],
    },
  },
  cards: {
    'card-roadmap': {
      id: 'card-roadmap',
      title: 'Plan the weekly roadmap',
      description: 'Choose the most important outcomes for this week.',
      createdAt: 0,
      updatedAt: 0,
    },
    'card-notes': {
      id: 'card-notes',
      title: 'Review project notes',
      description: '',
      createdAt: 0,
      updatedAt: 0,
    },
    'card-prototype': {
      id: 'card-prototype',
      title: 'Build the first prototype',
      description: 'Keep the first pass focused on the core workflow.',
      createdAt: 0,
      updatedAt: 0,
    },
    'card-workspace': {
      id: 'card-workspace',
      title: 'Set up the workspace',
      description: 'The project is ready for focused work.',
      createdAt: 0,
      updatedAt: 0,
    },
  },
  createdAt: 0,
  updatedAt: 0,
};

export function App() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <header className="mx-auto mb-6 max-w-screen-2xl">
        <h1 className="text-2xl font-bold">taskboard</h1>
        <p className="mt-1 text-sm text-muted">
          A private board for focused work.
        </p>
      </header>
      <BoardView board={staticBoard} />
    </main>
  );
}
