"use client"

import { type DragEndEvent } from "@dnd-kit/core"
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Play,
  Pause,
  Plus,
  ChevronDown,
  RefreshCw,
  Wrench,
  LayoutGrid,
  List,
  FolderOpen,
  Columns,
  GripVertical,
  EyeOff,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { AddTorrentDialog } from "@/components/add-torrent-dialog"
import { FilterPanel } from "@/components/torrents/filter-panel"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"
import type { LabeledColumnConfig } from "@/hooks/use-column-manager"

interface DisplayColumnItemProps {
  id: string
  label: string
  onHide: (id: string) => void
  draggable?: boolean
  hideable?: boolean
  isMobile?: boolean
}

function DisplayColumnItem({
  id,
  label,
  onHide,
  draggable = true,
  hideable = true,
  isMobile = false,
}: DisplayColumnItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !draggable,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-muted/40 bg-background/70 px-2 py-2",
        draggable && isMobile && "cursor-grab touch-none",
        isDragging && "opacity-70 shadow-lg"
      )}
      {...(draggable && isMobile ? { ...attributes, ...listeners } : {})}
    >
      {draggable ? (
        <button
          type="button"
          className="flex h-9 w-9 cursor-grab items-center justify-center rounded-xl p-0 text-muted-foreground hover:bg-muted/60 md:h-8 md:w-8"
          aria-label={`Reorder ${label}`}
          {...(!isMobile ? { ...attributes, ...listeners } : {})}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl p-0 text-muted-foreground/40 md:h-8 md:w-8">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <span className="flex-1 text-sm font-medium">{label}</span>
      {hideable ? (
        <button
          type="button"
          className="flex items-center rounded-lg p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onHide(id)}
          aria-label={`Hide ${label}`}
        >
          <EyeOff className="h-4 w-4" />
        </button>
      ) : (
        <div className="h-6 w-6 shrink-0" />
      )}
    </div>
  )
}

interface TorrentToolbarProps {
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
  // Filter panel
  trackers: string[]
  downloadDirs: string[]
  availableLabels: string[]
  trackerFilter: string[]
  dirFilter: string[]
  labelFilter: string[]
  toggleTracker: (host: string) => void
  toggleDir: (path: string) => void
  toggleLabel: (label: string) => void
  clearFilters: () => void
  // Column management
  orderedVisibleColumnConfigs: LabeledColumnConfig[]
  visibleColumns: string[]
  hiddenColumns: LabeledColumnConfig[]
  isMobile: boolean
  columnDnDSensors: Parameters<typeof DndContext>[0]["sensors"]
  toggleColumn: (id: string) => void
  resetVisibleColumns: () => void
  handleColumnDragEnd: (event: DragEndEvent) => void
  // Actions
  onBatchReplaceOpen: () => void
  onBatchMoveOpen: () => void
  fetchData: () => void
  onGlobalAction: (action: "start" | "stop") => void
}

