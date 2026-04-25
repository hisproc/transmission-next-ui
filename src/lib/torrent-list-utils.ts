import { getStatusLabel } from "./formatters.ts"
import type { Torrent } from "./rpc-types.ts"
import { getTorrentLabelsSortValue, parseTorrentLabel } from "./torrent-labels.ts"

export type SortKey =
  | "name"
  | "status"
  | "percentDone"
  | "addedDate"
  | "editDate"
  | "uploadedEver"
  | "rateDownload"
  | "rateUpload"
  | "eta"
  | "uploadRatio"
  | "labels"

export type SortConfig = { key: SortKey; direction: "asc" | "desc" }

export interface TorrentFilterOptions {
  statusFilter?: string
  searchQuery?: string
  trackerFilter?: string[]
  dirFilter?: string[]
  labelFilter?: string[]
  translateStatus: (statusKey: string) => string
}

export function getAvailableTrackers(torrents: Torrent[]): string[] {
  const hosts = new Set<string>()

  torrents.forEach((torrent) => {
    torrent.trackerStats?.forEach((stat) => {
      if (stat.host) hosts.add(stat.host)
    })
  })

  return Array.from(hosts).sort()
}

export function getAvailableDownloadDirs(torrents: Torrent[]): string[] {
  const dirs = new Set<string>()

  torrents.forEach((torrent) => {
    if (torrent.downloadDir) dirs.add(torrent.downloadDir)
  })

  return Array.from(dirs).sort()
}

export function getAvailableLabels(torrents: Torrent[]): string[] {
  const labels = new Set<string>()

  torrents.forEach((torrent) => {
    torrent.labels?.forEach((label) => {
      const text = parseTorrentLabel(label)
      if (text) labels.add(text)
    })
  })

  return Array.from(labels).sort()
}

export function filterTorrents(torrents: Torrent[], options: TorrentFilterOptions): Torrent[] {
  const {
    statusFilter,
    searchQuery,
    trackerFilter = [],
    dirFilter = [],
    labelFilter = [],
    translateStatus,
  } = options
  const statusLower = statusFilter?.toLowerCase()
  const searchLower = searchQuery?.toLowerCase()

  return torrents.filter((torrent) => {
    if (statusLower) {
      if (statusLower === "active") {
        if (!(torrent.rateDownload > 0 || torrent.rateUpload > 0)) return false
      } else if (statusLower === "downloading") {
        if (![4, 3, 2, 1].includes(torrent.status)) return false
      } else if (statusLower === "seeding") {
        if (![6, 5].includes(torrent.status)) return false
      } else if (statusLower === "stopped" || statusLower === "paused") {
        if (torrent.status !== 0) return false
      } else if (!translateStatus(getStatusLabel(torrent.status)).toLowerCase().includes(statusLower)) {
        return false
      }
    }

    if (trackerFilter.length > 0 && !torrent.trackerStats?.some((stat) => trackerFilter.includes(stat.host))) return false
    if (dirFilter.length > 0 && !dirFilter.includes(torrent.downloadDir)) return false
    if (labelFilter.length > 0 && !torrent.labels?.some((label) => labelFilter.includes(parseTorrentLabel(label)))) return false
    if (searchLower && !torrent.name.toLowerCase().includes(searchLower)) return false

    return true
  })
}

export function getTorrentSortValue(torrent: Torrent, key: SortKey): number | string {
  switch (key) {
    case "labels":
      return getTorrentLabelsSortValue(torrent.labels)
    case "editDate":
      return torrent.editDate ?? 0
    default:
      return torrent[key] ?? 0
  }
}

export function sortTorrents(torrents: Torrent[], sortConfig: SortConfig | null): Torrent[] {
  if (!sortConfig) return torrents

  const { key, direction } = sortConfig

  return [...torrents].sort((a, b) => {
    const valueA = getTorrentSortValue(a, key)
    const valueB = getTorrentSortValue(b, key)

    if (valueA < valueB) return direction === "asc" ? -1 : 1
    if (valueA > valueB) return direction === "asc" ? 1 : -1
    return 0
  })
}
