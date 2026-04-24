import { parseTorrentLabels, serializeTorrentLabels } from "./torrent-labels.ts"
import type { Torrent, TorrentField, TorrentSetArgs } from "./rpc-types.ts"

export type EditTorrentDialogTorrent = Pick<Torrent, "id" | "name" | "downloadDir">

export interface EditTorrentFormState {
  name: string
  location: string
  moveData: boolean
  bandwidthPriority: number
  downloadLimit: number
  downloadLimited: boolean
  uploadLimit: number
  uploadLimited: boolean
  honorsSessionLimits: boolean
  seedRatioLimit: number
  seedRatioMode: number
  seedIdleLimit: number
  seedIdleMode: number
  trackerList: string
  labels: string[]
}

export const EDIT_TORRENT_FIELDS: TorrentField[] = [
  "name",
  "downloadDir",
  "bandwidthPriority",
  "downloadLimit",
  "downloadLimited",
  "uploadLimit",
  "uploadLimited",
  "honorsSessionLimits",
  "seedRatioLimit",
  "seedRatioMode",
  "seedIdleLimit",
  "seedIdleMode",
  "trackerList",
  "labels",
]

export function createInitialEditTorrentFormState(torrent: EditTorrentDialogTorrent): EditTorrentFormState {
  return {
    name: torrent.name,
    location: torrent.downloadDir || "/downloads",
    moveData: true,
    bandwidthPriority: 0,
    downloadLimit: 0,
    downloadLimited: false,
    uploadLimit: 0,
    uploadLimited: false,
    honorsSessionLimits: true,
    seedRatioLimit: 0,
    seedRatioMode: 0,
    seedIdleLimit: 0,
    seedIdleMode: 0,
    trackerList: "",
    labels: [],
  }
}

export function mapTorrentToEditTorrentFormState(
  torrent: EditTorrentDialogTorrent,
  details?: Torrent
): EditTorrentFormState {
  const base = details

  return {
    name: base?.name ?? torrent.name,
    location: base?.downloadDir || torrent.downloadDir || "/downloads",
    moveData: true,
    bandwidthPriority: base?.bandwidthPriority ?? 0,
    downloadLimit: base?.downloadLimit ?? 0,
    downloadLimited: base?.downloadLimited ?? false,
    uploadLimit: base?.uploadLimit ?? 0,
    uploadLimited: base?.uploadLimited ?? false,
    honorsSessionLimits: base?.honorsSessionLimits !== false,
    seedRatioLimit: base?.seedRatioLimit ?? 0,
    seedRatioMode: base?.seedRatioMode ?? 0,
    seedIdleLimit: base?.seedIdleLimit ?? 0,
    seedIdleMode: base?.seedIdleMode ?? 0,
    trackerList: base?.trackerList ?? "",
    labels: parseTorrentLabels(base?.labels),
  }
}

export function buildEditTorrentSetArgs(form: EditTorrentFormState): TorrentSetArgs {
  return {
    bandwidthPriority: form.bandwidthPriority,
    downloadLimit: Number(form.downloadLimit),
    downloadLimited: form.downloadLimited,
    uploadLimit: Number(form.uploadLimit),
    uploadLimited: form.uploadLimited,
    honorsSessionLimits: form.honorsSessionLimits,
    seedRatioLimit: Number(form.seedRatioLimit),
    seedRatioMode: form.seedRatioMode,
    seedIdleLimit: Number(form.seedIdleLimit),
    seedIdleMode: form.seedIdleMode,
    trackerList: form.trackerList,
    labels: serializeTorrentLabels(form.labels),
  }
}
