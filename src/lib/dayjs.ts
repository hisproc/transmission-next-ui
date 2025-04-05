import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import durationFormat from "dayjs/plugin/duration"

dayjs.extend(duration);
dayjs.extend(durationFormat);

export function formatEta(seconds: number, t: Function) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    const parts = []
    if (h) parts.push(`${h}${t("h")}`)
    if (m) parts.push(`${m}${t("m")}`)
    if (s || parts.length === 0) parts.push(`${s}${t("s")}`)

    return parts.join("")
}

export default dayjs;