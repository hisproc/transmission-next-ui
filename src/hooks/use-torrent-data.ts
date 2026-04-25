"use client"
import { useState, useCallback, useEffect } from "react"
import { rpc } from "@/lib/rpc-client"
import { useAppSettings } from "@/lib/app-settings-context"
import { getRequiredRpcFields } from "@/lib/columns"
import type { Torrent, SessionStats } from "@/lib/rpc-types"

export function useTorrentData(
  showStats: boolean,
  viewMode: "list" | "grid",
  visibleColumns: string[]
) {
  const [torrents, setTorrents] = useState<Torrent[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [freeSpace, setFreeSpace] = useState<{ path: string; "size-bytes": number; total_size: number } | null>(null)
  const { refreshInterval, autoRefresh } = useAppSettings()

  const fetchData = useCallback(async () => {
    try {
      const torrentFields = getRequiredRpcFields(visibleColumns, viewMode)
      const torrentsData = await rpc.getTorrents(torrentFields)
      setTorrents(torrentsData.torrents)

      if (showStats) {
        const [statsData, sessionData] = await Promise.all([
          rpc.getStats(),
          rpc.getSession()
        ])
        setStats(statsData)

        if (sessionData["download-dir"]) {
          try {
            const freeData = await rpc.freeSpace(sessionData["download-dir"])
            setFreeSpace(freeData)
          } catch (e) {
            console.error("Failed to fetch free space:", e)
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch Transmission data:", err)
    }
  }, [showStats, viewMode, visibleColumns])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
    if (!autoRefresh) return

    const timer = setInterval(fetchData, refreshInterval)
    return () => clearInterval(timer)
  }, [fetchData, refreshInterval, autoRefresh])

  return { torrents, stats, freeSpace, fetchData }
}
