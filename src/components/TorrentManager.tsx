import { useEffect, useState, useRef, useMemo } from "react"
import {
    type UniqueIdentifier,
} from "@dnd-kit/core"

import {
    IconChevronDown,
    IconLayoutColumns,
} from "@tabler/icons-react"
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { getColumns } from "@/components/TorrentColumns"
import { TorrentToolbar } from "@/components/TorrentToolbar"
import { schema } from "../schemas/torrentSchema"
import { TorrentTable } from "./TorrentTable"
import { TransmissionSession } from "@/lib/types"
import { useTranslation } from "react-i18next"

export function TorrentManager({
    data: initialData,
    session: session,
}: {
    data: z.infer<typeof schema>[],
    session: TransmissionSession
}) {
    const [rowSelection, setRowSelection] = useState({})
    const [file, setFile] = useState<File | null>(null)
    const [filename, setFilename] = useState("");
    const [isDragging, setIsDragging] = useState(false)
    const dragCounter = useRef(0)
    const [dialogOpen, setDialogOpen] = useState(false)

    const diaLogOnOpenChange = (open: boolean) => {
        if (!open) {
            dragCounter.current = 0;
            setIsDragging(false);
            setFile(null);
            setFilename("");
        }
        setDialogOpen(open)
    }

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault()
            dragCounter.current++
            setIsDragging(true)
        }

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault()
            dragCounter.current--
            if (dragCounter.current <= 0) {
                setIsDragging(false)
            }
        }

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault()
        }

        const handleDrop = (e: DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            dragCounter.current = 0
            const files = e.dataTransfer?.files
            if (files && files.length > 0) {
                const file = files[0]
                setFile(file)
                setDialogOpen(true)
            }
        }

        window.addEventListener("dragenter", handleDragEnter)
        window.addEventListener("dragleave", handleDragLeave)
        window.addEventListener("dragover", handleDragOver)
        window.addEventListener("drop", handleDrop)

        return () => {
            window.removeEventListener("dragenter", handleDragEnter)
            window.removeEventListener("dragleave", handleDragLeave)
            window.removeEventListener("dragover", handleDragOver)
            window.removeEventListener("drop", handleDrop)
        }
    }, [])
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = useState<SortingState>([
        { id: "Added Date", desc: true }
    ])
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 50,
    })
    useMemo<UniqueIdentifier[]>(
        () => initialData?.map(({ id }) => id) || [],
        [initialData]
    );
    const downloadDirs = Array.from(new Set(initialData.map(item => item.downloadDir)));
    const [directory, setDirectory] = useState(session["download-dir"] || "")
    const [tabValue, setTabValue] = useState("all")
    const { t } = useTranslation()
    const table = useReactTable({
        data: initialData,
        columns: useMemo(() => getColumns(t), [t]),
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    return (
        <Tabs
            value={tabValue}
            onValueChange={(value) => {
                setTabValue(value)
                table.setRowSelection({})
            }}
            className="w-full flex-col justify-start gap-6"
        >
            {
                isDragging && !dialogOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center text-white text-xl font-semibold pointer-events-none">
                        Drop .torrent file to upload
                    </div>
                )
            }
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    View
                </Label>
                <Select value={tabValue} onValueChange={(value) => {
                    setTabValue(value)
                    table.setRowSelection({})
                }}>
                    <SelectTrigger
                        className="flex w-fit @4xl/main:hidden"
                        size="sm"
                        id="view-selector"
                    >
                        <SelectValue placeholder="Select a view" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All")}</SelectItem>
                        <SelectItem value="active">{t("Active")}</SelectItem>
                        <SelectItem value="downloading">{t("Downloading")}</SelectItem>
                        <SelectItem value="seeding">{t("Seeding")}</SelectItem>
                        <SelectItem value="stopped">{t("Stopped")}</SelectItem>
                    </SelectContent>
                </Select>
                <TabsList
                    className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
                    <TabsTrigger value="all">{t("All")} <Badge variant="secondary">{table.getRowModel().rows.length}</Badge>

                    </TabsTrigger>
                    <TabsTrigger value="active">{t("Active")} <Badge variant="secondary">{table.getRowModel().rows.filter(row => row.original.rateUpload > 0 || row.original.rateDownload > 0).length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="downloading">{t("Downloading")} <Badge variant="secondary">{table.getRowModel().rows.filter(row => row.original.status === 4).length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="seeding">{t("Seeding")} <Badge variant="secondary">{table.getRowModel().rows.filter(row => row.original.status === 6).length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="stopped">{t("Stopped")} <Badge variant="secondary">{table.getRowModel().rows.filter(row => row.original.status === 0).length}</Badge>

                    </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <IconLayoutColumns />
                                <span className="hidden lg:inline">{t("Customize Columns")}</span>
                                <span className="lg:hidden">{t("Columns")}</span>
                                <IconChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {t(column.id)}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <TorrentToolbar fileProps={{ file, setFile }}
                        directoryProps={{ defaultDirectory: directory, directories: downloadDirs, setDirectory }}
                        openProps={{ open: dialogOpen, onOpenChange: diaLogOnOpenChange }}
                        filenameProps={{ filename, setFilename }}
                    />
                </div>
            </div>
            <TabsContent value="all" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <TorrentTable table={table} rows={table.getRowModel().rows} />
            </TabsContent>
            <TabsContent value="active" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <TorrentTable table={table} rows={table.getRowModel().rows.filter(row => row.original.rateUpload > 0 || row.original.rateDownload > 0)} />
            </TabsContent>
            <TabsContent
                value="downloading"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <TorrentTable table={table} rows={table.getRowModel().rows.filter(row => row.original.status === 4)} />
            </TabsContent>
            <TabsContent value="seeding" className="flex flex-col px-4 lg:px-6">
                <TorrentTable table={table} rows={table.getRowModel().rows.filter(row => row.original.status === 6)} />
            </TabsContent>
            <TabsContent
                value="stopped"
                className="flex flex-col px-4 lg:px-6"
            >
                <TorrentTable table={table} rows={table.getRowModel().rows.filter(row => row.original.status === 0)} />
            </TabsContent>
        </Tabs>
    )
}
