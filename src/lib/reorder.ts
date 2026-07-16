/** Returns a copy of `items` with the item at `fromIndex` moved to `toIndex`. */
export function moveWithinArray<T>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) {
    return items;
  }
  next.splice(toIndex, 0, moved);
  return next;
}

/** Moves the item at `fromIndex` in `source` into `destination` at `toIndex`. */
export function moveBetweenArrays<T>(
  source: T[],
  destination: T[],
  fromIndex: number,
  toIndex: number,
): { source: T[]; destination: T[] } {
  if (fromIndex < 0 || fromIndex >= source.length) {
    return { source, destination };
  }

  const nextSource = [...source];
  const [moved] = nextSource.splice(fromIndex, 1);
  if (moved === undefined) {
    return { source, destination };
  }

  const nextDestination = [...destination];
  const clampedIndex = Math.min(Math.max(toIndex, 0), nextDestination.length);
  nextDestination.splice(clampedIndex, 0, moved);

  return { source: nextSource, destination: nextDestination };
}
