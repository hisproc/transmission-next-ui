"use client"

import * as React from "react"
import en from "@/locales/en.json"
import zh from "@/locales/zh.json"

type Locale = "en" | "zh"

const I18nContext = React.createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: (path: string, args?: Record<string, unknown> | string, defaultValue?: string) => string
} | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("zh")

  // Load locale from storage on mount
  React.useEffect(() => {
    const savedLocale = localStorage.getItem("transmission-locale") as Locale
    if (savedLocale && (savedLocale === "en" || savedLocale === "zh")) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem("transmission-locale", l)
  }

  const t = (path: string, args?: Record<string, unknown> | string, defaultValue?: string): string => {
    const data = locale === "en" ? en : zh
    const keys = path.split(".")
    let current: unknown = data
    for (const key of keys) {
      if (typeof current !== 'object' || current === null || !(key in current)) {
        return (typeof args === 'string' ? args : defaultValue) || path
      }
      current = (current as Record<string, unknown>)[key]
    }

    let result = current as string
    if (typeof args === 'object' && args !== null) {
      Object.entries(args).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
      })
    }

    return result
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const context = React.useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within I18nProvider")
  return context
}
