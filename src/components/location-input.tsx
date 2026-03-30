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
  placeholder?: string
  menuClassName?: string
  id?: string
}

export function LocationInput({ 
  value, 
  onChange, 
  disabled, 
  className,
  placeholder,
  menuClassName = "w-[300px] sm:w-[400px]",
  id
}: LocationInputProps) {
  const { t } = useI18n()
  const [pathOptions, setPathOptions] = React.useState<string[]>([])

  React.useEffect(() => {
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
          // Optionally default to session download-dir if value is completely empty and we just fetched
          if (value === "") {
            onChange(defaultDir)
          }
        }
        
        torrentsData.torrents.forEach((t: any) => {
          if (t.downloadDir) paths.add(t.downloadDir)
        })
        
        const combinedPaths = Array.from(paths).sort()
        setPathOptions(combinedPaths.length > 0 ? combinedPaths : FALLBACK_PATHS)
      } catch (error) {
        console.error("Failed to fetch download paths:", error)
        if (mounted) {
          setPathOptions(FALLBACK_PATHS)
          if (value === "") onChange(FALLBACK_PATHS[0])
        }
      }
    }
    fetchPaths()

    return () => {
      mounted = false
    }
  }, []) // fetch on mount

  return (
    <div className="relative flex w-full">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(className, "pr-14")} // Ensure space for the button
        disabled={disabled}
        placeholder={placeholder || t('common.save_location')}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground" disabled={disabled}>
              <ChevronDown className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="bottom"
            sideOffset={8}
            className={cn("rounded-2xl border-muted/50 p-1 bg-card/95 backdrop-blur-xl shadow-2xl z-[60] max-h-[300px] overflow-y-auto no-scrollbar", menuClassName)}
          >
            {pathOptions.map((path) => (
              <DropdownMenuItem 
                key={path}
                className="rounded-xl py-3 px-4 text-sm font-medium cursor-pointer"
                onClick={() => onChange(path)}
              >
                <FolderOpen className="h-4 w-4 mr-3 opacity-50 shrink-0" />
                <span className="truncate">{path}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
