"use client"

import * as React from "react"
import { Plus, Link, FileUp, PlayCircle, Clipboard, FolderOpen, ChevronDown, X, FileIcon, Trash2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { rpc } from "@/lib/rpc-client"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { LocationInput } from "@/components/location-input"

interface AddTorrentDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

// Fallback paths if RPC fails
const FALLBACK_PATHS = [
  "/downloads",
  "/downloads/movies",
  "/downloads/tv",
  "/downloads/music",
]

const toBase64 = (file: File): Promise<string> => 
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(',')[1];
      resolve(b64);
    };
    reader.onerror = reject;
  });

export function AddTorrentDialog({ children, onSuccess }: AddTorrentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [location, setLocation] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const [magnetLink, setMagnetLink] = React.useState("")
  const [isDragging, setIsDragging] = React.useState(false)
  const [isAdding, setIsAdding] = React.useState(false)
  const [startImmediately, setStartImmediately] = React.useState(true)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { t } = useI18n()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const torrentFiles = selectedFiles.filter(file => file.name.endsWith('.torrent'))
    if (torrentFiles.length > 0) {
      setFiles(prev => [...prev, ...torrentFiles])
    }
    // Reset input value to allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const torrentFiles = droppedFiles.filter(file => file.name.endsWith('.torrent'))
    
    if (torrentFiles.length > 0) {
      setFiles(prev => [...prev, ...torrentFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0 && !magnetLink) {
      toast.error(t('common.no_input', 'No torrent or magnet link provided'))
      return
    }

    setIsAdding(true)
    try {
      // Handle magnet links
      if (magnetLink) {
        const links = magnetLink.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean)
        for (const link of links) {
          await rpc.addTorrent({ 
            filename: link, 
            "download-dir": location,
            paused: !startImmediately
          })
        }
      }

      // Handle files
      for (const file of files) {
        const metainfo = await toBase64(file)
        await rpc.addTorrent({ 
          metainfo, 
          "download-dir": location,
          paused: !startImmediately
        })
      }

      toast.success(t('common.add_success', 'Torrent added successfully'))
      setOpen(false)
      setFiles([])
      setMagnetLink("")
      setLocation("")
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error("Failed to add torrent:", err)
      toast.error(t('common.add_failed', 'Failed to add torrent'))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-8 gap-6 border-none bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="gap-2 shrink-0">
          <DialogTitle className="text-2xl font-medium tracking-tight">{t('common.add_torrent', 'Add Torrent')}</DialogTitle>
          <DialogDescription className="text-base font-medium opacity-70">
            {t('common.add_torrent_desc', 'Upload a .torrent file or paste a magnet link to start downloading.')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar px-1">
          {magnetLink.trim() === "" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground/60">
                  <FileUp className="h-3.5 w-3.5" /> {t('common.torrent_file', 'Torrent Files')}
                </div>
                {files.length > 0 && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {files.length} {t('common.files', 'files')}
                  </span>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".torrent"
                multiple
                onChange={handleFileChange}
              />

              {files.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group",
                    isDragging 
                      ? "border-primary bg-primary/10 scale-[0.98] shadow-inner" 
                      : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-500",
                    isDragging 
                      ? "bg-primary text-primary-foreground scale-110 rotate-12" 
                      : "bg-muted text-muted-foreground group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <FileUp className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isDragging ? t('common.release_to_drop', 'Release to drop files') : t('common.drop_file', 'Drop your files here')}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{t('common.file_support_desc', 'Supports .torrent files up to 10MB')}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid gap-2">
                    {files.map((file, idx) => (
                      <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-muted/20 group/file">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-9 w-9 rounded-xl bg-background flex items-center justify-center text-muted-foreground group-hover/file:text-primary transition-colors shrink-0">
                            <FileIcon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium break-all whitespace-normal leading-tight">{file.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => removeFile(idx)}
                          title={t('common.remove', 'Remove')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full rounded-2xl border-dashed border-2 py-6 hover:bg-primary/5 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="mr-2 h-4 w-4" /> {t('common.add_more', 'Add More Files')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {magnetLink.trim() === "" && files.length === 0 && (
            <div className="relative animate-in fade-in duration-500">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-medium text-muted-foreground bg-background px-4">
                {t('common.or', 'Or')}
              </div>
            </div>
          )}

          {files.length === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground/60">
                <Link className="h-3.5 w-3.5" /> {t('common.magnet_link', 'Magnet Link')}
              </div>
              <div className="relative group">
                <Textarea 
                  value={magnetLink}
                  onChange={(e) => setMagnetLink(e.target.value)}
                  placeholder={t('common.magnet_placeholder', 'Paste magnet links here (one per line)...')} 
                  className="min-h-[120px] pl-4 pr-14 py-4 rounded-2xl bg-muted/30 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-mono text-xs w-full resize-none no-scrollbar"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 bottom-2 h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-sans"
                  title={t('common.paste_clipboard', 'Paste from clipboard')}
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      setMagnetLink(prev => prev ? `${prev}\n${text}` : text)
                    } catch (e) {
                      console.error("Paste failed", e)
                    }
                  }}
                >
                  <Clipboard className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground/60">
              <FolderOpen className="h-3.5 w-3.5" /> {t('common.save_location', 'Save Location')}
            </div>
            <LocationInput 
              value={location} 
              onChange={setLocation} 
              className="h-14 rounded-2xl bg-muted/30 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-medium text-sm"
              menuClassName="w-[300px] sm:w-[400px]"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-4 pt-4 border-t border-muted/20 shrink-0">
          <div 
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none"
            onClick={() => setStartImmediately(!startImmediately)}
          >
            <div className={cn(
              "h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
              startImmediately ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary/50"
            )}>
              {startImmediately && <CheckIcon className="h-3 w-3" />}
            </div>
            {t('common.start_immediately', 'Start immediately')}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="rounded-xl font-medium px-6" onClick={() => setOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              className="rounded-xl font-medium px-8 shadow-lg shadow-primary/20" 
              disabled={isAdding || (files.length === 0 && !magnetLink)}
              onClick={handleSubmit}
            >
              {isAdding ? t('common.adding', 'Adding...') : t('common.add_torrent', 'Add Torrent')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
