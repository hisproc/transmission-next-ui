import { useTranslation } from "react-i18next";
import { IconAlertTriangle, IconClock, IconDownload, IconLoader, IconPlayerStop, IconUpload } from "@tabler/icons-react";
import { torrentSchema } from "@/schemas/torrentSchema.ts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Badge } from "@/components/ui/badge.tsx";

interface TorrentStatusProps {
    error: number;
    status: number;
    trackerStats?: torrentSchema['trackerStats'];
    errorString?: string;
}

export function getStatusError(error: number, trackerStats?: torrentSchema['trackerStats']) {
    if (error !== 0) {
        return { type: 'system', hasError: true } as const;
    }

    const hasTrackerError = trackerStats &&
        trackerStats.length > 0 &&
        !trackerStats[0].lastAnnounceSucceeded;

    if (hasTrackerError) {
        return { type: 'tracker', hasError: true } as const;
    }

    return { hasError: false } as const;
}


export function TorrentStatus({ error, status, trackerStats, errorString }: TorrentStatusProps) {
    const { t } = useTranslation()

    const errorInfo = getStatusError(error, trackerStats);

    const renderStatusContent = () => {
        if (errorInfo.hasError) {
            if (errorInfo.type === 'system') {
                return (
                    <>
                        <IconAlertTriangle className="text-red-500" />
                        {t("Error")}
                    </>
                );
            } else {
                return (
                    <>
                        <IconAlertTriangle className="text-yellow-500" />
                        {t("Warning")}
                    </>
                );
            }
        }

        // 正常状态处理
        let statusDetails;
        switch (status) {
            case 0:
                statusDetails = { icon: <IconPlayerStop className="text-red-500" />, text: t("Stopped") };
                break;
            case 1:
                statusDetails = { icon: <IconClock className="text-yellow-500" />, text: t("Queued") };
                break;
            case 2:
                statusDetails = { icon: <IconLoader className="animate-spin text-blue-500" />, text: t("Verifying") };
                break;
            case 3:
                statusDetails = { icon: <IconClock className="text-yellow-500" />, text: t("Queued") };
                break;
            case 4:
                statusDetails = { icon: <IconDownload className="text-green-500" />, text: t("Downloading") };
                break;
            case 5:
                statusDetails = { icon: <IconClock className="text-yellow-500" />, text: t("Queued") };
                break;
            case 6:
                statusDetails = { icon: <IconUpload className="text-purple-500" />, text: t("Seeding") };
                break;
            default:
                statusDetails = { icon: null, text: t("Unknown") };
        }

        return (
            <>
                {statusDetails.icon}
                {statusDetails.text}
            </>
        );
    };

    if (!errorInfo.hasError) {
        return (
            <Badge variant="outline" className="min-w-[120px] justify-start text-muted-foreground px-1.5 text-sm">
                {renderStatusContent()}
            </Badge>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className="min-w-[120px] justify-start text-muted-foreground px-1.5 text-sm">
                        {renderStatusContent()}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" sideOffset={5}>
                    <p>
                        {errorInfo.type === 'system'
                            ? errorString
                            : trackerStats?.[0]?.lastAnnounceResult
                        }
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
