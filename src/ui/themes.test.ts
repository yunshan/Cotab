import { describe, expect, it } from 'vitest';
import { DESIGN_THEMES, getSavedDesignTheme } from './themes';

const IMPORTED_THEME_IDS = [
  'airbnb',
  'airtable',
  'apple',
  'claude',
  'cohere',
  'coinbase',
  'cursor',
  'elevenlabs',
  'figma',
  'framer',
  'lovable',
  'minimax',
  'mistral-ai',
  'notion',
  'ollama',
  'opencode-ai',
  'replicate',
  'runwayml',
  'spotify',
  'stripe',
  'supabase',
  'together-ai',
  'vercel'
];

describe('design themes', () => {
  it('uses Claude as the default theme', () => {
    expect(getSavedDesignTheme(undefined)).toBe('claude');
  });

  it('loads a saved supported theme', () => {
    const storage = {
      getItem: (key: string) => (key === 'cotab-design-theme' ? 'cohere' : null)
    };

    expect(getSavedDesignTheme(storage)).toBe('cohere');
  });

  it('ignores unsupported saved themes', () => {
    const storage = {
      getItem: (key: string) => (key === 'cotab-design-theme' ? 'unknown' : null)
    };

    expect(getSavedDesignTheme(storage)).toBe('claude');
  });

  it('contains every imported theme option', () => {
    expect(DESIGN_THEMES).toHaveLength(23);
    expect(DESIGN_THEMES.some((theme) => theme.id === 'claude')).toBe(true);
  });

  it('matches the imported DESIGN.md theme ids', () => {
    expect(DESIGN_THEMES.map((theme) => theme.id)).toEqual(IMPORTED_THEME_IDS);
  });
});
