// Multi-language Support Hook
"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useLanguage() {
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { t, resources } = useTranslations();
  const [loading, setLoading] = useState(false);

  const changeLanguage = async (newLocale: string) => {
    setLoading(true);
    try {
      // Save preference to localStorage
      localStorage.setItem("preferred-locale", newLocale);

      // Change route to new locale
      const newPath = pathname.replace(/^\/[a-z]{2}/, `/${newLocale}/`);
      await router.push(newPath);
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load preferred locale from localStorage on mount
    const savedLocale = localStorage.getItem("preferred-locale");
    if (savedLocale && savedLocale !== locale && resources[savedLocale]) {
      changeLanguage(savedLocale);
    }
  }, [locale, pathname]);

  return {
    locale,
    t,
    resources,
    changeLanguage,
    loading,
    availableLocales: [
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
      { code: "es", name: "Español", flag: "🇪🇸" },
      { code: "fr", name: "Français", flag: "🇫🇷" },
      { code: "de", name: "Deutsch", flag: "🇩🇪" },
      { code: "ja", name: "日本語", flag: "🇯🇵" },
      { code: "zh", name: "中文", flag: "🇨🇳" },
      { code: "ar", name: "العربية", flag: "🇸🇦🇪" },
    ],
    isRTL: ["ar", "he", "fa", "ur"].includes(locale),
  };
}

// Currency formatting hook
export function useCurrency(locale?: string) {
  const { t } = useTranslations();
  const currentLocale = locale || useLocale();

  const formatPrice = (amount: number, currencyCode?: string) => {
    const currency = currencyCode || "INR";

    try {
      return new Intl.NumberFormat(currentLocale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error("Currency formatting error:", error);
      return `₹${amount.toLocaleString("en-IN")}`;
    }
  };

  const formatNumber = (amount: number) => {
    try {
      return new Intl.NumberFormat(currentLocale).format(amount);
    } catch (error) {
      console.error("Number formatting error:", error);
      return amount.toLocaleString();
    }
  };

  const formatPercent = (value: number) => {
    try {
      return new Intl.NumberFormat(currentLocale, {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(value);
    } catch (error) {
      console.error("Percent formatting error:", error);
      return `${value}%`;
    }
  };

  return {
    formatPrice,
    formatNumber,
    formatPercent,
  };
}

// Date formatting hook
export function useDate(locale?: string) {
  const currentLocale = locale || useLocale();
  const { t } = useTranslations();

  const formatDate = (
    date: Date | string,
    options?: {
      dateStyle?: "full" | "long" | "medium" | "short";
      timeStyle?: "full" | "long" | "medium" | "short";
      timeZone?: string;
    } = {},
  ) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    try {
      const optionsIntl: Intl.DateTimeFormatOptions = {
        dateStyle: options.dateStyle || "medium",
        timeStyle: options.timeStyle || "short",
        timeZone: options.timeZone || "Asia/Kolkata",
      };

      return new Intl.DateTimeFormat(currentLocale, optionsIntl).format(
        dateObj,
      );
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateObj.toLocaleDateString();
    }
  };

  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000,
    );

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return t(
          `timeAgo.${interval.label}`,
          { count, count: count.toString() },
          count,
        );
      }
    }

    return t("timeAgo.justNow");
  };

  return {
    formatDate,
    formatRelativeTime,
  };
}
