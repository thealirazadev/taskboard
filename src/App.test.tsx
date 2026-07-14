import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the application heading', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'taskboard' }),
    ).toBeInTheDocument();
  });

  it('renders the default board columns and card counts', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'In Progress' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getByText('2 cards')).toBeInTheDocument();
    expect(screen.getAllByText('1 card')).toHaveLength(2);
  });
});
