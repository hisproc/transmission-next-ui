import * as React from "react"
import { FolderOpen, HardDrive, Check, ChevronRight, Settings2 } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { LocationInput } from "@/components/location-input"
import {
  EDIT_TORRENT_ADVANCED_TABS,
  EditTorrentLabelsTab,
  EditTorrentRatioTab,
  EditTorrentSpeedTab,
  EditTorrentTrackersTab,
} from "@/components/torrents/edit-torrent-advanced-tabs"
import type { EditTorrentDialogTorrent } from "@/lib/edit-torrent-form"
import { useEditTorrentForm } from "@/hooks/use-edit-torrent-form"

interface EditTorrentDialogProps {
  torrent: EditTorrentDialogTorrent
  children: React.ReactNode
  onSuccess?: () => void
}

type AdvancedTab = typeof EDIT_TORRENT_ADVANCED_TABS[number]["id"]

export function EditTorrentDialog({ torrent, children, onSuccess }: EditTorrentDialogProps) {
  const { t } = useI18n()
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<AdvancedTab>("speed")
  const { open, setOpen, form, updateField, toggleField, handleSubmit, isLoading, isFetching } =
    useEditTorrentForm(torrent, onSuccess)

  React.useEffect(() => {
    if (open) return

    setAdvancedOpen(false)
    setActiveTab("speed")
  }, [open])

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
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                placeholder="Enter new name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" /> {t('common.save_location')}
              </label>
              <LocationInput
                id="location"
                value={form.location}
                onChange={(value) => updateField("location", value)}
                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary transition-all flex-1"
                disabled={isLoading}
                menuClassName="w-[280px] sm:w-[350px]"
              />
            </div>
            <div 
              className={`flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-muted/50 transition-colors group ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'}`}
              onClick={() => !isLoading && toggleField("moveData")}
            >
              <div className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${form.moveData ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground/30'}`}>
                {form.moveData && <Check className="h-3 w-3" />}
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
              <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300 w-full overflow-hidden">
                {/* Tabs for advanced options */}
                <div className="flex gap-1 p-1 bg-muted/30 rounded-2xl border border-muted/30 overflow-x-auto no-scrollbar">
                  {EDIT_TORRENT_ADVANCED_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 justify-center sm:flex-none sm:px-4",
                        activeTab === tab.id
                          ? "bg-background shadow-sm text-primary"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <tab.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline">{getAdvancedTabLabel(tab.id, t)}</span>
                    </button>
                  ))}
                </div>

                <div className="min-h-[220px]">
                  {activeTab === 'speed' && (
                    <EditTorrentSpeedTab
                      form={form}
                      updateField={updateField}
                      toggleField={toggleField}
                      t={t}
                    />
                  )}

                  {activeTab === 'ratio' && (
                    <EditTorrentRatioTab
                      form={form}
                      updateField={updateField}
                      t={t}
                    />
                  )}

                  {activeTab === 'trackers' && (
                    <EditTorrentTrackersTab
                      form={form}
                      updateField={updateField}
                      t={t}
                    />
                  )}

                  {activeTab === 'labels' && (
                    <EditTorrentLabelsTab
                      form={form}
                      updateField={updateField}
                      t={t}
                    />
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

function getAdvancedTabLabel(tab: AdvancedTab, t: (key: string, fallback?: string) => string) {
  switch (tab) {
    case "speed":
      return t("settings.tabs.speed")
    case "ratio":
      return t("details.storage_ratio")
    case "trackers":
      return t("details.trackers")
    case "labels":
      return t("common.labels")
  }
}
