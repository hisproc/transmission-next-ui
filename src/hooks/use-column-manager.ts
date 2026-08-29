"use client"

import { useState, useEffect, useMemo } from "react"
import { TORRENT_COLUMNS, DEFAULT_VISIBLE_COLUMNS, type ColumnConfig } from "@/lib/columns"
import { PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useI18n } from "@/lib/i18n-context"

export type LabeledColumnConfig = ColumnConfig & { label: string }

const DEFAULT_COLUMN_WIDTHS = Object.fromEntries(
  TORRENT_COLUMNS.map((column) => [column.id, column.width])
)

function normalizeVisibleColumns(columns: string[]) {
  const uniqueColumns = Array.from(new Set(columns.filter((column) => column !== "name")))
  return ["name", ...uniqueColumns]
}

function normalizeColumnWidths(widths: unknown) {
  if (!widths || typeof widths !== "object") return DEFAULT_COLUMN_WIDTHS

  return TORRENT_COLUMNS.reduce<Record<string, string>>((acc, column) => {
    const value = (widths as Record<string, unknown>)[column.id]
    acc[column.id] = typeof value === "string" && value.trim() ? value : column.width
    return acc
  }, {})
}

function getApproximatePixelWidth(width: string) {
  if (width.endsWith("%")) return 250
  const parsed = Number.parseInt(width, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

export function useColumnManager() {
  const { t } = useI18n()

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('torrent-visible-columns')
    return saved ? normalizeVisibleColumns(JSON.parse(saved) as string[]) : DEFAULT_VISIBLE_COLUMNS
  })
  const [columnWidths, setColumnWidths] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('torrent-column-widths')
    return normalizeColumnWidths(saved ? JSON.parse(saved) : null)
  })

  const columnDnDSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  )

  useEffect(() => {
    localStorage.setItem('torrent-visible-columns', JSON.stringify(visibleColumns))
  }, [visibleColumns])

  useEffect(() => {
    localStorage.setItem('torrent-column-widths', JSON.stringify(columnWidths))
  }, [columnWidths])

  const toggleColumn = (id: string) => {
    if (id === "name") return
    setVisibleColumns(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev
        return normalizeVisibleColumns(prev.filter(c => c !== id))
      }
      return normalizeVisibleColumns([...prev, id])
    })
  }

  const resetVisibleColumns = () => {
    setVisibleColumns(normalizeVisibleColumns(DEFAULT_VISIBLE_COLUMNS))
    setColumnWidths(DEFAULT_COLUMN_WIDTHS)
  }

  const resizeColumn = (id: string, width: number) => {
    const column = TORRENT_COLUMNS.find(c => c.id === id)
    if (!column) return

    const minWidth = column.minWidth ?? column.width
    const nextWidth = Math.max(width, getApproximatePixelWidth(minWidth))
    setColumnWidths(prev => ({
      ...prev,
      [id]: `${Math.round(nextWidth)}px`,
    }))
  }

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setVisibleColumns((prev) => {
      const oldIndex = prev.indexOf(String(active.id))
      const newIndex = prev.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return prev
      return normalizeVisibleColumns(arrayMove(prev, oldIndex, newIndex))
    })
  }

  const allColumns = useMemo<LabeledColumnConfig[]>(() =>
    TORRENT_COLUMNS.map(col => ({ ...col, label: t(col.labelKey, col.defaultLabel) })),
    [t]
  )

  const hiddenColumns = useMemo(
    () => allColumns.filter((column) => !visibleColumns.includes(column.id)),
    [allColumns, visibleColumns]
  )

  const orderedVisibleColumnConfigs = useMemo(
    () => visibleColumns
      .map((columnId) => allColumns.find((column) => column.id === columnId))
      .filter((column): column is LabeledColumnConfig => Boolean(column)),
    [allColumns, visibleColumns]
  )

  const tableMinWidth = useMemo(() => {
    const fixedWidths = 180
    const columnsWidth = visibleColumns.reduce((acc, id) => {
      const col = TORRENT_COLUMNS.find(c => c.id === id)
      if (!col) return acc
      const width = columnWidths[id] ?? col.width
      const minWidth = col.minWidth ?? col.width
      return acc + Math.max(
        getApproximatePixelWidth(width),
        getApproximatePixelWidth(minWidth)
      )
    }, 0)
    return fixedWidths + columnsWidth
  }, [columnWidths, visibleColumns])

  return {
    visibleColumns,
    columnWidths,
    columnDnDSensors,
    toggleColumn,
    resetVisibleColumns,
    resizeColumn,
    handleColumnDragEnd,
    allColumns,
    hiddenColumns,
    orderedVisibleColumnConfigs,
    tableMinWidth,
  }
}
