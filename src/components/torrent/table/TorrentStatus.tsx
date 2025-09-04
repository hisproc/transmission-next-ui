import {useTranslation} from "react-i18next";
import {IconAlertTriangle, IconClock, IconDownload, IconLoader, IconPlayerStop, IconUpload} from "@tabler/icons-react";

export function TorrentStatus({ error, status }: { error: number; status: number }) {
    const { t } = useTranslation()
    if (error !== 0) {
        return (
            <>
                <IconAlertTriangle className="text-red-500" />
                {t("Error")}
            </>
        )
    }

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
    )
}
