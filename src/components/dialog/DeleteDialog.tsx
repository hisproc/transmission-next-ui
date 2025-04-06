import { useTranslation } from "react-i18next";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useDeleteTorrent } from "@/hooks/useTorrentActions";
import {torrentSchema} from "@/schemas/torrentSchema.ts";

export function DeleteDialog({ open, onOpenChange, targetRows }: { open: boolean, onOpenChange: (open: boolean) => void, targetRows: Row<torrentSchema>[] }) {
    const { t } = useTranslation();
    const deleteTorrent = useDeleteTorrent();
    const [deleteData, setDeleteData] = useState(false);


    useEffect(() => {
        if (open) {
            setDeleteData(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Are you sure you want to do this?")}</DialogTitle>
                    <DialogDescription className="break-all">
                        {t("The following torrents will be deleted")}:
                    </DialogDescription>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {targetRows.map((row) => (
                            <li key={row.original.id} className="font-medium text-foreground">{row.original.name}</li>
                        ))}
                    </ul>
                    <div className="py-2 flex items-center gap-2">
                        <Checkbox id="delete-data" checked={deleteData} onCheckedChange={() => setDeleteData(!deleteData)} />
                        <Label>{t("Delete data")}</Label>
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit" onClick={() => {
                            deleteTorrent.mutate({ ids: targetRows.map((row) => row.original.id), deleteData: deleteData })
                        }}>{t("Confirm")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )

}