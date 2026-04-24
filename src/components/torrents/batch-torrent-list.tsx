"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"

interface BatchTorrentListProps {
  torrents: { id: number; name: string }[]
  maxHeight?: string
}

export function BatchTorrentList({ torrents, maxHeight = "220px" }: BatchTorrentListProps) {
  return (
    <div 
      className="overflow-y-auto no-scrollbar space-y-2 pr-1 w-full"
      style={{ maxHeight }}
    >
      {torrents.map((tor) => (
        <div 
          key={tor.id} 
          className="p-3.5 rounded-2xl bg-muted/30 border border-muted/20 flex items-start gap-3 min-w-0"
        >
          <CheckCircle2 className="h-4.5 w-4.5 text-green-500 mt-0.5 shrink-0" />
          <span className="text-sm font-medium break-all flex-1 min-w-0">
            {tor.name}
          </span>
        </div>
      ))}
    </div>
  )
}
