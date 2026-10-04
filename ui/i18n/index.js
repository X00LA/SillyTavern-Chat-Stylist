import deDE from './de-de.js';

// Translation tables by SillyTavern locale ID (see public/locales/lang.json).
// English is the source language and needs no table.
const locales = {
    'de-de': deDE,
};

/**
 * Registers the translations for the current SillyTavern UI language.
 * Must run before any UI text is created with t`...`.
 */
export function registerLocales() {
    const { addLocaleData, getCurrentLocale } = SillyTavern.getContext();
    const locale = getCurrentLocale();
    if (locales[locale]) {
        addLocaleData(locale, locales[locale]);
    }
}
