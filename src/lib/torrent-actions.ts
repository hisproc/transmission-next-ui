export type SingleTorrentAction = "start" | "stop" | "remove"
export type BatchTorrentAction = SingleTorrentAction | "verify" | "reannounce"
export type TorrentActionMode = "single" | "batch"
export type TorrentRpcAction = Exclude<BatchTorrentAction, "remove">
export type Translate = (key: string, fallback?: string) => string

export interface TorrentActionToast {
  level: "success" | "info"
  title: string
  description?: string
}

export type TorrentActionPlan =
  | { type: "noop" }
  | { type: "confirm-delete"; ids: number[] }
  | {
      type: "rpc"
      action: TorrentRpcAction
      ids: number[]
      clearSelection: boolean
      toast: TorrentActionToast
    }

export function createTorrentActionPlan(
  action: BatchTorrentAction,
  ids: number[],
  mode: TorrentActionMode,
  t: Translate
): TorrentActionPlan {
  if (ids.length === 0) return { type: "noop" }
  if (action === "remove") return { type: "confirm-delete", ids }

  const clearSelection = mode === "batch"

  switch (action) {
    case "start":
      return {
        type: "rpc",
        action,
        ids,
        clearSelection,
        toast: mode === "single"
          ? { level: "success", title: t("common.resume_success", "Resumed") }
          : {
              level: "success",
              title: t("common.resume_success", "Success"),
              description: t("common.resume_desc", "Selected torrents started"),
            },
      }
    case "stop":
      return {
        type: "rpc",
        action,
        ids,
        clearSelection,
        toast: mode === "single"
          ? { level: "info", title: t("common.pause_success", "Stopped") }
          : {
              level: "info",
              title: t("common.pause_success", "Tasks Stopped"),
              description: t("common.pause_desc", "Selected torrents stopped"),
            },
      }
    case "verify":
      return {
        type: "rpc",
        action,
        ids,
        clearSelection,
        toast: {
          level: "success",
          title: t("common.verify_success", "Verifying"),
          description: t("common.verify_desc", "Selected torrents queued for verification"),
        },
      }
    case "reannounce":
      return {
        type: "rpc",
        action,
        ids,
        clearSelection,
        toast: {
          level: "success",
          title: t("common.reannounce_success", "Reannounced"),
          description: t("common.reannounce_desc", "Selected torrents reannounced to trackers"),
        },
      }
  }
}
