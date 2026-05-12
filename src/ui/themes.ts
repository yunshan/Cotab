export const DESIGN_THEMES = [
  { id: 'airbnb', name: 'Airbnb' },
  { id: 'airtable', name: 'Airtable' },
  { id: 'apple', name: 'Apple' },
  { id: 'claude', name: 'Claude' },
  { id: 'cohere', name: 'Cohere' },
  { id: 'coinbase', name: 'Coinbase' },
  { id: 'cursor', name: 'Cursor' },
  { id: 'elevenlabs', name: 'ElevenLabs' },
  { id: 'figma', name: 'Figma' },
  { id: 'framer', name: 'Framer' },
  { id: 'lovable', name: 'Lovable' },
  { id: 'minimax', name: 'Minimax' },
  { id: 'mistral-ai', name: 'Mistral AI' },
  { id: 'notion', name: 'Notion' },
  { id: 'ollama', name: 'Ollama' },
  { id: 'opencode-ai', name: 'OpenCode AI' },
  { id: 'replicate', name: 'Replicate' },
  { id: 'runwayml', name: 'RunwayML' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'stripe', name: 'Stripe' },
  { id: 'supabase', name: 'Supabase' },
  { id: 'together-ai', name: 'Together AI' },
  { id: 'vercel', name: 'Vercel Inspired' }
] as const;

export type DesignThemeId = (typeof DESIGN_THEMES)[number]['id'];

export function getSavedDesignTheme(storage: Pick<Storage, 'getItem'> | undefined): DesignThemeId {
  const saved = storage?.getItem('cotab-design-theme');
  return DESIGN_THEMES.some((theme) => theme.id === saved) ? (saved as DesignThemeId) : 'claude';
}
