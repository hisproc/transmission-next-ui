"use client"

import { TorrentView } from "@/components/torrent-view"
import { useI18n } from "@/lib/i18n-context"

export default function Page() {
  const { t } = useI18n()
  return <TorrentView title={t('common.paused')} statusFilter="Paused" showStats={false} />
}
