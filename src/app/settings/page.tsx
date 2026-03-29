import { useState, useEffect, useCallback } from "react"
import { 
  Globe, 
  Shield, 
  HardDrive, 
  Network, 
  Lock, 
  Terminal,
  Save,
  RefreshCw,
  Zap,
  ShieldCheck,
  Activity,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Monitor
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { useI18n } from "@/lib/i18n-context"
import { rpc } from "@/lib/rpc-client"
import { type Session } from "@/lib/rpc-types"
import { useAppSettings } from "@/lib/app-settings-context"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const { t } = useI18n()
  const { refreshInterval, setRefreshInterval, autoRefresh, setAutoRefresh } = useAppSettings()
  const [session, setSession] = useState<Session | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Partial<Session>>({})
  const [pendingRefreshInterval, setPendingRefreshInterval] = useState<number | null>(null)
  const [pendingAutoRefresh, setPendingAutoRefresh] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingPort, setTestingPort] = useState(false)

  const fetchSession = useCallback(async () => {
    try {
      const data = await rpc.getSession()
      setSession(data)
    } catch (err) {
      console.error("Failed to fetch session settings:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const handleChange = (key: keyof Session, value: any) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }))
  }

  const applyChanges = async () => {
    if (Object.keys(pendingChanges).length === 0 && pendingRefreshInterval === null && pendingAutoRefresh === null) return
    setSaving(true)
    try {
      // Save local app settings
      if (pendingRefreshInterval !== null) {
        setRefreshInterval(pendingRefreshInterval)
        setPendingRefreshInterval(null)
      }
      if (pendingAutoRefresh !== null) {
        setAutoRefresh(pendingAutoRefresh)
        setPendingAutoRefresh(null)
      }

      // Save remote session settings
      if (Object.keys(pendingChanges).length > 0) {
        await rpc.setSession(pendingChanges)
        setPendingChanges({})
        await fetchSession()
      }
      
      toast.success(t('settings.actions.apply_success', 'Success'), {
        description: t('settings.actions.apply_desc', 'Settings updated successfully!'),
      })
    } catch (err) {
      console.error("Failed to apply settings:", err)
      toast.error(t('settings.actions.apply_failed', 'Error'), {
        description: t('settings.actions.apply_error_desc', 'Failed to apply changes to the daemon.'),
      })
    } finally {
      setSaving(false)
    }
  }

  const discardChanges = () => {
    setPendingChanges({})
    setPendingRefreshInterval(null)
    setPendingAutoRefresh(null)
  }

  const handlePortTest = async () => {
    setTestingPort(true)
    try {
      const data = await rpc.portTest()
      if (data["port-is-open"]) {
        toast.success(t('settings.network.port_open', 'Port is open'), {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
        })
      } else {
        toast.error(t('settings.network.port_closed', 'Port is closed'), {
          icon: <XCircle className="h-4 w-4 text-destructive" />
        })
      }
    } catch (err) {
      toast.error(t('settings.network.port_test_error', 'Port test failed'))
    } finally {
      setTestingPort(false)
    }
  }

  const getValue = <K extends keyof Session>(key: K): Session[K] | undefined => {
    if (key in pendingChanges) return pendingChanges[key]
    return session?.[key]
  }

  const getRefreshInterval = () => {
    return pendingRefreshInterval !== null ? pendingRefreshInterval : refreshInterval
  }

  const getAutoRefresh = () => {
    return pendingAutoRefresh !== null ? pendingAutoRefresh : autoRefresh
  }

  const tabs = [
    { id: "general", label: t('settings.tabs.speed'), icon: Zap },
    { id: "transfers", label: t('settings.tabs.transfers'), icon: HardDrive },
    { id: "network", label: t('settings.tabs.network'), icon: Network },
    { id: "peers", label: t('settings.tabs.peers'), icon: Shield },
    { id: "page", label: t('settings.tabs.page'), icon: Monitor },
    { id: "remote", label: t('settings.tabs.remote'), icon: Terminal },
  ]

  const Toggle = ({ field, localValue, setLocalValue }: { field?: keyof Session, localValue?: boolean, setLocalValue?: (v: boolean) => void }) => {
    const active = field ? !!getValue(field) : !!localValue
    return (
      <div 
        onClick={() => {
          if (field) handleChange(field, !active)
          else if (setLocalValue) setLocalValue(!active)
        }}
        className={cn(
          "h-6 w-11 rounded-full transition-all duration-300 relative cursor-pointer",
          active ? "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.4)]" : "bg-muted"
        )}
      >
        <div className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300",
          active ? "right-1" : "left-1"
        )} />
      </div>
    )
  }

  if (loading && !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading session settings...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out max-w-[1300px] mx-auto pb-32">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground italic">{t('settings.desc')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-8">
          {/* Sidebar Tabs */}
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 lg:w-[240px] shrink-0 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl text-[10px] lg:text-xs uppercase tracking-widest font-black transition-all duration-300 whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-6 lg:space-y-8 animate-in slide-in-from-right-4 duration-500">
            
            {activeTab === "general" && (
              <div className="space-y-6">
                <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden">
                  <CardHeader className="p-5 pb-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg md:text-xl font-medium tracking-tight">{t('settings.speed.title')}</CardTitle>
                        <CardDescription className="text-xs md:text-sm text-muted-foreground/70 italic">{t('settings.speed.desc')}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">{t('settings.speed.download')} (KB/s)</label>
                          <Toggle field="speed-limit-down-enabled" />
                        </div>
                        <Input 
                          type="number" 
                          value={getValue("speed-limit-down")} 
                          onChange={(e) => handleChange("speed-limit-down", parseInt(e.target.value) || 0)}
                          className="h-11 md:h-12 rounded-xl bg-muted/40 border-none text-numeric" 
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">{t('settings.speed.upload')} (KB/s)</label>
                          <Toggle field="speed-limit-up-enabled" />
                        </div>
                        <Input 
                          type="number" 
                          value={getValue("speed-limit-up")} 
                          onChange={(e) => handleChange("speed-limit-up", parseInt(e.target.value) || 0)}
                          className="h-11 md:h-12 rounded-xl bg-muted/40 border-none text-numeric" 
                        />
                      </div>
                    </div>

                    <Separator className="bg-muted/30" />

                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                               <Zap className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm md:text-base font-medium tracking-tight">{t('settings.speed.alt_title')}</p>
                              <p className="text-[11px] md:text-xs text-muted-foreground/70">{t('settings.speed.alt_desc')}</p>
                            </div>
                         </div>
                         <Toggle field="alt-speed-enabled" />
                      </div>
                      
                      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 transition-opacity", !getValue("alt-speed-enabled") && "opacity-50 grayscale pointer-events-none")}>
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-tighter">{t('settings.speed.alt_download')} (KB/s)</label>
                          <Input 
                            type="number" 
                            value={getValue("alt-speed-down")} 
                            onChange={(e) => handleChange("alt-speed-down", parseInt(e.target.value) || 0)}
                            className="h-11 md:h-12 rounded-xl bg-muted/40 border-none text-numeric" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-tighter">{t('settings.speed.alt_upload')} (KB/s)</label>
                          <Input 
                            type="number" 
                            value={getValue("alt-speed-up")} 
                            onChange={(e) => handleChange("alt-speed-up", parseInt(e.target.value) || 0)}
                            className="h-11 md:h-12 rounded-xl bg-muted/40 border-none text-numeric" 
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "transfers" && (
              <div className="space-y-6">
                 <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden">
                  <CardHeader className="p-5 pb-4">
                    <CardTitle className="text-lg md:text-xl font-medium flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-primary" /> {t('settings.transfers.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-8">
                     <div className="grid gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 italic">{t('settings.transfers.default_location')}</label>
                          <Input 
                            value={getValue("download-dir")} 
                            onChange={(e) => handleChange("download-dir", e.target.value)}
                            className="h-11 md:h-12 rounded-xl bg-muted/40 border-none font-mono text-xs font-bold" 
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                             <div>
                                <p className="text-sm md:text-base font-medium tracking-normal">{t('settings.transfers.incomplete_dir')}</p>
                                <p className="text-[11px] text-muted-foreground/70 italic">{t('settings.transfers.incomplete_dir_desc')}</p>
                             </div>
                             <Toggle field="incomplete-dir-enabled" />
                          </div>
                          <Input 
                            value={getValue("incomplete-dir")} 
                            onChange={(e) => handleChange("incomplete-dir", e.target.value)}
                            className={cn("h-11 md:h-12 rounded-xl bg-muted/40 border-none font-mono text-xs font-bold transition-opacity", !getValue("incomplete-dir-enabled") && "opacity-50")} 
                          />
                        </div>
                     </div>

                     <Separator className="bg-muted/30" />

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                             <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">{t('settings.transfers.download_queue')}</label>
                             <Toggle field="download-queue-enabled" />
                          </div>
                          <Input 
                            type="number" 
                            value={getValue("download-queue-size")} 
                            onChange={(e) => handleChange("download-queue-size", parseInt(e.target.value) || 0)}
                            className="h-11 md:h-12 rounded-xl bg-muted/40 border-none text-numeric" 
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                             <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">{t('settings.transfers.seed_queue')}</label>
                             <Toggle field="seed-queue-enabled" />
                          </div>
                          <Input 
                            type="number" 
                            value={getValue("seed-queue-size")} 
                            onChange={(e) => handleChange("seed-queue-size", parseInt(e.target.value) || 0)}
                            className="h-11 md:h-12 rounded-xl bg-muted/40 border-none text-numeric" 
                          />
                        </div>
                     </div>

                     <Separator className="bg-muted/30" />

                     <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold">{t('settings.transfers.append_part')}</p>
                            <p className="text-[11px] text-muted-foreground/60">{t('settings.transfers.append_part_desc')}</p>
                          </div>
                          <Toggle field="rename-partial-files" />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold">{t('settings.transfers.start_added')}</p>
                            <p className="text-[11px] text-muted-foreground/60">{t('settings.transfers.start_added_desc')}</p>
                          </div>
                          <Toggle field="start-added-torrents" />
                        </div>
                     </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "network" && (
              <div className="space-y-6">
                 <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden">
                  <CardHeader className="p-5 pb-4">
                    <CardTitle className="text-lg md:text-xl font-medium">{t('settings.network.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-8">
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8 md:items-end">
                        <div className="space-y-2 flex-1">
                          <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">{t('settings.network.listening_port')}</label>
                          <Input 
                            type="number" 
                            value={getValue("peer-port")} 
                            onChange={(e) => handleChange("peer-port", parseInt(e.target.value) || 0)}
                            className="h-11 md:h-12 rounded-xl bg-muted/40 border-none text-numeric" 
                          />
                        </div>
                        <div className="space-y-2 flex-grow">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">{t('settings.network.randomize')}</span>
                             <Toggle field="peer-port-random-on-start" />
                          </div>
                          <Button 
                             variant="outline" 
                             onClick={handlePortTest} 
                             disabled={testingPort}
                             className="w-full h-11 md:h-12 rounded-xl text-xs font-bold border-primary/20 hover:bg-primary/10 transition-all gap-2"
                          >
                             {testingPort ? (
                               <RefreshCw className="h-4 w-4 animate-spin" />
                             ) : (
                               <Activity className="h-4 w-4" />
                             )}
                             {testingPort ? t('settings.network.testing') : t('settings.network.test_port')}
                          </Button>
                        </div>
                      </div>

                      <Separator className="bg-muted/30" />

                      <div className="space-y-6">
                          <div className="flex items-start justify-between gap-4">
                             <div>
                                <p className="text-sm md:text-base font-medium tracking-tight leading-snug">{t('settings.network.upnp')}</p>
                                <p className="text-[11px] text-muted-foreground/70">{t('settings.network.upnp_desc')}</p>
                             </div>
                             <Toggle field="port-forwarding-enabled" />
                          </div>
                          <div className="flex items-start justify-between gap-4">
                             <div>
                                <p className="text-sm md:text-base font-medium tracking-tight leading-snug">{t('settings.network.utp')}</p>
                                <p className="text-[11px] text-muted-foreground/70 italic">{t('settings.network.utp_desc')}</p>
                             </div>
                             <Toggle field="utp-enabled" />
                          </div>
                      </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "peers" && (
              <div className="space-y-6">
                 <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden">
                  <CardHeader className="p-5 pb-4">
                    <CardTitle className="text-lg md:text-xl font-medium">{t('settings.peers.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-8">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/20 rounded-2xl border border-muted/30 flex flex-col items-center gap-3 text-center transition-all hover:bg-muted/30">
                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">DHT</div>
                           <p className="text-[11px] font-bold text-muted-foreground tracking-tight">{t('settings.peers.dht')}</p>
                           <Toggle field="dht-enabled" />
                        </div>
                        <div className="p-4 bg-muted/20 rounded-2xl border border-muted/30 flex flex-col items-center gap-3 text-center transition-all hover:bg-muted/30">
                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">PEX</div>
                           <p className="text-[11px] font-bold text-muted-foreground tracking-tight">{t('settings.peers.pex')}</p>
                           <Toggle field="pex-enabled" />
                        </div>
                        <div className="p-4 bg-muted/20 rounded-2xl border border-muted/30 flex flex-col items-center gap-3 text-center transition-all hover:bg-muted/30">
                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">LPD</div>
                           <p className="text-[11px] font-bold text-muted-foreground tracking-tight">{t('settings.peers.lpd')}</p>
                           <Toggle field="lpd-enabled" />
                        </div>
                     </div>

                     <Separator className="bg-muted/30" />

                     <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <p className="text-sm md:text-base font-medium tracking-tight leading-snug">{t('settings.peers.encryption')}</p>
                          <div className="flex p-1 bg-muted/40 rounded-xl gap-1 overflow-x-auto no-scrollbar">
                             <button 
                               onClick={() => handleChange("encryption", "required")}
                               className={cn("px-4 py-1.5 text-[10px] md:text-xs font-bold whitespace-nowrap rounded-lg shadow-sm transition-all", getValue("encryption") === "required" ? "bg-background text-primary" : "text-muted-foreground")}
                             >
                               {t('settings.peers.required')}
                             </button>
                             <button 
                               onClick={() => handleChange("encryption", "preferred")}
                               className={cn("px-4 py-1.5 text-[10px] md:text-xs font-bold whitespace-nowrap rounded-lg shadow-sm transition-all", getValue("encryption") === "preferred" ? "bg-background text-primary" : "text-muted-foreground")}
                             >
                                {t('settings.peers.preferred')}
                             </button>
                             <button 
                               onClick={() => handleChange("encryption", "tolerated")}
                               className={cn("px-4 py-1.5 text-[10px] md:text-xs font-bold whitespace-nowrap rounded-lg shadow-sm transition-all", getValue("encryption") === "tolerated" ? "bg-background text-primary" : "text-muted-foreground")}
                             >
                                {t('settings.peers.tolerated')}
                             </button>
                          </div>
                        </div>
                     </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden">
                  <CardHeader className="p-5 pb-4">
                    <CardTitle className="text-lg md:text-xl font-medium flex items-center gap-2">
                      <Lock className="h-5 w-5 text-destructive" /> {t('settings.peers.blocklist')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                     <div className="flex items-start justify-between gap-4">
                       <div>
                         <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1">{t('settings.peers.blocklist_url')}</p>
                         <p className="text-[11px] text-muted-foreground/60">{t('settings.peers.blocklist_desc')}</p>
                       </div>
                       <Toggle field="blocklist-enabled" />
                     </div>
                     <Input 
                        value={getValue("blocklist-url")} 
                        onChange={(e) => handleChange("blocklist-url", e.target.value)}
                        placeholder="http://example.com/blocklist.gz" 
                        className="h-11 md:h-12 rounded-xl bg-muted/40 border-none font-mono text-xs font-bold" 
                     />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "page" && (
              <div className="space-y-6">
                <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden">
                  <CardHeader className="p-5 pb-4">
                    <CardTitle className="text-lg md:text-xl font-medium flex items-center gap-2">
                       <Monitor className="h-5 w-5 text-primary" /> {t('settings.page.title')}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm text-muted-foreground/70 italic">
                      {t('settings.page.desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button 
                         onClick={() => setPendingAutoRefresh(!getAutoRefresh())}
                         className={cn(
                           "p-5 rounded-2xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden",
                           getAutoRefresh() 
                             ? "bg-primary/10 border-primary shadow-sm" 
                             : "bg-muted/30 border-transparent hover:bg-muted/50"
                         )}
                       >
                         <div className="flex items-center justify-between w-full">
                           <div className={cn(
                             "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                             getAutoRefresh() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                           )}>
                             <RefreshCw className={cn("h-5 w-5", getAutoRefresh() && "animate-spin-slow")} />
                           </div>
                           <Toggle localValue={getAutoRefresh()} setLocalValue={setPendingAutoRefresh} />
                         </div>
                         <div>
                           <p className="text-sm font-bold tracking-tight">{t('settings.page.auto_refresh')}</p>
                           <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed mt-1">
                             {t('settings.page.auto_refresh_desc')}
                           </p>
                         </div>
                       </button>

                       <div className={cn(
                         "p-5 rounded-2xl border transition-all flex flex-col gap-4",
                         !getAutoRefresh() ? "opacity-40 grayscale pointer-events-none bg-muted/10 border-transparent" : "bg-muted/30 border-transparent"
                       )}>
                         <div className="flex items-center gap-2 text-muted-foreground">
                           <Zap className="h-4 w-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest">{t('settings.page.refresh_title')}</p>
                         </div>
                         <div className="flex items-center gap-3">
                           <Input 
                             type="number" 
                             min={0.5}
                             step={0.5}
                             disabled={!getAutoRefresh()}
                             value={getRefreshInterval() / 1000} 
                             onChange={(e) => setPendingRefreshInterval(Math.round(parseFloat(e.target.value) * 1000) || 0)}
                             className="h-11 rounded-xl bg-background/50 border-none text-numeric flex-1 font-bold text-lg" 
                           />
                           <div className="bg-background/50 h-11 px-4 rounded-xl flex items-center justify-center font-bold text-xs text-muted-foreground uppercase">
                             {t('settings.page.refresh_unit')}
                           </div>
                         </div>
                         <p className="text-[10px] text-muted-foreground/60 italic leading-snug">
                           {t('settings.page.refresh_desc')}
                         </p>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "remote" && (
              <div className="space-y-6">
                 <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden">
                  <CardHeader className="p-5 pb-4">
                    <CardTitle className="text-lg md:text-xl font-medium tracking-tight">{t('settings.remote.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-8">
                      <div className="space-y-4 p-5 md:p-6 bg-primary/5 rounded-3xl border border-primary/10">
                         <div className="flex justify-between items-center text-xs md:text-sm">
                            <span className="font-semibold text-muted-foreground tracking-tight">{t('settings.remote.client_version')}</span>
                            <span className="text-numeric font-bold">v0.1.8</span>
                         </div>
                         <div className="flex justify-between items-center text-xs md:text-sm">
                            <span className="font-semibold text-muted-foreground tracking-tight">{t('settings.remote.rpc_version')}</span>
                            <span className="text-numeric font-bold">{session?.["rpc-version"]} ({session?.["rpc-version-semver"]})</span>
                         </div>
                         <div className="flex justify-between items-center text-xs md:text-sm">
                            <span className="font-semibold text-muted-foreground tracking-tight">{t('settings.remote.server_software')}</span>
                            <span className="font-bold tracking-tight">Transmission {session?.version}</span>
                         </div>
                      </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-6 md:right-12 z-50 p-1.5 md:p-2 bg-background/80 backdrop-blur-2xl border border-muted/30 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 ring-1 ring-black/5 dark:ring-white/10 w-[calc(100%-3rem)] md:w-auto">
         <div className="flex items-center gap-2">
            <Button 
              disabled={saving || (Object.keys(pendingChanges).length === 0 && pendingRefreshInterval === null && pendingAutoRefresh === null)}
              onClick={discardChanges}
              variant="ghost" 
              className="flex-1 md:flex-none rounded-xl text-[11px] md:text-xs font-bold h-10 md:h-11 px-6 hover:bg-muted/50 transition-colors uppercase tracking-widest"
            >
              {t('settings.actions.discard')}
            </Button>
            <Button 
              disabled={saving || (Object.keys(pendingChanges).length === 0 && pendingRefreshInterval === null && pendingAutoRefresh === null)}
              onClick={applyChanges}
              className="flex-[2] md:flex-none rounded-xl text-[11px] md:text-xs font-bold h-10 md:h-11 px-8 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : t('settings.actions.apply')}
            </Button>
         </div>
      </div>
    </>
  )
}
