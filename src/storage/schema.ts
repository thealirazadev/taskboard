import type { PersistedState } from '../types/board';
import type { Result } from '../types/result';
import { CURRENT_SCHEMA_VERSION } from './constants';

export interface SchemaError {
  kind: 'invalid-schema';
  message: string;
}

function invalid(message: string): Result<never, SchemaError> {
  return { ok: false, error: { kind: 'invalid-schema', message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function readIdArray(
  value: unknown,
  fieldName: string,
): Result<string[], SchemaError> {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string')
  ) {
    return invalid(`${fieldName} must be an array of ids.`);
  }

  if (new Set(value).size !== value.length) {
    return invalid(`${fieldName} must not contain duplicate ids.`);
  }

  return { ok: true, value };
}

function hasExactIds(
  order: string[],
  record: Record<string, unknown>,
): boolean {
  const keys = Object.keys(record);
  return order.length === keys.length && order.every((id) => id in record);
}

function validateCard(
  value: unknown,
  expectedId: string,
): Result<void, SchemaError> {
  if (!isRecord(value)) {
    return invalid(`Card ${expectedId} must be an object.`);
  }

  if (value.id !== expectedId) {
    return invalid(`Card map key ${expectedId} must match its id.`);
  }

  if (typeof value.title !== 'string' || value.title.trim().length === 0) {
    return invalid(`Card ${expectedId} must have a title.`);
  }

  if (typeof value.description !== 'string') {
    return invalid(`Card ${expectedId} must have a string description.`);
  }

  if (!isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt)) {
    return invalid(`Card ${expectedId} must have valid timestamps.`);
  }

  if (value.createdAt > value.updatedAt) {
    return invalid(`Card ${expectedId} timestamps are out of order.`);
  }

  return { ok: true, value: undefined };
}

function validateColumn(
  value: unknown,
  expectedId: string,
): Result<string[], SchemaError> {
  if (!isRecord(value)) {
    return invalid(`Column ${expectedId} must be an object.`);
  }

  if (value.id !== expectedId) {
    return invalid(`Column map key ${expectedId} must match its id.`);
  }

  if (typeof value.title !== 'string' || value.title.trim().length === 0) {
    return invalid(`Column ${expectedId} must have a title.`);
  }

  return readIdArray(value.cardIds, `Column ${expectedId} cardIds`);
}

function validateBoard(
  value: unknown,
  expectedId: string,
): Result<void, SchemaError> {
  if (!isRecord(value)) {
    return invalid(`Board ${expectedId} must be an object.`);
  }

  if (value.id !== expectedId) {
    return invalid(`Board map key ${expectedId} must match its id.`);
  }

  if (typeof value.title !== 'string' || value.title.trim().length === 0) {
    return invalid(`Board ${expectedId} must have a title.`);
  }

  if (!isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt)) {
    return invalid(`Board ${expectedId} must have valid timestamps.`);
  }

  if (value.createdAt > value.updatedAt) {
    return invalid(`Board ${expectedId} timestamps are out of order.`);
  }

  if (!isRecord(value.columns) || !isRecord(value.cards)) {
    return invalid(`Board ${expectedId} must contain columns and cards.`);
  }

  const columnOrderResult = readIdArray(
    value.columnOrder,
    `Board ${expectedId} columnOrder`,
  );
  if (!columnOrderResult.ok) {
    return columnOrderResult;
  }

  if (!hasExactIds(columnOrderResult.value, value.columns)) {
    return invalid(`Board ${expectedId} columnOrder must match its columns.`);
  }

  for (const [cardId, card] of Object.entries(value.cards)) {
    const cardResult = validateCard(card, cardId);
    if (!cardResult.ok) {
      return cardResult;
    }
  }

  const placedCardIds = new Set<string>();
  for (const [columnId, column] of Object.entries(value.columns)) {
    const columnResult = validateColumn(column, columnId);
    if (!columnResult.ok) {
      return columnResult;
    }

    for (const cardId of columnResult.value) {
      if (!(cardId in value.cards)) {
        return invalid(
          `Column ${columnId} references a card that does not exist.`,
        );
      }

      if (placedCardIds.has(cardId)) {
        return invalid(`Card ${cardId} must appear in exactly one column.`);
      }

      placedCardIds.add(cardId);
    }
  }

  if (placedCardIds.size !== Object.keys(value.cards).length) {
    return invalid(`Board ${expectedId} must not contain orphaned cards.`);
  }

  return { ok: true, value: undefined };
}

export function validatePersistedState(
  value: unknown,
): Result<PersistedState, SchemaError> {
  if (!isRecord(value)) {
    return invalid('Saved data must be an object.');
  }

  if (value.version !== CURRENT_SCHEMA_VERSION) {
    return invalid('Saved data uses an unexpected version.');
  }

  if (!isRecord(value.boards)) {
    return invalid('Saved data must contain boards.');
  }

  const boardOrderResult = readIdArray(value.boardOrder, 'boardOrder');
  if (!boardOrderResult.ok) {
    return boardOrderResult;
  }

  if (!hasExactIds(boardOrderResult.value, value.boards)) {
    return invalid('boardOrder must match the saved boards.');
  }

  for (const [boardId, board] of Object.entries(value.boards)) {
    const boardResult = validateBoard(board, boardId);
    if (!boardResult.ok) {
      return boardResult;
    }
  }

  if (value.activeBoardId !== null && typeof value.activeBoardId !== 'string') {
    return invalid('activeBoardId must be an id or null.');
  }

  if (boardOrderResult.value.length === 0 && value.activeBoardId !== null) {
    return invalid('An empty state cannot have an active board.');
  }

  if (
    boardOrderResult.value.length > 0 &&
    (value.activeBoardId === null || !(value.activeBoardId in value.boards))
  ) {
    return invalid('activeBoardId must reference a saved board.');
  }

  return { ok: true, value: value as unknown as PersistedState };
}
