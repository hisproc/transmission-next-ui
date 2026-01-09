import './App.css'
import { AppSidebar } from "@/components/layout/AppSidebar.tsx"
import { TorrentManager } from "@/components/torrent/TorrentManager.tsx"
import { SectionCards } from "@/components/stats/SectionCards.tsx"
import { SiteHeader } from "@/components/layout/SiteHeader.tsx"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";

import { allTorrentFields, getFreeSpace, getSession, getSessionStats, getTorrents } from './lib/api/transmissionClient.ts'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { SessionSetting } from '@/components/forms/settings/SessionSetting'
import About from './components/shared/About.tsx'
import { ThemeProvider } from './components/layout/ThemeProvider.tsx'
import { schema } from './schemas/torrentSchema.ts'
import { STORAGE_KEYS } from './constants/storage.ts';

const client = new QueryClient()
function Main() {
    const [refetchInterval, setRefetchInterval] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.REFETCH_INTERVAL);
        return saved ? JSON.parse(saved) : 5000;
    });

    // Initialize font settings
    useEffect(() => {
        const savedFont = localStorage.getItem(STORAGE_KEYS.UI_FONT_FAMILY);
        if (savedFont) {
            document.documentElement.style.setProperty('--app-font-family', savedFont);
        }
    }, []);

    const { data: torrentData } = useQuery({
        queryKey: ['torrent'],
        queryFn: () => getTorrents({ fields: allTorrentFields }),
        refetchInterval,
        select: (data) => data.torrents.map((torrent: any) => schema.parse(torrent))
    })

    const { data: sessionStats } = useQuery({
        queryKey: ['torrent', 'stats'],
        queryFn: () => getSessionStats(),
        refetchInterval,
    })

    const { data: session } = useQuery({
        queryKey: ['torrent', 'session'],
        queryFn: () => getSession(),
        refetchInterval,
    })

    const { data: freeSpace } = useQuery({
        queryKey: ['torrent, free-space'],
        queryFn: () => getFreeSpace(session?.["download-dir"]),
        refetchInterval,
        enabled: !!session
    })

    return (
        <>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <SidebarProvider>
                    <Toaster />
                    <AppSidebar variant="inset" />
                    <SidebarInset >
                        <SiteHeader />
                        <div className="flex flex-1 flex-col">
                            <div className="@container/main flex flex-1 flex-col gap-2">
                                <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
                                    <Routes>
                                        <Route path="/" element={<>
                                            <SectionCards
                                                torrentData={torrentData || []}
                                                data={sessionStats || {}}
                                                session={session || {}}
                                                freespace={freeSpace || {}}
                                            />
                                            <TorrentManager data={torrentData || []} session={session || {}} refetchInterval={refetchInterval} setRefetchInterval={setRefetchInterval} />
                                        </>} />
                                        <Route path="/settings" element={<>
                                            <SessionSetting />
                                        </>} />
                                        <Route path="/about" element={
                                            <About session={session || {}} />
                                        }
                                        />
                                    </Routes>
                                </div>
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </ThemeProvider>
        </>
    )
}
function App() {
    return (
        <QueryClientProvider client={client}>
            <Main />
        </QueryClientProvider>
    )
}

export default App
