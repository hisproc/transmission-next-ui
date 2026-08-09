import bencode from "bencode"
import { expect, test } from "vitest"

import { parseTorrentMetainfo } from "./torrent-metainfo"

test("parses a multi-file v1 torrent in Transmission file order", () => {
  const data = bencode.encode({
    announce: "https://tracker.example/announce",
    info: {
      name: "Linux",
      files: [
        { length: 1024, path: ["images", "disk.iso"] },
        { length: 42, path: ["README.txt"] },
      ],
      "piece length": 16384,
      pieces: new Uint8Array(20),
    },
  })

  expect(parseTorrentMetainfo(data)).toEqual({
    name: "Linux",
    files: [
      { index: 0, path: "Linux/images/disk.iso", length: 1024 },
      { index: 1, path: "Linux/README.txt", length: 42 },
    ],
  })
})

test("parses a single-file torrent", () => {
  const data = bencode.encode({ info: { name: "video.mkv", length: 2048 } })

  expect(parseTorrentMetainfo(data).files).toEqual([
    { index: 0, path: "video.mkv", length: 2048 },
  ])
})

test("parses a v2 file tree", () => {
  const data = bencode.encode({
    info: {
      name: "Media",
      "meta version": 2,
      "file tree": {
        audio: {
          "track.flac": { "": { length: 4096 } },
        },
        "cover.jpg": { "": { length: 512 } },
      },
    },
  })

  expect(parseTorrentMetainfo(data).files).toEqual([
    { index: 0, path: "Media/audio/track.flac", length: 4096 },
    { index: 1, path: "Media/cover.jpg", length: 512 },
  ])
})

test("rejects malformed metadata", () => {
  expect(() =>
    parseTorrentMetainfo(bencode.encode({ announce: "tracker" })),
  ).toThrow("missing its info dictionary")
})
