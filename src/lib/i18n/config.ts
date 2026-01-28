// Internationalization Configuration
export const defaultLocale = "en";
export const locales = [
  "en",
  "hi",
  "es",
  "fr",
  "de",
  "ja",
  "zh",
  "ar",
] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  zh: "中文",
  ar: "العربية",
};

export const currencySymbols: Record<Locale, string> = {
  en: "₹",
  hi: "₹",
  es: "₹",
  fr: "₹",
  de: "₹",
  ja: "₹",
  zh: "₹",
  ar: "₹",
};

export const dateFormats: Record<Locale, string> = {
  en: "MM/dd/yyyy",
  hi: "dd/MM/yyyy",
  es: "dd/MM/yyyy",
  fr: "dd/MM/yyyy",
  de: "dd.MM.yyyy",
  ja: "yyyy/MM/dd",
  zh: "yyyy/MM/dd",
  ar: "dd/MM/yyyy",
};

export const numberFormats: Record<Locale, Intl.NumberFormatOptions> = {
  en: { style: "decimal", minimumFractionDigits: 0 },
  hi: { style: "decimal", minimumFractionDigits: 0 },
  es: { style: "decimal", minimumFractionDigits: 0 },
  fr: { style: "decimal", minimumFractionDigits: 0 },
  de: { style: "decimal", minimumFractionDigits: 0 },
  ja: { style: "decimal", minimumFractionDigits: 0 },
  zh: { style: "decimal", minimumFractionDigits: 0 },
  ar: { style: "decimal", minimumFractionDigits: 0, useGrouping: true },
};
