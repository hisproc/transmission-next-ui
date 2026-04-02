"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"

interface BatchInputWithDropdownProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  options: string[]
  icon: React.ComponentType<{ className?: string }>
  optionIcon: React.ComponentType<{ className?: string }>
}

export function BatchInputWithDropdown({
  label,
  placeholder,
  value,
  onChange,
  options,
  icon: Icon,
  optionIcon: OptionIcon,
}: BatchInputWithDropdownProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between ml-1">
        <label className="text-sm font-medium uppercase tracking-widest text-muted-foreground/60">
          {label}
        </label>
      </div>

      <div className="relative group/input">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-11 pr-12 h-14 text-sm rounded-2xl bg-muted/30 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-muted-foreground/50 hover:text-primary transition-colors"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            {options.length > 0 && (
              <DropdownMenuPortal>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  className="w-[var(--radix-dropdown-menu-trigger-width)] sm:w-[400px] rounded-2xl border-muted/50 p-1 bg-card/95 backdrop-blur-xl z-50 max-h-[300px] overflow-y-auto no-scrollbar"
                >
                  {options.map((opt) => (
                    <DropdownMenuItem
                      key={opt}
                      className="rounded-xl py-3 px-4 text-sm font-medium cursor-pointer transition-colors"
                      onClick={() => onChange(opt)}
                    >
                      <OptionIcon className="h-4 w-4 mr-3 opacity-50 shrink-0" />
                      <span className="truncate">{opt}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            )}
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
