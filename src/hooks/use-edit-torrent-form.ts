import * as React from "react"
import { toast } from "sonner"
import { rpc } from "@/lib/rpc-client"
import { useI18n } from "@/lib/i18n-context"
import {
  buildEditTorrentSetArgs,
  createInitialEditTorrentFormState,
  EDIT_TORRENT_FIELDS,
  mapTorrentToEditTorrentFormState,
  type EditTorrentDialogTorrent,
  type EditTorrentFormState,
} from "@/lib/edit-torrent-form"

export function useEditTorrentForm(
  torrent: EditTorrentDialogTorrent,
  onSuccess?: () => void
) {
  const { t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<EditTorrentFormState>(() => createInitialEditTorrentFormState(torrent))
  const [isLoading, setIsLoading] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(false)

  React.useEffect(() => {
    if (!open) return

    let active = true
    setIsFetching(true)
    setForm(createInitialEditTorrentFormState(torrent))

    const fetchTorrentDetails = async () => {
      try {
        const data = await rpc.getTorrents(EDIT_TORRENT_FIELDS, [torrent.id])
        const details = data.torrents[0]

        if (active) {
          setForm(mapTorrentToEditTorrentFormState(torrent, details))
        }
      } catch (err) {
        console.error("Failed to fetch torrent details:", err)
      } finally {
        if (active) {
          setIsFetching(false)
        }
      }
    }

    fetchTorrentDetails()

    return () => {
      active = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, torrent.downloadDir, torrent.id, torrent.name])

  const updateField = React.useCallback(<K extends keyof EditTorrentFormState>(
    key: K,
    value: EditTorrentFormState[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleField = React.useCallback((
    key: "moveData" | "downloadLimited" | "uploadLimited" | "honorsSessionLimits"
  ) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (form.name !== torrent.name) {
        await rpc.renameTorrentPath(torrent.id, torrent.name, form.name)
      }

      if (form.location !== (torrent.downloadDir || "/downloads")) {
        await rpc.setTorrentLocation([torrent.id], form.location, form.moveData)
      }

      await rpc.setTorrent([torrent.id], buildEditTorrentSetArgs(form))

      toast.success(t("common.edit_success", "Torrent updated successfully"))
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to update torrent:", error)
      toast.error(t("common.edit_failed", "Failed to update torrent"))
    } finally {
      setIsLoading(false)
    }
  }, [form, onSuccess, t, torrent])

  return {
    open,
    setOpen,
    form,
    updateField,
    toggleField,
    handleSubmit,
    isLoading,
    isFetching,
  }
}
