import { describe, expect, it } from 'vitest';

import { moveWithinArray } from './reorder';

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
