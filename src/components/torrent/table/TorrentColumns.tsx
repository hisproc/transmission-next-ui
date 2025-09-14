import {
    ColumnDef,
    FilterFn,
    Row,
    Table
} from "@tanstack/react-table"

import { torrentSchema } from "@/schemas/torrentSchema.ts"
import { Checkbox } from "@/components/ui/checkbox.tsx"
import { TorrentDrawer } from "@/components/torrent/TorrentDrawer.tsx"
import { filesize } from "filesize"
import { Progress } from "@/components/ui/progress.tsx"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx"
import { Badge } from "@/components/ui/badge.tsx"

import dayjs, { formatEta } from "@/lib/utils/dayjs.ts"
import { ActionButton } from "./ActionButton.tsx"
import { TFunction } from "i18next";
import { TorrentStatus } from "@/components/torrent/table/TorrentStatus.tsx";
import { SortableHeader } from "@/components/torrent/table/SortableHeader.tsx";
import { RowAction } from "@/lib/utils/rowAction.ts"
import React from "react";
import { TorrentLabel } from "@/lib/utils/torrentLabel.ts";
import { parseLabel } from "@/lib/utils/utils.ts";

const activeFilter: FilterFn<torrentSchema> = (row) => {
    return row.original.rateDownload > 0 || row.original.rateUpload > 0
}

interface getColumnsProps {
    t: TFunction;
    setRowAction: React.Dispatch<React.SetStateAction<RowAction | null>>;
}

export function getColumns({ t, setRowAction }: getColumnsProps): ColumnDef<torrentSchema>[] {
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
                <TorrentStatus 
                    error={row.original.error} 
                    status={row.original.status}
                    trackerStats={row.original.trackerStats}
                    errorString={row.original.errorString}
                />
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
            filterFn: activeFilter,
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
            id: "Tracker",
            accessorKey: "trackerStats",
            header: ({ column }) => <SortableHeader column={column} title={t("Tracker")} className="w-full justify-start" />,
            cell: ({ row }) => {
                const trackers = row.original.trackerStats;
                const hasMultiple = trackers.length > 1;
                return (
                    <div className="flex items-center gap-2">
                        <div className="text-left">
                            {trackers[0]?.host || ''}
                        </div>
                        {hasMultiple && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="secondary"
                                            className="rounded-sm px-1 font-normal"
                                        >
                                            +{trackers.length - 1}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="center" sideOffset={5}>
                                        <div className="flex flex-col gap-1">
                                            {trackers.slice(1).map((tracker, index) => (
                                                <div key={index} className="text-sm">
                                                    {tracker.host}
                                                </div>
                                            ))}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                )
            },
            sortingFn: (rowA, rowB, columnId) => {
                const a = rowA.getValue(columnId) as { host: string }[] || [];
                const b = rowB.getValue(columnId) as { host: string }[] || [];
                const hostA = a[0]?.host || "";
                const hostB = b[0]?.host || "";
                return hostA.localeCompare(hostB);
            },
            filterFn: (row, columnId, filterValue: string[]) => {
                const trackers = row.getValue(columnId) as { host: string }[] || [];
                return trackers.some(tracker => filterValue.includes(tracker.host));
            },
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
            id: "Labels",
            accessorKey: "labels",
            accessorFn: (row) => row.labels.map((label) => parseLabel(label)).filter((label) => label !== null),
            header: ({ column }) => <SortableHeader column={column} title={t("Labels")} className="w-full justify-start" />,
            cell: ({ row }) => {
                const labels = row.getValue("Labels") as TorrentLabel[];
                return (
                    <div className="flex flex-row gap-1">
                        {labels.map((label, index) => (
                            <span
                                key={index}
                                className="bg-muted text-sm px-2 py-0.5 rounded-full border border-border"
                            >
                                {label.text}
                            </span>
                        ))}
                    </div>
                )
            },
            filterFn: (row, columnId, filterValue: string[]) => {
                const labels = row.getValue(columnId) as TorrentLabel[];
                return labels.some((label) => filterValue.includes(label.text));
            }
        },
        {
            id: "actions",
            cell: ({ row }: {
                row: Row<torrentSchema>;
                table: Table<torrentSchema>;
            }) => {
                return (
                    <ActionButton row={row} setRowAction={setRowAction} />
                )
            },
        },
    ]
}