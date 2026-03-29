import { useState, useEffect, useCallback, Suspense } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Clock,
  Play,
  Pause,
  Square,
  Trash2,
  Server,
  HardDrive,
  Shield,
  Calendar,
  Layers,
  Globe,
  Share2,
  Users,
  FileText,
  Activity,
  Info,
  ExternalLink,
  MapPin,
  Tag
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { rpc } from "@/lib/rpc-client"
import { useI18n } from "@/lib/i18n-context"
import { useAppSettings } from "@/lib/app-settings-context"
import { type Torrent, TorrentStatus } from "@/lib/rpc-types"
import { formatSize, formatSpeed, formatDuration, getStatusLabel } from "@/lib/formatters"

function TorrentDetailsContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const idValue = searchParams.get('id')
  const [activeTab, setActiveTab] = useState("general")
  const [torrent, setTorrent] = useState<Torrent | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!idValue) return
    try {
      const id = isNaN(Number(idValue)) ? idValue : Number(idValue)

      const torrentsData = await rpc.getTorrents([
        "id", "name", "status", "totalSize", "percentDone",
        "rateDownload", "rateUpload", "eta", "addedDate",
        "hashString", "downloadDir", "comment", "isPrivate",
        "creator", "dateCreated", "uploadedEver", "downloadedEver",
        "uploadRatio", "peersConnected", "peersGettingFromUs",
        "peersSendingToUs", "trackers", "files", "peers", "labels",
        "trackerStats"
      ], [id])

      if (torrentsData.torrents.length > 0) {
        setTorrent(torrentsData.torrents[0])
      }
    } catch (err) {
      console.error("Failed to fetch torrent details:", err)
    } finally {
      setLoading(false)
    }
  }, [idValue])

  const { refreshInterval, autoRefresh } = useAppSettings()

  useEffect(() => {
    fetchData()
    if (!autoRefresh) return

    const timer = setInterval(fetchData, refreshInterval)
    return () => clearInterval(timer)
  }, [fetchData, refreshInterval, autoRefresh])

  if (loading && !torrent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading torrent details...</p>
        </div>
      </div>
    )
  }

  if (!torrent || !idValue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="bg-muted p-6 rounded-full">
          <Layers className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Torrent Not Found</h2>
          <p className="text-muted-foreground max-w-xs mx-auto mt-2">The torrent you're looking for might have been removed or doesn't exist.</p>
        </div>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl px-8">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    )
  }

  const tor = torrent;

  const isStopped = tor.status === TorrentStatus.STOPPED;

  const handleToggleStatus = async () => {
    if (isStopped) {
      await rpc.startTorrents([tor.id])
    } else {
      await rpc.stopTorrents([tor.id])
    }
    fetchData()
  }

  const handleRemove = async () => {
    if (confirm(t('common.confirm_remove', 'Are you sure you want to remove this torrent?'))) {
      await rpc.removeTorrents([tor.id])
      navigate("/")
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 overflow-hidden">
          <div className="flex items-start gap-4 flex-1 min-w-0 pl-1">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-sm hover:translate-x-[-2px] transition-transform shrink-0"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <h1 className="text-xl md:text-3xl font-semibold tracking-tight truncate max-w-full" title={tor.name}>{tor.name}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] md:text-xs font-semibold uppercase tracking-widest ${tor.status === TorrentStatus.DOWNLOAD ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" :
                  tor.status === TorrentStatus.SEED ? "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400" :
                    "bg-muted text-muted-foreground"
                  }`}>
                  {t(getStatusLabel(tor.status))}
                </span>
              </div>
              <p className="text-[10px] md:text-sm text-muted-foreground font-medium tracking-tight mt-1 opacity-70 truncate font-mono">
                HASH: {tor.hashString}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            <Button variant="default" size="sm" className="flex-1 lg:flex-none rounded-xl font-medium h-12 px-6 shadow-lg shadow-primary/20" onClick={handleToggleStatus}>
              {isStopped ? (
                <><Play className="h-4 w-4 mr-2" /> {t('common.resume', 'Start')}</>
              ) : (
                <><Square className="h-4 w-4 mr-2 fill-current" /> {t('common.pause', 'Stop')}</>
              )}
            </Button>
            <Button variant="outline" size="sm" className="flex-1 lg:flex-none rounded-xl font-medium h-12 px-6 bg-background dark:border-white/10" onClick={handleRemove}>
              <Trash2 className="h-4 w-4 mr-2 text-destructive" /> {t('common.remove', 'Remove')}
            </Button>
          </div>
        </div>

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-md border-none bg-sidebar/40 py-0 flex flex-col overflow-hidden">
            <CardHeader className="pt-4 pb-2 border-b border-muted/20 px-4">
              <CardTitle className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" /> {t('common.progress')}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 md:py-6 flex flex-col gap-2 px-4">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl md:text-3xl font-medium text-primary">{(tor.percentDone * 100).toFixed(1)}%</span>
                <span className="text-[10px] md:text-xs font-medium text-muted-foreground">{formatSize(tor.downloadedEver)} / {formatSize(tor.totalSize)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 md:h-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${tor.percentDone * 100}%` }}></div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-none bg-sidebar/40 py-0 flex flex-col overflow-hidden">
            <CardHeader className="pt-4 pb-2 border-b border-muted/20 px-4">
              <CardTitle className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ArrowDown className="h-3.5 w-3.5 text-green-500" /> {t('common.status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 md:py-6 flex flex-col gap-1 px-4">
              <div className="text-2xl md:text-3xl font-medium text-green-500">{formatSpeed(tor.rateDownload)}</div>
              <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-muted-foreground uppercase">
                <ArrowUp className="h-3 w-3 text-blue-500" /> {formatSpeed(tor.rateUpload)} {t('stats.upload_speed')}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-none bg-sidebar/40 py-0 flex flex-col overflow-hidden">
            <CardHeader className="pt-4 pb-2 border-b border-muted/20 px-4">
              <CardTitle className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> {t('details.remaining_time')}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 md:py-6 px-4">
              <div className="text-2xl md:text-3xl font-medium">{formatDuration(tor.eta)}</div>
              <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase mt-1">{t('details.estimating_completion')}</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-none bg-sidebar/40 py-0 flex flex-col overflow-hidden">
            <CardHeader className="pt-4 pb-2 border-b border-muted/20 px-4">
              <CardTitle className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> {t('details.connections')}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 md:py-6 flex flex-col gap-1 px-4">
              <div className="text-2xl md:text-3xl font-medium">{tor.peersConnected} <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">{t('details.peer_count')}</span></div>
              <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-muted-foreground uppercase">
                <Server className="h-3 w-3" /> {tor.peersSendingToUs} {t('details.seeds_active')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Details Sections with Tabs-like Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-2xl w-full border border-muted/20 backdrop-blur-sm sm:self-start overflow-x-auto no-scrollbar">
          <Button
            variant={activeTab === "general" ? "secondary" : "ghost"}
            className={`flex-1 min-w-[90px] rounded-xl px-2 py-4 md:py-6 font-medium uppercase text-[10px] md:text-xs tracking-widest transition-all duration-300 shrink-0 ${activeTab === "general"
              ? "bg-background shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-muted/50 text-primary scale-[1.01]"
              : "text-muted-foreground hover:bg-muted/40 hover:scale-[1.01]"
              }`}
            onClick={() => setActiveTab("general")}
          >
            <Info className="h-3.5 w-3.5 md:mr-2" /> <span className="hidden md:inline">{t('details.general')}</span>
          </Button>
          <Button
            variant={activeTab === "files" ? "secondary" : "ghost"}
            className={`flex-1 min-w-[90px] rounded-xl px-2 py-4 md:py-6 font-medium uppercase text-[10px] md:text-xs tracking-widest transition-all duration-300 shrink-0 ${activeTab === "files"
              ? "bg-background shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-muted/50 text-primary scale-[1.01]"
              : "text-muted-foreground hover:bg-muted/40 hover:scale-[1.01]"
              }`}
            onClick={() => setActiveTab("files")}
          >
            <FileText className="h-3.5 w-3.5 md:mr-2" /> <span className="hidden md:inline">{t('details.files')}</span>
          </Button>
          <Button
            variant={activeTab === "trackers" ? "secondary" : "ghost"}
            className={`flex-1 min-w-[90px] rounded-xl px-2 py-4 md:py-6 font-medium uppercase text-[10px] md:text-xs tracking-widest transition-all duration-300 shrink-0 ${activeTab === "trackers"
              ? "bg-background shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-muted/50 text-primary scale-[1.01]"
              : "text-muted-foreground hover:bg-muted/40 hover:scale-[1.01]"
              }`}
            onClick={() => setActiveTab("trackers")}
          >
            <Globe className="h-3.5 w-3.5 md:mr-2" /> <span className="hidden md:inline">{t('details.trackers')}</span>
          </Button>
          <Button
            variant={activeTab === "peers" ? "secondary" : "ghost"}
            className={`flex-1 min-w-[90px] rounded-xl px-2 py-4 md:py-6 font-medium uppercase text-[10px] md:text-xs tracking-widest transition-all duration-300 shrink-0 ${activeTab === "peers"
              ? "bg-background shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-muted/50 text-primary scale-[1.01]"
              : "text-muted-foreground hover:bg-muted/40 hover:scale-[1.01]"
              }`}
            onClick={() => setActiveTab("peers")}
          >
            <Users className="h-3.5 w-3.5 md:mr-2" /> <span className="hidden md:inline">{t('details.peers')}</span>
          </Button>
        </div>

        {/* Tab Content */}
        <Card className="shadow-2xl border-none overflow-hidden bg-card/60 backdrop-blur-lg min-h-[400px] border border-muted/10 py-0">
          <CardContent className="p-0 overflow-x-auto no-scrollbar">
            {activeTab === "general" && (
              <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-muted/10 pb-2">
                      {t('details.metadata')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                        <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> {t('details.added_date')}</span>
                        <span className="text-xs md:text-sm font-medium">{new Date(tor.addedDate * 1000).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                        <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><Layers className="h-4 w-4" /> {t('details.comment')}</span>
                        <span className="text-xs md:text-sm font-medium italic break-all">{tor.comment || t('common.none', 'None')}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                        <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><Shield className="h-4 w-4" /> {t('details.privacy')}</span>
                        <span className="text-xs md:text-sm font-medium">{tor.isPrivate ? t('details.private_torrent') : t('details.public_torrent')}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                        <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><Tag className="h-4 w-4" /> {t('common.labels')}</span>
                        <div className="flex flex-wrap gap-1.5 sm:justify-end">
                          {(tor.labels && tor.labels.length > 0) && (
                            tor.labels.map((l: string, i: number) => {
                              let text = l;
                              try {
                                const parsed = JSON.parse(l);
                                text = typeof parsed === 'object' && parsed !== null && 'text' in parsed ? parsed.text : l;
                              } catch {
                                text = l;
                              }
                              return (
                                <span key={i} className="text-xs md:text-sm font-medium p-1 px-2 bg-muted rounded-lg w-fit whitespace-nowrap">
                                  {text}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-muted/10 pb-2">
                      {t('details.creation')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                        <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><Server className="h-4 w-4" /> {t('details.created_by')}</span>
                        <span className="text-xs md:text-sm font-medium">{tor.creator || t('common.unknown', 'Unknown')}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                        <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> {t('details.creation_date')}</span>
                        <span className="text-xs md:text-sm font-medium">{tor.dateCreated ? new Date(tor.dateCreated * 1000).toLocaleDateString() : t('common.unknown', 'Unknown')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-muted/10 pb-2">
                    {t('details.storage_ratio')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                      <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><HardDrive className="h-4 w-4" /> {t('details.download_location')}</span>
                      <span className="text-xs md:text-sm font-medium group-hover:text-primary transition-colors cursor-pointer break-all text-left sm:text-right">{tor.downloadDir}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                      <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><ArrowDown className="h-4 w-4" /> {t('details.total_downloaded')}</span>
                      <span className="text-xs md:text-sm font-medium text-green-500">{formatSize(tor.downloadedEver)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                      <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><ArrowUp className="h-4 w-4" /> {t('details.total_uploaded')}</span>
                      <span className="text-xs md:text-sm font-medium text-blue-500">{formatSize(tor.uploadedEver)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group gap-1 sm:gap-4">
                      <span className="text-[11px] md:text-sm font-medium text-muted-foreground flex items-center gap-2"><Share2 className="h-4 w-4" /> {t('details.share_ratio')}</span>
                      <span className="text-xs md:text-sm font-medium p-1 px-2 bg-muted rounded-lg w-fit">{tor.uploadRatio.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 min-w-[700px] md:min-w-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="pl-6 md:pl-8 h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest">{t('details.file_name')}</TableHead>
                      <TableHead className="h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest text-right">{t('common.size', 'Size')}</TableHead>
                      <TableHead className="h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest">{t('common.progress')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tor.files?.map((file: any, idx: number) => {
                      const progress = (file.bytesCompleted / file.length * 100).toFixed(1)
                      return (
                        <TableRow key={idx} className="hover:bg-muted/30 transition-colors border-b last:border-0 border-muted/30 group">
                          <TableCell className="font-medium pl-6 md:pl-8 py-4 flex items-center gap-3">
                            <FileText className="h-4 w-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                            <span className="truncate max-w-[400px]">{file.name}</span>
                          </TableCell>
                          <TableCell className="font-medium text-right tabular-nums text-xs">{formatSize(file.length)}</TableCell>
                          <TableCell className="min-w-[150px] md:min-w-[200px] pr-8">
                            <div className="flex items-center gap-3">
                              <div className="w-full bg-muted rounded-full h-1 md:h-1.5 overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="text-[10px] md:text-xs font-medium w-12">{progress}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === "trackers" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-[700px] md:min-w-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="pl-6 md:pl-8 h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest">{t('details.tracker_url')}</TableHead>
                      <TableHead className="h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest text-right">Seeds</TableHead>
                      <TableHead className="h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest pr-6 md:pr-8 text-right">Peers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tor.trackerStats?.map((tr: any, idx: number) => (
                      <TableRow key={idx} className="hover:bg-muted/30 transition-colors border-b last:border-0 border-muted/30">
                        <TableCell className="font-medium pl-6 md:pl-8 py-4 flex items-center gap-3 group">
                          <Globe className="h-4 w-4 text-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                          <span className="truncate max-w-[200px] md:max-w-[400px] text-xs">{tr.announce}</span>
                          <ExternalLink className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 cursor-pointer" />
                        </TableCell>
                        <TableCell className="font-medium text-right tabular-nums text-xs">{tr.seederCount}</TableCell>
                        <TableCell className="pr-6 md:pr-8 text-right font-medium tabular-nums text-xs">{tr.leecherCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === "peers" && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 min-w-[700px] md:min-w-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="pl-6 md:pl-8 h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest">{t('details.address')}</TableHead>
                      <TableHead className="h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest">{t('details.client')}</TableHead>
                      <TableHead className="h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest text-right">Down</TableHead>
                      <TableHead className="h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest text-right">Up</TableHead>
                      <TableHead className="h-12 uppercase font-medium text-[10px] md:text-xs tracking-widest pr-6 md:pr-8 text-right">{t('common.progress')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tor.peers?.map((peer: any, idx: number) => (
                      <TableRow key={idx} className="hover:bg-muted/30 transition-colors border-b last:border-0 border-muted/30 group">
                        <TableCell className="font-medium pl-6 md:pl-8 py-4 text-xs">{peer.address}</TableCell>
                        <TableCell className="font-normal text-[11px] text-muted-foreground">{peer.clientName}</TableCell>
                        <TableCell className="font-medium text-right text-green-500 text-[10px] md:text-xs tabular-nums">{formatSpeed(peer.rateToClient)}</TableCell>
                        <TableCell className="font-medium text-right text-blue-500 text-[10px] md:text-xs tabular-nums">{formatSpeed(peer.rateToPeer)}</TableCell>
                        <TableCell className="pr-6 md:pr-8 text-right font-medium tabular-nums text-[10px] md:text-xs">{(peer.progress * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function TorrentDetailsPage() {
  return (
    <Suspense fallback={
       <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading torrent details...</p>
        </div>
      </div>
    }>
      <TorrentDetailsContent />
    </Suspense>
  )
}
