import { describe, expect, it } from 'vitest';
import { truncateTitle } from './text';

describe('truncateTitle', () => {
  it('keeps titles at or below 50 characters unchanged', () => {
    expect(truncateTitle('Short title')).toBe('Short title');
    expect(truncateTitle('x'.repeat(50))).toBe('x'.repeat(50));
  });

  it('truncates long titles to 50 characters including ellipsis', () => {
    expect(truncateTitle('x'.repeat(80))).toBe(`${'x'.repeat(49)}…`);
  });
});
