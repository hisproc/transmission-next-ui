import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"

import { I18nProvider } from "@/lib/i18n-context"
import { TorrentFileSelector } from "./torrent-file-selector"

const files = [
  { index: 0, name: "bundle/video.mkv", length: 2048, bytesCompleted: 1024 },
  { index: 1, name: "bundle/sample.txt", length: 128, bytesCompleted: 0 },
]

test("toggles individual files and all files", async () => {
  const onSelectionChange = vi.fn()
  const user = userEvent.setup()
  const { rerender } = render(
    <I18nProvider>
      <TorrentFileSelector
        files={files}
        selectedFileIndexes={[0, 1]}
        onSelectionChange={onSelectionChange}
      />
    </I18nProvider>,
  )

  await user.click(screen.getByRole("checkbox", { name: /sample\.txt/ }))
  expect(onSelectionChange).toHaveBeenLastCalledWith([0])

  rerender(
    <I18nProvider>
      <TorrentFileSelector
        files={files}
        selectedFileIndexes={[0]}
        onSelectionChange={onSelectionChange}
      />
    </I18nProvider>,
  )
  await user.click(screen.getByRole("checkbox", { name: /Select all/ }))
  expect(onSelectionChange).toHaveBeenLastCalledWith([0, 1])
})
