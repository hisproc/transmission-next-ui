import { expect, test } from "vitest"
import { createTorrentActionPlan } from "./torrent-actions.ts"

const t = (_key: string, fallback?: string) => fallback ?? _key

test("createTorrentActionPlan returns noop for empty ids", () => {
  expect(createTorrentActionPlan("start", [], "batch", t)).toEqual({ type: "noop" })
})

test("createTorrentActionPlan returns confirm-delete for remove", () => {
  expect(createTorrentActionPlan("remove", [1, 2], "batch", t)).toEqual({
    type: "confirm-delete",
    ids: [1, 2],
  })
})

test("createTorrentActionPlan keeps single action feedback concise", () => {
  expect(createTorrentActionPlan("stop", [5], "single", t)).toEqual({
    type: "rpc",
    action: "stop",
    ids: [5],
    clearSelection: false,
    toast: {
      level: "info",
      title: "Stopped",
    },
  })
})

test("createTorrentActionPlan includes batch feedback and clears selection", () => {
  expect(createTorrentActionPlan("verify", [3, 4], "batch", t)).toEqual({
    type: "rpc",
    action: "verify",
    ids: [3, 4],
    clearSelection: true,
    toast: {
      level: "success",
      title: "Verifying",
      description: "Selected torrents queued for verification",
    },
  })
})
