import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { useState } from "react"
import { useDeleteTorrent, useRenamePathTorrent, useSetLocationTorrent } from "../hooks/useTorrentActions"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { IconChevronDown } from "@tabler/icons-react"
import { Row } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"


export function RowDialog({ row, selectedRows, dialogOption, directories }: { row: Row<any>, selectedRows: Row<any>[], dialogOption: any, directories: string[] }) {
    const [location, setLocation] = useState(row.original.downloadDir)
    const [deleteData, setDeleteData] = useState(false)
    const [pathname, setPathname] = useState(row.original.name)
    const [oldPathname, oldLocation] = [row.original.name, row.original.downloadDir]
    const [moveData, setMoveData] = useState(false)
    const deleteTorrent = useDeleteTorrent();
    const renamePathTorrent = useRenamePathTorrent();
    const setLocationTorrent = useSetLocationTorrent();
    const { t } = useTranslation();
    const targetRows: Row<any>[] = dialogOption == "deleteMultiple" ? selectedRows : [row];
    return (
        <>
            {(dialogOption == "delete" || dialogOption == "deleteMultiple") && (<DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Are you sure you want to do this?")}</DialogTitle>
                    <DialogDescription className="break-all">
                        {t("The following torrents will be deleted")}:
                        <ul className="list-disc list-inside mt-2">
                            {targetRows.map((row) => (
                                <li key={row.original.id} className="font-semibold">{row.original.name}</li>
                            ))}
                        </ul>
                    </DialogDescription>
                    <div className="py-2 flex items-center gap-2">
                        <Checkbox id="delete-data" checked={deleteData} onCheckedChange={() => setDeleteData(!deleteData)} />
                        <Label>{t("Delete data")}</Label>
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <Button type="submit" onClick={() => {
                        deleteTorrent.mutate({ ids: targetRows.map((row) => row.original.id), deleteData: deleteData })
                    }}>{t("Confirm")}</Button>
                </DialogFooter>
            </DialogContent>)
            }
            {dialogOption == "edit" && (<DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Edit")}</DialogTitle>
                    <DialogDescription>
                        Edit the following torrent <span className="font-semibold">"{row.original.name}"</span>.
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
                        <div className="py-2 flex items-center gap-2">
                            <Label>{t("Move data")}</Label>
                            <Checkbox id="move" checked={moveData} onCheckedChange={() => setMoveData(!moveData)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit" onClick={() => {
                            if (pathname != oldPathname) {
                                renamePathTorrent.mutate({ ids: [row.original.id], path: pathname, name: pathname })
                            }
                            if (location != oldLocation) {
                                setLocationTorrent.mutate({ ids: [row.original.id], location: location, move: moveData })
                            }
                        }
                        }>{t("Submit")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>)
            }
        </>
    )
}
