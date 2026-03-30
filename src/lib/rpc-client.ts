/**
 * Transmission RPC Client
 * Based on RPC Specification v17 (Transmission 4.0.0)
 */
import type { Session, Torrent } from "./rpc-types"

export interface RPCRequest {
  method: string
  arguments?: any
  tag?: number
}

export interface RPCResponse<T = any> {
  result: string
  arguments: T
  tag?: number
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
  async request<T = any>(method: string, args?: any): Promise<T> {
    const body: RPCRequest = {
      method,
      arguments: args,
      tag: Math.floor(Math.random() * 100000),
    }

    const execute = async (isRetry = false): Promise<any> => {
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

      const data: RPCResponse<T> = await response.json()

      if (data.result !== "success") {
        throw new Error(`RPC Error: ${data.result}`)
      }

      return data.arguments
    }

    return execute()
  }

  // Helper methods for common actions

  async getTorrents(fields: string[], ids?: (number | string)[]) {
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

  async startTorrents(ids?: (number | string)[]) {
    const args = ids && ids.length > 0 ? { ids } : {}
    return this.request("torrent-start", args)
  }

  async stopTorrents(ids?: (number | string)[]) {
    const args = ids && ids.length > 0 ? { ids } : {}
    return this.request("torrent-stop", args)
  }

  async removeTorrents(ids: (number | string)[], deleteData = false) {
    return this.request("torrent-remove", { ids, "delete-local-data": deleteData })
  }

  async addTorrent(args: { 
    filename?: string; 
    metainfo?: string; 
    "download-dir"?: string; 
    paused?: boolean 
  }) {
    return this.request("torrent-add", args)
  }

  async setTorrent(ids: (number | string)[], args: any) {
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
    return this.request<{ "port-is-open": boolean }>("port-test")
  }

  async verifyTorrents(ids?: (number | string)[]) {
    const args = ids && ids.length > 0 ? { ids } : {}
    return this.request("torrent-verify", args)
  }

  async reannounceTorrents(ids?: (number | string)[]) {
    const args = ids && ids.length > 0 ? { ids } : {}
    return this.request("torrent-reannounce", args)
  }
}

export const rpc = new TransmissionRPC()
