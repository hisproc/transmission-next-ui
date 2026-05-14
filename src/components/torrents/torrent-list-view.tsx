"use client"

import { useCallback, type CSSProperties, type PointerEvent } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  CheckSquare,
  Square,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Play,
  Pause,
  Trash2,
  Pencil,
} from "lucide-react"
import { EditTorrentDialog } from "@/components/torrents/edit-torrent-dialog"
import { cn } from "@/lib/utils"
import { formatSpeed, formatDuration, formatSize, getStatusLabel, formatDate } from "@/lib/formatters"
import type { ColumnConfig } from "@/lib/columns"
import type { Torrent } from "@/lib/rpc-types"
import { useI18n } from "@/lib/i18n-context"

type SortKey =
  | "name"
  | "status"
  | "percentDone"
  | "addedDate"
  | "editDate"
  | "uploadedEver"
  | "rateDownload"
  | "rateUpload"
  | "eta"
  | "uploadRatio"
  | "labels"

interface TorrentListViewProps {
  paginatedTorrents: Torrent[]
  visibleColumns: string[]
  allColumns: Array<ColumnConfig & { label: string }>
  columnWidths: Record<string, string>
  selectedIds: number[]
  filteredCount: number
  sortConfig: { key: SortKey; direction: 'asc' | 'desc' } | null
  tableMinWidth: number
  locale: string
  onToggleSelect: (id: number) => void
  onToggleSelectAll: () => void
  onSort: (key: SortKey) => void
  onSingleAction: (id: number, action: "start" | "stop" | "remove") => void
  onResizeColumn: (id: string, width: number) => void
}

function SortIcon({ column, sortConfig }: { column: SortKey; sortConfig: TorrentListViewProps['sortConfig'] }) {
  if (sortConfig?.key !== column) return <ArrowDownCircle className="ml-1 h-3 w-3 opacity-20" />;
  return sortConfig.direction === 'asc'
    ? <ArrowUpCircle className="ml-1 h-3 w-3 text-primary" />
    : <ArrowDownCircle className="ml-1 h-3 w-3 text-primary" />;
}

