import { StatCard } from "./StatCard"
import { filesize } from "filesize"
import { FreeSpace, SessionStats, Torrent, TransmissionSession } from "@/lib/types"
import { useTranslation } from "react-i18next"
import { STORAGE_KEYS } from "@/constants/storage";
import { useState } from "react";
import { Folder, ChevronDown, ChevronUp } from "lucide-react";

function summarySpeed(torrentData: Torrent[], field: string) {
  return torrentData.reduce((acc, torrent) => {
    const speed = field === "uploadSpeed" ? torrent.rateUpload : torrent.rateDownload;
    return acc + speed;
  }, 0);
}

export function SectionCards({ torrentData, data, session, freespace }: { torrentData: Torrent[], data: SessionStats, session: TransmissionSession, freespace: FreeSpace }) {

  const { t } = useTranslation();
  const [uploadDataType, setUploadDataType] = useState<'current' | 'session' | 'total'>('current');
  const [downloadDataType, setDownloadDataType] = useState<'current' | 'session' | 'total'>('current');
  const [torrentDataType, setTorrentDataType] = useState<'active' | 'total' | 'paused'>('active');
  const [spaceDataType, setSpaceDataType] = useState<'free' | 'total' | 'used'>('free');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const clientNetworkSpeedSummary = localStorage.getItem(STORAGE_KEYS.CLIENT_NETWORK_SPEED_SUMMARY) === "true";

  const getUploadData = () => {
    switch (uploadDataType) {
      case 'current':
        return {
          speed: clientNetworkSpeedSummary ? 
            summarySpeed(torrentData, "uploadSpeed") : 
            data?.uploadSpeed || 0,
          label: t("Upload Speed")
        };
      case 'session':
        return {
          speed: data?.["current-stats"]?.uploadedBytes || 0,
          label: t("Session Upload")
        };
      case 'total':
        return {
          speed: data?.["cumulative-stats"]?.uploadedBytes || 0,
          label: t("Total Upload")
        };
      default:
        return {
          speed: data?.uploadSpeed || 0,
          label: t("Upload Speed")
        };
    }
  };

  const uploadData = getUploadData();

  const getDownloadData = () => {
    switch (downloadDataType) {
      case 'current':
        return {
          speed: clientNetworkSpeedSummary ? 
            summarySpeed(torrentData, "downloadSpeed") : 
            data?.downloadSpeed || 0,
          label: t("Download Speed")
        };
      case 'session':
        return {
          speed: data?.["current-stats"]?.downloadedBytes || 0,
          label: t("Session Download")
        };
      case 'total':
        return {
          speed: data?.["cumulative-stats"]?.downloadedBytes || 0,
          label: t("Total Download")
        };
      default:
        return {
          speed: data?.downloadSpeed || 0,
          label: t("Download Speed")
        };
    }
  };

  const getTorrentData = () => {
    switch (torrentDataType) {
      case 'active':
        return {
          count: data?.activeTorrentCount || 0,
          label: t("Active Torrents")
        };
      case 'total':
        return {
          count: data?.torrentCount || 0,
          label: t("Total Torrents")
        };
      case 'paused':
        return {
          count: data?.pausedTorrentCount || 0,
          label: t("Paused Torrents")
        };
      default:
        return {
          count: data?.activeTorrentCount || 0,
          label: t("Active Torrents")
        };
    }
  };

  const getSpaceData = () => {
    const totalSize = freespace["total_size"] || 0;
    const freeSize = freespace["size-bytes"] || 0;
    const usedSize = totalSize - freeSize;
    
    switch (spaceDataType) {
      case 'free':
        return {
          size: freeSize,
          label: t("Free Space")
        };
      case 'total':
        return {
          size: totalSize,
          label: t("Total Space")
        };
      case 'used':
        return {
          size: usedSize,
          label: t("Used Space")
        };
      default:
        return {
          size: freeSize,
          label: t("Free Space")
        };
    }
  };

  const downloadData = getDownloadData();
  const torrentDataInfo = getTorrentData();
  const spaceData = getSpaceData();

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        label={uploadData.label}
        value={uploadDataType === 'current'
          ? `${filesize(uploadData.speed)} /s`
          : filesize(uploadData.speed)
        }
        tabs={[
          { key: 'current', label: t("Current") },
          { key: 'session', label: t("Session") },
          { key: 'total', label: t("Total") }
        ]}
        activeTab={uploadDataType}
        onTabChange={(tab) => setUploadDataType(tab as any)}
        collapsed={isCollapsed}
        // 在第一个卡片添加全局折叠控制
        extraIcon={
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 -m-1 rounded-md hover:bg-muted/50 transition-colors"
            title={isCollapsed ? t("Expand All") : t("Collapse All")}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
          </button>
        }
      />
      
      <StatCard
        label={downloadData.label}
        value={downloadDataType === 'current' 
          ? `${filesize(downloadData.speed)} /s` 
          : filesize(downloadData.speed)
        }
        tabs={[
          { key: 'current', label: t("Current") },
          { key: 'session', label: t("Session") },
          { key: 'total', label: t("Total") }
        ]}
        activeTab={downloadDataType}
        onTabChange={(tab) => setDownloadDataType(tab as any)}
        collapsed={isCollapsed}
      />
      
      <StatCard
        label={torrentDataInfo.label}
        value={torrentDataInfo.count}
        tabs={[
          { key: 'active', label: t("ActiveTorrents") },
          { key: 'total', label: t("Total") },
          { key: 'paused', label: t("Paused") }
        ]}
        activeTab={torrentDataType}
        onTabChange={(tab) => setTorrentDataType(tab as any)}
        collapsed={isCollapsed}
      />
      
      <StatCard
        label={spaceData.label}
        value={filesize(spaceData.size)}
        tabs={[
          { key: 'free', label: t("Free") },
          { key: 'total', label: t("Total") },
          { key: 'used', label: t("Used") }
        ]}
        activeTab={spaceDataType}
        onTabChange={(tab) => setSpaceDataType(tab as any)}
        icon={<Folder className="h-4 w-4 text-muted-foreground" />}
        iconTooltip={`${t("Path")}: ${session["download-dir"] || "/"}`}
        collapsed={isCollapsed}
      />
    </div>
  )
}
