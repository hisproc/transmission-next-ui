import type { TorrentFile, TorrentFileStat } from "./rpc-types"

export interface SelectableTorrentFile {
  index: number
  name: string
  length: number
  bytesCompleted: number
}

export function createSelectableTorrentFiles(
  files: TorrentFile[] = [],
): SelectableTorrentFile[] {
  return files.map((file, index) => ({ ...file, index }))
}

export function getWantedFileIndexes(
  fileCount: number,
  fileStats?: TorrentFileStat[],
): number[] {
  return Array.from({ length: fileCount }, (_, index) => index).filter(
    (index) => fileStats?.[index]?.wanted !== false,
  )
}

export function buildFileSelectionArgs(
  fileCount: number,
  selectedFileIndexes: number[],
): { "files-wanted": number[]; "files-unwanted": number[] } {
  const selected = new Set(selectedFileIndexes)
  const allIndexes = Array.from({ length: fileCount }, (_, index) => index)

  return {
    "files-wanted": allIndexes.filter((index) => selected.has(index)),
    "files-unwanted": allIndexes.filter((index) => !selected.has(index)),
  }
}
