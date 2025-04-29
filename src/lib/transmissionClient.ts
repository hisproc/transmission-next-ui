import axios from 'axios';

import {
    AddTorrentOptions,
    DeleteTorrentOptions,
    GetTorrentsOptions,
    NewLocationOptions,
    PortTestOptions,
    RenamePathOptions,
    SetTorrentOptions,
    StopTorrentOptions,
    TransmissionSession
} from '@/lib/types';

const transmission = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 3000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let sessionId: null = null;

transmission.interceptors.request.use(config => {
    if (sessionId) {
        config.headers['X-Transmission-Session-Id'] = sessionId;
    }
    return config;
});

transmission.interceptors.response.use(
    res => res,
    async error => {
        if (error.response?.status === 409) {
            const newSessionId = error.response.headers['x-transmission-session-id'];
            if (newSessionId) {
                sessionId = newSessionId;
                // 重新发送原始请求
                const config = error.config;
                config.headers['X-Transmission-Session-Id'] = sessionId;
                return transmission(config);
            }
        }
        return Promise.reject(error);
    }
);

export const allTorrentFields = ["id", "name", "status", "hashString", "totalSize", "percentDone", "addedDate", "trackerStats", "leftUntilDone", "rateDownload", "rateUpload", "recheckProgress", "rateDownload", "rateUpload", "peersGettingFromUs", "peersSendingToUs", "uploadRatio", "uploadedEver", "downloadedEver", "downloadDir", "error", "errorString", "doneDate", "queuePosition", "activityDate", "eta", "labels"];

export const singleTorrentFields = ["fileStats", "trackerStats", "peers", "leftUntilDone", "status", "rateDownload", "rateUpload", "uploadedEver", "uploadRatio", "error", "errorString", "pieces", "pieceCount", "pieceSize", "files", "trackers", "comment", "dateCreated", "creator", "downloadDir", "hashString", "addedDate", "label"];


export const getTorrents = async (options: GetTorrentsOptions) => {
    const payload = {
        method: 'torrent-get',
        arguments: options,
    };
    const response = await transmission.post('', payload);
    return response.data.arguments;
}

/**
 * 添加下载任务
 * @param {Object} options - 添加参数
 * @param {string} [options.filename] - 磁力链接或URL
 * @param {string} [options.metainfo] - base64编码的.torrent文件内容
 * @param {string} [options.downloadDir] - 指定下载目录
 */
export const addTorrent = async (options: AddTorrentOptions) => {
    const payload = {
        method: 'torrent-add',
        arguments: options,
    };

    const response = await transmission.post('', payload);
    if (response.data.result !== 'success') {
        throw new Error(response.data.result);
    }
    return response.data.arguments;
};

export const deleteTorrent = async (options: DeleteTorrentOptions) => {
    const payload = {
        method: 'torrent-remove',
        arguments: options
    }
    const response = await transmission.post('', payload);
    return response.data.arguments;
};

export const setTorrent = async (options: SetTorrentOptions) => {
    const payload = {
        method: 'torrent-set',
        arguments: options
    }
    const response = await transmission.post('', payload);
    return response.data.arguments;
}

export const stopTorrent = async (options: StopTorrentOptions) => {
    const payload = {
        method: 'torrent-stop',
        arguments: options
    }
    const response = await transmission.post('', payload);
    return response.data.arguments;
};

export const startTorrent = async (options: StopTorrentOptions) => {
    const payload = {
        method: 'torrent-start',
        arguments: options
    }
    const response = await transmission.post('', payload);
    return response.data.arguments;
}

export const renamePath = async (options: RenamePathOptions) => {
    const payload = {
        method: 'torrent-rename-path',
        arguments: options,
    };
    const response = await transmission.post('', payload);
    return response.data.arguments;
};

export const setLocation = async (options: NewLocationOptions) => {
    const payload = {
        method: 'torrent-set-location',
        arguments: options,
    };
    const response = await transmission.post('', payload);
    return response.data.arguments;
};

export const getSessionStats = async () => {
    const payload = {
        method: 'session-stats',
    };
    const response = await transmission.post('', payload);
    return response.data.arguments;
};

export const getFreeSpace = async (path: string) => {
    const payload = {
        method: 'free-space',
        arguments: {
            path,
        },
    };
    const response = await transmission.post('', payload);
    return response.data.arguments;
};

export const getSession = async () => {
    const payload = {
        method: 'session-get',
    };
    const response = await transmission.post('', payload);
    return response.data.arguments;
};

export const setSession = async (options: TransmissionSession) => {
    const payload = {
        method: 'session-set',
        arguments: options,
    };
    const response = await transmission.post('', payload);
    return response.data.arguments;
}

export const portTest = async (options: PortTestOptions) => {
    const payload = {
        method: 'port-test',
        arguments: options,
    };
    const response = await transmission.post('', payload);
    return response.data.arguments;
}

export default transmission;