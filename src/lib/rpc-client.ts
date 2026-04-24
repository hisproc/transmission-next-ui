/**
 * Transmission RPC Client
 * Based on RPC Specification v17 (Transmission 4.0.0)
 */
import type {
  FreeSpaceResponse,
  Session,
  SessionStats,
  TorrentAddArgs,
  TorrentAddResponse,
  TorrentGetResponse,
  TorrentId,
  TorrentSetArgs,
} from "./rpc-types"

export interface RPCRequest<TArguments = undefined> {
  method: keyof RPCMethodArguments
  arguments?: TArguments
  tag?: number
}

export interface RPCResponse<TArguments> {
  result: string
  arguments: TArguments
  tag?: number
}

interface RPCMethodArguments {
  "torrent-get": { fields: string[]; ids?: TorrentId[] }
  "session-get": undefined
  "session-set": Partial<Session>
  "session-stats": undefined
  "torrent-start": { ids?: TorrentId[] }
  "torrent-stop": { ids?: TorrentId[] }
  "torrent-remove": { ids: TorrentId[]; "delete-local-data": boolean }
  "torrent-add": TorrentAddArgs
  "torrent-set": { ids: TorrentId[] } & TorrentSetArgs
  "torrent-set-location": { ids: number[]; location: string; move: boolean }
  "torrent-rename-path": { ids: number[]; path: string; name: string }
  "free-space": { path: string }
  "port-test": undefined
  "torrent-verify": { ids?: TorrentId[] }
  "torrent-reannounce": { ids?: TorrentId[] }
}

interface RPCMethodResponses {
  "torrent-get": TorrentGetResponse
  "session-get": Session
  "session-set": Record<string, never>
  "session-stats": SessionStats
  "torrent-start": Record<string, never>
  "torrent-stop": Record<string, never>
  "torrent-remove": Record<string, never>
  "torrent-add": TorrentAddResponse
  "torrent-set": Record<string, never>
  "torrent-set-location": Record<string, never>
  "torrent-rename-path": Record<string, never>
  "free-space": FreeSpaceResponse
  "port-test": { "port-is-open": boolean }
  "torrent-verify": Record<string, never>
  "torrent-reannounce": Record<string, never>
}

class TransmissionRPC {
  private baseUrl: string = "/transmission/rpc"
  private sessionId: string | null = null
  private authHeader: string | null = null

  constructor(config?: { baseUrl?: string; username?: string; password?: string }) {
    if (config?.baseUrl) this.baseUrl = config.baseUrl
    if (config?.username && config?.password) {
      this.authHeader = `Basic ${btoa(`${config.username}:${config.password}`)}`
    }
  }

  /**
   * Execute an RPC call with automatic CSRF token handling
   */
  async request<M extends keyof RPCMethodArguments>(
    method: M,
    args?: RPCMethodArguments[M]
  ): Promise<RPCMethodResponses[M]> {
    const body: RPCRequest<RPCMethodArguments[M]> = {
      method,
      arguments: args,
      tag: Math.floor(Math.random() * 100000),
    }

    const execute = async (isRetry = false): Promise<RPCMethodResponses[M]> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (this.sessionId) {
        headers["X-Transmission-Session-Id"] = this.sessionId
      }

      if (this.authHeader) {
        headers["Authorization"] = this.authHeader
      }

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      // Handle CSRF Protection (409 Conflict)
      if (response.status === 409) {
        const newSessionId = response.headers.get("X-Transmission-Session-Id")
        if (newSessionId) {
          this.sessionId = newSessionId
          if (!isRetry) {
            return execute(true) // Retry once with the new token
          }
        }
        throw new Error("Failed to acquire Transmission Session ID")
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data: RPCResponse<RPCMethodResponses[M]> = await response.json()

      if (data.result !== "success") {
        throw new Error(`RPC Error: ${data.result}`)
      }

      return data.arguments
    }

    return execute()
  }

  // Helper methods for common actions

  async getTorrents(fields: string[], ids?: TorrentId[]) {
    return this.request("torrent-get", { fields, ids })
  }

  async getSession() {
    return this.request("session-get")
  }

  async setSession(args: Partial<Session>) {
    return this.request("session-set", args)
  }

  async getStats() {
    return this.request("session-stats")
  }

  async startTorrents(ids?: TorrentId[]) {
    const args = ids && ids.length > 0 ? { ids } : {}
    return this.request("torrent-start", args)
  }

  async stopTorrents(ids?: TorrentId[]) {
    const args = ids && ids.length > 0 ? { ids } : {}
    return this.request("torrent-stop", args)
  }

  async removeTorrents(ids: TorrentId[], deleteData = false) {
    return this.request("torrent-remove", { ids, "delete-local-data": deleteData })
  }

  async addTorrent(args: TorrentAddArgs) {
    return this.request("torrent-add", args)
  }

  async setTorrent(ids: TorrentId[], args: TorrentSetArgs) {
    return this.request("torrent-set", { ids, ...args })
  }

  async setTorrentLocation(ids: number[], location: string, move: boolean = true) {
    return this.request("torrent-set-location", { ids, location, move })
  }

  async renameTorrentPath(id: number, path: string, name: string) {
    return this.request("torrent-rename-path", { ids: [id], path, name })
  }

  async freeSpace(path: string) {
    return this.request("free-space", { path })
  }
  
  async portTest() {
    return this.request("port-test")
  }

  async verifyTorrents(ids?: TorrentId[]) {
    const args = ids && ids.length > 0 ? { ids } : {}
    return this.request("torrent-verify", args)
  }

  async reannounceTorrents(ids?: TorrentId[]) {
    const args = ids && ids.length > 0 ? { ids } : {}
    return this.request("torrent-reannounce", args)
  }
}

export const rpc = new TransmissionRPC()
