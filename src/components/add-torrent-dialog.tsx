"use client"

import * as React from "react"
import {
  AlertCircle,
  Check,
  Clipboard,
  FileIcon,
  FileUp,
  FolderOpen,
  Link,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { rpc } from "@/lib/rpc-client"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { LocationInput } from "@/components/location-input"
import { formatSize } from "@/lib/formatters"
import { TorrentFileSelector } from "@/components/torrents/torrent-file-selector"
import {
  parseTorrentMetainfo,
  type TorrentMetainfo,
} from "@/lib/torrent-metainfo"

interface AddTorrentDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

interface TorrentUpload {
  id: string
  file: File
  metainfo?: TorrentMetainfo
  selectedFileIndexes: number[]
  parseError?: string
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      const b64 = result.split(",")[1]
      resolve(b64)
    }
    reader.onerror = reject
  })

export function AddTorrentDialog({
  children,
  onSuccess,
}: AddTorrentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [location, setLocation] = React.useState("")
  const [files, setFiles] = React.useState<TorrentUpload[]>([])
  const [magnetLink, setMagnetLink] = React.useState("")
  const [isDragging, setIsDragging] = React.useState(false)
  const [isAdding, setIsAdding] = React.useState(false)
  const [startImmediately, setStartImmediately] = React.useState(true)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { t } = useI18n()

  const addFiles = (selectedFiles: File[]) => {
    const torrentFiles = selectedFiles.filter((file) =>
      file.name.toLowerCase().endsWith(".torrent"),
    )
    const uploads = torrentFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      selectedFileIndexes: [],
    }))

    if (uploads.length === 0) return
    setFiles((prev) => [...prev, ...uploads])

    uploads.forEach(async (upload) => {
      try {
        const metainfo = parseTorrentMetainfo(
          new Uint8Array(await upload.file.arrayBuffer()),
        )
        setFiles((prev) =>
          prev.map((item) =>
            item.id === upload.id
              ? {
                  ...item,
                  metainfo,
                  selectedFileIndexes: metainfo.files.map((file) => file.index),
                }
              : item,
          ),
        )
      } catch (error) {
        console.error(`Failed to parse ${upload.file.name}:`, error)
        setFiles((prev) =>
          prev.map((item) =>
            item.id === upload.id
              ? {
                  ...item,
                  parseError: t(
                    "common.invalid_torrent_file",
                    "Unable to read this torrent file",
                  ),
                }
              : item,
          ),
        )
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []))
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

    addFiles(Array.from(e.dataTransfer.files))
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const setUploadFileSelection = (uploadId: string, indexes: number[]) => {
    setFiles((prev) =>
      prev.map((upload) =>
        upload.id === uploadId
          ? { ...upload, selectedFileIndexes: indexes }
          : upload,
      ),
    )
  }

  const resetDialog = () => {
    setFiles([])
    setMagnetLink("")
    setLocation("")
    setIsAdding(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) resetDialog()
  }

  const handleSubmit = async () => {
    if (files.length === 0 && !magnetLink) {
      toast.error(t("common.no_input", "No torrent or magnet link provided"))
      return
    }

    if (
      files.some(
        (file) => !file.metainfo || file.selectedFileIndexes.length === 0,
      )
    ) {
      toast.error(
        t(
          "common.select_at_least_one_file",
          "Select at least one file from each torrent",
        ),
      )
      return
    }

    setIsAdding(true)
    try {
      if (magnetLink) {
        const links = magnetLink
          .split(/[\n\r]+/)
          .map((link) => link.trim())
          .filter(Boolean)
        for (const link of links) {
          await rpc.addTorrent({
            filename: link,
            "download-dir": location,
            paused: !startImmediately,
          })
        }
      }

      for (const upload of files) {
        const metainfo = await toBase64(upload.file)
        const selectedIndexes = new Set(upload.selectedFileIndexes)
        const unwantedIndexes = upload
          .metainfo!.files.filter((file) => !selectedIndexes.has(file.index))
          .map((file) => file.index)
        await rpc.addTorrent({
          metainfo,
          "download-dir": location,
          "files-unwanted": unwantedIndexes,
          paused: !startImmediately,
        })
      }

      toast.success(t("common.add_success", "Torrent added successfully"))
      setOpen(false)
      resetDialog()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error("Failed to add torrent:", err)
      toast.error(t("common.add_failed", "Failed to add torrent"))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-8 gap-6 border-none bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100svh-2rem)]">
        <DialogHeader className="gap-2 shrink-0">
          <DialogTitle className="text-2xl font-medium tracking-tight">
            {t("common.add_torrent", "Add Torrent")}
          </DialogTitle>
          <DialogDescription className="text-base font-medium opacity-70">
            {t(
              "common.add_torrent_desc",
              "Upload a .torrent file or paste a magnet link to start downloading.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar px-1 flex-1">
          {magnetLink.trim() === "" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground/60">
                  <FileUp className="h-3.5 w-3.5" />{" "}
                  {t("common.torrent_file", "Torrent Files")}
                </div>
                {files.length > 0 && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {files.length} {t("common.files", "files")}
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
                      : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  <div
                    className={cn(
                      "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-500",
                      isDragging
                        ? "bg-primary text-primary-foreground scale-110 rotate-12"
                        : "bg-muted text-muted-foreground group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary",
                    )}
                  >
                    <FileUp className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isDragging
                        ? t("common.release_to_drop", "Release to drop files")
                        : t("common.drop_file", "Drop your files here")}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      {t(
                        "common.file_support_desc",
                        "Supports .torrent files up to 10MB",
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid gap-2">
                    {files.map((upload) => {
                      return (
                        <div
                          key={upload.id}
                          className="overflow-hidden rounded-lg border border-muted/30 bg-muted/20"
                        >
                          <div className="flex items-center justify-between gap-3 p-3 group/file">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover/file:text-primary transition-colors shrink-0">
                                <FileIcon className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium break-all whitespace-normal leading-tight">
                                  {upload.file.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                  {formatSize(upload.file.size)}
                                  {upload.metainfo &&
                                    ` · ${upload.metainfo.files.length} ${t("common.files", "files")}`}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                              onClick={() => removeFile(upload.id)}
                              title={t("common.remove", "Remove")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {!upload.metainfo && !upload.parseError && (
                            <div className="flex items-center gap-2 border-t border-muted/30 px-4 py-3 text-xs text-muted-foreground">
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              {t(
                                "common.reading_torrent_files",
                                "Reading file list...",
                              )}
                            </div>
                          )}

                          {upload.parseError && (
                            <div className="flex items-center gap-2 border-t border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {upload.parseError}
                            </div>
                          )}

                          {upload.metainfo && (
                            <TorrentFileSelector
                              files={upload.metainfo.files.map((torrentFile) => ({
                                index: torrentFile.index,
                                name: torrentFile.path,
                                length: torrentFile.length,
                                bytesCompleted: 0,
                              }))}
                              selectedFileIndexes={upload.selectedFileIndexes}
                              onSelectionChange={(indexes) =>
                                setUploadFileSelection(upload.id, indexes)
                              }
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-2xl border-dashed border-2 py-6 hover:bg-primary/5 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="mr-2 h-4 w-4" />{" "}
                    {t("common.add_more", "Add More Files")}
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
                {t("common.or", "Or")}
              </div>
            </div>
          )}

          {files.length === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground/60">
                <Link className="h-3.5 w-3.5" />{" "}
                {t("common.magnet_link", "Magnet Link")}
              </div>
              <div className="relative group">
                <Textarea
                  value={magnetLink}
                  onChange={(e) => setMagnetLink(e.target.value)}
                  placeholder={t(
                    "common.magnet_placeholder",
                    "Paste magnet links here (one per line)...",
                  )}
                  className="min-h-[120px] pl-4 pr-14 py-4 rounded-2xl bg-muted/30 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-mono text-xs w-full resize-none no-scrollbar"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 bottom-2 h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-sans"
                  title={t("common.paste_clipboard", "Paste from clipboard")}
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      setMagnetLink((prev) =>
                        prev ? `${prev}\n${text}` : text,
                      )
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
              <FolderOpen className="h-3.5 w-3.5" />{" "}
              {t("common.save_location", "Save Location")}
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
            <div
              className={cn(
                "h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
                startImmediately
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 hover:border-primary/50",
              )}
            >
              {startImmediately && <Check className="h-3 w-3" />}
            </div>
            {t("common.start_immediately", "Start immediately")}
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="rounded-xl font-medium px-6"
              onClick={() => handleOpenChange(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              className="rounded-xl font-medium px-8 shadow-lg shadow-primary/20"
              disabled={
                isAdding ||
                (files.length === 0 && !magnetLink) ||
                files.some(
                  (file) =>
                    !file.metainfo || file.selectedFileIndexes.length === 0,
                )
              }
              onClick={handleSubmit}
            >
              {isAdding
                ? t("common.adding", "Adding...")
                : t("common.add_torrent", "Add Torrent")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
