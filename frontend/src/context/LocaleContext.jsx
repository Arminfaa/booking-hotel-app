import { createContext, useContext, useEffect, useMemo, useState } from "react";

const dict = {
  en: {
    explore: "Explore",
    saved: "Saved",
    trips: "Trips",
    messages: "Messages",
    host: "Host",
    admin: "Admin",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
  },
  fa: {
    explore: "کاوش",
    saved: "ذخیره‌ها",
    trips: "سفرها",
    messages: "پیام‌ها",
    host: "میزبان",
    admin: "ادمین",
    login: "ورود",
    signup: "ثبت‌نام",
    logout: "خروج",
  },
};

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem("cove_locale") || "en");

  useEffect(() => {
    localStorage.setItem("cove_locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      dir: locale === "fa" ? "rtl" : "ltr",
      t: (key) => dict[locale]?.[key] || dict.en[key] || key,
      setLocale,
      toggle: () => setLocale((l) => (l === "en" ? "fa" : "en")),
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
