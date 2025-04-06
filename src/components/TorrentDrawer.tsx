import { Button } from "@/components/ui/button"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { torrentSchema} from "../schemas/torrentSchema"
import { getTorrents, singleTorrentFields } from "@/lib/transmissionClient"
import { GetTorrentResponse } from "@/lib/types"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import dayjs from "dayjs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { filesize } from "filesize"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

function ButtonSquare({ active = false }: { active?: boolean }) {
    return (
        <div
            className={cn(
                "w-5 h-5 rounded-md transition-transform duration-150 active:scale-80",
                active ? "bg-primary" : "bg-muted"
            )}
        />
    )
}

export function TorrentDrawer({ item }: { item: torrentSchema }) {
    const isMobile = useIsMobile()
    const [open, setOpen] = useState(false)

    const { t } = useTranslation()

    const { data: torrentData } = useQuery<GetTorrentResponse | null>({
        queryKey: ['torrent', item.id],
        queryFn: () => getTorrents({ ids: [item.id], fields: singleTorrentFields }),
        refetchInterval: 5000,
        enabled: open
    })

    return (
        <Drawer direction={isMobile ? "bottom" : "right"} open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="link" className="text-foreground max-w-[600px] truncate px-0 text-left justify-start" onClick={(e) => e.currentTarget.blur()}>
                    {item.name}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="w-full !max-w-5xl flex flex-col h-full overflow-hidden">
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="break-words whitespace-pre-wrap max-w-full">{item.name}</DrawerTitle>
                </DrawerHeader>
                <Tabs defaultValue="info" className="px-4 text-sm w-full flex-1 min-h-0 flex flex-col">
                    <TabsList className="mb-4 w-full grid grid-cols-4 gap-2">
                        <TabsTrigger value="info">{t("Info")}</TabsTrigger>
                        <TabsTrigger value="peers">{t("Peers")}</TabsTrigger>
                        <TabsTrigger value="trackers">{t("Trackers")}</TabsTrigger>
                        <TabsTrigger value="files">{t("Files")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="overflow-y-auto flex-1 min-h-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t("Save Path")}</span>
                                <span className="text-foreground font-medium break-all">{item.downloadDir}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t("Size")}</span>
                                <span className="text-foreground font-medium">{filesize(item.totalSize)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t("Hash")}</span>
                                <span className="text-foreground font-medium break-all">{torrentData?.torrents[0].hashString ?? '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t("Added At")}</span>
                                <span className="text-foreground font-medium">{dayjs.unix(item.addedDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t("Creator")}</span>
                                <span className="text-foreground font-medium break-all">{torrentData?.torrents[0].creator ?? '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t("Created At")}</span>
                                <span className="text-foreground font-medium">{torrentData?.torrents[0].addedDate ? dayjs.unix(torrentData?.torrents[0].addedDate).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
                            </div>
                            <div className="flex flex-col sm:col-span-2">
                                <span className="text-muted-foreground">{t("Comment")}</span>
                                <span className="text-foreground font-medium break-words">{torrentData?.torrents[0].comment ?? '-'}</span>
                            </div>
                            <div className="flex flex-col sm:col-span-2">
                                {torrentData?.torrents?.[0]?.pieces && torrentData?.torrents?.[0]?.pieceCount && (() => {
                                    const bitsRaw = Array.from(atob(torrentData.torrents[0].pieces))
                                        .flatMap((char) => char.charCodeAt(0).toString(2).padStart(8, '0').split(''))
                                    const pieceCount = torrentData.torrents[0].pieceCount
                                    const bitsArray = bitsRaw.slice(0, pieceCount)

                                    const fixedCount = 300

                                    const compactBits = Array.from({ length: fixedCount }, (_, i) => {
                                        const start = Math.floor(i * pieceCount / fixedCount);
                                        const end = Math.floor((i + 1) * pieceCount / fixedCount);
                                        const group = bitsArray.slice(start, end);
                                        return group.length > 0 && group.every(b => b == '1') ? '1' : '0'; // 兼容数字和字符串
                                    });

                                    return (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap gap-1">
                                                {compactBits.map((bit, index) => (
                                                    <ButtonSquare key={index} active={bit === '1'} />
                                                ))}
                                            </div>
                                            <span className="text-xs text-muted-foreground mt-1">
                                                {t("Total Pieces")}: {pieceCount} | {t("Displayed Blocks")}: {compactBits.length}
                                            </span>
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="peers" className="overflow-y-auto flex-1 min-h-0">
                        {torrentData?.torrents?.[0].peers?.length ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("IP Address")}</TableHead>
                                        <TableHead className="text-right">{t("Port")}</TableHead>
                                        <TableHead className="text-center">{t("uTP")}</TableHead>
                                        <TableHead>{t("Client")}</TableHead>
                                        <TableHead>{t("Flags")}</TableHead>
                                        <TableHead className="text-right">{t("Progress")}</TableHead>
                                        <TableHead className="text-right">{t("Download")}</TableHead>
                                        <TableHead className="text-right">{t("Upload")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {torrentData.torrents[0].peers.map((peer, index) => {
                                        const progress = (peer.progress * 100).toFixed(1)
                                        return (
                                            <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/40' : ''}>
                                                <TableCell>{peer.address}</TableCell>
                                                <TableCell className="text-right">{peer.port}</TableCell>
                                                <TableCell className="text-center">{peer.isUTP ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{peer.clientName}</TableCell>
                                                <TableCell>{peer.flagStr}</TableCell>
                                                <TableCell className="text-right">{progress}%</TableCell>
                                                <TableCell className="text-right">{filesize(peer.rateToClient)}/s</TableCell>
                                                <TableCell className="text-right">{filesize(peer.rateToPeer)}/s</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t("No peer data available.")}</p>
                        )}
                    </TabsContent>
                    <TabsContent value="trackers">
                        {torrentData?.torrents?.[0].trackerStats.length ? (
                            <div className="flex flex-col gap-4">
                                {torrentData.torrents[0].trackerStats.map((tracker) => (
                                    <Card key={tracker.id}>
                                        <CardHeader>
                                            <CardTitle className="text-base font-semibold">{tracker.host}</CardTitle>
                                            <CardDescription className="text-sm text-muted-foreground">{tracker.announce}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-foreground">{t("Last Announce")}:</span>
                                                <span>{t(tracker.lastAnnounceResult)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-foreground">{t("Announce Time")}:</span>
                                                <span>{dayjs.unix(tracker.lastAnnounceTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-foreground">{t("Seeders")}:</span>
                                                <span>{tracker.seederCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-foreground">{t("Leechers")}:</span>
                                                <span>{tracker.leecherCount}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t("No tracker data available.")}</p>
                        )}
                    </TabsContent>
                    <TabsContent value="files" className="overflow-y-auto flex-1 min-h-0">
                        {torrentData?.torrents?.[0].files?.length ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-2/5">{t("Name")}</TableHead>
                                        <TableHead className="text-right w-1/5">{t("Size")}</TableHead>
                                        <TableHead className="text-right w-2/5">{t("Progress")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {torrentData.torrents[0].files.map((file, index) => {
                                        const percent = file.length === 0 ? 0 : (file.bytesCompleted / file.length) * 100
                                        return (
                                            <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/40' : ''}>
                                                <TableCell className="whitespace-pre-wrap break-all">{file.name}</TableCell>
                                                <TableCell className="text-right">{filesize(file.length)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full"
                                                            style={{ width: `${percent}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">{percent.toFixed(1)}%</div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t("No files available.")}</p>
                        )}
                    </TabsContent>
                </Tabs>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">{t("Close")}</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}