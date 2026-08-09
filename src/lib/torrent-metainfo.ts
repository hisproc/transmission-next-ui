import bencode from "bencode"

export interface TorrentMetainfoFile {
  index: number
  path: string
  length: number
}

export interface TorrentMetainfo {
  name: string
  files: TorrentMetainfoFile[]
}

type BencodeDictionary = Record<string, unknown>
const textDecoder = new TextDecoder()

function isDictionary(value: unknown): value is BencodeDictionary {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Uint8Array)
  )
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string") return value.length > 0 ? value : undefined
  if (value instanceof Uint8Array) {
    const decoded = textDecoder.decode(value)
    return decoded.length > 0 ? decoded : undefined
  }
  return undefined
}

function readLength(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined
}

function readPath(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined

  const parts = value.map(readString)
  return parts.every((part): part is string => part !== undefined)
    ? parts
    : undefined
}

function parseV1Files(
  info: BencodeDictionary,
  name: string,
): TorrentMetainfoFile[] | undefined {
  if (Array.isArray(info.files)) {
    const files = info.files.map((value, index) => {
      if (!isDictionary(value))
        throw new Error("Invalid file entry in torrent metadata")

      const length = readLength(value.length)
      const path = readPath(value["path.utf-8"]) ?? readPath(value.path)
      if (length === undefined || !path?.length)
        throw new Error("Invalid file entry in torrent metadata")

      return { index, path: [name, ...path].join("/"), length }
    })

    return files
  }

  const length = readLength(info.length)
  return length === undefined ? undefined : [{ index: 0, path: name, length }]
}

function parseV2Files(
  info: BencodeDictionary,
  name: string,
): TorrentMetainfoFile[] | undefined {
  const fileTree = info["file tree"]
  if (!isDictionary(fileTree)) return undefined

  const files: TorrentMetainfoFile[] = []
  const visit = (node: BencodeDictionary, path: string[]) => {
    const leaf = node[""]
    if (isDictionary(leaf)) {
      const length = readLength(leaf.length)
      if (length === undefined)
        throw new Error("Invalid file tree entry in torrent metadata")
      files.push({
        index: files.length,
        path: [name, ...path].join("/"),
        length,
      })
    }

    for (const [part, child] of Object.entries(node)) {
      if (part === "") continue
      if (!isDictionary(child))
        throw new Error("Invalid file tree in torrent metadata")
      visit(child, [...path, part])
    }
  }

  visit(fileTree, [])
  return files.length > 0 ? files : undefined
}

export function parseTorrentMetainfo(data: Uint8Array): TorrentMetainfo {
  const root = bencode.decode(data)
  if (!isDictionary(root) || !isDictionary(root.info)) {
    throw new Error("Torrent metadata is missing its info dictionary")
  }

  const info = root.info
  const name = readString(info["name.utf-8"]) ?? readString(info.name)
  if (!name) throw new Error("Torrent metadata is missing its name")

  const files = parseV1Files(info, name) ?? parseV2Files(info, name)
  if (!files?.length)
    throw new Error("Torrent metadata does not contain any files")

  return { name, files }
}
