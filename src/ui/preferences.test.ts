import { describe, expect, it } from 'vitest';
import { getDefaultLanguage } from './preferences';

function storage(values: Record<string, string | null>): Pick<Storage, 'getItem'> {
  return {
    getItem: (key: string) => values[key] ?? null
  };
}

describe('getDefaultLanguage', () => {
  it('follows browser language when there is no manual preference', () => {
    expect(getDefaultLanguage(storage({}), ['zh-CN', 'en-US'], 'en-US')).toBe('zh');
    expect(getDefaultLanguage(storage({}), ['en-US'], 'en-US')).toBe('en');
  });

  it('uses saved language only after the user manually switches', () => {
    expect(
      getDefaultLanguage(storage({ 'cotab-language': 'en' }), ['zh-CN'], 'zh-CN')
    ).toBe('zh');
    expect(
      getDefaultLanguage(
        storage({ 'cotab-language': 'en', 'cotab-language-manual': 'true' }),
        ['zh-CN'],
        'zh-CN'
      )
    ).toBe('en');
  });
});
