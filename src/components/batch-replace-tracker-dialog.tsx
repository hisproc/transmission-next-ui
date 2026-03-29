"use client"

import * as React from "react"
import { Globe, RefreshCw, CheckCircle2, AlertCircle, Search, ArrowRight, ListCheck, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { rpc } from "@/lib/rpc-client"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

interface BatchReplaceTrackerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface MatchingTorrent {
  id: number
  name: string
  trackers: Array<{ announce: string; tier: number }>
  matchFullUrl: string // The full original URL of the matching tracker
}

export function BatchReplaceTrackerDialog({ open, onOpenChange, onSuccess }: BatchReplaceTrackerDialogProps) {
  const [oldTracker, setOldTracker] = React.useState("")
  const [newTracker, setNewTracker] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [isReplacing, setIsReplacing] = React.useState(false)
  const [matchingTorrents, setMatchingTorrents] = React.useState<MatchingTorrent[]>([])
  const [availableTrackers, setAvailableTrackers] = React.useState<string[]>([])
  const [step, setStep] = React.useState<"input" | "confirm">("input")
  const { t } = useI18n()

  // Fetch unique trackers when dialog opens
  React.useEffect(() => {
    if (open) {
      const fetchTrackers = async () => {
        try {
          const { torrents } = await rpc.getTorrents(["trackers"])
          const trackerSet = new Set<string>()
          torrents.forEach((tor: any) => {
            tor.trackers?.forEach((tr: any) => {
              // Strip parameters after '?' if they exist
              const baseUrl = tr.announce.split('?')[0]
              trackerSet.add(baseUrl)
            })
          })
          setAvailableTrackers(Array.from(trackerSet).sort())
        } catch (error) {
          console.error("Failed to fetch trackers:", error)
        }
      }
      fetchTrackers()
    }
  }, [open])

  const handleSearch = async () => {
    if (!oldTracker.trim()) return

    setIsSearching(true)
    try {
      const { torrents } = await rpc.getTorrents(["id", "name", "trackers"])
      const matches: MatchingTorrent[] = []

      torrents.forEach((tor: any) => {
        const matchesInTorrent = tor.trackers?.filter((tr: any) => tr.announce.startsWith(oldTracker.trim()))
        if (matchesInTorrent && matchesInTorrent.length > 0) {
          // If we found a match, we store the torrent and its FULL tracker list
          matches.push({
            id: tor.id,
            name: tor.name,
            trackers: tor.trackers.map((tr: any) => ({ announce: tr.announce, tier: tr.tier })),
            matchFullUrl: matchesInTorrent[0].announce // Use first match for preview
          })
        }
      })

      setMatchingTorrents(matches)
      if (matches.length > 0) {
        setStep("confirm")
      } else {
        toast.error(t('common.no_matching_torrents'))
      }
    } catch (error) {
      console.error("Search failed:", error)
      toast.error(t('common.action_failed'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleReplace = async () => {
    if (!newTracker.trim()) return

    setIsReplacing(true)
    let successCount = 0
    try {
      const oldPrefix = oldTracker.trim()
      const newPrefix = newTracker.trim()

      for (const item of matchingTorrents) {
        try {
          // Update all matching trackers in this torrent's list
          const updatedTrackers = item.trackers.map(tr => {
            if (tr.announce.startsWith(oldPrefix)) {
              return { ...tr, announce: tr.announce.replace(oldPrefix, newPrefix) }
            }
            return tr
          })

          // Sort by tier to ensure blank lines work correctly
          updatedTrackers.sort((a, b) => a.tier - b.tier)

          // Build trackerList string: URLs one per line, blank line between tiers
          let trackerListString = ""
          let currentTier = -1
          
          updatedTrackers.forEach((tr, index) => {
            if (currentTier !== -1 && tr.tier !== currentTier) {
              trackerListString += "\n" // Blank line between tiers
            }
            trackerListString += tr.announce + "\n"
            currentTier = tr.tier
          })

          // Apply full replacement using the modern 'trackerList' parameter
          await rpc.setTorrent([item.id], {
             trackerList: trackerListString.trim()
          })
          
          successCount++
        } catch (e) {
          console.error(`Failed to replace tracker for torrent ${item.id}:`, e)
        }
      }

      toast.success(t('common.replace_success', { count: successCount }))
      onOpenChange(false)
      onSuccess?.()
      setStep("input")
      setOldTracker("")
      setNewTracker("")
      setMatchingTorrents([])
    } catch (error) {
      console.error("Batch replace failed:", error)
      toast.error(t('common.action_failed'))
    } finally {
      setIsReplacing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
        if (!isReplacing) {
            onOpenChange(v)
            if (!v) {
                setStep("input")
                setMatchingTorrents([])
            }
        }
    }}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl bg-card border border-muted/20 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-muted/50 bg-muted/20">
             <div>
                <DialogTitle className="text-2xl font-medium tracking-tight">{t('common.batch_replace_tracker')}</DialogTitle>
                <DialogDescription className="text-base font-medium opacity-70">
                   {step === "input" ? "通过输入前缀，批量更新命中种子的 Tracker 地址。" : `发现了 ${matchingTorrents.length} 个匹配的种子。`}
                </DialogDescription>
             </div>
        </DialogHeader>

        <div className="p-6">
          {step === "input" ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-medium uppercase tracking-widest text-muted-foreground/60">{t('common.old_tracker')}</label>
                  </div>
                  
                  <div className="relative group/input">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <Input
                      placeholder="https://tracker.example.com/announce"
                      value={oldTracker}
                      onChange={(e) => setOldTracker(e.target.value)}
                      className="pl-11 pr-12 h-14 text-sm rounded-2xl bg-muted/30 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground/50 hover:text-primary transition-colors">
                            <ChevronDown className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        {availableTrackers.length > 0 && (
                          <DropdownMenuContent 
                            align="end" 
                            side="bottom"
                            sideOffset={8}
                            className="w-[var(--radix-dropdown-menu-trigger-width)] sm:w-[400px] rounded-2xl border-muted/50 p-1 bg-card/95 backdrop-blur-xl z-[60] max-h-[300px] overflow-y-auto no-scrollbar"
                          >
                            {availableTrackers.map(url => (
                              <DropdownMenuItem 
                                key={url} 
                                className="rounded-xl py-3 px-4 text-sm font-medium cursor-pointer transition-colors"
                                onClick={() => setOldTracker(url)}
                              >
                                <Globe className="h-4 w-4 mr-3 opacity-50 shrink-0" />
                                <span className="truncate">{url}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        )}
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium uppercase tracking-widest text-muted-foreground/60 ml-1">{t('common.new_tracker')}</label>
                  <div className="relative group/input">
                    <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <Input
                      placeholder="https://new-tracker.org/announce"
                      value={newTracker}
                      onChange={(e) => setNewTracker(e.target.value)}
                      className="pl-11 h-14 text-sm rounded-2xl bg-muted/30 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                  该操作将遍历所有正在进行的任务。修改 Tracker 地址的前缀部分可能会导致种子短暂掉线，系统会自动尝试重连。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground/60">{t('common.affected_torrents')}</span>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{matchingTorrents.length}</span>
               </div>
               <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-2 pr-1">
                  {matchingTorrents.map((tor) => (
                    <div key={tor.id} className="p-3.5 rounded-2xl bg-muted/30 border border-muted/20 flex items-center gap-3">
                      <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                      <span className="text-sm font-medium truncate leading-none">{tor.name}</span>
                    </div>
                  ))}
               </div>
               
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 px-2">
                  <div className="flex flex-col items-center gap-2 min-w-0 w-full sm:flex-1">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">PREFIX OLD</span>
                    <div className="w-full bg-muted/50 p-3 rounded-2xl border border-muted/50 text-center transition-colors group/old">
                      <span className="text-xs font-mono font-medium break-all line-clamp-2 leading-relaxed" title={oldTracker}>{oldTracker}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center sm:mt-6">
                    <ArrowRight className="h-5 w-5 text-primary opacity-30 rotate-90 sm:rotate-0" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 min-w-0 w-full sm:flex-1">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-primary/40">PREFIX NEW</span>
                    <div className="w-full bg-primary/5 p-3 rounded-2xl border border-primary/20 text-center transition-colors">
                      <span className="text-xs font-mono font-medium text-primary break-all line-clamp-2 leading-relaxed" title={newTracker}>{newTracker}</span>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/10 border-t border-muted/50">
          {step === "input" ? (
            <Button
              className="w-full h-12 rounded-2xl font-medium tracking-widest uppercase transition-all shadow-lg shadow-primary/20 bg-primary hover:scale-[1.01] active:scale-[0.99] text-xs"
              onClick={handleSearch}
              disabled={isSearching || !oldTracker || !newTracker}
            >
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : 
               <><Search className="h-4 w-4 mr-2" /> 扫描匹配种子</>}
            </Button>
          ) : (
            <div className="flex gap-3 w-full">
              <Button
                variant="ghost"
                className="flex-1 h-12 rounded-2xl font-medium tracking-widest uppercase text-xs"
                onClick={() => setStep("input")}
                disabled={isReplacing}
              >
                返回修改
              </Button>
              <Button
                className="flex-[2] h-12 rounded-2xl font-medium tracking-widest uppercase text-xs shadow-lg shadow-primary/20"
                onClick={handleReplace}
                disabled={isReplacing}
              >
                {isReplacing ? <RefreshCw className="h-4 w-4 animate-spin" /> : 
                 <><ListCheck className="h-4 w-4 mr-2" /> {t('common.replace_confirm')}</>}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
