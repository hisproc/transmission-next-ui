import * as React from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { I18nProvider } from "@/lib/i18n-context"
import { useEditTorrentForm } from "./use-edit-torrent-form"
import { rpc } from "@/lib/rpc-client"
import { toast } from "sonner"
import type { Torrent } from "@/lib/rpc-types"

vi.mock("@/lib/rpc-client", () => ({
  rpc: {
    getTorrents: vi.fn(),
    renameTorrentPath: vi.fn(),
    setTorrentLocation: vi.fn(),
    setTorrent: vi.fn(),
  },
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const torrent = {
  id: 1,
  name: "Ubuntu.iso",
  downloadDir: "/downloads/iso",
}

const details: Torrent = {
  id: 1,
  name: "Ubuntu.iso",
  status: 6,
  hashString: "hash",
  totalSize: 1000,
  percentDone: 1,
  rateDownload: 0,
  rateUpload: 0,
  eta: -1,
  addedDate: 1,
  doneDate: 2,
  downloadDir: "/downloads/iso",
  error: 0,
  errorString: "",
  uploadedEver: 400,
  downloadedEver: 1000,
  uploadRatio: 0.4,
  labels: ['{"text":"Linux"}', "ISO"],
  queuePosition: 0,
  isFinished: true,
  isPrivate: false,
  isStalled: false,
  peersConnected: 0,
  peersSendingToUs: 0,
  peersGettingFromUs: 0,
  bandwidthPriority: 1,
  downloadLimit: 2048,
  downloadLimited: true,
  uploadLimit: 512,
  uploadLimited: true,
  honorsSessionLimits: false,
  seedRatioLimit: 1.5,
  seedRatioMode: 1,
  seedIdleLimit: 30,
  seedIdleMode: 2,
  trackerList: "https://tracker.example/announce",
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>
}

describe("useEditTorrentForm", () => {
  const rpcMock = vi.mocked(rpc)
  const toastMock = vi.mocked(toast)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("fetches torrent details when the dialog opens", async () => {
    rpcMock.getTorrents.mockResolvedValueOnce({ torrents: [details] })

    const { result } = renderHook(() => useEditTorrentForm(torrent), { wrapper })

    act(() => {
      result.current.setOpen(true)
    })

    await waitFor(() => {
      expect(rpcMock.getTorrents).toHaveBeenCalledWith(expect.any(Array), [torrent.id])
    })

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false)
    })

    expect(result.current.form.bandwidthPriority).toBe(1)
    expect(result.current.form.honorsSessionLimits).toBe(false)
    expect(result.current.form.labels).toEqual(["Linux", "ISO"])
  })

  test("submits rename, location and torrent settings changes", async () => {
    const onSuccess = vi.fn()
    rpcMock.getTorrents.mockResolvedValueOnce({ torrents: [details] })
    rpcMock.renameTorrentPath.mockResolvedValueOnce({})
    rpcMock.setTorrentLocation.mockResolvedValueOnce({})
    rpcMock.setTorrent.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEditTorrentForm(torrent, onSuccess), { wrapper })

    act(() => {
      result.current.setOpen(true)
    })

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false)
    })

    act(() => {
      result.current.updateField("name", "Ubuntu-1.iso")
      result.current.updateField("location", "/downloads/linux")
      result.current.updateField("labels", ["Linux", "ISO"])
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault() {} } as React.FormEvent)
    })

    expect(rpcMock.renameTorrentPath).toHaveBeenCalledWith(1, "Ubuntu.iso", "Ubuntu-1.iso")
    expect(rpcMock.setTorrentLocation).toHaveBeenCalledWith([1], "/downloads/linux", true)
    expect(rpcMock.setTorrent).toHaveBeenCalledWith([1], expect.objectContaining({
      labels: ['{"text":"Linux"}', '{"text":"ISO"}'],
    }))
    expect(toastMock.success).toHaveBeenCalledWith("Torrent updated successfully")
    expect(onSuccess).toHaveBeenCalledOnce()
    expect(result.current.open).toBe(false)
  })

  test("shows an error toast when saving fails", async () => {
    const onSuccess = vi.fn()
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    rpcMock.setTorrent.mockRejectedValueOnce(new Error("save failed"))

    const { result } = renderHook(() => useEditTorrentForm(torrent, onSuccess), { wrapper })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault() {} } as React.FormEvent)
    })

    expect(toastMock.error).toHaveBeenCalledWith("Failed to update torrent")
    expect(onSuccess).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
