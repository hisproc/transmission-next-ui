import {
    ColumnDef,
    Row,
    Table
} from "@tanstack/react-table"

import { z } from "zod"
import { schema } from "../schemas/torrentSchema"
import { Checkbox } from "./ui/checkbox"
import { TorrentDrawer } from "@/components/TorrentDrawer"
import { filesize } from "filesize"
import { Progress } from "./ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { IconAlertTriangle, IconArrowDown, IconArrowUp, IconClock, IconDotsVertical, IconDownload, IconEdit, IconLoader, IconPlayerPlay, IconPlayerStop, IconTrash, IconUpload } from "@tabler/icons-react"
import { Button } from "./ui/button"
import { useStartTorrent, useStopTorrent } from "../hooks/useTorrentActions"
import { RowDialog } from "./RowDialog"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import dayjs, { formatEta } from "@/lib/dayjs"



function TorrentStatus({ error, status }: { error: number; status: number }) {
    const { t } = useTranslation()
    if (error !== 0) {
        return (
            <>
                <IconAlertTriangle className="text-red-500" />
                {t("Error")}
            </>
        )
    }

    let statusDetails;
    switch (status) {
        case 0:
            statusDetails = { icon: <IconPlayerStop className="text-red-500" />, text: t("Stopped") };
            break;
        case 1:
            statusDetails = { icon: <IconClock className="text-yellow-500" />, text: t("Queued") };
            break;
        case 2:
            statusDetails = { icon: <IconLoader className="animate-spin text-blue-500" />, text: t("Verifying") };
            break;
        case 3:
            statusDetails = { icon: <IconClock className="text-yellow-500" />, text: t("Queued") };
            break;
        case 4:
            statusDetails = { icon: <IconDownload className="text-green-500" />, text: t("Downloading") };
            break;
        case 5:
            statusDetails = { icon: <IconClock className="text-yellow-500" />, text: t("Queued") };
            break;
        case 6:
            statusDetails = { icon: <IconUpload className="text-purple-500" />, text: t("Seeding") };
            break;
        default:
            statusDetails = { icon: null, text: t("Unknown") };
    }

    return (
        <>
            {statusDetails.icon}
            {statusDetails.text}
        </>
    )
}

function SortableHeader({ column, title, className }: { column: any, title: string, className?: string }) {
    const sort = column.getIsSorted()
    const icon =
        sort === "asc"
            ? <IconArrowUp className="h-5 w-5 text-muted-foreground/70" />
            : sort === "desc"
                ? <IconArrowDown className="h-5 w-5 text-muted-foreground/70" />
                : <ChevronsUpDown className="h-5 w-5 text-muted-foreground/70" />

    return (
        <div
            className={cn("cursor-pointer select-none flex items-center gap-1", className)}
            onClick={() => column.toggleSorting()}
        >
            <span>{title}</span>
            {icon}
        </div>
    )
}

