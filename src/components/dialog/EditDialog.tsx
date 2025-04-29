import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Row } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import {useRenamePathTorrent, useSetLocationTorrent, useSetTorrent} from "@/hooks/useTorrentActions";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { IconChevronDown } from "@tabler/icons-react";
import { torrentSchema } from "@/schemas/torrentSchema.ts";
import {TorrentLabel} from "@/lib/torrentLabel.ts";
import {LabelEdit} from "@/components/dialog/LabelEdit.tsx";

export function EditDialog({ open, onOpenChange, targetRows, directories }: { open: boolean, onOpenChange: (open: boolean) => void, targetRows: Row<torrentSchema>[], directories: string[] }) {
    const { t } = useTranslation();

    const renamePathTorrent = useRenamePathTorrent();
    const setLocationTorrent = useSetLocationTorrent();
    const setTorrent = useSetTorrent();
    const row = targetRows?.[0];
    const [oldPathname, oldLocation] = [row?.original.name, row?.original.downloadDir, row?.original.labels]
    const [location, setLocation] = useState(row?.original.downloadDir)
    const [moveData, setMoveData] = useState(false)
    const [pathname, setPathname] = useState(row?.original.name)
    const [labels, setLabels] = useState<TorrentLabel[]>([])


    useEffect(() => {
        setPathname(row?.original.name || "")
        setLocation(row?.original.downloadDir || "")
        setLabels(row?.getValue("Labels") || [])
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Edit")}</DialogTitle>
                    <DialogDescription>
                        {t("EditingFollowingTorrent")} <span className="font-semibold">"{row?.original.name}"</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>{t("Name")}</Label>
                        <Input id="name" defaultValue={pathname} onChange={(e) => setPathname(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("Save Directory")}</Label>
                        <div className="relative">
                            <Input
                                id="directory"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter or select a directory"
                                className="pr-10"
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="absolute right-0 top-1/2 -translate-y-1/2"
                                        size="icon"
                                    >
                                        <IconChevronDown />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-full">
                                    {directories.map((dir) => (
                                        <DropdownMenuItem key={dir} onClick={() => setLocation(dir)}>
                                            {dir}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("Labels")}</Label><LabelEdit labels={labels} setLabels={setLabels} />
                    </div>
                    <div className="py-2 flex items-center gap-2">
                        <Label>{t("Move data")}</Label>
                        <Checkbox id="move" checked={moveData} onCheckedChange={() => setMoveData(!moveData)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit" onClick={() => {
                            if (pathname != oldPathname) {
                                renamePathTorrent.mutate({ ids: [row.original.id], path: oldPathname, name: pathname })
                            }
                            if (location != oldLocation) {
                                setLocationTorrent.mutate({ ids: [row.original.id], location: location, move: moveData })
                            }
                            if (labels.length > 0) {
                                setTorrent.mutate({ ids: [row.original.id], labels: labels })
                            }
                        }}>{t("Submit")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
