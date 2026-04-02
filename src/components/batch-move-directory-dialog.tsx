"use client"

import * as React from "react"
import { FolderOpen, ArrowRight, Search, AlertCircle, RefreshCw, ListCheck } from "lucide-react"
import { BatchTorrentList } from "@/components/batch-torrent-list"
import { BatchInputWithDropdown } from "@/components/batch-input-with-dropdown"
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
import { toast } from "sonner"
import { rpc } from "@/lib/rpc-client"
import { useI18n } from "@/lib/i18n-context"

interface BatchMoveDirectoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface MatchingTorrent {
  id: number
  name: string
  downloadDir: string
}

export function BatchMoveDirectoryDialog({ open, onOpenChange, onSuccess }: BatchMoveDirectoryDialogProps) {
  const [oldDir, setOldDir] = React.useState("")
  const [newDir, setNewDir] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [isMoving, setIsMoving] = React.useState(false)
  const [matchingTorrents, setMatchingTorrents] = React.useState<MatchingTorrent[]>([])
  const [availableDirs, setAvailableDirs] = React.useState<string[]>([])
  const [step, setStep] = React.useState<"input" | "confirm">("input")
  const { t } = useI18n()

  // Fetch unique download directories when dialog opens
  React.useEffect(() => {
    if (open) {
      const fetchDirs = async () => {
        try {
          const { torrents } = await rpc.getTorrents(["downloadDir"])
          const dirSet = new Set<string>()
          torrents.forEach((tor: any) => {
            if (tor.downloadDir) {
              dirSet.add(tor.downloadDir)
            }
          })
          setAvailableDirs(Array.from(dirSet).sort())
        } catch (error) {
          console.error("Failed to fetch directories:", error)
        }
      }
      fetchDirs()
    }
  }, [open])

  const handleSearch = async () => {
    if (!oldDir.trim()) return

    setIsSearching(true)
    try {
      const { torrents } = await rpc.getTorrents(["id", "name", "downloadDir"])
      const targetOldDir = oldDir.trim()
      
      const matches: MatchingTorrent[] = torrents
        .filter((tor: any) => tor.downloadDir === targetOldDir)
        .map((tor: any) => ({
          id: tor.id,
          name: tor.name,
          downloadDir: tor.downloadDir
        }))

      setMatchingTorrents(matches)
      if (matches.length > 0) {
        setStep("confirm")
      } else {
        toast.error(t('common.no_matching_directories'))
      }
    } catch (error) {
      console.error("Search failed:", error)
      toast.error(t('common.action_failed'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleMove = async () => {
    if (!newDir.trim() || matchingTorrents.length === 0) return

    setIsMoving(true)
    try {
      const ids = matchingTorrents.map(t => t.id)
      const targetNewDir = newDir.trim()
      
      // Transmission RPC: torrent-set-location
      // { "ids": [...], "location": "...", "move": true }
      await rpc.setTorrentLocation(ids, targetNewDir, true)

      toast.success(t('common.move_directory_success', { count: matchingTorrents.length }))
      onOpenChange(false)
      onSuccess?.()
      setStep("input")
      setOldDir("")
      setNewDir("")
      setMatchingTorrents([])
    } catch (error) {
      console.error("Batch move failed:", error)
      toast.error(t('common.action_failed'))
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
        if (!isMoving) {
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
                <DialogTitle className="text-2xl font-medium tracking-tight">{t('common.batch_move_directory')}</DialogTitle>
                <DialogDescription className="text-base font-medium opacity-70">
                   {step === "input" ? t('common.move_directory_desc') : `发现了 ${matchingTorrents.length} 个匹配的种子。`}
                </DialogDescription>
             </div>
        </DialogHeader>

        <div className="p-6">
          {step === "input" ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <BatchInputWithDropdown
                  label={t('common.old_directory')}
                  placeholder="/downloads/old-path"
                  value={oldDir}
                  onChange={setOldDir}
                  options={availableDirs}
                  icon={FolderOpen}
                  optionIcon={FolderOpen}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium uppercase tracking-widest text-muted-foreground/60 ml-1">{t('common.new_directory')}</label>
                  <div className="relative group/input">
                    <ArrowRight className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <Input
                      placeholder="/downloads/new-path"
                      value={newDir}
                      onChange={(e) => setNewDir(e.target.value)}
                      className="pl-11 h-14 text-sm rounded-2xl bg-muted/30 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                  该操作将移动匹配种子的物理文件。请确保目标路径有足够的磁盘空间。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground/60">{t('common.affected_torrents')}</span>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{matchingTorrents.length}</span>
               </div>
               <BatchTorrentList torrents={matchingTorrents} />
               
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 px-2">
                  <div className="flex flex-col items-center gap-2 min-w-0 w-full sm:flex-1">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">OLD PATH</span>
                    <div className="w-full bg-muted/50 p-3 rounded-2xl border border-muted/50 text-center transition-colors group/old">
                      <span className="text-xs font-mono font-medium break-all line-clamp-2 leading-relaxed" title={oldDir}>{oldDir}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center sm:mt-6">
                    <ArrowRight className="h-5 w-5 text-primary opacity-30 rotate-90 sm:rotate-0" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 min-w-0 w-full sm:flex-1">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-primary/40">NEW PATH</span>
                    <div className="w-full bg-primary/5 p-3 rounded-2xl border border-primary/20 text-center transition-colors">
                      <span className="text-xs font-mono font-medium text-primary break-all line-clamp-2 leading-relaxed" title={newDir}>{newDir}</span>
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
              disabled={isSearching || !oldDir || !newDir}
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
                disabled={isMoving}
              >
                返回修改
              </Button>
              <Button
                className="flex-[2] h-12 rounded-2xl font-medium tracking-widest uppercase text-xs shadow-lg shadow-primary/20"
                onClick={handleMove}
                disabled={isMoving}
              >
                {isMoving ? <RefreshCw className="h-4 w-4 animate-spin" /> : 
                 <><ListCheck className="h-4 w-4 mr-2" /> {t('common.move_confirm')}</>}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
