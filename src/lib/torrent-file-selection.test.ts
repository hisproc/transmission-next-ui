import { expect, test } from "vitest"

import {
  buildFileSelectionArgs,
  createSelectableTorrentFiles,
  getWantedFileIndexes,
} from "./torrent-file-selection"

test("maps torrent files to stable Transmission indexes", () => {
  expect(
    createSelectableTorrentFiles([
      { name: "one", length: 10, bytesCompleted: 4 },
      { name: "two", length: 20, bytesCompleted: 20 },
    ]),
  ).toEqual([
    { index: 0, name: "one", length: 10, bytesCompleted: 4 },
    { index: 1, name: "two", length: 20, bytesCompleted: 20 },
  ])
})

test("defaults files without fileStats to wanted", () => {
  expect(
    getWantedFileIndexes(3, [
      { bytesCompleted: 0, wanted: true, priority: 0 },
      { bytesCompleted: 0, wanted: false, priority: 0 },
    ]),
  ).toEqual([0, 2])
})

test("builds complete wanted and unwanted index lists", () => {
  expect(buildFileSelectionArgs(4, [0, 3])).toEqual({
    "files-wanted": [0, 3],
    "files-unwanted": [1, 2],
  })
})
