
export interface ColumnConfig {
  id: string
  labelKey: string
  defaultLabel: string
  width: string
  minWidth?: string
  rpcFields: string[]
  align?: "left" | "right" | "center"
}

export const TORRENT_COLUMNS: ColumnConfig[] = [
  {
    id: "name",
    labelKey: "common.name",
    defaultLabel: "Name",
    width: "30%",
    minWidth: "250px",
    rpcFields: ["name"],
    align: "left"
  },
  {
    id: "status",
    labelKey: "common.status",
    defaultLabel: "Status",
    width: "160px",
    rpcFields: ["status", "error", "errorString"],
    align: "left"
  },
  {
    id: "progress",
    labelKey: "common.progress",
    defaultLabel: "Progress",
    width: "150px",
    rpcFields: ["percentDone", "totalSize"],
    align: "left"
  },
  {
    id: "addedDate",
    labelKey: "common.added_date",
    defaultLabel: "Added Date",
    width: "160px",
    rpcFields: ["addedDate"],
    align: "right"
  },
  {
    id: "editDate",
    labelKey: "common.edit_date",
    defaultLabel: "Modified Date",
    width: "160px",
    rpcFields: ["editDate"],
    align: "right"
  },
  {
    id: "uploadedEver",
    labelKey: "details.total_uploaded",
    defaultLabel: "Uploaded",
    width: "110px",
    rpcFields: ["uploadedEver"],
    align: "right"
  },
  {
    id: "uploadRatio",
    labelKey: "details.share_ratio",
    defaultLabel: "Ratio",
    width: "80px",
    rpcFields: ["uploadRatio"],
    align: "right"
  },
  {
    id: "rateDownload",
    labelKey: "common.down_speed",
    defaultLabel: "Down Speed",
    width: "110px",
    rpcFields: ["rateDownload"],
    align: "right"
  },
  {
    id: "rateUpload",
    labelKey: "common.up_speed",
    defaultLabel: "Up Speed",
    width: "110px",
    rpcFields: ["rateUpload"],
    align: "right"
  },
  {
    id: "eta",
    labelKey: "common.eta",
    defaultLabel: "ETA",
    width: "100px",
    rpcFields: ["eta"],
    align: "right"
  }
]

export const DEFAULT_VISIBLE_COLUMNS = [
  "name",
  "status",
  "progress",
  "uploadedEver",
  "rateDownload",
  "eta"
]

export const BASE_RPC_FIELDS = [
  "id",
  "name",
  "status",
  "rateDownload",
  "rateUpload",
  "downloadDir",
  "labels",
  "trackerStats",
  "error",
  "errorString",
  "addedDate"
]

export const GRID_MODE_RPC_FIELDS = [
  "totalSize",
  "percentDone",
  "rateDownload",
  "rateUpload",
  "eta"
]

/**
 * Get required RPC fields based on visible columns and view mode
 */
export function getRequiredRpcFields(visibleColumns: string[], viewMode: "list" | "grid"): string[] {
  const fieldSet = new Set(BASE_RPC_FIELDS)

  if (viewMode === "grid") {
    GRID_MODE_RPC_FIELDS.forEach(f => fieldSet.add(f))
  } else {
    visibleColumns.forEach(colId => {
      const config = TORRENT_COLUMNS.find(c => c.id === colId)
      if (config) {
        config.rpcFields.forEach(f => fieldSet.add(f))
      }
    })
  }

  return Array.from(fieldSet)
}
