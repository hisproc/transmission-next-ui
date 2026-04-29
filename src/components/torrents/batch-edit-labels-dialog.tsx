"use client"

import * as React from "react"
import { Tag, RefreshCw, Search, ArrowRight, ListCheck } from "lucide-react"
import { BatchTorrentList } from "@/components/torrents/batch-torrent-list"
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
import { parseTorrentLabels, serializeTorrentLabels } from "@/lib/torrent-labels"
import { useI18n } from "@/lib/i18n-context"

interface BatchEditLabelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface MatchingTorrent {
  id: number
  name: string
  rawLabels: string[]
}

export function BatchEditLabelsDialog({ open, onOpenChange, onSuccess }: BatchEditLabelsDialogProps) {
  const [oldLabel, setOldLabel] = React.useState("")
  const [newLabel, setNewLabel] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [isApplying, setIsApplying] = React.useState(false)
  const [matchingTorrents, setMatchingTorrents] = React.useState<MatchingTorrent[]>([])
  const [availableLabels, setAvailableLabels] = React.useState<string[]>([])
  const [step, setStep] = React.useState<"input" | "confirm">("input")
  const { t } = useI18n()

  React.useEffect(() => {
    if (open) {
      const fetchLabels = async () => {
        try {
          const { torrents } = await rpc.getTorrents(["labels"])
          const labelSet = new Set<string>()
          torrents.forEach((tor: { labels?: string[] }) => {
            parseTorrentLabels(tor.labels).forEach((l) => labelSet.add(l))
          })
          setAvailableLabels(Array.from(labelSet).sort())
        } catch (error) {
          console.error("Failed to fetch labels:", error)
        }
      }
      fetchLabels()
    }
  }, [open])

  const handleSearch = async () => {
    if (!oldLabel.trim()) return

    setIsSearching(true)
    try {
      const { torrents } = await rpc.getTorrents(["id", "name", "labels"])
      const matches: MatchingTorrent[] = []

      torrents.forEach((tor: { id: number; name: string; labels?: string[] }) => {
        const parsed = parseTorrentLabels(tor.labels)
        if (parsed.includes(oldLabel.trim())) {
          matches.push({ id: tor.id, name: tor.name, rawLabels: tor.labels ?? [] })
        }
      })

      setMatchingTorrents(matches)
      if (matches.length > 0) {
        setStep("confirm")
      } else {
        toast.error(t('common.no_matching_label_torrents'))
      }
    } catch (error) {
      console.error("Search failed:", error)
      toast.error(t('common.action_failed'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleApply = async () => {
    const trimmedNew = newLabel.trim()
    if (!trimmedNew) return

    setIsApplying(true)
    let successCount = 0
    try {
      const trimmedOld = oldLabel.trim()

      for (const item of matchingTorrents) {
        try {
          const parsed = parseTorrentLabels(item.rawLabels)
          const updated = parsed.map((l) => (l === trimmedOld ? trimmedNew : l))
          await rpc.setTorrent([item.id], { labels: serializeTorrentLabels(updated) })
          successCount++
        } catch (e) {
          console.error(`Failed to update labels for torrent ${item.id}:`, e)
        }
      }

      toast.success(t('common.edit_labels_success', { count: successCount }))
      onOpenChange(false)
      onSuccess?.()
      resetState()
    } catch (error) {
      console.error("Batch edit labels failed:", error)
      toast.error(t('common.action_failed'))
    } finally {
      setIsApplying(false)
    }
  }

  const resetState = () => {
    setStep("input")
    setOldLabel("")
    setNewLabel("")
    setMatchingTorrents([])
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!isApplying) {
        onOpenChange(v)
        if (!v) resetState()
      }
    }}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl bg-card border border-muted/20 p-0 overflow-hidden flex flex-col max-h-[calc(100svh-2rem)]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-muted/50 bg-muted/20 shrink-0">
          <div>
            <DialogTitle className="text-2xl font-medium tracking-tight">{t('common.batch_edit_labels')}</DialogTitle>
            <DialogDescription className="text-base font-medium opacity-70">
              {step === "input"
                ? t('common.batch_edit_labels_desc')
                : t('common.batch_found_count', { count: matchingTorrents.length })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1">
          {step === "input" ? (
            <div className="space-y-4">
              <BatchInputWithDropdown
                label={t('common.old_label')}
                placeholder={t('common.old_label_placeholder')}
                value={oldLabel}
                onChange={setOldLabel}
                options={availableLabels}
                icon={Tag}
                optionIcon={Tag}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-widest text-muted-foreground/60 ml-1">{t('common.new_label')}</label>
                <div className="relative group/input">
                  <ArrowRight className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                  <Input
                    placeholder={t('common.new_label_placeholder')}
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="pl-11 h-14 text-sm rounded-2xl bg-muted/30 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
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
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">OLD LABEL</span>
                  <div className="w-full bg-muted/50 p-3 rounded-2xl border border-muted/50 text-center">
                    <span className="text-xs font-medium break-all line-clamp-2 leading-relaxed" title={oldLabel}>{oldLabel}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:mt-6">
                  <ArrowRight className="h-5 w-5 text-primary opacity-30 rotate-90 sm:rotate-0" />
                </div>

                <div className="flex flex-col items-center gap-2 min-w-0 w-full sm:flex-1">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-primary/40">NEW LABEL</span>
                  <div className="w-full bg-primary/5 p-3 rounded-2xl border border-primary/20 text-center">
                    <span className="text-xs font-medium text-primary break-all line-clamp-2 leading-relaxed" title={newLabel}>{newLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/10 border-t border-muted/50 shrink-0">
          {step === "input" ? (
            <Button
              className="w-full h-12 rounded-2xl font-medium tracking-widest uppercase transition-all shadow-lg shadow-primary/20 bg-primary hover:scale-[1.01] active:scale-[0.99] text-xs"
              onClick={handleSearch}
              disabled={isSearching || !oldLabel || !newLabel}
            >
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> :
                <><Search className="h-4 w-4 mr-2" />{t('common.scan_torrents')}</>}
            </Button>
          ) : (
            <div className="flex gap-3 w-full">
              <Button
                variant="ghost"
                className="flex-1 h-12 rounded-2xl font-medium tracking-widest uppercase text-xs"
                onClick={() => setStep("input")}
                disabled={isApplying}
              >
                {t('common.go_back')}
              </Button>
              <Button
                className="flex-[2] h-12 rounded-2xl font-medium tracking-widest uppercase text-xs shadow-lg shadow-primary/20"
                onClick={handleApply}
                disabled={isApplying}
              >
                {isApplying ? <RefreshCw className="h-4 w-4 animate-spin" /> :
                  <><ListCheck className="h-4 w-4 mr-2" />{t('common.edit_labels_confirm')}</>}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