export function getColumns(t: Function): ColumnDef<z.infer<typeof schema>>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "Name",
            accessorKey: "name",
            header: ({ column }) => <SortableHeader column={column} title={t("Name")} />,
            cell: ({ row }) => {
                return <TorrentDrawer item={row.original} />
            },
            enableHiding: false,
            enableSorting: true
        },
        {
            id: "Total Size",
            accessorKey: "totalSize",
            header: ({ column }) => <SortableHeader column={column} title={t("Total Size")} />,
            cell: ({ row }) => (
                <div className="text-right">
                    {filesize(row.original.totalSize)}
                </div>
            ),
        },
        {
            id: "Percentage",
            accessorKey: "percentDone",
            header: ({ column }) => <SortableHeader column={column} title={t("Percentage")} />,
            cell: ({ row }) => (
                <div className="w-32">
                    <Progress value={row.original.percentDone * 100} className="w-[60%]" />
                    {(row.original.percentDone * 100).toFixed(2)}%
                </div>
            ),
        },
        {
            id: "eta",
            accessorKey: "eta",
            header: ({ column }) => <SortableHeader column={column} title={t("eta")} className="w-30 justify-end" />,
            cell: ({ row }) => {
                const eta = row.original.eta
                if (eta === -1) {
                    return <div className="text-right"></div>
                }
                return (
                    <div className="text-right">
                        {formatEta(eta, t)}
                    </div>
                )
            },
        },
        {
            id: "Status",
            accessorKey: "status",
            header: ({ column }) => <SortableHeader column={column} title={t("Status")} />,
            cell: ({ row }) => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="min-w-[120px] justify-start text-muted-foreground px-1.5">
                                <TorrentStatus error={row.original.error} status={row.original.status} />
                            </Badge>
                        </TooltipTrigger>
                        {row.original.error !== 0 && (
                            <TooltipContent side="top" align="center" sideOffset={5}>
                                <p>{row.original.errorString}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            ),
        },
        {
            id: "Download Speed",
            accessorKey: "rateDownload",
            header: ({ column }) => <SortableHeader column={column} title={t("Download Rate")} className="w-full justify-end" />,
            cell: ({ row }) => (
                <div className="text-right">
                    {filesize(row.original.rateDownload)}/s
                </div>
            ),
        },
        {
            id: "Upload Speed",
            accessorKey: "rateUpload",
            header: ({ column }) => <SortableHeader column={column} title={t("Upload Rate")} className="w-full justify-end" />,
            cell: ({ row }) => (
                <div className="text-right">
                    {filesize(row.original.rateUpload)}/s
                </div>
            ),
        },
        {
            id: "Download Peers",
            header: ({ column }) => <SortableHeader column={column} title={t("Download Peers")} className="w-full justify-end" />,
            cell: ({ row }) => {
                const totalSeeders = row.original.trackerStats.reduce(
                    (sum, tracker) => sum + tracker.seederCount,
                    0
                )
                return <div className="text-right">{totalSeeders}({row.original.peersSendingToUs})</div>
            },
        },
        {
            id: "Upload Peers",
            header: ({ column }) => <SortableHeader column={column} title={t("Upload Peers")} className="w-full justify-end" />,
            cell: ({ row }) => {
                const totalLeechers = row.original.trackerStats.reduce(
                    (sum, tracker) => sum + tracker.leecherCount,
                    0
                )
                return <div className="text-right">{totalLeechers}({row.original.peersGettingFromUs})</div>
            },
        },
        {
            id: "Upload Ratio",
            accessorKey: "uploadRatio",
            header: ({ column }) => <SortableHeader column={column} title={t("Upload Ratio")} className="w-full justify-end" />,
            cell: ({ row }) => (
                <div className="text-right">
                    {row.original.uploadRatio}
                </div>
            ),
        },
        {
            id: "Uploaded",
            accessorKey: "uploadedEver",
            header: ({ column }) => <SortableHeader column={column} title={t("Uploaded")} className="w-full justify-end" />,
            cell: ({ row }) => (
                <div className="text-right">
                    {filesize(row.original.uploadedEver)}
                </div>
            ),
        },
        {
            id: "Added Date",
            accessorKey: "addedDate",
            header: ({ column }) => <SortableHeader column={column} title={t("Added Date")} className="w-full justify-end" />,
            cell: ({ row }) => (
                <div className="text-right">
                    {dayjs.unix(row.original.addedDate).format('YYYY-MM-DD HH:mm:ss')}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row, table }: {
                row: Row<any>;
                table: Table<any>;
            }) => {

                const stopTorrent = useStopTorrent()
                const startTorrent = useStartTorrent()

                const [dialogOption, setDialogOption] = useState<string>("")
                return (
                    <Dialog key={row.id}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                    size="icon"
                                >
                                    <IconDotsVertical />
                                    <span className="sr-only">{t("Open menu")}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                                <DialogTrigger asChild onClick={() => setDialogOption("edit")}>
                                    <DropdownMenuItem>
                                        <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {t("Edit")}
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                {row.original.status === 0 && (
                                    <DropdownMenuItem onClick={() => startTorrent.mutate([row.original.id])}>
                                        <IconPlayerPlay className="mr-2 h-4 w-4 text-green-500" />
                                        {t("Start")}
                                    </DropdownMenuItem>
                                )}
                                {row.original.status !== 0 && (
                                    <DropdownMenuItem onClick={() => stopTorrent.mutate([row.original.id])}>
                                        <IconPlayerStop className="mr-2 h-4 w-4 text-red-500" />
                                        {t("Stop")}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DialogTrigger asChild onClick={() => setDialogOption("delete")}>
                                    <DropdownMenuItem variant="destructive">
                                        <IconTrash className="mr-2 h-4 w-4 text-red-500" />
                                        {t("Delete")}
                                    </DropdownMenuItem>
                                </DialogTrigger>
                            </DropdownMenuContent>
                            <RowDialog row={row} selectedRows={table.getSelectedRowModel().rows} dialogOption={dialogOption} directories={[...new Set(table.getRowModel().rows.map(row => row.original.downloadDir))]} />
                        </DropdownMenu>
                    </Dialog>
                )
            },
        },
    ]
}