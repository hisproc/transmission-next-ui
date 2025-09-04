import { IconDotsVertical, IconEdit, IconPlayerPlay, IconPlayerStop, IconTrash } from "@tabler/icons-react";
import { Button } from "../../ui/button.tsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu.tsx";
import { useTranslation } from "react-i18next";
import { Row } from "@tanstack/react-table";
import { useStartTorrent, useStopTorrent } from "@/hooks/useTorrentActions.ts";
import { torrentSchema } from "@/schemas/torrentSchema.ts";
import { RowAction } from "@/lib/utils/rowAction.ts";
import { DialogType } from "@/lib/api/types.ts";
import React from "react";

interface ActionButtonProps {
    row: Row<torrentSchema>;
    setRowAction: React.Dispatch<React.SetStateAction<RowAction | null>>;
}
export function ActionButton({ row, setRowAction }: ActionButtonProps) {

    const { t } = useTranslation();
    const stopTorrent = useStopTorrent();
    const startTorrent = useStartTorrent();

    return (
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
                    <DropdownMenuItem onSelect={() => {
                        setRowAction({ dialogType: DialogType.Edit, targetRows: [row] })
                    }}>
                        <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
                        {t("Edit")}
                    </DropdownMenuItem>
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
                    <DropdownMenuItem variant="destructive" onSelect={() => {setRowAction({ dialogType: DialogType.Delete, targetRows: [row] })}}>
                        <IconTrash className="mr-2 h-4 w-4 text-red-500" />
                        {t("Delete")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
    )
}