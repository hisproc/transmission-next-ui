export function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0 || !isFinite(bytes)) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const idx = Math.max(0, Math.min(i, sizes.length - 1))
  return parseFloat((bytes / Math.pow(k, idx)).toFixed(2)) + " " + sizes[idx]
}

export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return "0 B/s"
  return formatSize(bytesPerSecond) + "/s"
}

export function formatDuration(seconds: number): string {
  if (seconds < 0 || seconds === Infinity) return "-"
  if (seconds === 0) return "0s"
  
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function getStatusLabel(status: number): string {
  const keys: Record<number, string> = {
    0: "status.stopped",
    1: "status.check_wait",
    2: "status.check",
    3: "status.download_wait",
    4: "status.downloading",
    5: "status.seed_wait",
    6: "status.seeding",
  }
  return keys[status] || "status.unknown"
}
export function formatSizeParts(bytes: number): { value: string, unit: string } {
  if (!bytes || bytes <= 0 || !isFinite(bytes)) return { value: "0", unit: "B" }
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const idx = Math.max(0, Math.min(i, sizes.length - 1))
  return {
    value: parseFloat((bytes / Math.pow(k, idx)).toFixed(2)).toString(),
    unit: sizes[idx]
  }
}

export function splitSpeed(speedStr: string): { value: string, unit: string } {
  const parts = speedStr.split(" ")
  if (parts.length === 2) {
    return { value: parts[0], unit: parts[1] }
  }
  return { value: speedStr, unit: "" }
}
