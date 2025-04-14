import {
    ColumnDef,
    Row,
    Table
} from "@tanstack/react-table"

import { torrentSchema } from "../schemas/torrentSchema"
import { Checkbox } from "./ui/checkbox"
import { TorrentDrawer } from "@/components/TorrentDrawer"
import { filesize } from "filesize"
import { Progress } from "./ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Badge } from "./ui/badge"

import dayjs, { formatEta } from "@/lib/dayjs"
import { ActionButton } from "./table/ActionButton"
import { TFunction } from "i18next";
import { TorrentStatus } from "@/components/table/TorrentStatus.tsx";
import { SortableHeader } from "@/components/table/SortableHeader.tsx";
import { DialogType } from "@/lib/types"

export function getColumns({ t, setDialogType, setTargetRows }: { t: TFunction, setDialogType: (type: DialogType) => void, setTargetRows: (rows: Row<torrentSchema>[]) => void }): ColumnDef<torrentSchema>[] {
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
            filterFn: 'equals',
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
            filterFn: (row, columnId, value) => {
                const cellValue: number = row.getValue(columnId)
                return cellValue > value
            }
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
            filterFn: (row, columnId, value) => {
                const cellValue: number = row.getValue(columnId)
                return cellValue > value
            }
        },
        {
            id: "Download Peers",
            header: ({ column }) => <SortableHeader column={column} title={t("Download Peers")} className="w-full justify-end" />,
            cell: ({ row }) => {
                const totalLeechers = row.original.trackerStats.reduce(
                    (sum, tracker) => sum + tracker.leecherCount,
                    0
                )
                return <div className="text-right">{totalLeechers}({row.original.peersSendingToUs})</div>
            },
        },
        {
            id: "Upload Peers",
            header: ({ column }) => <SortableHeader column={column} title={t("Upload Peers")} className="w-full justify-end" />,
            cell: ({ row }) => {
                const totalSeeders = row.original.trackerStats.reduce(
                    (sum, tracker) => sum + tracker.seederCount,
                    0
                )
                return <div className="text-right">{totalSeeders}({row.original.peersGettingFromUs})</div>
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
            cell: ({ row }: {
                row: Row<torrentSchema>;
                table: Table<torrentSchema>;
            }) => {
                return (
                    <ActionButton row={row} setDialogType={setDialogType} setTargetRows={setTargetRows} />
                )
            },
        },
    ]
}