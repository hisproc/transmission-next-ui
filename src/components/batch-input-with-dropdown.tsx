"use client"

import * as React from "react"
import { LocationInput } from "@/components/location-input"

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
  icon,
  optionIcon,
}: BatchInputWithDropdownProps) {
  return (
    <LocationInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      externalOptions={options}
      leftIcon={icon}
      optionIcon={optionIcon}
      inputClassName="h-14 text-sm rounded-2xl bg-muted/30 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
      menuClassName="w-[300px] sm:w-[400px]"
    />
  )
}
