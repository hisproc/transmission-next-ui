"use client"

import * as React from "react"
import { Languages, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all",
          isOpen && "bg-muted text-primary"
        )}
        title={locale === "en" ? "Language" : "语言"}
      >
        <Languages className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border bg-background p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden backdrop-blur-md bg-background/90">
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => { setLocale("en"); setIsOpen(false); }}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors w-full text-left",
                locale === "en" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold w-4 text-center">EN</span>
                <span>English</span>
              </div>
              {locale === "en" && <Check className="h-3.5 w-3.5" />}
            </button>
            <button 
              onClick={() => { setLocale("zh"); setIsOpen(false); }}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors w-full text-left",
                locale === "zh" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold w-4 text-center">ZH</span>
                <span>简体中文</span>
              </div>
              {locale === "zh" && <Check className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
