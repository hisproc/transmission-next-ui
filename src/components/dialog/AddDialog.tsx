import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { IconChevronDown, IconClipboardCheck } from "@tabler/icons-react";
import { Label } from "recharts";
import { Input } from "@/components/ui/input.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import { FileUpload } from "@/components/FileUpload.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddTorrent } from "@/hooks/useTorrentActions.ts";

export function AddDialog({ open, onOpenChange, file, setFile, directories }: { open: boolean, onOpenChange: (open: boolean) => void, file: File | null, setFile: (file: File | null) => void, directories: string[] }) {

    const [directory, setDirectory] = useState(directories[0] ?? "");

    const addTorrent = useAddTorrent();
    const [filename, setFilename] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        if (open) {
            setDirectory(directories[0] ?? "");
        }
        if (!open) {
            setFile(null);
            setFilename("");
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Add Torrent")}</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                </DialogDescription>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>{t("Save Directory")}</Label>
                        <div className="relative">
                            <Input
                                id="directory"
                                value={directory}
                                onChange={(e) => setDirectory(e.target.value)}
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
                                    {directories.map((dir) => (
                                        <DropdownMenuItem key={dir} onClick={() => setDirectory(dir)}>
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
                            value={file}
                            onChange={(file) => setFile(file)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            id="clipboard-input"
                            placeholder={t("Paste magnet link or URL")}
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
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
                                                setFilename(text);
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
                                console.log("Adding torrent", { directory: directory, file: file, filename: filename });
                                if (filename && file) {
                                    toast.error(t("Please select only one file or magnet link."), { "position": "top-right" });
                                    return;
                                }
                                if (!filename && !file) {
                                    toast.error(t("Please select a file or magnet link."), { "position": "top-right" });
                                    return;
                                }
                                addTorrent.mutate({ directory: directory, file: file, filename: filename });
                            }}
                        >
                            {t("Submit")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
