import * as fs from 'fs';
import * as path from 'path';

type TranslationMap = Record<string, string | Record<string, string>>;

let translations: Record<string, TranslationMap> = {};

function loadTranslations(): void {
  if (Object.keys(translations).length > 0) return;
  try {
    const i18nDir = path.join(__dirname, '../../i18n');
    const locales = fs.readdirSync(i18nDir);
    for (const locale of locales) {
      const filePath = path.join(i18nDir, locale, 'translation.json');
      if (fs.existsSync(filePath)) {
        translations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8')) as TranslationMap;
      }
    }
  } catch {
    translations = { en: {} };
  }
}

export class I18nHelper {
  static t(key: string, locale = 'en'): string {
    loadTranslations();
    const parts = key.split('.');
    let current: TranslationMap | string = translations[locale] || translations['en'] || {};
    for (const part of parts) {
      if (typeof current === 'object' && current !== null && part in current) {
        current = current[part] as TranslationMap | string;
      } else {
        return key;
      }
    }
    return typeof current === 'string' ? current : key;
  }
}
