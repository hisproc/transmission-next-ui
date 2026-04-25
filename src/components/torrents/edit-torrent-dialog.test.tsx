import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { I18nProvider } from "@/lib/i18n-context"
import { EditTorrentDialog } from "./edit-torrent-dialog"

const useEditTorrentFormMock = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/use-edit-torrent-form", () => ({
  useEditTorrentForm: useEditTorrentFormMock,
}))

vi.mock("@/components/location-input", () => ({
  LocationInput: ({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) => (
    <input
      data-testid={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

vi.mock("@/components/torrents/edit-torrent-advanced-tabs", () => ({
  EDIT_TORRENT_ADVANCED_TABS: [
    { id: "speed", icon: () => null },
    { id: "ratio", icon: () => null },
    { id: "trackers", icon: () => null },
    { id: "labels", icon: () => null },
  ],
  EditTorrentSpeedTab: () => <div>Speed Panel</div>,
  EditTorrentRatioTab: () => <div>Ratio Panel</div>,
  EditTorrentTrackersTab: () => <div>Trackers Panel</div>,
  EditTorrentLabelsTab: () => <div>Labels Panel</div>,
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

describe("EditTorrentDialog", () => {
  const updateField = vi.fn()
  const toggleField = vi.fn()
  const setOpen = vi.fn()
  const handleSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())

  beforeEach(() => {
    vi.clearAllMocks()
    useEditTorrentFormMock.mockReturnValue({
      open: true,
      setOpen,
      form: {
        name: "Ubuntu.iso",
        location: "/downloads/iso",
        moveData: true,
        bandwidthPriority: 0,
        downloadLimit: 0,
        downloadLimited: false,
        uploadLimit: 0,
        uploadLimited: false,
        honorsSessionLimits: true,
        seedRatioLimit: 0,
        seedRatioMode: 0,
        seedIdleLimit: 0,
        seedIdleMode: 0,
        trackerList: "",
        labels: [],
      },
      updateField,
      toggleField,
      handleSubmit,
      isLoading: false,
      isFetching: false,
    })
  })

  test("renders the form and expands advanced content", async () => {
    const user = userEvent.setup()

    render(
      <I18nProvider>
        <EditTorrentDialog torrent={{ id: 1, name: "Ubuntu.iso", downloadDir: "/downloads/iso" }}>
          <button type="button">Open</button>
        </EditTorrentDialog>
      </I18nProvider>
    )

    expect(screen.getByRole("heading", { name: "Edit Torrent" })).toBeInTheDocument()
    expect(screen.getByDisplayValue("Ubuntu.iso")).toBeInTheDocument()
    expect(screen.getByTestId("location")).toHaveValue("/downloads/iso")

    await user.click(screen.getByText("Move existing data"))
    expect(toggleField).toHaveBeenCalledWith("moveData")

    await user.click(screen.getByRole("button", { name: "Advanced Options" }))
    expect(screen.getByText("Speed Panel")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Labels" }))
    expect(screen.getByText("Labels Panel")).toBeInTheDocument()
  })

  test("shows a loading state while fetching torrent details", () => {
    useEditTorrentFormMock.mockReturnValue({
      open: true,
      setOpen,
      form: {
        name: "",
        location: "",
        moveData: true,
        bandwidthPriority: 0,
        downloadLimit: 0,
        downloadLimited: false,
        uploadLimit: 0,
        uploadLimited: false,
        honorsSessionLimits: true,
        seedRatioLimit: 0,
        seedRatioMode: 0,
        seedIdleLimit: 0,
        seedIdleMode: 0,
        trackerList: "",
        labels: [],
      },
      updateField,
      toggleField,
      handleSubmit,
      isLoading: false,
      isFetching: true,
    })

    render(
      <I18nProvider>
        <EditTorrentDialog torrent={{ id: 1, name: "Ubuntu.iso", downloadDir: "/downloads/iso" }}>
          <button type="button">Open</button>
        </EditTorrentDialog>
      </I18nProvider>
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
    expect(screen.queryByDisplayValue("Ubuntu.iso")).not.toBeInTheDocument()
  })
})
