import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { ReactNode } from 'react';

import { useBoardState } from '../../hooks/useBoardState';
import { selectCardsForColumn } from '../../state/selectors';

export interface CardDragData {
  type: 'card';
  cardId: string;
  columnId: string;
}

interface BoardDndContextProps {
  boardId: string;
  children: ReactNode;
}

/** Wraps the board in a dnd-kit context and dispatches MOVE_CARD on drop. */
export function BoardDndContext({ boardId, children }: BoardDndContextProps) {
  const { state, dispatch } = useBoardState();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent): void {
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
