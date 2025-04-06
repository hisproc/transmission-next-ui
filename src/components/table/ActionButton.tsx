import { IconDotsVertical, IconEdit, IconPlayerPlay, IconPlayerStop, IconTrash } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { Row } from "@tanstack/react-table";
import { useStartTorrent, useStopTorrent } from "@/hooks/useTorrentActions";
import {torrentSchema} from "@/schemas/torrentSchema";
import { DialogType } from "@/lib/types";

export function ActionButton({ row, setDialogType, setTargetRows}: { row: Row<torrentSchema>; setDialogType: (type: DialogType) => void, setTargetRows: (rows: Row<torrentSchema>[]) => void }) {

    const { t } = useTranslation();
    const stopTorrent = useStopTorrent();
    const startTorrent = useStartTorrent();

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
                    <DialogTrigger asChild onClick={() => {
                        setDialogType(DialogType.Edit);
                        setTargetRows([row]);
                    }}>
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
                    <DialogTrigger asChild onClick={() => {
                        setDialogType(DialogType.Delete);
                        setTargetRows([row]);
                    }}>
                        <DropdownMenuItem variant="destructive">
                            <IconTrash className="mr-2 h-4 w-4 text-red-500" />
                            {t("Delete")}
                        </DropdownMenuItem>
                    </DialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
        </Dialog>
    )
}