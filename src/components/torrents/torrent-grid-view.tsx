"use client"

import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Pause,
  Play,
  Pencil,
  Trash2,
} from "lucide-react"
import { EditTorrentDialog } from "@/components/torrents/edit-torrent-dialog"
import { cn } from "@/lib/utils"
import { formatSpeed, formatDuration, getStatusLabel, formatSizeParts, splitSpeed } from "@/lib/formatters"
import type { Torrent } from "@/lib/rpc-types"
import { useI18n } from "@/lib/i18n-context"

interface TorrentGridViewProps {
  paginatedTorrents: Torrent[]
  onSingleAction: (id: number, action: "start" | "stop" | "remove") => void
}

export function TorrentGridView({
  paginatedTorrents,
  onSingleAction,
}: TorrentGridViewProps) {
  const { t } = useI18n()

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {paginatedTorrents.map((torrent) => (
        <Card
          key={torrent.id}
          className="group relative shadow-md border-none overflow-hidden hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 bg-sidebar/30 flex flex-col py-0"
        >
          <CardHeader className="pb-3 pt-4 border-b border-muted/50 bg-background/50">
            <div className="min-w-0 space-y-1">
              <Link to={`/torrents/detail?id=${torrent.id}`} className="block group-hover:text-primary transition-colors">
                <CardTitle className="text-heading-3 truncate pr-2 cursor-pointer leading-tight" title={torrent.name}>
                  {torrent.name}
                </CardTitle>
              </Link>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide transition-colors",
                  torrent.status === 4 ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" :
                    torrent.status === 6 ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400" :
                      torrent.status === 0 ? "bg-muted text-muted-foreground/70" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                )}>
                  {t(getStatusLabel(torrent.status))}
                </span>
                <span className="text-label tracking-tighter whitespace-nowrap">
                  {(() => {
                    const parts = formatSizeParts(torrent.totalSize)
                    return (
                      <>
                        {parts.value} <span className="text-[10px] opacity-60 font-medium">{parts.unit}</span>
                      </>
                    )
                  })()}
                </span>
              </div>
            </div>
            <CardAction className="flex gap-1 shrink-0">
              <EditTorrentDialog torrent={torrent}>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-opacity rounded-full">
                  <Pencil className="h-4 w-4" />
                </Button>
              </EditTorrentDialog>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-opacity rounded-full" onClick={() => onSingleAction(torrent.id, "remove")}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="py-5 space-y-5 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between text-label">
                <span>{t('common.progress')}</span>
                <span className="text-primary">{(torrent.percentDone * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.4)]"
                  style={{ width: `${torrent.percentDone * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-label">{t('stats.download_speed')}</p>
                <div className="flex items-center gap-1 text-green-500 text-heading-3 whitespace-nowrap">
                  <ArrowDown className="h-3 w-3" />
                  <span className="text-numeric">
                    {(() => {
                      const parts = splitSpeed(formatSpeed(torrent.rateDownload))
                      return (
                        <>
                          {parts.value} <span className="text-sm opacity-60 ml-0.5">{parts.unit}</span>
                        </>
                      )
                    })()}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-label">{t('stats.upload_speed')}</p>
                <div className="flex items-center justify-end gap-1 text-blue-500 text-heading-3 whitespace-nowrap">
                  <ArrowUp className="h-3 w-3" />
                  <span className="text-numeric">
                    {(() => {
                      const parts = splitSpeed(formatSpeed(torrent.rateUpload))
                      return (
                        <>
                          {parts.value} <span className="text-sm opacity-60 ml-0.5">{parts.unit}</span>
                        </>
                      )
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 px-4 py-3 border-t border-muted/50 flex justify-between items-center mt-auto">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-label lowercase">{formatDuration(torrent.eta)}</span>
            </div>
            <div className="flex gap-2">
              {torrent.status !== 0 ? (
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-muted-foreground/20 hover:bg-orange-500/10 hover:text-orange-500 transition-all hover:scale-110" onClick={() => onSingleAction(torrent.id, "stop")}>
                  <Pause className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-muted-foreground/20 hover:bg-green-500/10 hover:text-green-500 transition-all hover:scale-110" onClick={() => onSingleAction(torrent.id, "start")}>
                  <Play className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
