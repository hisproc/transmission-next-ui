"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardAction } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  ArrowDown, 
  ArrowUp, 
  Activity, 
  Database, 
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  LayoutGrid, 
  List,
  Check,
  CheckSquare,
  Square,
  X,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Pencil,
  Filter,
  Globe,
  ChevronDown,
  ChevronUp,
  History,
  Tag,
  RefreshCw,
  Wrench
} from "lucide-react"
import { AddTorrentDialog } from "@/components/add-torrent-dialog"
import { EditTorrentDialog } from "@/components/edit-torrent-dialog"
import { BatchReplaceTrackerDialog } from "@/components/batch-replace-tracker-dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { useI18n } from "@/lib/i18n-context"
import { useSearch } from "@/lib/search-context"
import { useAppSettings } from "@/lib/app-settings-context"
import { rpc } from "@/lib/rpc-client"
import type { Torrent, SessionStats } from "@/lib/rpc-types"
import { formatSize, formatSpeed, formatDuration, getStatusLabel, formatSizeParts, splitSpeed } from "@/lib/formatters"

interface TorrentViewProps {
  title?: string
  statusFilter?: string
  showStats?: boolean
}

export function TorrentView({ title, statusFilter, showStats = true }: TorrentViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [torrents, setTorrents] = useState<Torrent[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [freeSpace, setFreeSpace] = useState<{ path: string, "size-bytes": number, total_size: number } | null>(null)
  const { t } = useI18n()
  const { searchQuery } = useSearch()
  const [trackerFilter, setTrackerFilter] = useState<string[]>([])
  const [dirFilter, setDirFilter] = useState<string[]>([])
  const [labelFilter, setLabelFilter] = useState<string[]>([])
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBatchReplaceOpen, setIsBatchReplaceOpen] = useState(false)
  const [idsToDelete, setIdsToDelete] = useState<number[]>([])
  const [deleteLocalData, setDeleteLocalData] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('isStatsCollapsed')
    if (saved !== null) {
      setIsStatsCollapsed(saved === 'true')
    }
  }, [])

  const toggleStats = () => {
    const newVal = !isStatsCollapsed
    setIsStatsCollapsed(newVal)
    localStorage.setItem('isStatsCollapsed', String(newVal))
  }

  const trackers = useMemo(() => {
    const hosts = new Set<string>()
    torrents.forEach(tor => {
      tor.trackerStats?.forEach(ts => {
        if (ts.host) hosts.add(ts.host)
      })
    })
    return Array.from(hosts).sort()
  }, [torrents])

  const downloadDirs = useMemo(() => {
    const dirs = new Set<string>()
    torrents.forEach(tor => {
      if (tor.downloadDir) dirs.add(tor.downloadDir)
    })
    return Array.from(dirs).sort()
  }, [torrents])

  const availableLabels = useMemo(() => {
    const labelSet = new Set<string>()
    torrents.forEach(tor => {
      tor.labels?.forEach(l => {
        try {
          const parsed = JSON.parse(l);
          const text = typeof parsed === 'object' && parsed !== null && 'text' in parsed ? parsed.text : l;
          if (text) labelSet.add(text)
        } catch {
          if (l) labelSet.add(l)
        }
      })
    })
    return Array.from(labelSet).sort()
  }, [torrents])

  const totalDownloadSpeed = useMemo(() => 
    torrents.reduce((acc, tor) => acc + (tor.rateDownload || 0), 0)
  , [torrents])

  const totalUploadSpeed = useMemo(() => 
    torrents.reduce((acc, tor) => acc + (tor.rateUpload || 0), 0)
  , [torrents])
  
  const fetchData = useCallback(async () => {
    try {
      const torrentFields = [
        "id", "name", "status", "totalSize", "percentDone", 
        "rateDownload", "rateUpload", "eta", "error", 
        "errorString", "downloadDir", "uploadedEver", 
        "downloadedEver", "uploadRatio", "trackerStats", "labels"
      ]
      
      const torrentsData = await rpc.getTorrents(torrentFields)
      setTorrents(torrentsData.torrents)
      
      if (showStats) {
        const [statsData, sessionData] = await Promise.all([
          rpc.getStats(),
          rpc.getSession()
        ])
        setStats(statsData)
        
        if (sessionData["download-dir"]) {
          try {
            const freeData = await rpc.freeSpace(sessionData["download-dir"])
            setFreeSpace(freeData)
          } catch (e) {
            console.error("Failed to fetch free space:", e)
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch Transmission data:", err)
    }
  }, [showStats])

  const handleBatchAction = async (action: "start" | "stop" | "remove") => {
    if (selectedIds.length === 0) return
    
    const count = selectedIds.length
    try {
      if (action === "start") {
        await rpc.startTorrents(selectedIds)
        toast.success(t('common.resume_success', 'Success'), {
          description: t('common.resume_desc', 'Selected torrents started')
        })
      } else if (action === "stop") {
        await rpc.stopTorrents(selectedIds)
        toast.info(t('common.pause_success', 'Tasks Stopped'), {
          description: t('common.pause_desc', 'Selected torrents stopped')
        })
      } else if (action === "remove") {
        setIdsToDelete(selectedIds)
        setDeleteLocalData(false)
        setIsDeleteDialogOpen(true)
        return // Handle in confirmDelete
      }
      
      setSelectedIds([])
      fetchData()
    } catch (err) {
      toast.error(t('common.action_failed', 'Action Failed'))
    }
  }

  const confirmDelete = async () => {
    try {
      await rpc.removeTorrents(idsToDelete, deleteLocalData)
      toast.success(t('common.remove_success', 'Removed'), {
        description: t('common.remove_desc', 'Selected torrents deleted')
      })
      if (idsToDelete.length > 1) {
        setSelectedIds([])
      } else {
        setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)))
      }
      setIsDeleteDialogOpen(false)
      setIdsToDelete([])
      setDeleteLocalData(false)
      fetchData()
    } catch (err) {
      toast.error(t('common.action_failed', 'Action Failed'))
    }
  }

  const handleSingleAction = async (id: number, action: "start" | "stop" | "remove") => {
    try {
      if (action === "start") {
        await rpc.startTorrents([id])
        toast.success(t('common.resume_success', 'Resumed'))
      } else if (action === "stop") {
        await rpc.stopTorrents([id])
        toast.info(t('common.pause_success', 'Stopped'))
      } else if (action === "remove") {
        setIdsToDelete([id])
        setDeleteLocalData(false)
        setIsDeleteDialogOpen(true)
        return // Handle in confirmDelete
      }
      fetchData()
    } catch (err) {
      toast.error(t('common.action_failed', 'Action Failed'))
    }
  }

  const { refreshInterval, autoRefresh } = useAppSettings()

  useEffect(() => {
    fetchData()
    if (!autoRefresh) return
    
    const timer = setInterval(fetchData, refreshInterval)
    return () => clearInterval(timer)
  }, [fetchData, refreshInterval, autoRefresh])

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    if (direction === null) {
      setSortConfig(null);
    } else {
      setSortConfig({ key, direction });
    }
  }

  const toggleTracker = (host: string) => {
    setTrackerFilter(prev => 
      prev.includes(host) 
        ? prev.filter(h => h !== host) 
        : [...prev, host]
    )
  }

  const toggleDir = (path: string) => {
    setDirFilter(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path]
    )
  }

  const toggleLabel = (label: string) => {
    setLabelFilter(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    )
  }

  const statusFiltered = statusFilter 
    ? torrents.filter(tor => {
        const filter = statusFilter.toLowerCase()
        if (filter === 'active') {
          return tor.rateDownload > 0 || tor.rateUpload > 0
        }
        if (filter === 'downloading') {
          return tor.status === 4 || tor.status === 3 || tor.status === 2 || tor.status === 1
        }
        if (filter === 'seeding') {
          return tor.status === 6 || tor.status === 5
        }
        if (filter === 'stopped' || filter === 'paused') {
          return tor.status === 0
        }
        // Fallback to text matching
        const statusText = t(getStatusLabel(tor.status)).toLowerCase()
        return statusText.includes(filter)
      })
    : torrents;

  const trackerFiltered = trackerFilter.length > 0
    ? statusFiltered.filter(tor => 
        tor.trackerStats?.some(ts => trackerFilter.includes(ts.host))
      )
    : statusFiltered;

  const dirFiltered = dirFilter.length > 0
    ? trackerFiltered.filter(tor => dirFilter.includes(tor.downloadDir))
    : trackerFiltered;

  const labelFiltered = labelFilter.length > 0
    ? dirFiltered.filter(tor => 
        tor.labels?.some(l => {
          try {
            const parsed = JSON.parse(l);
            const text = typeof parsed === 'object' && parsed !== null && 'text' in parsed ? parsed.text : l;
            return labelFilter.includes(text)
          } catch {
            return labelFilter.includes(l)
          }
        })
      )
    : dirFiltered;

  const filteredTorrents = searchQuery
    ? labelFiltered.filter(tor => tor.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : labelFiltered;

  const sortedTorrents = [...filteredTorrents].sort((a: any, b: any) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let valA = a[key];
    let valB = b[key];

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTorrents.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredTorrents.map(t => t.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    )
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return <ArrowDownCircle className="ml-1 h-3 w-3 opacity-20" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUpCircle className="ml-1 h-3 w-3 text-primary" /> 
      : <ArrowDownCircle className="ml-1 h-3 w-3 text-primary" />;
  }

  const handleGlobalAction = async (action: "start" | "stop") => {
    try {
      if (action === "start") {
        await rpc.startTorrents([])
        toast.success(t('common.resume_all_success', 'All tasks started'))
      } else {
        await rpc.stopTorrents([])
        toast.info(t('common.pause_all_success', 'All tasks stopped'))
      }
      fetchData()
    } catch (err) {
      toast.error(t('common.action_failed', 'Action failed'))
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      {showStats && stats && (
        <div className="p-2 md:p-2.5 bg-muted/20 backdrop-blur-xl rounded-[2.5rem] border border-muted/30 shadow-sm animate-in slide-in-from-top-4 duration-500 ease-out mb-2">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {/* Download Speed */}
            <div className="flex items-center gap-3 p-4 rounded-[2rem] bg-background/40 border border-muted/5 hover:bg-background/60 transition-all group shrink-0 overflow-hidden shadow-none cursor-default">
              <div className="h-10 w-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shrink-0 shadow-sm group-hover:shadow-green-500/20">
                <ArrowDown className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[11px] uppercase font-bold tracking-widest text-muted-foreground/50 leading-none mb-1.5 group-hover:text-green-500/80 transition-colors uppercase">{t('stats.download_speed')}</p>
                <div className="flex items-center justify-between gap-1 overflow-hidden h-7">
                  <span className="text-lg font-extrabold tracking-tight truncate group-hover:scale-[1.02] transition-transform origin-left">{formatSpeed(totalDownloadSpeed)}</span>
                  <div className="block lg:hidden xl:block relative h-4 overflow-hidden flex-1 text-right">
                    <div className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-4">
                      <span className="text-[11px] text-muted-foreground/60 font-medium whitespace-nowrap h-4 flex items-center justify-end gap-1">
                        {t('stats.session_badge')}: {formatSize(stats["current-stats"].downloadedBytes)}
                      </span>
                      <span className="text-[11px] text-green-500/80 font-bold whitespace-nowrap h-4 flex items-center justify-end gap-1 translate-y-0">
                         {t('stats.history_badge')}: {formatSize(stats["cumulative-stats"].downloadedBytes)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Speed */}
            <div className="flex items-center gap-3 p-4 rounded-[2rem] bg-background/40 border border-muted/5 hover:bg-background/60 transition-all group shrink-0 overflow-hidden shadow-none cursor-default">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shrink-0 shadow-sm group-hover:shadow-blue-500/20">
                <ArrowUp className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[11px] uppercase font-bold tracking-widest text-muted-foreground/50 leading-none mb-1.5 group-hover:text-blue-500/80 transition-colors uppercase">{t('stats.upload_speed')}</p>
                <div className="flex items-center justify-between gap-1 overflow-hidden h-7">
                  <span className="text-lg font-extrabold tracking-tight truncate group-hover:scale-[1.02] transition-transform origin-left">{formatSpeed(totalUploadSpeed)}</span>
                  <div className="block lg:hidden xl:block relative h-4 overflow-hidden flex-1 text-right">
                    <div className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-4">
                      <span className="text-[11px] text-muted-foreground/60 font-medium whitespace-nowrap h-4 flex items-center justify-end gap-1">
                        {t('stats.session_badge')}: {formatSize(stats["current-stats"].uploadedBytes)}
                      </span>
                      <span className="text-[11px] text-blue-500/80 font-bold whitespace-nowrap h-4 flex items-center justify-end gap-1">
                         {t('stats.history_badge')}: {formatSize(stats["cumulative-stats"].uploadedBytes)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="flex items-center gap-3 p-4 rounded-[2rem] bg-background/40 border border-muted/5 hover:bg-background/60 transition-all group shrink-0 overflow-hidden shadow-none cursor-default">
              <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shrink-0 shadow-sm group-hover:shadow-orange-500/20">
                <Activity className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[11px] uppercase font-bold tracking-widest text-muted-foreground/50 leading-none mb-1.5 group-hover:text-orange-500/80 transition-colors uppercase">{t('stats.active_torrents')}</p>
                <div className="flex items-center justify-between gap-1 overflow-hidden h-7">
                  <span className="text-lg font-extrabold tracking-tight truncate group-hover:scale-[1.02] transition-transform origin-left">{stats.activeTorrentCount}</span>
                  <div className="block lg:hidden xl:block relative h-4 overflow-hidden flex-1 text-right">
                    <div className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-4">
                      <span className="text-[11px] text-muted-foreground/60 font-medium whitespace-nowrap h-4 flex items-center justify-end gap-1">
                        {t('stats.total_tasks')}: {stats.torrentCount}
                      </span>
                      <span className="text-[11px] text-orange-500/80 font-bold whitespace-nowrap h-4 flex items-center justify-end gap-1">
                         {t('stats.paused_tasks')}: {stats.pausedTorrentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Space */}
            <div className="flex items-center gap-3 p-4 rounded-[2rem] bg-background/40 border border-muted/5 hover:bg-background/60 transition-all group shrink-0 overflow-hidden shadow-none cursor-default">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shrink-0 shadow-sm group-hover:shadow-purple-500/20">
                <Database className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[11px] uppercase font-bold tracking-widest text-muted-foreground/50 leading-none mb-1.5 group-hover:text-purple-500/80 transition-colors uppercase">{t('stats.free_space')}</p>
                <div className="flex items-center justify-between gap-1 overflow-hidden h-7">
                  <span className="text-lg font-extrabold tracking-tight truncate group-hover:scale-[1.02] transition-transform origin-left">{freeSpace ? formatSize(freeSpace["size-bytes"]) : "---"}</span>
                  <div className="block lg:hidden xl:block relative h-4 overflow-hidden flex-1 text-right">
                    <div className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-4">
                      {freeSpace && (
                        <span className="text-[11px] text-muted-foreground/60 font-medium whitespace-nowrap h-4 flex items-center justify-end gap-1 text-right">
                          {((freeSpace["size-bytes"] / freeSpace.total_size) * 100).toFixed(0)}% {t('stats.free_unit')}
                        </span>
                      )}
                      {freeSpace && (
                        <span className="text-[11px] text-purple-500/80 font-bold whitespace-nowrap h-4 flex items-center justify-end gap-1 text-right">
                           {t('stats.total_label')}: {formatSize(freeSpace.total_size)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 md:gap-4 flex-wrap pb-1 sm:pb-0">
            <h2 className="text-xl font-bold tracking-tight whitespace-nowrap mr-2">{t('common.torrents')}</h2>
            
            <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-200",
                  viewMode === "list" 
                    ? "bg-background shadow-sm text-primary" 
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-200",
                  viewMode === "grid" 
                    ? "bg-background shadow-sm text-primary" 
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn(
                    "h-8 w-8 rounded-lg transition-all duration-200 relative",
                    (trackerFilter.length > 0 || dirFilter.length > 0 || labelFilter.length > 0)
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}>
                    <Filter className="h-4 w-4" />
                    {(trackerFilter.length > 0 || dirFilter.length > 0 || labelFilter.length > 0) && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary border border-background shadow-xs" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-0 mt-2 overflow-hidden">
                  <div className="px-4 py-3 bg-muted/20 border-b border-muted/50 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-muted-foreground whitespace-nowrap">{t('common.filters', 'Filters')}</span>
                    {(trackerFilter.length > 0 || dirFilter.length > 0 || labelFilter.length > 0) && (
                      <Button 
                        variant="ghost" 
                        className="h-6 px-2 text-[10px] font-bold rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => {
                          setTrackerFilter([])
                          setDirFilter([])
                          setLabelFilter([])
                        }}
                      >
                        {t('common.clear', 'Clear')}
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-1">
                    <DropdownMenuSub>
                       <DropdownMenuSubTrigger className="rounded-xl py-2.5 px-3 focus:bg-muted data-[state=open]:bg-muted whitespace-nowrap">
                        <Globe className="h-4 w-4 mr-3 opacity-50 flex-shrink-0" />
                        <span className="text-sm font-medium mr-2">{t('common.filter_by_tracker')}</span>
                        {trackerFilter.length > 0 && (
                          <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full flex-shrink-0">
                            {trackerFilter.length}
                          </span>
                        )}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-[280px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-2 ml-1">
                          <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 tracking-wider">
                            {t('common.all_trackers')}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="mx-2 my-1 bg-muted/50" />
                          <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-0.5">
                            {trackers.length === 0 ? (
                              <div className="px-3 py-4 text-center text-xs text-muted-foreground italic opacity-50">
                                {t('common.no_trackers', 'No trackers found')}
                              </div>
                            ) : (
                              trackers.map(host => (
                                <DropdownMenuCheckboxItem 
                                  key={host} 
                                  className="rounded-xl py-2 border-none cursor-pointer transition-colors focus:bg-muted"
                                  checked={trackerFilter.includes(host)}
                                  onCheckedChange={() => toggleTracker(host)}
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <span className="truncate text-sm font-medium">{host}</span>
                                </DropdownMenuCheckboxItem>
                              ))
                            )}
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="rounded-xl py-2.5 px-3 focus:bg-muted data-[state=open]:bg-muted whitespace-nowrap">
                        <Database className="h-4 w-4 mr-3 opacity-50 flex-shrink-0" />
                        <span className="text-sm font-medium mr-2">{t('common.filter_by_dir', 'By Directory')}</span>
                        {dirFilter.length > 0 && (
                          <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full flex-shrink-0">
                            {dirFilter.length}
                          </span>
                        )}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-[320px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-2 ml-1">
                          <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 tracking-wider">
                            {t('common.all_directories', 'All Directories')}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="mx-2 my-1 bg-muted/50" />
                          <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-0.5">
                            {downloadDirs.length === 0 ? (
                              <div className="px-3 py-4 text-center text-xs text-muted-foreground italic opacity-50">
                                {t('common.no_directories', 'No directories found')}
                              </div>
                            ) : (
                              downloadDirs.map(path => (
                                <DropdownMenuCheckboxItem 
                                  key={path} 
                                  className="rounded-xl py-2 border-none cursor-pointer transition-colors focus:bg-muted"
                                  checked={dirFilter.includes(path)}
                                  onCheckedChange={() => toggleDir(path)}
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <div className="flex flex-col min-w-0">
                                    <span className="truncate text-sm font-medium">{path.split('/').pop() || '/'}</span>
                                    <span className="truncate text-[10px] opacity-50">{path}</span>
                                  </div>
                                </DropdownMenuCheckboxItem>
                              ))
                            )}
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="rounded-xl py-2.5 px-3 focus:bg-muted data-[state=open]:bg-muted whitespace-nowrap">
                        <Tag className="h-4 w-4 mr-3 opacity-50 flex-shrink-0" />
                        <span className="text-sm font-medium mr-2">{t('common.filter_by_label', 'By Label')}</span>
                        {labelFilter.length > 0 && (
                          <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full flex-shrink-0">
                            {labelFilter.length}
                          </span>
                        )}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-[220px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-2 ml-1">
                          <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 tracking-wider">
                            {t('common.all_labels', 'All Labels')}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="mx-2 my-1 bg-muted/50" />
                          <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-0.5">
                            {availableLabels.length === 0 ? (
                              <div className="px-3 py-4 text-center text-xs text-muted-foreground italic opacity-50">
                                {t('common.no_labels', 'No labels found')}
                              </div>
                            ) : (
                              availableLabels.map(label => (
                                <DropdownMenuCheckboxItem 
                                  key={label} 
                                  className="rounded-xl py-2 border-none cursor-pointer transition-colors focus:bg-muted"
                                  checked={labelFilter.includes(label)}
                                  onCheckedChange={() => toggleLabel(label)}
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <span className="truncate text-sm font-medium">{label}</span>
                                </DropdownMenuCheckboxItem>
                              ))
                            )}
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex gap-2 w-full lg:w-auto flex-wrap justify-start lg:justify-end pb-1 sm:pb-0">
            <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 md:px-3.5 rounded-lg font-medium bg-background/60 hover:bg-background hover:shadow-sm transition-all text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 border-none">
                    <Wrench className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{t('common.tools')}</span>
                    <ChevronDown className="h-3 w-3 opacity-50 hidden md:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto min-w-[200px] rounded-2xl border border-muted/50 bg-card/95 backdrop-blur-xl shadow-2xl p-1 mt-2 overflow-hidden">
                  <DropdownMenuItem 
                    className="rounded-xl py-2.5 px-3 focus:bg-muted cursor-pointer transition-colors"
                    onClick={() => setIsBatchReplaceOpen(true)}
                  >
                    <RefreshCw className="h-4 w-4 mr-3 text-primary opacity-70" />
                    <span className="text-sm font-medium whitespace-nowrap">{t('common.batch_replace_tracker')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center bg-muted/60 p-1 rounded-xl shrink-0">
              <AddTorrentDialog onSuccess={fetchData}>
                <Button variant="default" className="h-8 px-2 md:px-4 rounded-lg font-medium gap-2 shadow-md shadow-primary/10 text-xs border-none">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{t('common.add_torrent')}</span>
                </Button>
              </AddTorrentDialog>
            </div>
            <div className="flex items-center bg-muted/60 p-1 rounded-xl gap-1 shrink-0">
              <Button 
                variant="ghost" 
                className="h-8 px-3.5 md:px-3.5 rounded-lg font-medium bg-background/60 hover:bg-background hover:shadow-sm transition-all text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5" 
                onClick={() => handleGlobalAction("start")}
              >
                <Play className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{t('common.resume_all')}</span>
              </Button>
              <Button 
                variant="ghost" 
                className="h-8 px-3.5 md:px-3.5 rounded-lg font-medium bg-background/60 hover:bg-background hover:shadow-sm transition-all text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5" 
                onClick={() => handleGlobalAction("stop")}
              >
                <Pause className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{t('common.pause_all')}</span>
              </Button>
            </div>
          </div>
        </div>

        {viewMode === "list" ? (
          <Card className="shadow-md border-none overflow-hidden py-0">
            <CardContent className="p-0 overflow-auto">
              <Table className="table-fixed min-w-[1000px]">
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[50px] pl-6 h-12">
                      <div 
                        className="cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                        onClick={toggleSelectAll}
                      >
                        {selectedIds.length === filteredTorrents.length && filteredTorrents.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : selectedIds.length > 0 ? (
                          <div className="h-4 w-4 flex items-center justify-center">
                            <div className="w-2.5 h-0.5 bg-primary rounded-full" />
                          </div>
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="w-[30%] h-12 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center truncate pr-4">{t('common.name')} <SortIcon column="name" /></div>
                    </TableHead>
                    <TableHead 
                      className="w-[160px] h-12 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">{t('common.status')} <SortIcon column="status" /></div>
                    </TableHead>
                    <TableHead 
                      className="w-[150px] h-12 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('percentDone')}
                    >
                      <div className="flex items-center">{t('common.progress')} <SortIcon column="progress" /></div>
                    </TableHead>
                    <TableHead 
                      className="w-[110px] h-12 cursor-pointer hover:text-primary transition-colors text-right"
                      onClick={() => handleSort('rateDownload')}
                    >
                      <div className="flex items-center justify-end">{t('common.down_speed')} <SortIcon column="rateDownload" /></div>
                    </TableHead>
                    <TableHead 
                      className="w-[110px] h-12 cursor-pointer hover:text-primary transition-colors text-right"
                      onClick={() => handleSort('rateUpload')}
                    >
                      <div className="flex items-center justify-end">{t('common.up_speed')} <SortIcon column="rateUpload" /></div>
                    </TableHead>
                    <TableHead 
                      className="w-[100px] h-12 cursor-pointer hover:text-primary transition-colors text-right"
                      onClick={() => handleSort('eta')}
                    >
                      <div className="flex items-center justify-end">{t('common.eta')} <SortIcon column="eta" /></div>
                    </TableHead>
                    <TableHead className="text-center w-[130px] h-12 pr-6">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTorrents.map((torrent) => (
                    <TableRow 
                      key={torrent.id} 
                      className={cn(
                        "hover:bg-muted/30 transition-colors border-b last:border-0 border-muted/50 group/row",
                        selectedIds.includes(torrent.id) && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <TableCell className="pl-6">
                        <div 
                          className="cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => toggleSelect(torrent.id)}
                        >
                          {selectedIds.includes(torrent.id) ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 opacity-40 group-hover/row:opacity-100" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-heading-3 max-w-[350px] lg:max-w-[500px]">
                        <Link 
                          to={`/torrents/detail?id=${torrent.id}`} 
                          className="hover:text-primary transition-colors cursor-pointer block truncate"
                        >
                          {torrent.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider transition-colors",
                          torrent.status === 4 ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" : 
                          torrent.status === 6 ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400" :
                          torrent.status === 0 ? "bg-muted text-muted-foreground/70" :
                          "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                        )}>
                          {t(getStatusLabel(torrent.status))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-muted rounded-full h-2 min-w-[100px]">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                            style={{ width: `${torrent.percentDone * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-label mt-1.5 block">
                          {(torrent.percentDone * 100).toFixed(1)}% • {formatSize(torrent.totalSize)}
                        </span>
                      </TableCell>
                      <TableCell className="text-numeric text-green-500 text-right">{formatSpeed(torrent.rateDownload)}</TableCell>
                      <TableCell className="text-numeric text-blue-500 text-right">{formatSpeed(torrent.rateUpload)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-label lowercase">{formatDuration(torrent.eta)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[130px] pr-6">
                        <div className="flex items-center justify-center gap-1">
                          <EditTorrentDialog torrent={torrent}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </EditTorrentDialog>
                          {torrent.status !== 0 ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-500 transition-colors" onClick={() => handleSingleAction(torrent.id, "stop")}>
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-500/10 hover:text-green-500 transition-colors" onClick={() => handleSingleAction(torrent.id, "start")}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => handleSingleAction(torrent.id, "remove")}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedTorrents.map((torrent) => (
              <Card 
                key={torrent.id} 
                className="group relative shadow-md border-none overflow-hidden hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 bg-sidebar/30 flex flex-col py-0"
              >
                <CardHeader className="pb-3 pt-4 border-b border-muted/50 bg-background/50">
                  <div className="min-w-0 space-y-1">
                    <Link to={`/torrents/detail?id=${torrent.id}`} className="block group-hover:text-primary transition-colors">
                      <CardTitle className="text-heading-3 truncate pr-2 cursor-pointer leading-tight" title={torrent.name}>
                        {torrent.name}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide transition-colors",
                        torrent.status === 4 ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" : 
                        torrent.status === 6 ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400" :
                        torrent.status === 0 ? "bg-muted text-muted-foreground/70" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                      )}>
                        {t(getStatusLabel(torrent.status))}
                      </span>
                      <span className="text-label tracking-tighter whitespace-nowrap">
                        {(() => {
                          const parts = formatSizeParts(torrent.totalSize)
                          return (
                            <>
                              {parts.value} <span className="text-[10px] opacity-60 font-medium">{parts.unit}</span>
                            </>
                          )
                        })()}
                      </span>
                    </div>
                  </div>
                  <CardAction className="flex gap-1 shrink-0">
                    <EditTorrentDialog torrent={torrent}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-opacity rounded-full">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </EditTorrentDialog>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-opacity rounded-full" onClick={() => handleSingleAction(torrent.id, "remove")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="py-5 space-y-5 flex-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-label">
                      <span>{t('common.progress')}</span>
                      <span className="text-primary">{(torrent.percentDone * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.4)]" 
                        style={{ width: `${torrent.percentDone * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-label">{t('stats.download_speed')}</p>
                      <div className="flex items-center gap-1 text-green-500 text-heading-3 whitespace-nowrap">
                        <ArrowDown className="h-3 w-3" />
                        <span className="text-numeric">
                          {(() => {
                            const parts = splitSpeed(formatSpeed(torrent.rateDownload))
                            return (
                              <>
                                {parts.value} <span className="text-sm opacity-60 ml-0.5">{parts.unit}</span>
                              </>
                            )
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-label">{t('stats.upload_speed')}</p>
                      <div className="flex items-center justify-end gap-1 text-blue-500 text-heading-3 whitespace-nowrap">
                        <ArrowUp className="h-3 w-3" />
                        <span className="text-numeric">
                          {(() => {
                            const parts = splitSpeed(formatSpeed(torrent.rateUpload))
                            return (
                              <>
                                {parts.value} <span className="text-sm opacity-60 ml-0.5">{parts.unit}</span>
                              </>
                            )
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 px-4 py-3 border-t border-muted/50 flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-label lowercase">{formatDuration(torrent.eta)}</span>
                  </div>
                  <div className="flex gap-2">
                    {torrent.status !== 0 ? (
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-muted-foreground/20 hover:bg-orange-500/10 hover:text-orange-500 transition-all hover:scale-110" onClick={() => handleSingleAction(torrent.id, "stop")}>
                        <Pause className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-muted-foreground/20 hover:bg-green-500/10 hover:text-green-500 transition-all hover:scale-110" onClick={() => handleSingleAction(torrent.id, "start")}>
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300 w-full max-w-[calc(100%-2rem)] md:max-w-fit px-2 sm:px-0">
          <div className="bg-background/80 backdrop-blur-xl border border-primary/20 shadow-[0_8px_40px_rgba(var(--primary),0.15)] rounded-[2.5rem] px-3 py-2.5 md:px-6 md:py-4 flex items-center gap-2 md:gap-6 min-w-0 md:min-w-[400px] justify-between md:justify-start">
            <div className="flex items-center gap-2 border-r pr-3 md:pr-6 mr-1 md:mr-2 shrink-0">
              <div className="bg-primary text-primary-foreground text-[10px] md:text-xs font-bold h-5 w-5 md:h-6 md:w-6 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                {selectedIds.length}
              </div>
              <span className="text-sm font-bold tracking-tight hidden sm:inline">{t('common.selected')}</span>
            </div>
            
            <div className="flex items-center gap-1.5 md:gap-3 flex-1 min-w-0 overflow-x-auto no-scrollbar justify-center md:justify-start">
              <Button size="sm" className="h-9 md:h-10 rounded-2xl md:rounded-xl font-bold gap-2 px-3 md:px-4" onClick={() => handleBatchAction("start")}>
                <Play className="h-4 w-4" /> 
                <span className="hidden md:inline">{t('common.resume')}</span>
              </Button>
              <Button size="sm" variant="secondary" className="h-9 md:h-10 rounded-2xl md:rounded-xl font-bold gap-2 px-3 md:px-4" onClick={() => handleBatchAction("stop")}>
                <Pause className="h-4 w-4" /> 
                <span className="hidden md:inline">{t('common.pause')}</span>
              </Button>
              <Button size="sm" variant="ghost" className="h-9 md:h-10 rounded-2xl md:rounded-xl font-bold gap-2 px-3 md:px-4 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleBatchAction("remove")}>
                <Trash2 className="h-4 w-4" /> 
                <span className="hidden md:inline">{t('common.remove')}</span>
              </Button>
            </div>
 
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 md:h-9 md:w-9 rounded-full shrink-0 hover:bg-muted/50"
              onClick={() => setSelectedIds([])}
            >
              <X className="h-4 w-4 opacity-50" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-3xl border-none bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
          <DialogHeader className="gap-2 shrink-0">
            <DialogTitle className="text-2xl font-medium tracking-tight flex items-center gap-3 text-destructive">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </div>
              {idsToDelete.length > 1 ? t('common.remove', 'Remove Torrents') : t('common.remove', 'Remove Torrent')}
            </DialogTitle>
            <DialogDescription className="text-base font-medium opacity-70">
              {idsToDelete.length > 1 
                ? t('common.confirm_remove_all', `Are you sure you want to remove ${idsToDelete.length} torrents?`)
                : t('common.confirm_remove', 'Are you sure you want to remove this torrent from the list?')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-5 py-4">
             <div 
               className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-muted/50 cursor-pointer group hover:bg-destructive/5 hover:border-destructive/20 transition-all"
               onClick={() => setDeleteLocalData(!deleteLocalData)}
             >
                <div className={cn(
                  "h-5 w-5 rounded flex items-center justify-center transition-all shrink-0",
                  deleteLocalData ? "bg-destructive border-destructive text-destructive-foreground shadow-lg shadow-destructive/20" : "border-2 border-muted-foreground/30 group-hover:border-destructive/50"
                )}>
                  {deleteLocalData && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    deleteLocalData ? "text-destructive" : "text-foreground group-hover:text-destructive"
                  )}>
                    {t('common.move_data', 'Delete local data')}
                  </span>
                  <span className="text-xs text-muted-foreground opacity-60">
                    {t('common.remove_desc', 'This will permanently delete the downloaded files.')}
                  </span>
                </div>
             </div>
             
             <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 flex items-start gap-3">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle text-destructive shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
               <span className="text-[11px] font-medium text-destructive/80 leading-relaxed">
                 {t('common.action_warning', 'Warning: This action is permanent and cannot be undone.')}
               </span>
             </div>
          </div>

          <DialogFooter className="pt-4 border-t border-muted/20">
            <Button 
              variant="ghost" 
              className="rounded-xl font-medium"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-xl font-medium px-8 shadow-lg shadow-destructive/20 active:scale-[0.98] transition-all"
              onClick={confirmDelete}
            >
              {idsToDelete.length > 1 ? t('common.remove', 'Delete All') : t('common.remove', 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <BatchReplaceTrackerDialog 
        open={isBatchReplaceOpen} 
        onOpenChange={setIsBatchReplaceOpen} 
        onSuccess={fetchData} 
      />
    </div>
  )
}
