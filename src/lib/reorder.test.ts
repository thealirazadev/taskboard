import { describe, expect, it } from 'vitest';

import { moveBetweenArrays, moveWithinArray } from './reorder';

describe('moveWithinArray', () => {
  it('moves an item forward', () => {
    expect(moveWithinArray(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('moves an item backward', () => {
    expect(moveWithinArray(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('is a no-op when moving to the same index', () => {
    const items = ['a', 'b', 'c'];
    expect(moveWithinArray(items, 1, 1)).toEqual(['a', 'b', 'c']);
  });

  it('returns the original array for an out-of-range index', () => {
    const items = ['a', 'b'];
    expect(moveWithinArray(items, 0, 5)).toBe(items);
    expect(moveWithinArray(items, -1, 0)).toBe(items);
  });
});

describe('moveBetweenArrays', () => {
  it('moves an item from source into destination at the given index', () => {
    const result = moveBetweenArrays(['a', 'b'], ['x', 'y'], 0, 1);
    expect(result.source).toEqual(['b']);
    expect(result.destination).toEqual(['x', 'a', 'y']);
  });

  it('appends when the destination index is beyond the end', () => {
    const result = moveBetweenArrays(['a'], [], 0, 10);
    expect(result.source).toEqual([]);
    expect(result.destination).toEqual(['a']);
  });

  it('returns the originals for an out-of-range source index', () => {
    const source = ['a'];
    const destination = ['b'];
    const result = moveBetweenArrays(source, destination, 5, 0);
    expect(result.source).toBe(source);
    expect(result.destination).toBe(destination);
  });
});
