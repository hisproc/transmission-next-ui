export interface GetTorrentsOptions {
    fields?: string[];      // 要获取的字段列表
    ids?: number[];         // 要获取的 torrent ID 列表
}

export interface AddTorrentOptions {
    filename?: string;      // 磁力链接 或 URL
    metainfo?: string;      // base64 编码的 .torrent 文件内容
    "download-dir"?: string;   // 可选的下载目录
    paused?: boolean;       // 是否暂停添加
    peerLimit?: number;     // 同时连接的peer数限制
    bandwidthPriority?: number; // 带宽优先级
    cookies?: string;       // 设置 cookie
}

export enum DialogType {
    Edit = "edit",
    Delete = "delete",
    Add = "add",
}

export interface PortTestOptions {
    "ip_protocol": string;
}

export interface PortTestResponse {
    "port-is-open": boolean; // Is the port open?
    "ip-protocol": string; // Ip protocol used
}

export interface DeleteTorrentOptions {
    ids: number[];
    "delete-local-data"?: boolean;
}

export interface SetTorrentOptions {
    ids: number[];
    labels?: string[];
}

export interface StopTorrentOptions {
    ids: number[];
}

export interface StartTorrentOptions {
    ids: number[];
}

export interface RenamePathOptions {
    ids: number[];
    path: string;
    name: string;
}

export interface NewLocationOptions {
    ids: number[];
    location: string;
    move: boolean;
}

export interface SessionStats {
    activeTorrentCount: number;
    downloadSpeed: number;
    pausedTorrentCount: number;
    torrentCount: number;
    uploadSpeed: number;
    "cumulative-stats": StatItem;
    "current-stats": StatItem;
}

export interface StatItem {
    downloadedBytes: number;
    filesAdded: number;
    secondsActive: number;
    uploadedBytes: number;
    sessionCount: number;
}

export interface FreeSpace {
    "size-bytes": number;
    "total_size": number;
}

export interface TransmissionSession {
    "download-dir"?: string;
    "speed-limit-down"?: number;
    "speed-limit-down-enabled"?: boolean;
    "speed-limit-up"?: number;
    "speed-limit-up-enabled"?: boolean;
    "incomplete-dir"?: string;
    "incomplete-dir-enabled"?: boolean;
    "peer-port"?: number;
    "peer-port-random-on-start"?: boolean;
    "utp-enabled"?: boolean;
    "rename-partial-files"?: boolean;
    "port-forwarding-enabled"?: boolean;
    "cache-size-mb"?: number;
    "lpd-enabled"?: boolean;
    "dht-enabled"?: boolean;
    "pex-enabled"?: boolean;
    "encryption"?: string;
    "queue-stalled-enabled"?: boolean;
    "queue-stalled-minutes"?: number;
    "download-queue-size"?: number;
    "seed-queue-size"?: number;
    "download-queue-enabled"?: boolean;
    "seed-queue-enabled"?: boolean;
    "seedRatioLimit"?: number;
    "seedRatioLimited"?: boolean;
    "idle-seeding-limit"?: number;
    "idle-seeding-limit-enabled"?: boolean;
    "rpc-version"?: number;
    version?: string;
}

export interface TrackerStats {
    announce: string;
    announceState: number;
    downloadCount: number;
    hasAnnounced: boolean;
    hasScraped: boolean;
    host: string;
    id: number;
    isBackup: boolean;
    lastAnnouncePeerCount: number;
    lastAnnounceResult: string;
    lastAnnounceStartTime: number;
    lastAnnounceSucceeded: boolean;
    lastAnnounceTime: number;
    lastAnnounceTimedOut: boolean;
    lastScrapeResult: string;
    lastScrapeStartTime: number;
    lastScrapeSucceeded: boolean;
    lastScrapeTime: number;
    lastScrapeTimedOut: boolean;
    leecherCount: number;
    nextAnnounceTime: number;
    nextScrapeTime: number;
    scrape: string;
    scrapeState: number;
    seederCount: number;
    tier: number;
}

export interface TorrentFile {
    bytesCompleted: number;
    length: number;
    name: string;
}

export interface Peer {
    address: string;
    clientName: string;
    clientIsChoked: boolean;
    clientIsInterested: boolean;
    flagStr: string;
    isDownloadingFrom: boolean;
    isEncrypted: boolean;
    isIncoming: boolean;
    isUploadingTo: boolean;
    isUTP: boolean;
    peerIsChoked: boolean;
    peerIsInterested: boolean;
    port: number;
    progress: number;
    rateToClient: number;
    rateToPeer: number;
}

export interface Torrent {
    id: number;
    name: string;
    status: number;
    hashString: string;
    totalSize: number;
    percentDone: number;
    addedDate: number;
    creator: string;
    comment: string;
    trackerStats: TrackerStats[];
    pieces: string;
    pieceCount: number;
    rateDownload: number;
    rateUpload: number;
    peers: Peer[];
    files: TorrentFile[];
}

export interface GetTorrentResponse {
    torrents: Torrent[];
}