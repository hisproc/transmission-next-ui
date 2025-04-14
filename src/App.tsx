import './App.css'
import { AppSidebar } from "@/components/AppSidebar"
import { TorrentManager } from "@/components/TorrentManager"
import { SectionCards } from "@/components/SectionCards"
import { SiteHeader } from "@/components/SiteHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Routes, Route } from 'react-router-dom';

import { allTorrentFields, getFreeSpace, getSession, getSessionStats, getTorrents } from './lib/transmissionClient'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { SessionSetting } from './components/settings/SessionSetting'
import About from './components/About'
import { ThemeProvider } from './components/ThemeProvider.tsx'

const client = new QueryClient()
function Main() {

    const { data: torrentData } = useQuery({
        queryKey: ['torrent'],
        queryFn: () => getTorrents({ fields: allTorrentFields }),
        refetchInterval: 5000,
        select: (data) => data.torrents
    })

    const { data: sessionStats } = useQuery({
        queryKey: ['torrent', 'stats'],
        queryFn: () => getSessionStats(),
        refetchInterval: 5000,
    })

    const { data: session } = useQuery({
        queryKey: ['torrent', 'session'],
        queryFn: () => getSession(),
        refetchInterval: 5000,
    })

    const { data: freeSpace } = useQuery({
        queryKey: ['torrent, free-space'],
        queryFn: () => getFreeSpace(session?.["download-dir"]),
        refetchInterval: 5000,
        enabled: !!session
    })

    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
                                                data={sessionStats || {}}
                                                session={session || {}}
                                                freespace={freeSpace || {}}
                                            />
                                            <TorrentManager data={torrentData || []} session={session || {}} />
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
