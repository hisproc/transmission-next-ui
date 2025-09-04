// src/lib/i18n.ts
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from 'i18next-browser-languagedetector'
import zh from "@/locales/zh-CN.json"
import en from "@/locales/en.json"

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        fallbackLng: "zh", // 默认语言
        supportedLngs: ["en", "zh"],
        debug: false,
        interpolation: {
            escapeValue: false, // React 会自动处理 XSS
        },
        resources: {
            en: {
                translation: en,
            },
            zh: {
                translation: zh,
            },
        },
        detection: {
            order: ['localStorage', 'cookie', 'navigator'],
            caches: ['localStorage', 'cookie'],
        },
    })

export default i18n