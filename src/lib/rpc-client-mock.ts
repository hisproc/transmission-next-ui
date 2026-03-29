import type { Session, Torrent } from "./rpc-types";
import { MOCK_SESSION, MOCK_STATS, MOCK_TORRENTS } from "./mock-data";

class TransmissionRPCMock {
  private baseUrl: string = "/transmission/rpc";

  constructor(_config?: { baseUrl?: string; username?: string; password?: string }) {
    console.log("TransmissionRPC Mock initialized");
  }

  async request<T = any>(method: string, args?: any): Promise<T> {
    console.log(`[RPC Mock] Request: ${method}`, args);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    switch (method) {
      case "torrent-get":
        return { torrents: MOCK_TORRENTS } as any;
      case "session-get":
        return MOCK_SESSION as any;
      case "session-stats":
        return MOCK_STATS as any;
      case "session-set":
      case "torrent-start":
      case "torrent-stop":
      case "torrent-remove":
      case "torrent-add":
      case "torrent-set":
      case "torrent-set-location":
      case "torrent-rename-path":
        return {} as any;
      case "free-space":
        return { 
          path: args.path, 
          "size-bytes": 500 * 1024 * 1024 * 1024,
          total_size: 1024 * 1024 * 1024 * 1024 
        } as any; // 500GB free / 1TB total
      case "port-test":
        return { "port-is-open": true } as any;
      default:
        throw new Error(`RPC Method ${method} not implemented in mock`);
    }
  }

  async getTorrents(_fields: string[], _ids?: (number | string)[]) {
    return this.request("torrent-get", { ids: _ids });
  }

  async getSession() {
    return this.request("session-get");
  }

  async setSession(args: Partial<Session>) {
    return this.request("session-set", args);
  }

  async getStats() {
    return this.request("session-stats");
  }

  async startTorrents(ids?: (number | string)[]) {
    return this.request("torrent-start", { ids });
  }

  async stopTorrents(ids?: (number | string)[]) {
    return this.request("torrent-stop", { ids });
  }

  async removeTorrents(ids: (number | string)[], deleteData = false) {
    return this.request("torrent-remove", { ids, "delete-local-data": deleteData });
  }

  async addTorrent(args: { 
    filename?: string; 
    metainfo?: string; 
    "download-dir"?: string; 
    paused?: boolean 
  }) {
    return this.request("torrent-add", args);
  }

  async setTorrent(ids: (number | string)[], args: any) {
    return this.request("torrent-set", { ids, ...args });
  }

  async setTorrentLocation(ids: number[], location: string, move: boolean = true) {
    return this.request("torrent-set-location", { ids, location, move });
  }

  async renameTorrentPath(id: number, path: string, name: string) {
    return this.request("torrent-rename-path", { ids: [id], path, name });
  }

  async freeSpace(path: string) {
    return this.request("free-space", { path });
  }
  
  async portTest() {
    return this.request<{ "port-is-open": boolean }>("port-test");
  }
}

export const rpc = new TransmissionRPCMock();
