"use client"

import * as React from "react"
import { Tag, RefreshCw, X, ListCheck } from "lucide-react"
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

interface BatchSetLabelsSelectedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: number[]
  onSuccess?: () => void
}

export function BatchSetLabelsSelectedDialog({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: BatchSetLabelsSelectedDialogProps) {
  const [labels, setLabels] = React.useState<string[]>([])
  const [draftLabel, setDraftLabel] = React.useState("")
  const [mode, setMode] = React.useState<"overwrite" | "append">("overwrite")
  const [isApplying, setIsApplying] = React.useState(false)
  const [availableLabels, setAvailableLabels] = React.useState<string[]>([])
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

  const addLabel = (value?: string) => {
    const label = (value ?? draftLabel).trim()
    if (!label || labels.includes(label)) return
    setLabels((prev) => [...prev, label])
    setDraftLabel("")
  }

  const removeLabel = (index: number) => {
    setLabels((prev) => prev.filter((_, i) => i !== index))
  }

  const handleApply = async () => {
    setIsApplying(true)
    let successCount = 0
    try {
      if (mode === "overwrite") {
        await rpc.setTorrent(selectedIds, { labels: serializeTorrentLabels(labels) })
        successCount = selectedIds.length
      } else {
        const { torrents } = await rpc.getTorrents(["id", "labels"])
        const torrentMap = new Map<number, string[]>()
        torrents.forEach((tor: { id: number; labels?: string[] }) => {
          torrentMap.set(tor.id, tor.labels ?? [])
        })

        for (const id of selectedIds) {
          try {
            const existing = parseTorrentLabels(torrentMap.get(id))
            const merged = Array.from(new Set([...existing, ...labels]))
            await rpc.setTorrent([id], { labels: serializeTorrentLabels(merged) })
            successCount++
          } catch (e) {
            console.error(`Failed to set labels for torrent ${id}:`, e)
          }
        }
      }

      toast.success(t("common.set_labels_success", { count: successCount }))
      onOpenChange(false)
      onSuccess?.()
      resetState()
    } catch (error) {
      console.error("Batch set labels failed:", error)
      toast.error(t("common.action_failed"))
    } finally {
      setIsApplying(false)
    }
  }

  const resetState = () => {
    setLabels([])
    setDraftLabel("")
    setMode("overwrite")
  }

  const filteredSuggestions = availableLabels.filter(
    (l) => l.toLowerCase().includes(draftLabel.toLowerCase()) && !labels.includes(l)
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isApplying) {
          onOpenChange(v)
          if (!v) resetState()
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl bg-card border border-muted/20 p-0 overflow-hidden flex flex-col max-h-[calc(100svh-2rem)]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-muted/50 bg-muted/20 shrink-0">
          <div>
            <DialogTitle className="text-2xl font-medium tracking-tight">
              {t("common.set_torrent_labels")}
            </DialogTitle>
            <DialogDescription className="text-base font-medium opacity-70">
              {t("common.set_torrent_labels_desc", { count: selectedIds.length })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Mode toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              {t("common.set_labels_mode")}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("overwrite")}
                className={`flex-1 h-10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border ${
                  mode === "overwrite"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-muted/30 text-muted-foreground border-muted/30 hover:bg-muted/50"
                }`}
              >
                {t("common.set_labels_overwrite")}
              </button>
              <button
                type="button"
                onClick={() => setMode("append")}
                className={`flex-1 h-10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border ${
                  mode === "append"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-muted/30 text-muted-foreground border-muted/30 hover:bg-muted/50"
                }`}
              >
                {t("common.set_labels_append")}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground/50 px-1">
              {mode === "overwrite"
                ? t("common.set_labels_overwrite_hint")
                : t("common.set_labels_append_hint")}
            </p>
          </div>

          {/* Tag input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              {t("common.labels")}
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-muted/20 border border-muted/10 min-h-[52px]">
              {labels.map((label, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 p-1 px-2.5 bg-primary/10 text-primary rounded-xl text-xs font-medium animate-in zoom-in-95 duration-200"
                >
                  <Tag className="h-3 w-3 opacity-60" />
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(i)}
                    className="p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="relative flex-1 min-w-[120px]">
                <Input
                  value={draftLabel}
                  onChange={(e) => setDraftLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addLabel()
                    } else if (e.key === "Backspace" && !draftLabel && labels.length > 0) {
                      removeLabel(labels.length - 1)
                    }
                  }}
                  className="h-8 border-none bg-transparent focus-visible:ring-0 px-1 text-xs font-medium placeholder:text-muted-foreground/30"
                  placeholder={t("common.labels_placeholder")}
                />
              </div>
            </div>

            {/* Suggestions */}
            {draftLabel && filteredSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-1">
                {filteredSuggestions.slice(0, 8).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addLabel(s)}
                    className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/10 border-t border-muted/50 shrink-0">
          <Button
            className="w-full h-12 rounded-2xl font-medium tracking-widest uppercase transition-all shadow-lg shadow-primary/20 bg-primary hover:scale-[1.01] active:scale-[0.99] text-xs"
            onClick={handleApply}
            disabled={isApplying || labels.length === 0}
          >
            {isApplying ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ListCheck className="h-4 w-4 mr-2" />
                {t("common.set_labels_confirm", { count: selectedIds.length })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
