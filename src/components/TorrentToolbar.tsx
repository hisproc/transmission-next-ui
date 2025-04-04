import { IconPlus, IconChevronDown, IconClipboardCheck } from "@tabler/icons-react";
import { Label } from "recharts";
import { FileUpload } from "./FileUpload";
import { useAddTorrent } from "../hooks/useTorrentActions";
import { Button } from "./ui/button";
import { DialogHeader, DialogFooter, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "./ui/dialog";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function TorrentToolbar({ fileProps, directoryProps, openProps, filenameProps }: {
    fileProps: { file: File | null, setFile: (file: File | null) => void },
    directoryProps: { defaultDirectory: string, directories: string[], setDirectory: (dir: string) => void },
    openProps: { open: boolean, onOpenChange: (open: boolean) => void },
    filenameProps: { filename: string, setFilename: (filename: string) => void }
}) {

    const addTorrent = useAddTorrent();

    const { t } = useTranslation();

    return (
        <>
            <Dialog open={openProps.open} onOpenChange={openProps.onOpenChange}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <IconPlus />
                        <span className="hidden lg:inline">{t("Add Torrent")}</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("Add Torrent")}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("Save Directory")}</Label>
                            <div className="relative">
                                <Input
                                    id="directory"
                                    value={directoryProps.directories[0]}
                                    onChange={(e) => directoryProps.setDirectory(e.target.value)}
                                    placeholder={t("Enter or select a directory")}
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
                                        {directoryProps.directories.map((dir) => (
                                            <DropdownMenuItem key={dir} onClick={() => directoryProps.setDirectory(dir)}>
                                                {dir}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="max-w-full overflow-hidden truncate">
                            <FileUpload
                                accept=".torrent"
                                maxSize={5 * 1024 * 1024} // 5MB
                                value={fileProps.file}
                                onChange={(file) => fileProps.setFile(file)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                id="clipboard-input"
                                placeholder={t("Paste magnet link or URL")}
                                value={filenameProps.filename}
                                onChange={(e) => filenameProps.setFilename(e.target.value)}
                                className="flex-1"
                            />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={async () => {
                                                try {
                                                    const text = await navigator.clipboard.readText();
                                                    filenameProps.setFilename(text);
                                                } catch (err) {
                                                    console.error("Failed to write clipboard", err);
                                                }
                                            }}
                                        >
                                            <IconClipboardCheck />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{t("Paste from clipboard")}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="submit"
                                onClick={() => {
                                    if (filenameProps.filename && fileProps.file) {
                                        toast.error(t("Please select only one file or magnet link."), { "position": "top-right" });
                                        return;
                                    }
                                    if (!filenameProps.filename && !fileProps.file) {
                                        toast.error(t("Please select a file or magnet link."), { "position": "top-right" });
                                        return;
                                    }
                                    addTorrent.mutate({ directory: directoryProps.defaultDirectory, file: fileProps.file, filename: filenameProps.filename });
                                }}
                            >
                                {t("Submit")}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}