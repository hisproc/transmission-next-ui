"use client"

import * as React from "react"
import { FolderOpen, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { rpc } from "@/lib/rpc-client"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

const FALLBACK_PATHS = [
  "/downloads",
  "/downloads/movies",
  "/downloads/tv",
  "/downloads/music",
]

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  inputClassName?: string
  placeholder?: string
  menuClassName?: string
  id?: string
  label?: string
  /** When provided, skips internal RPC fetching and uses these options directly */
  externalOptions?: string[]
  leftIcon?: React.ComponentType<{ className?: string }>
  optionIcon?: React.ComponentType<{ className?: string }>
}

export function LocationInput({
  value,
  onChange,
  disabled,
  className,
  inputClassName,
  placeholder,
  menuClassName = "w-[300px] sm:w-[400px]",
  id,
  label,
  externalOptions,
  leftIcon: LeftIcon,
  optionIcon: OptionIcon = FolderOpen,
}: LocationInputProps) {
  const { t } = useI18n()
  const [fetchedOptions, setFetchedOptions] = React.useState<string[]>([])
  const isExternal = externalOptions !== undefined

  React.useEffect(() => {
    if (isExternal) return

    let mounted = true
    const fetchPaths = async () => {
      try {
        const [session, torrentsData] = await Promise.all([
          rpc.getSession(),
          rpc.getTorrents(["downloadDir"])
        ])

        if (!mounted) return

        const paths = new Set<string>()
        const defaultDir = session["download-dir"]

        if (defaultDir) {
          paths.add(defaultDir)
          if (value === "") {
            onChange(defaultDir)
          }
        }

        torrentsData.torrents.forEach((t: { downloadDir?: string }) => {
          if (t.downloadDir) paths.add(t.downloadDir)
        })

        const combinedPaths = Array.from(paths).sort()
        setFetchedOptions(combinedPaths.length > 0 ? combinedPaths : FALLBACK_PATHS)
      } catch (error) {
        console.error("Failed to fetch download paths:", error)
        if (mounted) {
          setFetchedOptions(FALLBACK_PATHS)
          if (value === "") onChange(FALLBACK_PATHS[0])
        }
      }
    }
    fetchPaths()

    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExternal])

  const options = isExternal ? externalOptions : fetchedOptions

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium uppercase tracking-widest text-muted-foreground/60 ml-1">
          {label}
        </label>
      )}
      <div className="relative flex w-full group/input">
        {LeftIcon && (
          <LeftIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors pointer-events-none z-10" />
        )}
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            LeftIcon ? "pl-11" : "",
            "pr-14",
            inputClassName ?? className
          )}
          disabled={disabled}
          placeholder={placeholder || t('common.save_location')}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                disabled={disabled}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            {options.length > 0 && (
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className={cn(
                  "rounded-2xl border-muted/50 p-1 bg-card/95 backdrop-blur-xl shadow-2xl z-60 max-h-75 overflow-y-auto no-scrollbar",
                  menuClassName
                )}
              >
                {options.map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    className="rounded-xl py-3 px-4 text-sm font-medium cursor-pointer"
                    onClick={() => onChange(opt)}
                  >
                    <OptionIcon className="h-4 w-4 mr-3 opacity-50 shrink-0" />
                    <span className="truncate">{opt}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
