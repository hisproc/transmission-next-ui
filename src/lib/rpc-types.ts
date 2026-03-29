/**
 * Transmission RPC Type Definitions
 * Based on Specification v17 (Transmission 4.0.0)
 */

export enum TorrentStatus {
  STOPPED = 0,
  CHECK_WAIT = 1,
  CHECK = 2,
  DOWNLOAD_WAIT = 3,
  DOWNLOAD = 4,
  SEED_WAIT = 5,
  SEED = 6,
}

export interface Torrent {
  id: number
  name: string
  status: TorrentStatus
  hashString: string
  totalSize: number
  percentDone: number
  rateDownload: number
  rateUpload: number
  eta: number
  addedDate: number
  doneDate: number
  downloadDir: string
  error: number
  errorString: string
  uploadedEver: number
  downloadedEver: number
  uploadRatio: number
  labels?: string[]
  queuePosition: number
  isFinished: boolean
  isPrivate: boolean
  isStalled: boolean
  trackers?: Tracker[]
  trackerStats?: TrackerStat[]
  files?: TorrentFile[]
  peers?: Peer[]
  peersConnected: number
  peersSendingToUs: number
  peersGettingFromUs: number
  comment?: string
  creator?: string
  dateCreated?: number
  bandwidthPriority?: number
  downloadLimit?: number
  downloadLimited?: boolean
  uploadLimit?: number
  uploadLimited?: boolean
  honorsSessionLimits?: boolean
  seedRatioLimit?: number
  seedRatioMode?: number
  seedIdleLimit?: number
  seedIdleMode?: number
  trackerList?: string
}

export interface Tracker {
  id: number
  tier: number
  announce: string
  scrape: string
  sitename: string
}

export interface TrackerStat {
  announce: string
  host: string
  seederCount: number
  leecherCount: number
  lastAnnounceSucceeded: boolean
  lastAnnounceResult: string
  isBackup: boolean
}

export interface Peer {
  address: string
  clientName: string
  rateToClient: number
  rateToPeer: number
  progress: number
  isEncrypted: boolean
}

export interface TorrentFile {
  name: string
  length: number
  bytesCompleted: number
}

export interface Session {
  "alt-speed-down": number
  "alt-speed-enabled": boolean
  "alt-speed-up": number
  "alt-speed-time-begin": number
  "alt-speed-time-enabled": boolean
  "alt-speed-time-end": number
  "alt-speed-time-day": number
  "download-dir": string
  "download-queue-enabled": boolean
  "download-queue-size": number
  "encryption": "required" | "preferred" | "tolerated"
  "peer-limit-global": number
  "peer-limit-per-torrent": number
  "peer-port": number
  "peer-port-random-on-start": boolean
  "port-forwarding-enabled": boolean
  "rename-partial-files": boolean
  "rpc-version": number
  "rpc-version-semver": string
  "seed-queue-enabled": boolean
  "seed-queue-size": number
  "speed-limit-down": number
  "speed-limit-down-enabled": boolean
  "speed-limit-up": number
  "speed-limit-up-enabled": boolean
  "start-added-torrents": boolean
  "trash-original-torrent-files": boolean
  "units": {
    "speed-units": string[]
    "speed-bytes": number
    "size-units": string[]
    "size-bytes": number
  }
  "version": string
  "dht-enabled": boolean
  "pex-enabled": boolean
  "lpd-enabled": boolean
  "utp-enabled": boolean
  "blocklist-enabled": boolean
  "blocklist-url": string
  "blocklist-size": number
  "incomplete-dir": string
  "incomplete-dir-enabled": boolean
}

export interface SessionStats {
  activeTorrentCount: number
  downloadSpeed: number
  pausedTorrentCount: number
  torrentCount: number
  uploadSpeed: number
  "cumulative-stats": {
    downloadedBytes: number
    uploadedBytes: number
    filesAdded: number
    sessionCount: number
    secondsActive: number
  }
  "current-stats": {
    downloadedBytes: number
    uploadedBytes: number
    filesAdded: number
    sessionCount: number
    secondsActive: number
  }
}
