import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { filesize } from "filesize"
import { FreeSpace, SessionStats, TransmissionSession } from "@/lib/types"
import { useTranslation } from "react-i18next"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";


export function SectionCards({ data, session, freespace }: { data: SessionStats, session: TransmissionSession, freespace: FreeSpace }) {
  const { t } = useTranslation()
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("Upload Speed")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {filesize(data?.uploadSpeed || 0)} /s
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex justify-between w-full font-medium">
            <span>{t("Session Upload Size")}</span>
            <span>{filesize(data?.["current-stats"]?.uploadedBytes || 0)}</span>
          </div>
          <div className="line-clamp-1 flex justify-between w-full font-medium">
            <span>{t("Total Upload Size")}</span>
            <span>{filesize(data?.["cumulative-stats"]?.uploadedBytes || 0)}</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("Download Speed")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {filesize(data?.downloadSpeed || 0)} /s
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex justify-between w-full font-medium">
            <span>{t("Session Download")}</span>
            <span>{filesize(data?.["current-stats"]?.downloadedBytes || 0)}</span>
          </div>
          <div className="line-clamp-1 flex justify-between w-full font-medium">
            <span>{t("Total Download")}</span>
            <span>{filesize(data?.["cumulative-stats"]?.downloadedBytes || 0)}</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("Active Torrents")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.activeTorrentCount || 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex justify-between w-full font-medium">
            <span>{t("Total Torrents")}</span>
            <span>{data?.torrentCount || 0}</span>
          </div>
          <div className="line-clamp-1 flex justify-between w-full font-medium">
            <span>{t("Paused Torrents")}</span>
            <span>{data?.pausedTorrentCount || 0}</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("Free Space")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {filesize(freespace["size-bytes"] || 0)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex justify-between w-full font-medium">
            <span>{t("Total Space")}</span>
            <span>{filesize(freespace["total_size"] || 0)}</span>
          </div>
          <div className="line-clamp-1 flex justify-between w-full font-medium gap-x-2">
            <span className="text-nowrap" >{t("Path")}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate text-left [direction:rtl]">{session["download-dir"]}</span>
                </TooltipTrigger>
                <TooltipContent>
                  {session["download-dir"]}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
