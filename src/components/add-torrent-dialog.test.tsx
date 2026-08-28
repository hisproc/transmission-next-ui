import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { I18nProvider } from "@/lib/i18n-context"
import { AddTorrentDialog } from "./add-torrent-dialog"

const rpcMock = vi.hoisted(() => ({
  addTorrent: vi.fn(),
}))

const parseTorrentMetainfoMock = vi.hoisted(() => vi.fn())
const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

vi.mock("@/lib/rpc-client", () => ({ rpc: rpcMock }))
vi.mock("sonner", () => ({ toast: toastMock }))

vi.mock("@/lib/torrent-metainfo", () => ({
  parseTorrentMetainfo: parseTorrentMetainfoMock,
}))

vi.mock("@/components/location-input", () => ({
  LocationInput: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <input value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}))

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe("AddTorrentDialog file selection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rpcMock.addTorrent.mockResolvedValue({})
    parseTorrentMetainfoMock.mockReturnValue({
      name: "Bundle",
      files: [
        { index: 0, path: "Bundle/video.mkv", length: 2048 },
        { index: 1, path: "Bundle/sample.txt", length: 128 },
      ],
    })
  })

  test("sends deselected file indexes as files-unwanted", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <I18nProvider>
        <AddTorrentDialog>
          <button type="button">Open</button>
        </AddTorrentDialog>
      </I18nProvider>,
    )

    const torrent = new File([new Uint8Array([100, 101])], "bundle.torrent", {
      type: "application/x-bittorrent",
    })
    Object.defineProperty(torrent, "arrayBuffer", {
      value: vi.fn().mockResolvedValue(new ArrayBuffer(2)),
    })

    const input = container.querySelector<HTMLInputElement>('input[type="file"]')
    expect(input).not.toBeNull()
    await user.upload(input!, torrent)

    const sample = await screen.findByRole("checkbox", { name: /sample\.txt/ })
    await user.click(sample)
    expect(sample).toHaveAttribute("aria-checked", "false")

    await user.click(screen.getByRole("button", { name: "Add Torrent" }))

    await waitFor(() => {
      expect(rpcMock.addTorrent).toHaveBeenCalledWith(
        expect.objectContaining({
          "files-unwanted": [1],
          paused: false,
        }),
      )
    })
  })

  test("keeps the original direct-add flow for remote links", async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider>
        <AddTorrentDialog>
          <button type="button">Open</button>
        </AddTorrentDialog>
      </I18nProvider>,
    )

    await user.type(
      await screen.findByPlaceholderText(/Paste magnet links/),
      "https://tracker.example/download?id=2",
    )
    await user.click(screen.getByRole("button", { name: "Add Torrent" }))

    await waitFor(() => {
      expect(rpcMock.addTorrent).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: "https://tracker.example/download?id=2",
          paused: false,
        }),
      )
    })
  })

  test("falls back to direct file add when local metainfo parsing fails", async () => {
    parseTorrentMetainfoMock.mockImplementation(() => {
      throw new Error("unsupported torrent metadata")
    })
    const user = userEvent.setup()
    const { container } = render(
      <I18nProvider>
        <AddTorrentDialog>
          <button type="button">Open</button>
        </AddTorrentDialog>
      </I18nProvider>,
    )

    const torrent = new File([new Uint8Array([100, 101])], "legacy.torrent", {
      type: "application/x-bittorrent",
    })
    Object.defineProperty(torrent, "arrayBuffer", {
      value: vi.fn().mockResolvedValue(new ArrayBuffer(2)),
    })

    const input = container.querySelector<HTMLInputElement>('input[type="file"]')
    expect(input).not.toBeNull()
    await user.upload(input!, torrent)

    expect(await screen.findByText("legacy.torrent")).toBeInTheDocument()
    expect(
      screen.queryByText("Unable to read this torrent file"),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Add Torrent" }))

    await waitFor(() => {
      expect(rpcMock.addTorrent).toHaveBeenCalledWith(
        expect.objectContaining({
          metainfo: expect.any(String),
          paused: false,
        }),
      )
    })
    expect(rpcMock.addTorrent.mock.calls[0][0]).not.toHaveProperty(
      "files-unwanted",
    )
  })

  test("shows feedback when selected files do not use the .torrent extension", async () => {
    const { container } = render(
      <I18nProvider>
        <AddTorrentDialog>
          <button type="button">Open</button>
        </AddTorrentDialog>
      </I18nProvider>,
    )

    const notTorrent = new File([new Uint8Array([100, 101])], "download", {
      type: "application/octet-stream",
    })

    const input = container.querySelector<HTMLInputElement>('input[type="file"]')
    expect(input).not.toBeNull()
    fireEvent.change(input!, { target: { files: [notTorrent] } })

    expect(toastMock.error).toHaveBeenCalledWith("Please select a .torrent file")
    expect(screen.queryByText("download")).not.toBeInTheDocument()
    expect(parseTorrentMetainfoMock).not.toHaveBeenCalled()
  })
})
