import { expect, test } from "vitest"
import {
  buildEditTorrentSetArgs,
  createInitialEditTorrentFormState,
  mapTorrentToEditTorrentFormState,
  type EditTorrentDialogTorrent,
} from "./edit-torrent-form.ts"
import type { Torrent } from "./rpc-types.ts"

const dialogTorrent: EditTorrentDialogTorrent = {
  id: 1,
  name: "Ubuntu.iso",
  downloadDir: "/downloads/iso",
}

const detailedTorrent: Torrent = {
  id: 1,
  name: "Ubuntu.iso",
  status: 6,
  hashString: "hash",
  totalSize: 1000,
  percentDone: 1,
  rateDownload: 0,
  rateUpload: 0,
  eta: -1,
  addedDate: 1,
  doneDate: 2,
  downloadDir: "/downloads/iso",
  error: 0,
  errorString: "",
  uploadedEver: 400,
  downloadedEver: 1000,
  uploadRatio: 0.4,
  labels: ['{"text":"Linux"}', "ISO"],
  queuePosition: 0,
  isFinished: true,
  isPrivate: false,
  isStalled: false,
  peersConnected: 0,
  peersSendingToUs: 0,
  peersGettingFromUs: 0,
  bandwidthPriority: 1,
  downloadLimit: 2048,
  downloadLimited: true,
  uploadLimit: 512,
  uploadLimited: true,
  honorsSessionLimits: false,
  seedRatioLimit: 1.5,
  seedRatioMode: 1,
  seedIdleLimit: 30,
  seedIdleMode: 2,
  trackerList: "https://tracker.example/announce",
}

test("createInitialEditTorrentFormState uses dialog torrent defaults", () => {
  expect(createInitialEditTorrentFormState(dialogTorrent)).toEqual({
    name: "Ubuntu.iso",
    location: "/downloads/iso",
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
  })
})

test("mapTorrentToEditTorrentFormState normalizes fetched torrent details", () => {
  const form = mapTorrentToEditTorrentFormState(dialogTorrent, detailedTorrent)

  expect(form.name).toBe("Ubuntu.iso")
  expect(form.location).toBe("/downloads/iso")
  expect(form.bandwidthPriority).toBe(1)
  expect(form.honorsSessionLimits).toBe(false)
  expect(form.labels).toEqual(["Linux", "ISO"])
})

test("buildEditTorrentSetArgs serializes labels for RPC", () => {
  const form = mapTorrentToEditTorrentFormState(dialogTorrent, detailedTorrent)
  const args = buildEditTorrentSetArgs(form)

  expect(args.labels).toEqual(['{"text":"Linux"}', '{"text":"ISO"}'])
  expect(args.seedRatioLimit).toBe(1.5)
  expect(args.trackerList).toBe("https://tracker.example/announce")
})
