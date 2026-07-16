import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  Announcements,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import {
  selectCardById,
  selectCardsForColumn,
  selectColumnById,
} from '../../state/selectors';
import type { Card as CardData } from '../../types/board';

export interface CardDragData {
  type: 'card';
  cardId: string;
  columnId: string;
}

interface BoardDndContextProps {
  boardId: string;
  children: ReactNode;
}

function columnTitle(
  state: Parameters<typeof selectColumnById>[0],
  boardId: string,
  columnId: string,
): string {
  return selectColumnById(state, boardId, columnId)?.title ?? 'column';
}

/** Wraps the board in a dnd-kit context and dispatches MOVE_CARD on drop. */
export function BoardDndContext({ boardId, children }: BoardDndContextProps) {
  const { state, dispatch } = useBoardState();
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent): void {
    const data = event.active.data.current as CardDragData | undefined;
    if (!data) {
      return;
    }
    setActiveCard(selectCardById(state, boardId, data.cardId));
  }

  function handleDragEnd(event: DragEndEvent): void {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeData = active.data.current as CardDragData | undefined;
    const overData = over.data.current as CardDragData | undefined;
    if (!activeData || !overData) {
      return;
    }

    const destinationCards = selectCardsForColumn(
      state,
      boardId,
      overData.columnId,
    );
    const overIndex = destinationCards.findIndex(
      (card) => card.id === overData.cardId,
    );
    const toIndex = overIndex === -1 ? destinationCards.length : overIndex;

    dispatch({
      type: 'MOVE_CARD',
      boardId,
      cardId: activeData.cardId,
      fromColumnId: activeData.columnId,
      toColumnId: overData.columnId,
      toIndex,
      updatedAt: Date.now(),
    });
  }

  function handleDragCancel(): void {
    setActiveCard(null);
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      const data = active.data.current as CardDragData | undefined;
      if (!data) {
        return undefined;
      }
      const card = selectCardById(state, boardId, data.cardId);
      const column = columnTitle(state, boardId, data.columnId);
      return `Picked up card "${card?.title ?? ''}" from column "${column}".`;
    },
    onDragOver({ active, over }) {
      const activeData = active.data.current as CardDragData | undefined;
      const overData = over?.data.current as CardDragData | undefined;
      if (!activeData || !overData) {
        return undefined;
      }
      const card = selectCardById(state, boardId, activeData.cardId);
      const column = columnTitle(state, boardId, overData.columnId);
      return `Card "${card?.title ?? ''}" is over column "${column}".`;
    },
    onDragEnd({ active, over }) {
      const activeData = active.data.current as CardDragData | undefined;
      const card = activeData
        ? selectCardById(state, boardId, activeData.cardId)
        : null;
      if (!over) {
        return `Card "${card?.title ?? ''}" was dropped outside of any column.`;
      }
      const overData = over.data.current as CardDragData | undefined;
      const column = overData
        ? columnTitle(state, boardId, overData.columnId)
        : 'column';
      return `Card "${card?.title ?? ''}" was dropped in column "${column}".`;
    },
    onDragCancel({ active }) {
      const data = active.data.current as CardDragData | undefined;
      const card = data ? selectCardById(state, boardId, data.cardId) : null;
      return `Dragging card "${card?.title ?? ''}" was cancelled.`;
    },
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay>
        {activeCard ? (
          <article className="min-w-0 max-w-xs rotate-2 rounded-md border border-border bg-surface-raised p-3 shadow-lg motion-reduce:rotate-0">
            <h4 className="break-words text-base font-medium">
              {activeCard.title}
            </h4>
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
