"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Menu, Search, Bell, User, ArrowUpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { LanguageSwitcher } from "@/components/language-switcher"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n-context"
import { useSearch } from "@/lib/search-context"
import { APP_CONFIG } from "@/lib/config"

export function Navbar() {
  const { t } = useI18n()
  const { searchQuery, setSearchQuery } = useSearch()
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const [newVersion, setNewVersion] = React.useState(false)
  const [latestTag, setLatestTag] = React.useState("")
  const [dismissedVersion, setDismissedVersion] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Load dismissed version from localStorage
    const saved = localStorage.getItem('dismissedVersion')
    if (saved) setDismissedVersion(saved)

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+F (Mac) or Ctrl+F (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && (e.key === "f" || e.key === "F" || e.code === "KeyF")) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    // Version check from GitHub
    fetch("https://api.github.com/repos/hisproc/transmission-next-ui/releases/latest")
      .then((res) => res.json())
      .then((data) => {
        const latest = data.tag_name;
        // Match the version from APP_CONFIG
        const current = `v${APP_CONFIG.version}`;
        
        // Only show if it's a new version AND hasn't been dismissed
        if (latest && current && latest !== current && latest !== dismissedVersion) {
          setNewVersion(true);
          setLatestTag(latest);
          console.log("New version available:", latest);
          console.log("Current version:", current);
        } else {
          setNewVersion(false);
        }
      })
      .catch((err) => console.error("Version check failed:", err));

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dismissedVersion])

  const markAsRead = () => {
    if (latestTag) {
      setDismissedVersion(latestTag)
      localStorage.setItem('dismissedVersion', latestTag)
      setNewVersion(false)
    }
  }

  const messages = React.useMemo(() => {
    const list = []
    if (newVersion) {
      list.push({
        id: "version",
        title: t('common.new_version', 'Update Available'),
        desc: `New version ${latestTag} is ready to download.`,
        date: new Date().toLocaleDateString(),
        icon: <ArrowUpCircle className="h-4 w-4 text-primary" />,
        url: `${APP_CONFIG.githubUrl}/releases/latest`
      })
    }
    return list
  }, [newVersion, latestTag, t])

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-8 hidden md:block" />
        <div className="relative w-full max-w-[400px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 md:pr-12 h-10 w-full rounded-xl bg-muted/30 border-none transition-all placeholder:text-transparent md:placeholder:text-muted-foreground"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 border rounded px-1.5 py-0.5 bg-background text-[10px] text-muted-foreground pointer-events-none">
            <span className="text-xs">⌘</span>F
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full h-10 w-10 relative"
            >
              <Bell className="h-5 w-5" />
              {newVersion && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 animate-pulse ring-2 ring-background ring-offset-0" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-0 mt-2 overflow-hidden">
            <div className="px-4 py-4 bg-muted/20 border-b border-muted/50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-80">{t('common.notifications', 'Notifications')}</span>
              {messages.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {messages.length}
                </span>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto no-scrollbar p-1">
              {messages.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                  <Bell className="h-8 w-8 opacity-10" />
                  <p className="opacity-50 italic">{t('common.no_notifications', 'No new notifications')}</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <DropdownMenuItem 
                    key={msg.id} 
                    className="rounded-xl p-3 focus:bg-muted cursor-pointer transition-colors"
                  >
                    <Link to={msg.url} target="_blank" className="flex gap-4 w-full">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {msg.icon}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold truncate">{msg.title}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{msg.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{msg.desc}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            {messages.length > 0 && (
               <div className="p-1 border-t border-muted/50 bg-muted/10">
                <Button 
                  variant="ghost" 
                  className="w-full rounded-xl h-10 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={markAsRead}
                >
                  {t('common.mark_all_read', 'Mark all as read')}
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
