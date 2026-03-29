import * as React from "react"
import { FolderOpen, HardDrive, Check, ChevronDown, ChevronRight, Gauge, Zap, Settings2, Activity, Clock, Globe, Tag, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { rpc } from "@/lib/rpc-client"
import { toast } from "sonner"
import type { Torrent } from "@/lib/rpc-types"
import { cn } from "@/lib/utils"

interface EditTorrentDialogProps {
  torrent: {
    id: number
    name: string
    downloadDir?: string
    [key: string]: any
  }
  children: React.ReactNode
  onSuccess?: () => void
}

const COMMON_PATHS = [
  "/downloads",
  "/downloads/movies",
  "/downloads/tv",
  "/downloads/music",
  "/downloads/books",
  "/downloads/apps"
]

export function EditTorrentDialog({ torrent, children, onSuccess }: EditTorrentDialogProps) {
  const { t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(torrent.name)
  const [location, setLocation] = React.useState(torrent.downloadDir || "/downloads")
  const [moveData, setMoveData] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(false)
  
  // Advanced Settings State
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  const [bandwidthPriority, setBandwidthPriority] = React.useState(0)
  const [downloadLimit, setDownloadLimit] = React.useState(0)
  const [downloadLimited, setDownloadLimited] = React.useState(false)
  const [uploadLimit, setUploadLimit] = React.useState(0)
  const [uploadLimited, setUploadLimited] = React.useState(false)
  const [honorsSessionLimits, setHonorsSessionLimits] = React.useState(true)
  const [seedRatioLimit, setSeedRatioLimit] = React.useState(0)
  const [seedRatioMode, setSeedRatioMode] = React.useState(0)
  const [seedIdleLimit, setSeedIdleLimit] = React.useState(0)
  const [seedIdleMode, setSeedIdleMode] = React.useState(0)
  const [trackerList, setTrackerList] = React.useState("")
  const [labels, setLabels] = React.useState<string[]>([])
  const [newLabel, setNewLabel] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("speed")

  // Initialize state ONLY when opening the dialog
  React.useEffect(() => {
    if (open) {
      setIsFetching(true)
      setName(torrent.name)
      setLocation(torrent.downloadDir || "/downloads")
      
      const fields = [
        "name", "downloadDir", "bandwidthPriority", 
        "downloadLimit", "downloadLimited", "uploadLimit", 
        "uploadLimited", "honorsSessionLimits", "seedRatioLimit", 
        "seedRatioMode", "seedIdleLimit", "seedIdleMode", "trackerList", "labels"
      ]

      rpc.getTorrents(fields, [torrent.id]).then((data) => {
        const t = data.torrents[0]
        if (t) {
          setName(t.name)
          setLocation(t.downloadDir || "/downloads")
          setBandwidthPriority(t.bandwidthPriority || 0)
          setDownloadLimit(t.downloadLimit || 0)
          setDownloadLimited(t.downloadLimited || false)
          setUploadLimit(t.uploadLimit || 0)
          setUploadLimited(t.uploadLimited || false)
          setHonorsSessionLimits(t.honorsSessionLimits !== false)
          setSeedRatioLimit(t.seedRatioLimit || 0)
          setSeedRatioMode(t.seedRatioMode || 0)
          setSeedIdleLimit(t.seedIdleLimit || 0)
          setSeedIdleMode(t.seedIdleMode || 0)
          setTrackerList(t.trackerList || "")
          
          // Parse labels from JSON string if needed
          const initialLabels = (t.labels || []).map((l: string) => {
            try {
              const parsed = JSON.parse(l);
              return typeof parsed === 'object' && parsed !== null && 'text' in parsed ? parsed.text : l;
            } catch {
              return l;
            }
          });
          setLabels(initialLabels)
        }
      }).catch((err) => {
        console.error("Failed to fetch torrent details:", err)
      }).finally(() => {
        setIsFetching(false)
      })
    }
  }, [open, torrent.id, torrent.name, torrent.downloadDir])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Check for Name Change
      if (name !== torrent.name) {
        await rpc.renameTorrentPath(torrent.id, torrent.name, name)
      }

      // 2. Check for Location Change
      if (location !== (torrent.downloadDir || "/downloads")) {
        await rpc.setTorrentLocation([torrent.id], location, moveData)
      }

      // 3. Update Advanced Settings
      const advancedArgs: any = {
        bandwidthPriority,
        downloadLimit: Number(downloadLimit),
        downloadLimited,
        uploadLimit: Number(uploadLimit),
        uploadLimited,
        honorsSessionLimits,
        seedRatioLimit: Number(seedRatioLimit),
        seedRatioMode,
        seedIdleLimit: Number(seedIdleLimit),
        seedIdleMode,
        trackerList,
        labels: labels.map((l: string) => JSON.stringify({ text: l }))
      }
      
      await rpc.setTorrent([torrent.id], advancedArgs)

      toast.success(t('common.edit_success', 'Torrent updated successfully'))
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to update torrent:", error)
      toast.error(t('common.edit_failed', 'Failed to update torrent'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] rounded-3xl border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-medium tracking-tight">{t('common.edit_torrent')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('common.edit_torrent_desc', 'Modify torrent name or move its data to a different directory.')}
            </DialogDescription>
          </DialogHeader>
          
          {isFetching ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 animate-pulse">
              <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">{t('stats.loading', 'Loading details...')}</p>
            </div>
          ) : (
            <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <HardDrive className="h-3.5 w-3.5 text-muted-foreground" /> {t('common.name')}
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                placeholder="Enter new name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" /> {t('common.save_location')}
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isLoading}>
                  <div className="relative flex w-full">
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary pr-12 transition-all cursor-text pointer-events-auto flex-1"
                      disabled={isLoading}
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                      <Button variant="ghost" size="icon" type="button" className="h-9 w-9 rounded-lg text-muted-foreground" disabled={isLoading}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  side="bottom"
                  sideOffset={4}
                  alignOffset={0}
                  className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-muted/50 p-1 bg-card/95 backdrop-blur-xl shadow-2xl z-[60]"
                >
                  {COMMON_PATHS.map((path) => (
                    <DropdownMenuItem 
                      key={path}
                      className="rounded-lg py-2.5 px-3 text-sm font-medium cursor-pointer"
                      onClick={() => setLocation(path)}
                    >
                      <FolderOpen className="h-4 w-4 mr-3 opacity-50" />
                      {path}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div 
              className={`flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-muted/50 transition-colors group ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'}`}
              onClick={() => !isLoading && setMoveData(!moveData)}
            >
              <div className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${moveData ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground/30'}`}>
                {moveData && <Check className="h-3 w-3" />}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{t('common.move_data')}</span>
                <span className="text-xs text-muted-foreground">{t('common.move_data_desc')}</span>
              </div>
            </div>

            {/* Advanced Section Toggle */}
            <div className="pt-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between h-12 rounded-2xl bg-muted/20 hover:bg-muted/40 border border-muted/30 px-4 group"
                onClick={() => setAdvancedOpen(!advancedOpen)}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    advancedOpen ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                  )}>
                    <Settings2 className="h-4 w-4" />
                  </div>
                  <span className="font-semibold tracking-tight">{t('common.advanced')}</span>
                </div>
                <ChevronRight className={cn("h-4 w-4 transition-transform duration-300", advancedOpen && "rotate-90 text-primary")} />
              </Button>
            </div>

            {/* Advanced Options */}
            {advancedOpen && (
              <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {/* Tabs for advanced options */}
                <div className="flex gap-1 p-1 bg-muted/30 rounded-2xl border border-muted/30 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'speed', icon: Gauge, label: t('settings.tabs.speed') },
                    { id: 'ratio', icon: Activity, label: t('details.storage_ratio') },
                    { id: 'trackers', icon: Globe, label: t('details.trackers') },
                    { id: 'labels', icon: Tag, label: t('common.labels') }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap whitespace-nowrap",
                        activeTab === tab.id 
                          ? "bg-background shadow-sm text-primary" 
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="min-h-[220px]">
                  {activeTab === 'speed' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t('common.download_limit')}</label>
                          <div className="relative flex items-center">
                            <Input
                              type="number"
                              value={downloadLimit}
                              onChange={(e) => setDownloadLimit(Number(e.target.value))}
                              className={cn(
                                "h-11 rounded-xl border-none focus-visible:ring-1 focus-visible:ring-primary pl-10 transition-all",
                                downloadLimited ? "bg-muted/40 ring-1 ring-primary/30 shadow-inner" : "bg-muted/10 opacity-50"
                              )}
                            />
                            <Gauge className={cn(
                              "absolute left-3.5 h-4 w-4 transition-all duration-300",
                              downloadLimited ? "text-primary opacity-100 scale-110" : "text-muted-foreground opacity-30"
                            )} />
                          </div>
                          <div 
                            className="flex items-center gap-2 px-1 cursor-pointer group"
                            onClick={() => setDownloadLimited(!downloadLimited)}
                          >
                            <div className={cn(
                              "h-3.5 w-3.5 rounded border transition-all flex items-center justify-center",
                              downloadLimited ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
                            )}>
                              {downloadLimited && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{t('common.enabled')}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t('common.upload_limit')}</label>
                          <div className="relative flex items-center">
                            <Input
                              type="number"
                              value={uploadLimit}
                              onChange={(e) => setUploadLimit(Number(e.target.value))}
                              className={cn(
                                "h-11 rounded-xl border-none focus-visible:ring-1 focus-visible:ring-primary pl-10 transition-all",
                                uploadLimited ? "bg-muted/40 ring-1 ring-primary/30 shadow-inner" : "bg-muted/10 opacity-50"
                              )}
                            />
                            <Zap className={cn(
                              "absolute left-3.5 h-4 w-4 transition-all duration-300",
                              uploadLimited ? "text-primary opacity-100 scale-110" : "text-muted-foreground opacity-30"
                            )} />
                          </div>
                          <div 
                            className="flex items-center gap-2 px-1 cursor-pointer group"
                            onClick={() => setUploadLimited(!uploadLimited)}
                          >
                            <div className={cn(
                              "h-3.5 w-3.5 rounded border transition-all flex items-center justify-center",
                              uploadLimited ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
                            )}>
                              {uploadLimited && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{t('common.enabled')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t('common.bandwidth_priority')}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { val: -1, label: t('common.priority_low') },
                            { val: 0, label: t('common.priority_normal') },
                            { val: 1, label: t('common.priority_high') }
                          ].map((p) => (
                            <button
                              key={p.val}
                              type="button"
                              onClick={() => setBandwidthPriority(p.val)}
                              className={cn(
                                "h-10 rounded-xl text-xs font-bold transition-all border",
                                bandwidthPriority === p.val 
                                  ? "bg-primary/10 border-primary text-primary" 
                                  : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/30"
                              )}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div 
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-muted/10 cursor-pointer group hover:bg-muted/30 transition-all mt-2"
                        onClick={() => setHonorsSessionLimits(!honorsSessionLimits)}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded-lg flex items-center justify-center transition-all",
                          honorsSessionLimits ? "bg-primary text-primary-foreground" : "border-2 border-muted-foreground/20"
                        )}>
                          {honorsSessionLimits && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold tracking-tight">{t('common.honors_session_limits')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'ratio' && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center justify-between">
                          <span>{t('common.seed_ratio_limit')}</span>
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">{seedRatioLimit}</span>
                        </label>
                        <div className="space-y-3 p-3 rounded-2xl bg-muted/20 border border-muted/10">
                          <Input
                            type="number"
                            step="0.1"
                            value={seedRatioLimit}
                            onChange={(e) => setSeedRatioLimit(Number(e.target.value))}
                            className="h-10 rounded-xl bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { val: 0, label: t('common.mode_global') },
                              { val: 1, label: t('common.mode_single') },
                              { val: 2, label: t('common.mode_unlimited') }
                            ].map((m) => (
                              <button
                                key={m.val}
                                type="button"
                                onClick={() => setSeedRatioMode(m.val)}
                                className={cn(
                                  "h-9 rounded-xl text-[10px] font-bold transition-all border",
                                  seedRatioMode === m.val 
                                    ? "bg-primary/10 border-primary text-primary shadow-xs" 
                                    : "bg-muted/20 border-transparent text-muted-foreground hover:bg-muted/40"
                                )}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center justify-between">
                          <span>{t('common.seed_idle_limit')}</span>
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">{seedIdleLimit} min</span>
                        </label>
                        <div className="space-y-3 p-3 rounded-2xl bg-muted/20 border border-muted/10">
                          <Input
                            type="number"
                            value={seedIdleLimit}
                            onChange={(e) => setSeedIdleLimit(Number(e.target.value))}
                            className="h-10 rounded-xl bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { val: 0, label: t('common.mode_global') },
                              { val: 1, label: t('common.mode_single') },
                              { val: 2, label: t('common.mode_unlimited') }
                            ].map((m) => (
                              <button
                                key={m.val}
                                type="button"
                                onClick={() => setSeedIdleMode(m.val)}
                                className={cn(
                                  "h-9 rounded-xl text-[10px] font-bold transition-all border",
                                  seedIdleMode === m.val 
                                    ? "bg-primary/10 border-primary text-primary shadow-xs" 
                                    : "bg-muted/20 border-transparent text-muted-foreground hover:bg-muted/40"
                                )}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'trackers' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-2">
                        <Globe className="h-3 w-3" /> {t('common.trackers_list')}
                      </label>
                      <textarea
                        value={trackerList}
                        onChange={(e) => setTrackerList(e.target.value)}
                        className="w-full h-48 rounded-2xl bg-muted/20 border border-muted/20 focus:ring-1 focus:ring-primary outline-none p-4 text-sm font-mono leading-relaxed resize-none no-scrollbar"
                        placeholder="https://tracker.example.com/announce"
                      />
                      <p className="text-[10px] text-muted-foreground/60 px-1 font-medium leading-normal italic">
                        * {t('common.tracker_list_hint', 'Enter one URL per line. Use a blank line to separate tracker tiers.')}
                      </p>
                    </div>
                  )}

                  {activeTab === 'labels' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t('common.labels')}</label>
                        <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-muted/20 border border-muted/10 min-h-[44px]">
                          {labels.map((label, i) => (
                            <div key={i} className="flex items-center gap-1.5 p-1 px-2 bg-muted rounded-lg w-fit text-xs md:text-sm font-medium group animate-in zoom-in-95 duration-200">
                              {label}
                              <button
                                type="button"
                                onClick={() => setLabels(labels.filter((_, idx) => idx !== i))}
                                className="p-0.5 rounded-full hover:bg-muted-foreground/20 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <div className="relative flex-1 min-w-[120px]">
                            <Input
                              value={newLabel}
                              onChange={(e) => setNewLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newLabel.trim()) {
                                    setLabels([...labels, newLabel.trim()]);
                                    setNewLabel("");
                                  }
                                }
                              }}
                              className="h-8 border-none bg-transparent focus-visible:ring-0 px-1 text-xs font-medium placeholder:text-muted-foreground/30"
                              placeholder={t('common.labels_placeholder')}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {labels.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/60 px-1 transition-all">
                          Tip: Labels are stored as metadata in JSON format for compatibility.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          <DialogFooter className="pt-4 border-t border-muted/20">
            <Button variant="ghost" type="button" className="rounded-xl font-medium" onClick={() => setOpen(false)} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="rounded-xl font-medium px-8 shadow-lg shadow-primary/20" disabled={isLoading || isFetching}>
              {isLoading ? t('stats.loading', 'Saving...') : t('common.save_changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