export function TorrentListView({
  paginatedTorrents,
  visibleColumns,
  allColumns,
  columnWidths,
  selectedIds,
  filteredCount,
  sortConfig,
  tableMinWidth,
  locale,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  onSingleAction,
  onResizeColumn,
}: TorrentListViewProps) {
  const { t } = useI18n()
  const orderedVisibleColumns = visibleColumns
    .map((columnId) => allColumns.find((column) => column.id === columnId))
    .filter((column): column is ColumnConfig & { label: string } => Boolean(column))

  const getColumnStyle = (columnId: ColumnConfig["id"]) => {
    const column = allColumns.find(c => c.id === columnId)
    return {
      width: columnWidths[columnId] ?? column?.width,
      minWidth: column?.minWidth,
    }
  }

  const startColumnResize = useCallback((
    event: PointerEvent<HTMLButtonElement>,
    columnId: string
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const header = event.currentTarget.closest("th")
    if (!header) return

    const startX = event.clientX
    const startWidth = header.getBoundingClientRect().width
    const resizeHandle = event.currentTarget
    const pointerId = event.pointerId
    resizeHandle.setPointerCapture(pointerId)

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      onResizeColumn(columnId, startWidth + moveEvent.clientX - startX)
    }

    const handlePointerUp = () => {
      if (resizeHandle.hasPointerCapture(pointerId)) {
        resizeHandle.releasePointerCapture(pointerId)
      }
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
  }, [onResizeColumn])

  const getHeaderClassName = (column: ColumnConfig) =>
    cn(
      "h-12 cursor-pointer hover:text-primary transition-colors",
      column.align === "right" && "text-right"
    )

  const renderHeader = (column: ColumnConfig & { label: string }) => {
    const style = getColumnStyle(column.id)
    const contentClassName = cn(
      "flex items-center pr-4",
      column.align === "right" && "justify-end",
      column.id === "name" && "truncate"
    )

    const renderResizableHead = (sortKey: SortKey, label: string, iconKey: SortKey = sortKey) => (
      <TableHead
        key={column.id}
        className={cn(getHeaderClassName(column), "group/column relative select-none pr-3")}
        style={style}
        onClick={() => onSort(sortKey)}
      >
        <div className={contentClassName}>
          {label} <SortIcon column={iconKey} sortConfig={sortConfig} />
        </div>
        <button
          type="button"
          aria-label={t("common.resize_column", "Resize column")}
          className="absolute right-0 top-2 h-8 w-2 cursor-col-resize touch-none rounded-sm opacity-0 transition-opacity hover:bg-primary/30 hover:opacity-100 group-hover/column:opacity-60"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          onPointerDown={(event) => startColumnResize(event, column.id)}
        />
      </TableHead>
    )

    switch (column.id) {
      case "name":
        return renderResizableHead("name", t("common.name"))
      case "status":
        return renderResizableHead("status", t("common.status"))
      case "progress":
        return renderResizableHead("percentDone", t("common.progress"))
      case "addedDate":
        return renderResizableHead("addedDate", t("common.added_date", "Added Date"))
      case "editDate":
        return renderResizableHead("editDate", t("common.edit_date", "Modified Date"))
      case "uploadedEver":
        return renderResizableHead("uploadedEver", t("details.total_uploaded", "Uploaded"))
      case "rateDownload":
        return renderResizableHead("rateDownload", t("common.down_speed"))
      case "rateUpload":
        return renderResizableHead("rateUpload", t("common.up_speed"))
      case "eta":
        return renderResizableHead("eta", t("common.eta"))
      case "uploadRatio":
        return renderResizableHead("uploadRatio", t("details.share_ratio", "Ratio"))
    }
  }

  const renderCell = (torrent: Torrent, column: ColumnConfig & { label: string }) => {
    const style: CSSProperties = {
      width: getColumnStyle(column.id).width,
      minWidth: getColumnStyle(column.id).minWidth,
    }

    switch (column.id) {
      case "name":
        return (
          <TableCell key={column.id} className="text-heading-3" style={style}>
            <Link to={`/torrents/detail?id=${torrent.id}`} className="hover:text-primary transition-colors cursor-pointer block truncate">
              {torrent.name}
            </Link>
          </TableCell>
        )
      case "status":
        return (
          <TableCell key={column.id} style={style}>
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider transition-colors",
              torrent.status === 4 ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" :
                torrent.status === 6 ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400" :
                  torrent.status === 0 ? "bg-muted text-muted-foreground/70" :
                    "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
            )}>
              {t(getStatusLabel(torrent.status))}
            </span>
          </TableCell>
        )
      case "progress":
        return (
          <TableCell key={column.id} style={style}>
            <div className="w-full bg-muted rounded-full h-2 min-w-[100px]">
              <div className="bg-primary h-2 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(var(--primary),0.5)]" style={{ width: `${torrent.percentDone * 100}%` }} />
            </div>
            <span className="text-label mt-1.5 block">
              {(torrent.percentDone * 100).toFixed(1)}% • {formatSize(torrent.totalSize)}
            </span>
          </TableCell>
        )
      case "addedDate":
        return <TableCell key={column.id} className="text-numeric text-right text-muted-foreground text-xs" style={style}>{formatDate(torrent.addedDate, locale)}</TableCell>
      case "editDate":
        return <TableCell key={column.id} className="text-numeric text-right text-muted-foreground text-xs" style={style}>{torrent.editDate ? formatDate(torrent.editDate, locale) : "—"}</TableCell>
      case "uploadedEver":
        return <TableCell key={column.id} className="text-numeric text-right" style={style}>{formatSize(torrent.uploadedEver)}</TableCell>
      case "rateDownload":
        return <TableCell key={column.id} className="text-numeric text-green-500 text-right" style={style}>{formatSpeed(torrent.rateDownload)}</TableCell>
      case "rateUpload":
        return <TableCell key={column.id} className="text-numeric text-blue-500 text-right" style={style}>{formatSpeed(torrent.rateUpload)}</TableCell>
      case "eta":
        return <TableCell key={column.id} className="text-right" style={style}><div className="flex items-center justify-end gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /><span className="text-label lowercase">{formatDuration(torrent.eta)}</span></div></TableCell>
      case "uploadRatio":
        return <TableCell key={column.id} className="text-numeric text-right" style={style}>{torrent.uploadRatio >= 0 ? torrent.uploadRatio.toFixed(2) : "0.00"}</TableCell>
    }
  }

  return (
    <Card className="shadow-md border-none overflow-hidden py-0">
      <CardContent className="p-0 overflow-auto">
        <Table className="table-fixed" style={{ minWidth: `${tableMinWidth}px` }}>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[50px] pl-6 h-12">
                <div
                  className="cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                  onClick={onToggleSelectAll}
                >
                  {selectedIds.length === filteredCount && filteredCount > 0 ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : selectedIds.length > 0 ? (
                    <div className="h-4 w-4 flex items-center justify-center">
                      <div className="w-2.5 h-0.5 bg-primary rounded-full" />
                    </div>
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              {orderedVisibleColumns.map(renderHeader)}
              <TableHead className="text-center w-[130px] h-12 pr-6">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTorrents.map((torrent) => (
              <TableRow
                key={torrent.id}
                className={cn(
                  "hover:bg-muted/30 transition-colors border-b last:border-0 border-muted/50 group/row",
                  selectedIds.includes(torrent.id) && "bg-primary/5 hover:bg-primary/10"
                )}
              >
                <TableCell className="pl-6">
                  <div
                    className="cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => onToggleSelect(torrent.id)}
                  >
                    {selectedIds.includes(torrent.id) ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 opacity-40 group-hover/row:opacity-100" />
                    )}
                  </div>
                </TableCell>
                {orderedVisibleColumns.map((column) => renderCell(torrent, column))}
                <TableCell className="w-[130px] pr-6">
                  <div className="flex items-center justify-center gap-1">
                    <EditTorrentDialog torrent={torrent}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </EditTorrentDialog>
                    {torrent.status !== 0 ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-500 transition-colors" onClick={() => onSingleAction(torrent.id, "stop")}>
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-500/10 hover:text-green-500 transition-colors" onClick={() => onSingleAction(torrent.id, "start")}>
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => onSingleAction(torrent.id, "remove")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
