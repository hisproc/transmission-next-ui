import {
    addTorrent,
    startTorrent,
    stopTorrent,
    deleteTorrent,
    renamePath,
    setLocation,
    setSession,
    portTest,
    setTorrent
} from "@/lib/api/transmissionClient.ts";
import {PortTestOptions, TransmissionSession} from "@/lib/api/types.ts";
import { fileToBase64 } from "@/lib/utils/utils.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {TorrentLabel} from "@/lib/utils/torrentLabel.ts";


export function useAddTorrent() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async ({ directory, file, filename }: { directory: string; file?: File | null; filename: string | null }) => {
            await addTorrent({
                metainfo: file ? await fileToBase64(file) : undefined,
                filename: filename ? filename : undefined,
                "download-dir": directory,
                paused: false
            });
        },
        onSuccess: () => {
            toast.success(t("Torrent added successfully"), {
                "position": "top-right",
            });
            setTimeout(() => { queryClient.refetchQueries({ queryKey: ["torrent"] }); }, 1000);
        },
        onError: (error) => {
            console.error("Error submitting torrent:", error);
            toast.error(`${t("Failed to add torrent")}: ${error.message}`, {
                "position": "top-right",
            });
        }
    });
}

export function useDeleteTorrent() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async ({ ids, deleteData }: { ids: number[], deleteData: boolean }) => {
            await deleteTorrent({
                ids: ids,
                "delete-local-data": deleteData
            });
        },
        onSuccess: () => {
            toast.success(t("Torrent deleted successfully"), {
                "position": "top-right",
            });
            setTimeout(() => { queryClient.refetchQueries({ queryKey: ["torrent"] }); }, 1000);
        },
        onError: (error) => {
            console.error("Error deleting torrent:", error);
            toast.error(t("Failed to delete torrent"), {
                "position": "top-right",
            });
        }
    });
}

export function useStartTorrent() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async (ids: number[]) => {
            await startTorrent({
                ids: ids,
            });
        },
        onSuccess: () => {
            toast.success(t("Torrent started successfully"), {
                "position": "top-right",
            });
            setTimeout(() => { queryClient.refetchQueries({ queryKey: ["torrent"] }); }, 1000);
        },
        onError: (error) => {
            console.error("Error starting torrent:", error);
            toast.error(t("Failed to start torrent"), {
                "position": "top-right"
            });
        }
    });
}

export function useSetTorrent() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async ({ ids, labels }: { ids: number[]; labels: TorrentLabel[] }) => {
            await setTorrent({
                ids: ids,
                labels: labels.map((label) => JSON.stringify(label))
            });
        },
        onSuccess: () => {
            toast.success(t("Torrent set successfully"), {
                "position": "top-right",
            });
            setTimeout(() => { queryClient.refetchQueries({ queryKey: ["torrent"] }); }, 1000);
        },
        onError: (error) => {
            console.error("Error setting torrent label:", error);
            toast.error(t("Failed to set torrent label"), {
                "position": "top-right"
            });
        }
    });
}

export function useStopTorrent() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async (ids: number[]) => {
            await stopTorrent({
                ids: ids,
            });
        },
        onSuccess: () => {
            toast.success(t("Torrent stopped successfully"), {
                "position": "top-right",
            });
            setTimeout(() => { queryClient.refetchQueries({ queryKey: ["torrent"] }); }, 1000);
        },
        onError: (error) => {
            console.error("Error stopping torrent:", error);
            toast.error(t("Failed to stop torrent"), {
                "position": "top-right"
            }
            );
        }
    });
}

export function useRenamePathTorrent() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async ({ ids, path, name }: { ids: number[]; path: string; name: string }) => {
            await renamePath({
                ids: ids, path: path, name: name
            });
        },
        onSuccess: () => {
            toast.success(t("Torrent path renamed successfully"), {
                "position": "top-right",
            });
            setTimeout(() => { queryClient.refetchQueries({ queryKey: ["torrent"] }); }, 1000);
        },
        onError: (error) => {
            console.error("Error renaming torrent path:", error);
            toast.error(t("Failed to rename torrent path"), {
                "position": "top-right"
            }
            );
        }
    });
}

export function useSetLocationTorrent() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async ({ ids, location, move }: { ids: number[]; location: string; move: boolean }) => {
            await setLocation({
                ids: ids, location: location, move: move
            });
        },
        onSuccess: () => {
            toast.success(t("Torrent location set successfully"), {
                "position": "top-right",
            });
            setTimeout(() => { queryClient.refetchQueries({ queryKey: ["torrent"] }); }, 1000);
        },
        onError: (error) => {
            console.error("Error setting torrent location:", error);
            toast.error(t("Failed to set torrent location"), {
                "position": "top-right"
            }
            );
        }
    });
}

export function useSetSession() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async (options: TransmissionSession) => {
            await setSession(options);
        },
        onSuccess: () => {
            toast.success(t("Session setting saved successfully"), {
                "position": "top-right",
            });
            setTimeout(() => { queryClient.refetchQueries({ queryKey: ["torrent", "session"] }); }, 1000);
        },
        onError: (error) => {
            console.error("Error setting session:", error);
            toast.error(t("Failed to set session"), {
                "position": "top-right"
            }
            );
        }
    });
}

export function usePortTest() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async (options: PortTestOptions) => {
            await portTest(options);
        },
        onSuccess: () => {
            toast.success(t("Port test successfully"), {
                "position": "top-right",
            });
            setTimeout(() => { queryClient.refetchQueries({ queryKey: ["torrent"] }); }, 1000);
        },
        onError: (error) => {
            console.error("Error testing port:", error);
            toast.error(t("Failed to test port"), {
                "position": "top-right"
            }
            );
        }
    });
}