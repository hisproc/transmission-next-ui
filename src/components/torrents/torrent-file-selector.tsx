import { Check, Minus } from "lucide-react"

import { formatSize } from "@/lib/formatters"
import { useI18n } from "@/lib/i18n-context"
import type { SelectableTorrentFile } from "@/lib/torrent-file-selection"
import { cn } from "@/lib/utils"

interface TorrentFileSelectorProps {
  files: SelectableTorrentFile[]
  selectedFileIndexes: number[]
  onSelectionChange: (indexes: number[]) => void
  showProgress?: boolean
  maxHeightClassName?: string
}

function SelectionCheckbox({ checked }: { checked: boolean | "mixed" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/40",
      )}
    >
      {checked === true ? (
        <Check className="h-3 w-3" />
      ) : checked === "mixed" ? (
        <Minus className="h-3 w-3" />
      ) : null}
    </span>
  )
}

export function TorrentFileSelector({
  files,
  selectedFileIndexes,
  onSelectionChange,
  showProgress = false,
  maxHeightClassName = "max-h-52",
}: TorrentFileSelectorProps) {
  const { t } = useI18n()
  const selected = new Set(selectedFileIndexes)
  const allSelected = files.length > 0 && selected.size === files.length
  const someSelected = selected.size > 0
  const selectedBytes = files.reduce(
    (total, file) => total + (selected.has(file.index) ? file.length : 0),
    0,
  )

  const toggleFile = (index: number) => {
    onSelectionChange(
      selected.has(index)
        ? selectedFileIndexes.filter((fileIndex) => fileIndex !== index)
        : [...selectedFileIndexes, index].sort((a, b) => a - b),
    )
  }

  return (
    <div className="overflow-hidden border-y border-muted/30">
      <button
        type="button"
        role="checkbox"
        aria-checked={allSelected ? true : someSelected ? "mixed" : false}
        className="flex min-h-11 w-full items-center gap-3 bg-muted/20 px-4 text-left text-xs font-medium hover:bg-muted/40"
        onClick={() =>
          onSelectionChange(allSelected ? [] : files.map((file) => file.index))
        }
      >
        <SelectionCheckbox
          checked={allSelected ? true : someSelected ? "mixed" : false}
        />
        <span className="flex-1">{t("common.select_all", "Select all")}</span>
        <span className="text-right text-muted-foreground">
          {selected.size}/{files.length} · {formatSize(selectedBytes)}
        </span>
      </button>

      <div
        className={cn(
          "overflow-y-auto border-t border-muted/20",
          maxHeightClassName,
        )}
      >
        {files.map((file) => {
          const checked = selected.has(file.index)
          const progress =
            file.length > 0
              ? Math.min(100, (file.bytesCompleted / file.length) * 100)
              : 0

          return (
            <button
              key={file.index}
              type="button"
              role="checkbox"
              aria-checked={checked}
              className="flex min-h-11 w-full items-center gap-3 border-b border-muted/20 px-4 py-2 text-left last:border-0 hover:bg-muted/30"
              onClick={() => toggleFile(file.index)}
            >
              <SelectionCheckbox checked={checked} />
              <span
                className="min-w-0 flex-1 break-all text-xs"
                title={file.name}
              >
                {file.name}
              </span>
              <span className="w-20 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                {formatSize(file.length)}
              </span>
              {showProgress && (
                <span className="flex w-32 shrink-0 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </span>
                  <span className="w-10 text-right text-[10px] tabular-nums">
                    {progress.toFixed(1)}%
                  </span>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
