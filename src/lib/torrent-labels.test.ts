import { expect, test } from "vitest"
import {
  getTorrentLabelsSortValue,
  parseTorrentLabel,
  parseTorrentLabels,
  serializeTorrentLabel,
  serializeTorrentLabels,
} from "./torrent-labels.ts"

test("parseTorrentLabel handles JSON and plain strings", () => {
  expect(parseTorrentLabel('{"text":"Movie"}')).toBe("Movie")
  expect(parseTorrentLabel("Linux")).toBe("Linux")
  expect(parseTorrentLabel("{broken")).toBe("{broken")
})

test("parseTorrentLabels keeps order and removes empty labels", () => {
  expect(parseTorrentLabels(['{"text":"Movie"}', "", "Music"])).toEqual(["Movie", "Music"])
})

test("serializeTorrentLabel and serializeTorrentLabels produce JSON payloads", () => {
  expect(serializeTorrentLabel("Anime")).toBe('{"text":"Anime"}')
  expect(serializeTorrentLabels(["Movie", "4K"])).toEqual(['{"text":"Movie"}', '{"text":"4K"}'])
})

test("getTorrentLabelsSortValue normalizes encoded labels for sorting", () => {
  expect(getTorrentLabelsSortValue(['{"text":"TV"}', "HDR"])).toBe("TV\u0000HDR")
})
