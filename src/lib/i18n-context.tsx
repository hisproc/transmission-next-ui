"use client"

import * as React from "react"
import en from "@/locales/en.json"
import zh from "@/locales/zh.json"

type Locale = "en" | "zh"
type Translations = typeof en

const I18nContext = React.createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: (path: string, args?: Record<string, any> | string, defaultValue?: string) => string
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

  const t = (path: string, args?: Record<string, any> | string, defaultValue?: string): string => {
    const data = locale === "en" ? en : zh
    const keys = path.split(".")
    let current: any = data
    for (const key of keys) {
      if (current[key] === undefined) {
        return (typeof args === 'string' ? args : defaultValue) || path
      }
      current = current[key]
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

export function useI18n() {
  const context = React.useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within I18nProvider")
  return context
}
