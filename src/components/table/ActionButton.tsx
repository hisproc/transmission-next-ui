import { IconDotsVertical, IconEdit, IconPlayerPlay, IconPlayerStop, IconTrash } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { RowDialog } from "../RowDialog";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Row, Table } from "@tanstack/react-table";
import { useStartTorrent, useStopTorrent } from "@/hooks/useTorrentActions";
import { schema } from "@/schemas/torrentSchema";
import {z} from "zod";

export function ActionButton({ row, table }: { row: Row<z.infer<typeof schema>>; table: Table<z.infer<typeof schema>> }) {

    const { t } = useTranslation();

    const stopTorrent = useStopTorrent();
    const startTorrent = useStartTorrent();

    const [dialogOption, setDialogOption] = useState<string>("");

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
}