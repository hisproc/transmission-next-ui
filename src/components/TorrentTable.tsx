import { flexRender, Table as ReactTable, Row } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "./ui/context-menu"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconEdit, IconPlayerPlay, IconPlayerStop, IconTrash } from "@tabler/icons-react"
import { useStartTorrent, useStopTorrent } from "../hooks/useTorrentActions"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { Dialog, DialogTrigger } from "./ui/dialog"
import { useTranslation } from "react-i18next"
import { DialogType } from "@/lib/types"
import { torrentSchema } from "@/schemas/torrentSchema.ts";

const pageSizeOption = [
    { "label": "10", "value": 10 },
    { "label": "25", "value": 25 },
    { "label": "50", "value": 50 },
    { "label": "100", "value": 100 },
    { "label": "All", "value": 100000 }
]

export function TorrentTable({ table, setDialogType, setTargetRows }: { table: ReactTable<torrentSchema>, setDialogType: (type: DialogType) => void, setTargetRows: (rows: Row<torrentSchema>[]) => void }) {

    const startTorrent = useStartTorrent();
    const stopTorrent = useStopTorrent();
    const { t } = useTranslation();
    const rows = table.getRowModel().rows;

    return (<>
        <div className="overflow-hidden rounded-lg border">
            <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                    {rows.map((row) => (
                        <Dialog key={row.id}>
                            <ContextMenu>
                                <ContextMenuTrigger asChild>
                                    <TableRow data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <DialogTrigger asChild onClick={() => {
                                        setDialogType(DialogType.Edit)
                                        setTargetRows([row])
                                    }}>
                                        <ContextMenuItem>
                                            <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {t("Edit")}
                                        </ContextMenuItem>
                                    </DialogTrigger>
                                    {row.original.status === 0 && (
                                        <ContextMenuItem onClick={() => startTorrent.mutate([row.original.id])}>
                                            <IconPlayerPlay className="mr-2 h-4 w-4 text-green-500" />
                                            {t("Start")}
                                        </ContextMenuItem>
                                    )}
                                    {row.original.status !== 0 && (
                                        <ContextMenuItem onClick={() => stopTorrent.mutate([row.original.id])}>
                                            <IconPlayerStop className="mr-2 h-4 w-4 text-red-500" />
                                            {t("Stop")}
                                        </ContextMenuItem>
                                    )}
                                    <DialogTrigger asChild onClick={() => {
                                        setTargetRows([row])
                                        setDialogType(DialogType.Delete)
                                    }}>
                                        <ContextMenuItem>
                                            <IconTrash className="mr-2 h-4 w-4 text-red-500" /> {t("Delete")}
                                        </ContextMenuItem>
                                    </DialogTrigger>
                                    {
                                        table.getSelectedRowModel().rows.length > 1 && (
                                            <div>
                                                <ContextMenuSeparator />
                                                <ContextMenuItem onClick={() => startTorrent.mutate(table.getSelectedRowModel().rows.map(row => row.original.id))}>
                                                    <IconPlayerPlay className="mr-2 h-4 w-4 text-green-500" />
                                                    {t("Start Selected Torrents")}
                                                </ContextMenuItem>
                                                <ContextMenuItem onClick={() => stopTorrent.mutate(table.getSelectedRowModel().rows.map(row => row.original.id))}>
                                                    <IconPlayerStop className="mr-2 h-4 w-4 text-red-500" />
                                                    {t("Stop Selected Torrents")}
                                                </ContextMenuItem>
                                                <DialogTrigger asChild onClick={() => {
                                                    setTargetRows(table.getSelectedRowModel().rows)
                                                    setDialogType(DialogType.Delete)
                                                }}>
                                                    <ContextMenuItem>
                                                        <IconTrash className="mr-2 h-4 w-4 text-red-500" />
                                                        {t("Delete Selected Torrents")}
                                                    </ContextMenuItem>
                                                </DialogTrigger>
                                            </div>
                                        )
                                    }
                                </ContextMenuContent>
                            </ContextMenu>
                        </Dialog>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} {t("of")}{" "}
                {table.getFilteredRowModel().rows.length} {t("row(s) selected.")}.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                        {t("RowsPerPage")}
                    </Label>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger size="sm" className="w-24" id="rows-per-page">
                            <SelectValue
                                placeholder={table.getState().pagination.pageSize}
                            />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {pageSizeOption.map(({ value, label }) => (
                                <SelectItem key={value} value={`${value}`}>
                                    {t(label)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    {t("Page")} {table.getState().pagination.pageIndex + 1} {t("of")}{" "}
                    {table.getPageCount()}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">{t("Go to first page")}</span>
                        <IconChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">{t("Go to previous page")}</span>
                        <IconChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">{t("Go to next page")}</span>
                        <IconChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">{t("Go to last page")}</span>
                        <IconChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    </>)
}