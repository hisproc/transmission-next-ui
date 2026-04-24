import { beforeEach, describe, expect, test, vi } from "vitest"
import { rpc } from "./rpc-client"

function createResponse({
  status = 200,
  statusText = "OK",
  headers = {},
  body,
}: {
  status?: number
  statusText?: string
  headers?: Record<string, string>
  body?: unknown
}) {
  return {
    status,
    statusText,
    ok: status >= 200 && status < 300,
    headers: {
      get: (name: string) => headers[name] ?? null,
    },
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

describe("TransmissionRPC", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
    ;((rpc as unknown) as { sessionId: string | null }).sessionId = null
  })

  test("retries once after acquiring a transmission session id", async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse({
        status: 409,
        statusText: "Conflict",
        headers: { "X-Transmission-Session-Id": "session-123" },
      }))
      .mockResolvedValueOnce(createResponse({
        body: {
          result: "success",
          arguments: { "port-is-open": true },
        },
      }))

    await expect(rpc.portTest()).resolves.toEqual({ "port-is-open": true })
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const firstHeaders = fetchMock.mock.calls[0][1]?.headers as Record<string, string>
    const secondHeaders = fetchMock.mock.calls[1][1]?.headers as Record<string, string>

    expect(firstHeaders["X-Transmission-Session-Id"]).toBeUndefined()
    expect(secondHeaders["X-Transmission-Session-Id"]).toBe("session-123")
  })

  test("throws when the RPC result is not success", async () => {
    fetchMock.mockResolvedValueOnce(createResponse({
      body: {
        result: "duplicate torrent",
        arguments: {},
      },
    }))

    await expect(rpc.getSession()).rejects.toThrow("RPC Error: duplicate torrent")
  })

  test("omits ids when starting all torrents", async () => {
    fetchMock.mockResolvedValueOnce(createResponse({
      body: {
        result: "success",
        arguments: {},
      },
    }))

    await rpc.startTorrents([])

    const [, options] = fetchMock.mock.calls[0]
    const requestBody = JSON.parse(options.body as string) as {
      method: string
      arguments: Record<string, unknown>
    }

    expect(requestBody.method).toBe("torrent-start")
    expect(requestBody.arguments).toEqual({})
  })
})
