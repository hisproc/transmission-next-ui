"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Filter, Globe, Database, Tag, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useI18n } from "@/lib/i18n-context"

interface FilterPanelProps {
  trackers: string[]
  downloadDirs: string[]
  availableLabels: string[]
  trackerFilter: string[]
  dirFilter: string[]
  labelFilter: string[]
  toggleTracker: (host: string) => void
  toggleDir: (path: string) => void
  toggleLabel: (label: string) => void
  clearFilters: () => void
}

export function FilterPanel({
  trackers,
  downloadDirs,
  availableLabels,
  trackerFilter,
  dirFilter,
  labelFilter,
  toggleTracker,
  toggleDir,
  toggleLabel,
  clearFilters,
}: FilterPanelProps) {
  const isMobile = useIsMobile()
  const { t } = useI18n()

  const hasActiveFilters = trackerFilter.length > 0 || dirFilter.length > 0 || labelFilter.length > 0

  const triggerButton = (
    <Button variant="ghost" size="icon" className={cn(
      "h-8 w-8 rounded-lg transition-all duration-200 relative",
      hasActiveFilters ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-muted"
    )}>
      <Filter className="h-4 w-4" />
      {hasActiveFilters && (
        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary border border-background shadow-xs" />
      )}
    </Button>
  )

  if (isMobile) {
    return (
      <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
        <Sheet>
          <SheetTrigger asChild>{triggerButton}</SheetTrigger>
          <SheetContent showCloseButton={false} side="bottom" className="rounded-t-[2rem] border-none bg-background/95 backdrop-blur-xl max-h-[85dvh] p-0 overflow-hidden flex flex-col">
            <SheetHeader className="px-6 py-4 border-b border-muted/20 shrink-0">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold tracking-tight">{t('common.filters', 'Filters')}</SheetTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs font-bold rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors text-destructive"
                    onClick={clearFilters}
                  >
                    {t('common.clear', 'Clear All')}
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar p-6 space-y-8 pb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">{t('common.filter_by_tracker')}</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {trackers.map(host => (
                    <button
                      key={host}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                        trackerFilter.includes(host)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-muted/30 border-transparent text-foreground hover:bg-muted/50"
                      )}
                      onClick={() => toggleTracker(host)}
                    >
                      <span className="text-sm font-medium truncate flex-1 mr-2">{host}</span>
                      {trackerFilter.includes(host) && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Database className="h-4 w-4" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">{t('common.filter_by_dir', 'By Directory')}</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {downloadDirs.map(path => (
                    <button
                      key={path}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                        dirFilter.includes(path)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-muted/30 border-transparent text-foreground hover:bg-muted/50"
                      )}
                      onClick={() => toggleDir(path)}
                    >
                      <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span className="text-sm font-medium truncate">{path.split('/').pop() || '/'}</span>
                        <span className="text-[10px] opacity-50 truncate">{path}</span>
                      </div>
                      {dirFilter.includes(path) && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">{t('common.filter_by_label', 'By Label')}</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {availableLabels.map(label => (
                    <button
                      key={label}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                        labelFilter.includes(label)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-muted/30 border-transparent text-foreground hover:bg-muted/50"
                      )}
                      onClick={() => toggleLabel(label)}
                    >
                      <span className="text-sm font-medium truncate flex-1 mr-2">{label}</span>
                      {labelFilter.includes(label) && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" collisionPadding={12} className="w-[220px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-0 mt-2 overflow-hidden">
          <div className="px-4 py-3 bg-muted/20 border-b border-muted/50 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-muted-foreground whitespace-nowrap">{t('common.filters', 'Filters')}</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                className="h-6 px-2 text-[10px] font-bold rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={clearFilters}
              >
                {t('common.clear', 'Clear')}
              </Button>
            )}
          </div>

          <div className="p-1">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-xl py-2.5 px-3 focus:bg-muted data-[state=open]:bg-muted whitespace-nowrap">
                <Globe className="h-4 w-4 mr-3 opacity-50 flex-shrink-0" />
                <span className="text-sm font-medium mr-2">{t('common.filter_by_tracker')}</span>
                {trackerFilter.length > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full flex-shrink-0">
                    {trackerFilter.length}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent collisionPadding={12} className="w-[280px] sm:w-[280px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-2 ml-1">
                  <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 tracking-wider">
                    {t('common.all_trackers')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2 my-1 bg-muted/50" />
                  <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-0.5">
                    {trackers.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground italic opacity-50">
                        {t('common.no_trackers', 'No trackers found')}
                      </div>
                    ) : (
                      trackers.map(host => (
                        <DropdownMenuCheckboxItem
                          key={host}
                          className="rounded-xl py-2 border-none cursor-pointer transition-colors focus:bg-muted"
                          checked={trackerFilter.includes(host)}
                          onCheckedChange={() => toggleTracker(host)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <span className="truncate text-sm font-medium">{host}</span>
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-xl py-2.5 px-3 focus:bg-muted data-[state=open]:bg-muted whitespace-nowrap">
                <Database className="h-4 w-4 mr-3 opacity-50 flex-shrink-0" />
                <span className="text-sm font-medium mr-2">{t('common.filter_by_dir', 'By Directory')}</span>
                {dirFilter.length > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full flex-shrink-0">
                    {dirFilter.length}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent collisionPadding={12} className="w-[280px] sm:w-[320px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-2 ml-1">
                  <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 tracking-wider">
                    {t('common.all_directories', 'All Directories')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2 my-1 bg-muted/50" />
                  <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-0.5">
                    {downloadDirs.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground italic opacity-50">
                        {t('common.no_directories', 'No directories found')}
                      </div>
                    ) : (
                      downloadDirs.map(path => (
                        <DropdownMenuCheckboxItem
                          key={path}
                          className="rounded-xl py-2 border-none cursor-pointer transition-colors focus:bg-muted"
                          checked={dirFilter.includes(path)}
                          onCheckedChange={() => toggleDir(path)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm font-medium">{path.split('/').pop() || '/'}</span>
                            <span className="truncate text-[10px] opacity-50">{path}</span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-xl py-2.5 px-3 focus:bg-muted data-[state=open]:bg-muted whitespace-nowrap">
                <Tag className="h-4 w-4 mr-3 opacity-50 flex-shrink-0" />
                <span className="text-sm font-medium mr-2">{t('common.filter_by_label', 'By Label')}</span>
                {labelFilter.length > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full flex-shrink-0">
                    {labelFilter.length}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent collisionPadding={12} className="w-[220px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-2 ml-1">
                  <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 tracking-wider">
                    {t('common.all_labels', 'All Labels')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2 my-1 bg-muted/50" />
                  <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-0.5">
                    {availableLabels.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground italic opacity-50">
                        {t('common.no_labels', 'No labels found')}
                      </div>
                    ) : (
                      availableLabels.map(label => (
                        <DropdownMenuCheckboxItem
                          key={label}
                          className="rounded-xl py-2 border-none cursor-pointer transition-colors focus:bg-muted"
                          checked={labelFilter.includes(label)}
                          onCheckedChange={() => toggleLabel(label)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <span className="truncate text-sm font-medium">{label}</span>
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
