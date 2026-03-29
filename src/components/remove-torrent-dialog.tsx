"use client"

import * as React from "react"
import { Trash2, AlertTriangle, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"

interface RemoveTorrentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (deleteLocalData: boolean) => Promise<void>
  count: number
}

export function RemoveTorrentDialog({
  open,
  onOpenChange,
  onConfirm,
  count,
}: RemoveTorrentDialogProps) {
  const { t } = useI18n()
  const [deleteLocalData, setDeleteLocalData] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setDeleteLocalData(false)
      setIsSubmitting(false)
    }
  }, [open])

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(deleteLocalData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl border-none bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader className="gap-2 shrink-0">
          <DialogTitle className="text-2xl font-medium tracking-tight flex items-center gap-3 text-destructive">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            {count > 1 ? t('common.remove', 'Remove Torrents') : t('common.remove', 'Remove Torrent')}
          </DialogTitle>
          <DialogDescription className="text-base font-medium opacity-70">
            {count > 1 
              ? t('common.confirm_remove_all', `Are you sure you want to remove ${count} torrents?`)
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
                <Check className="h-3 w-3 stroke-[3]" />
              )}
            </div>
            <div className="flex flex-col text-left">
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
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <span className="text-[11px] font-medium text-destructive/80 leading-relaxed text-left">
              {t('common.action_warning', 'Warning: This action is permanent and cannot be undone.')}
            </span>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-muted/20">
          <Button 
            variant="ghost" 
            className="rounded-xl font-medium"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button 
            variant="destructive" 
            className="rounded-xl font-medium px-8 shadow-lg shadow-destructive/20 active:scale-[0.98] transition-all"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.removing', 'Removing...') : (count > 1 ? t('common.remove', 'Delete All') : t('common.remove', 'Delete'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