export function TorrentToolbar({
  viewMode,
  onViewModeChange,
  trackers,
  downloadDirs,
  availableLabels,
  trackerFilter,
  dirFilter,
  labelFilter,
  toggleTracker,
  toggleDir,
  toggleLabel,
  clearFilters,
  orderedVisibleColumnConfigs,
  visibleColumns,
  hiddenColumns,
  isMobile,
  columnDnDSensors,
  toggleColumn,
  resetVisibleColumns,
  handleColumnDragEnd,
  onBatchReplaceOpen,
  onBatchMoveOpen,
  fetchData,
  onGlobalAction,
}: TorrentToolbarProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 md:gap-4 flex-wrap pb-1 sm:pb-0">
        <h2 className="text-xl font-bold tracking-tight whitespace-nowrap mr-2">{t('common.torrents')}</h2>

        <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg transition-all duration-200",
              viewMode === "list"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg transition-all duration-200",
              viewMode === "grid"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        <FilterPanel
          trackers={trackers}
          downloadDirs={downloadDirs}
          availableLabels={availableLabels}
          trackerFilter={trackerFilter}
          dirFilter={dirFilter}
          labelFilter={labelFilter}
          toggleTracker={toggleTracker}
          toggleDir={toggleDir}
          toggleLabel={toggleLabel}
          clearFilters={clearFilters}
        />

        <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-muted">
                <Columns className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] max-h-[min(80vh,36rem)] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-2 mt-2 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2">
                <DropdownMenuLabel className="p-0 text-[10px] font-bold text-muted-foreground/50 tracking-wider uppercase">
                  {t('common.display_columns', 'Display Columns')}
                </DropdownMenuLabel>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  onClick={resetVisibleColumns}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t('common.reset', 'Reset')}
                </button>
              </div>
              <DropdownMenuSeparator className="mx-1 my-1 bg-muted/50" />
              <div className="px-2 pb-1">
                <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  {t('common.visible', 'Visible')}
                </p>
                <DndContext sensors={columnDnDSensors} collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd}>
                  <SortableContext items={visibleColumns} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                      {orderedVisibleColumnConfigs.map((column) => (
                        <DisplayColumnItem
                          key={column.id}
                          id={column.id}
                          label={column.label}
                          onHide={toggleColumn}
                          draggable={column.id !== "name"}
                          hideable={column.id !== "name"}
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              <DropdownMenuSeparator className="mx-1 my-2 bg-muted/50" />
              <div className="px-2 pt-1">
                <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  {t('common.hidden', 'Hidden')}
                </p>
                <div className="space-y-1">
                  {hiddenColumns.length === 0 ? (
                    <div className="rounded-xl px-3 py-2 text-xs text-muted-foreground/70">
                      {t('common.all_columns_visible', 'All columns are visible')}
                    </div>
                  ) : hiddenColumns.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="rounded-xl py-2 cursor-pointer transition-colors focus:bg-muted"
                      checked={false}
                      onCheckedChange={() => toggleColumn(col.id)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="text-sm font-medium">{col.label}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex gap-2 w-full lg:w-auto flex-wrap justify-start lg:justify-end pb-1 sm:pb-0">
        <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2 md:px-3.5 rounded-lg font-medium bg-background/60 hover:bg-background hover:shadow-sm transition-all text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 border-none">
                <Wrench className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{t('common.tools')}</span>
                <ChevronDown className="h-3 w-3 opacity-50 hidden md:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-[200px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-1 mt-2 overflow-hidden">
              <DropdownMenuItem
                className="rounded-xl py-2.5 px-3 focus:bg-muted cursor-pointer transition-colors"
                onClick={onBatchReplaceOpen}
              >
                <RefreshCw className="h-4 w-4 mr-3 text-primary opacity-70" />
                <span className="text-sm font-medium whitespace-nowrap">{t('common.batch_replace_tracker')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl py-2.5 px-3 focus:bg-muted cursor-pointer transition-colors"
                onClick={onBatchMoveOpen}
              >
                <FolderOpen className="h-4 w-4 mr-3 text-primary opacity-70" />
                <span className="text-sm font-medium whitespace-nowrap">{t('common.batch_move_directory')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
          <AddTorrentDialog onSuccess={fetchData}>
            <Button variant="default" className="h-8 px-2 md:px-4 rounded-lg font-medium gap-2 shadow-md shadow-primary/10 text-xs border-none">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{t('common.add_torrent')}</span>
            </Button>
          </AddTorrentDialog>
        </div>

        <div className="flex items-center bg-muted/60 p-1 rounded-xl gap-1 shrink-0">
          <Button
            variant="ghost"
            className="h-8 px-3.5 md:px-3.5 rounded-lg font-medium bg-background/60 hover:bg-background hover:shadow-sm transition-all text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5"
            onClick={() => onGlobalAction("start")}
          >
            <Play className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t('common.resume_all')}</span>
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3.5 md:px-3.5 rounded-lg font-medium bg-background/60 hover:bg-background hover:shadow-sm transition-all text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5"
            onClick={() => onGlobalAction("stop")}
          >
            <Pause className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t('common.pause_all')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
