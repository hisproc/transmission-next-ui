import { HashRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout"
import { TorrentView } from "@/components/torrent-view"
import TorrentDetailsPage from "@/app/torrents/detail/page"
import SettingsPage from "@/app/settings/page"
import { useI18n } from "@/lib/i18n-context"

function AppRoutes() {
  const { t } = useI18n()
  
  return (
    <Routes>
      <Route path="/" element={<TorrentView key="all" />} />
      <Route path="/active" element={<TorrentView key="active" statusFilter="active" showStats={false} />} />
      <Route path="/downloading" element={<TorrentView key="downloading" statusFilter="downloading" showStats={false} />} />
      <Route path="/paused" element={<TorrentView key="paused" statusFilter="Paused" showStats={false} />} />
      <Route path="/seeding" element={<TorrentView key="seeding" statusFilter="Seeding" showStats={false} />} />
      <Route path="/settings" element={<SettingsPage key="settings" />} />
      <Route path="/torrents/detail" element={<TorrentDetailsPage key="detail" />} />
    </Routes>
  )
}

function App() {
  return (
    <HashRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </HashRouter>
  )
}

export default App
