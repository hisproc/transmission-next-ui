import { useState, useMemo } from "react"

import {
    IconPlus,
    IconRefresh,
    IconTool,
    IconChevronDown,
} from "@tabler/icons-react"
import { z } from "zod"

import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Label } from "@/components/ui/label.tsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.tsx"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs.tsx"

import { schema, torrentSchema } from "@/schemas/torrentSchema.ts"
import { TorrentTable } from "./TorrentTable.tsx"
import { DialogType, TransmissionSession } from "@/lib/api/types.ts"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input.tsx"
import { DeleteDialog } from "@/components/forms/dialog/DeleteDialog.tsx"
import { EditDialog } from "@/components/forms/dialog/EditDialog.tsx"
import { AddDialog } from "@/components/forms/dialog/AddDialog.tsx";
import { ColumnFilter } from "@/components/torrent/table/ColumnFilter.tsx"
import { useDragAndDropUpload } from "@/hooks/useDragAndDropUpload.ts"
import { useTorrentTable } from "@/hooks/useTorrentTable.ts"
import { RowAction } from "@/lib/utils/rowAction.ts"
import { ColumnView } from "@/components/torrent/table/ColumnView.tsx";
import { TorrentLabel } from "@/lib/utils/torrentLabel.ts";
import { parseLabel } from "@/lib/utils/utils.ts";
import { ReplaceTrackerDialog } from "../forms/dialog/ReplaceTrackerDialog.tsx"

const statusTabs = [
    { value: "all", label: "All", filter: [] },
    { value: "active", label: "Active", filter: [{ id: "Download Speed", value: 0 }] },
    { value: "downloading", label: "Downloading", filter: [{ id: "Status", value: 4 }] },
    { value: "seeding", label: "Seeding", filter: [{ id: "Status", value: 6 }] },
    { value: "stopped", label: "Stopped", filter: [{ id: "Status", value: 0 }] },
]

function getFilterCount(data: torrentSchema[], filter: { id: string, value: any }[]) {
    const filteredData = data.filter((item) => {
        return filter.every((f) => {
            if (f.id === "Status") {
                return item.status === f.value;
            } else if (f.id === "Download Speed") {
                return item.rateDownload > f.value || item.rateUpload > f.value;
            }
            else if (f.id === "Tracker") {
                return item.trackerStats.some(tracker => (f.value as string[]).includes(tracker.host));
            }
            else if (f.id === "Labels") {
                const itemLabels = item.labels.map(label => parseLabel(label)).filter(label => label !== null).map(label => (label as TorrentLabel).text);
                return itemLabels.some(label => (f.value as string[]).includes(label));
            }
            return true;
        });
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
    const [file, setFile] = useState<File | null>(null)
    const [rowAction, setRowAction] = useState<RowAction | null>(null)
    const { isDragging } = useDragAndDropUpload({ setFile, setRowAction })
    const downloadDirs = Array.from(new Set([...initialData.map((item) => item.downloadDir), session["download-dir"] || ""]))
    const trackers = Array.from(new Set(initialData.flatMap((item) => item.trackerStats.map((tracker) => ({
        label: tracker.host,
        announce: tracker.announce,
        value: tracker.host
    })))));
    const labelMap = new Map<string, TorrentLabel>();
    initialData.forEach(item => {
        item.labels.forEach(rawLabel => {
            const parsed = parseLabel(rawLabel);
            if (!parsed) return;
            labelMap.set(parsed.text, parsed);
        });
    });
    const labels = Array.from(labelMap.values()).map(label => ({
        label: label.text,
        value: label.text,
    }));

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

    const table = useTorrentTable({
        tabFilterData, setRowAction
    })

    const handleTabChange = (value: string) => {
        setTabValue(value)
        table.setRowSelection({})
        table.setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    return (
        <Tabs value={tabValue} onValueChange={handleTabChange} className="w-full flex-col justify-start gap-4">
            <div className="flex flex-wrap items-center w-full gap-2 px-4 lg:px-6">
                <div className="flex shrink-0 items-center gap-2">
                    <Label htmlFor="view-selector" className="sr-only">
                        View
                    </Label>
                    <Select value={tabValue} onValueChange={handleTabChange}>
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
                                    {getFilterCount(initialData, [...tab.filter, ...table.getState().columnFilters])}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="flex shrink-0 items-center gap-2 ml-auto">
                    <ColumnView columns={table.getAllColumns()} />
                    <Button variant="outline" size="sm" onClick={() => setRowAction({ dialogType: DialogType.Add, targetRows: [] })}>
                        <IconPlus />
                        <span className="hidden lg:inline">{t("Add Torrent")}</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <IconTool />
                                <span className="hidden lg:inline">{t("常用工具")}</span>
                                <IconChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setRowAction({
                                dialogType: DialogType.ReplaceTracker,
                                targetRows: table.getRowModel().rows
                            })}>
                                <IconRefresh className="mr-2 h-4 w-4" />
                                {t("Replace Tracker")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="flex flex-wrap items-center w-full gap-2 px-4 lg:px-6">
                <div className="flex min-w-[150px] w-full sm:flex-none sm:w-1/3">
                    <Input
                        type="text"
                        placeholder={t("Search ...")}
                        value={table.getColumn("Name")?.getFilterValue() as string}
                        onChange={(e) => table.getColumn("Name")?.setFilterValue(e.target.value)}
                    />
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:ml-0">
                    <ColumnFilter title={"Tracker"} column={table.getColumn("Tracker")} options={trackers} />
                    <ColumnFilter title={"Labels"} column={table.getColumn("Labels")} options={labels} />
                </div>
            </div>
            <TabsContent value={tabValue} className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <TorrentTable table={table} setRowAction={setRowAction} />
            </TabsContent>
            <DeleteDialog open={rowAction?.dialogType === DialogType.Delete} onOpenChange={(open) => !open && setRowAction(null)} targetRows={rowAction?.targetRows || []} />
            <EditDialog open={rowAction?.dialogType === DialogType.Edit} onOpenChange={(open) => !open && setRowAction(null)} targetRows={rowAction?.targetRows || []} directories={downloadDirs} />
            <AddDialog open={rowAction?.dialogType === DialogType.Add} onOpenChange={(open) => !open && setRowAction(null)} file={file} setFile={setFile} directories={downloadDirs} />
            <ReplaceTrackerDialog
                open={rowAction?.dialogType === DialogType.ReplaceTracker}
                onOpenChange={(open) => !open && setRowAction(null)}
                targetRows={table.getRowModel().rows || []}
                trackers={trackers.map(t => t.announce)}
            />
            {
                isDragging && rowAction?.dialogType !== DialogType.Add && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center text-white text-xl font-semibold pointer-events-none">
                        Drop .torrent file to upload
                    </div>
                )
            }
        </Tabs>
    )
}
