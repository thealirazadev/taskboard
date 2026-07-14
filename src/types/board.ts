export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  columnOrder: string[];
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  createdAt: number;
  updatedAt: number;
}

export interface PersistedState {
  version: number;
  boards: Record<string, Board>;
  boardOrder: string[];
  activeBoardId: string | null;
}
