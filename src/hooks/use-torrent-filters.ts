"use client"
import { useState, useMemo } from "react"
import { useI18n } from "@/lib/i18n-context"
import type { Torrent } from "@/lib/rpc-types"
import {
  filterTorrents,
  getAvailableDownloadDirs,
  getAvailableLabels,
  getAvailableTrackers,
} from "@/lib/torrent-list-utils"

export function useTorrentFilters(
  torrents: Torrent[],
  statusFilter: string | undefined,
  searchQuery: string
) {
  const { t } = useI18n()
  const [trackerFilter, setTrackerFilter] = useState<string[]>([])
  const [dirFilter, setDirFilter] = useState<string[]>([])
  const [labelFilter, setLabelFilter] = useState<string[]>([])

  const trackers = useMemo(() => getAvailableTrackers(torrents), [torrents])

  const downloadDirs = useMemo(() => getAvailableDownloadDirs(torrents), [torrents])

  const availableLabels = useMemo(() => getAvailableLabels(torrents), [torrents])

  const filteredTorrents = useMemo(() => filterTorrents(torrents, {
    statusFilter,
    searchQuery,
    trackerFilter,
    dirFilter,
    labelFilter,
    translateStatus: (statusKey) => t(statusKey),
  }), [torrents, statusFilter, trackerFilter, dirFilter, labelFilter, searchQuery, t])

  const toggleTracker = (host: string) => {
    setTrackerFilter(prev =>
      prev.includes(host)
        ? prev.filter(h => h !== host)
        : [...prev, host]
    )
  }

  const toggleDir = (path: string) => {
    setDirFilter(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  const toggleLabel = (label: string) => {
    setLabelFilter(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  const clearFilters = () => {
    setTrackerFilter([])
    setDirFilter([])
    setLabelFilter([])
  }

  return {
    trackerFilter,
    dirFilter,
    labelFilter,
    toggleTracker,
    toggleDir,
    toggleLabel,
    clearFilters,
    trackers,
    downloadDirs,
    availableLabels,
    filteredTorrents,
  }
}
