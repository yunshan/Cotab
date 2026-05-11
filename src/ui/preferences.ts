export type Language = 'zh' | 'en';

export function getDefaultLanguage(
  storage: Pick<Storage, 'getItem'> | undefined,
  languages: readonly string[] | undefined,
  fallbackLanguage: string | undefined
): Language {
  const hasManualPreference = storage?.getItem('cotab-language-manual') === 'true';
  const saved = hasManualPreference ? storage?.getItem('cotab-language') : null;
  if (saved === 'zh' || saved === 'en') {
    return saved;
  }

  const browserLanguages = languages?.length ? languages : [fallbackLanguage ?? ''];
  return browserLanguages.some((item) => item.toLowerCase().startsWith('zh')) ? 'zh' : 'en';
}
