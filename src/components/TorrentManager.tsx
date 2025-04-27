import { useEffect, useState, useRef, useMemo } from "react"
import {
    type UniqueIdentifier,
} from "@dnd-kit/core"

import {
    IconChevronDown,
    IconLayoutColumns,
    IconPlus,
} from "@tabler/icons-react"
import {
    ColumnFiltersState,
    Row,
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
import { schema, torrentSchema } from "../schemas/torrentSchema"
import { TorrentTable } from "./TorrentTable"
import { DialogType, TransmissionSession } from "@/lib/types"
import { useTranslation } from "react-i18next"
import { Input } from "./ui/input"
import { DeleteDialog } from "./dialog/DeleteDialog"
import { EditDialog } from "./dialog/EditDialog"
import { AddDialog } from "@/components/dialog/AddDialog.tsx";
import { STORAGE_KEYS } from "@/constants/storage"
import { ColumnFilter } from "./table/ColumnFilter"

const statusTabs = [
    { value: "all", label: "All", filter: [] },
    { value: "active", label: "Active", filter: [{ id: "Download Speed", value: 0 }] },
    { value: "downloading", label: "Downloading", filter: [{ id: "Status", value: 4 }] },
    { value: "seeding", label: "Seeding", filter: [{ id: "Status", value: 6 }] },
    { value: "stopped", label: "Stopped", filter: [{ id: "Status", value: 0 }] },
]

function getFilterCount(data: torrentSchema[], filter: { id: string, value: any }[], globalFilter: string) {
    const filteredData = data.filter((item) => {
        const isFiltered = filter.every((f) => {
            if (f.id === "Status") {
                return item.status === f.value;
            } else if (f.id === "Download Speed") {
                return item.rateDownload > f.value || item.rateUpload > f.value;
            }
            else if (f.id === "Tracker") {
                return item.trackerStats.some(tracker => (f.value as string[]).includes(tracker.host));
            }
            return true;
        });

        if (isFiltered) {
            if (globalFilter !== "") {
                return item.name.toLowerCase().includes(globalFilter.toLowerCase());
            }
            return true;
        }
        return false;
    });

    return filteredData.length;
}

export function TorrentManager({
    data: initialData,
    session: session,
}: {
    data: z.infer<typeof schema>[],
    session: TransmissionSession
}) {
    const [rowSelection, setRowSelection] = useState({})
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const dragCounter = useRef(0);
    const [globalFilter, setGlobalFilter] = useState("");
    const [dialogType, setDialogType] = useState<DialogType | null>(null);
    const [targetRows, setTargetRows] = useState<Row<torrentSchema>[]>([])


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
                setDialogType(DialogType.Add)
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
        pageSize: Number(localStorage.getItem(STORAGE_KEYS.PAGE_SIZE)) || 50,
    })
    useMemo<UniqueIdentifier[]>(
        () => initialData?.map(({ id }) => id) || [],
        [initialData]
    );
    const downloadDirs = Array.from(new Set([...initialData.map((item) => item.downloadDir), session["download-dir"] || ""]))
    const trackers = Array.from(new Set(initialData.flatMap((item) => item.trackerStats.map((tracker) => tracker.host)))).map((tracker) => ({
        label: tracker,
        value: tracker
    }))
    const [tabValue, setTabValue] = useState("all")
    const { t } = useTranslation()

    const tabFilterData = useMemo(() => {
        const tabFilter = statusTabs.find(tab => tab.value === tabValue)?.filter || [];
        return initialData.filter((item) => tabFilter.every((f) => {
            if (f.id === "Status") {
                return item.status === f.value;
            } else if (f.id === "Download Speed") {
                return item.rateDownload > f.value || item.rateUpload > f.value;
            }
            return true;
        }))
    }, [initialData, tabValue]);

    const table = useReactTable({
        data: tabFilterData,
        columns: useMemo(() => getColumns({ t, setDialogType, setTargetRows }), [t]),
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
            globalFilter,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        autoResetPageIndex: false
    })

    return (
        <Tabs
            value={tabValue}
            onValueChange={(value) => {
                setTabValue(value)
                table.setRowSelection({})
                table.setPageIndex(0)
            }}
            className="w-full flex-col justify-start gap-4"
        >
            {
                isDragging && dialogType !== DialogType.Add && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center text-white text-xl font-semibold pointer-events-none">
                        Drop .torrent file to upload
                    </div>
                )
            }
            <div className="flex flex-wrap items-center w-full gap-2 px-4 lg:px-6">
                <div className="flex shrink-0 items-center gap-2">
                    <Label htmlFor="view-selector" className="sr-only">
                        View
                    </Label>
                    <Select value={tabValue} onValueChange={(value) => {
                        setTabValue(value)
                        table.setRowSelection({})
                        table.setPageIndex(0)
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
                        {statusTabs.map(tab => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {t(tab.label)} <Badge variant="secondary">
                                    {getFilterCount(initialData, [...tab.filter, ...table.getState().columnFilters], globalFilter)}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="flex shrink-0 items-center gap-2 ml-auto">
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
                                                column.toggleVisibility(value)
                                            }
                                        >
                                            {t(column.id)}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" onClick={() => setDialogType(DialogType.Add)}>
                        <IconPlus />
                        <span className="hidden lg:inline">{t("Add Torrent")}</span>
                    </Button>
                </div>
            </div>
            <div className="flex flex-wrap items-center w-full gap-2 px-4 lg:px-6">
                <div className="flex min-w-[150px] flex-1 sm:flex-none sm:w-1/3">
                    <Input
                        type="text"
                        placeholder={t("Search ...")}
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
                <div className="flex shrink-0 items-center gap-2 ml-auto sm:ml-0">
                    <ColumnFilter title={"Tracker"} column={table.getColumn("Tracker")} options={trackers} />
                </div>
            </div>
            <TabsContent value={tabValue} className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <TorrentTable table={table} setDialogType={setDialogType} setTargetRows={setTargetRows} />
            </TabsContent>
            <DeleteDialog open={dialogType === DialogType.Delete} onOpenChange={(open) => !open && setDialogType(null)} targetRows={targetRows} />
            <EditDialog open={dialogType === DialogType.Edit} onOpenChange={(open) => !open && setDialogType(null)} targetRows={targetRows} directories={downloadDirs} />
            <AddDialog open={dialogType === DialogType.Add} onOpenChange={(open) => {
                if (!open) {
                    setDialogType(null)
                    setIsDragging(false)
                    dragCounter.current = 0
                }
            }} file={file} setFile={setFile} directories={downloadDirs} />
        </Tabs>
    )
}
