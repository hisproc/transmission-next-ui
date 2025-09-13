import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx"
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Row } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { useSetTorrentTracker } from "@/hooks/useTorrentActions.ts";
import { useEffect, useState, useMemo } from "react";
import { torrentSchema } from "@/schemas/torrentSchema.ts";
import { InputWithDropdown } from "@/components/ui/input-with-dropdown.tsx";
import { Badge } from "@/components/ui/badge.tsx";

export function ReplaceTrackerDialog({
    open,
    onOpenChange,
    targetRows,
    trackers
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    targetRows: Row<torrentSchema>[],
    trackers: string[]
}) {
    const { t } = useTranslation();
    const setTorrentTracker = useSetTorrentTracker();

    const [oldTracker, setOldTracker] = useState("")
    const [newTracker, setNewTracker] = useState("")

    const allTrackers = Array.from(new Set(
        targetRows.flatMap(row =>
            row.original.trackerStats.map(tracker => tracker.announce)
        )
    ));

    const matchedTorrents = useMemo(() => {
        if (!oldTracker.trim()) return [];

        return targetRows.filter(row =>
            row.original.trackerStats.some(tracker =>
                tracker.announce.toLowerCase() === oldTracker.toLowerCase()
            )
        );
    }, [oldTracker, targetRows]);

    useEffect(() => {
        if (open) {
            setOldTracker("")
            setNewTracker("")
        }
    }, [open]);

    const handleSubmit = () => {
        if (!oldTracker || !newTracker || matchedTorrents.length === 0) return;

        matchedTorrents.forEach(row => {
            const currentTrackers = row.original.trackerStats.map(tracker => tracker.announce);
            const updatedTrackers = currentTrackers.map(tracker =>
                tracker.toLowerCase() === oldTracker.toLowerCase() ? newTracker : tracker
            );

            setTorrentTracker.mutate({
                ids: [row.original.id],
                trackerList: updatedTrackers
            });
        });
    };

    const isFormValid = oldTracker && newTracker && oldTracker !== newTracker && matchedTorrents.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Replace Tracker")}</DialogTitle>
                    <DialogDescription>
                        {t("Enter the tracker URL to search and replace across torrents")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="old-tracker">{t("Search Tracker")}</Label>
                        <InputWithDropdown
                            id="old-tracker"
                            value={oldTracker}
                            onChange={setOldTracker}
                            options={allTrackers}
                            placeholder={t("Enter tracker URL to search")}
                        />
                    </div>

                    {oldTracker.trim() && (
                        <div className="space-y-2">
                            <Label>
                                {t("Matched Torrents")}
                                <Badge variant="secondary" className="ml-2">
                                    {matchedTorrents.length}
                                </Badge>
                            </Label>
                            {matchedTorrents.length > 0 ? (
                                <div className="h-32 border rounded-md p-3 overflow-y-auto">
                                    <div className="space-y-1">
                                        {matchedTorrents.map((row, index) => (
                                            <div key={row.original.id} className="text-sm">
                                                <span className="font-medium">{index + 1}.</span> {row.original.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground border rounded-md p-3">
                                    {t("No torrents found with this tracker")}
                                </div>
                            )}
                        </div>
                    )}

                    {matchedTorrents.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="new-tracker">{t("New Tracker")}</Label>
                            <InputWithDropdown
                                id="new-tracker"
                                value={newTracker}
                                onChange={setNewTracker}
                                options={trackers}
                                placeholder={t("Enter the new tracker URL")}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!isFormValid}
                        >
                            {t("Replace {{count}} Torrents", { count: matchedTorrents.length })}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
