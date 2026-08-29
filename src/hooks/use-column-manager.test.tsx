import * as React from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { I18nProvider } from "@/lib/i18n-context"
import { useColumnManager } from "./use-column-manager"

function wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>
}

describe("useColumnManager", () => {
  test("persists resized column widths by column id", async () => {
    const { result } = renderHook(() => useColumnManager(), { wrapper })

    act(() => {
      result.current.resizeColumn("status", 220)
      result.current.toggleColumn("rateUpload")
      result.current.toggleColumn("rateUpload")
    })

    expect(result.current.columnWidths.status).toBe("220px")

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem("torrent-column-widths") || "{}")).toMatchObject({
        status: "220px",
      })
    })
  })

  test("keeps resized widths above each column minimum", () => {
    const { result } = renderHook(() => useColumnManager(), { wrapper })

    act(() => {
      result.current.resizeColumn("name", 100)
    })

    expect(result.current.columnWidths.name).toBe("250px")
  })
})
