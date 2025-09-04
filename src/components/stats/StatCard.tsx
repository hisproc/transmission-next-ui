import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx"
import { ReactNode } from "react"

interface TabOption {
  key: string
  label: string
}

interface StatCardProps {
  label: string
  value: string | number
  tabs: TabOption[]
  activeTab: string
  onTabChange: (tab: string) => void
  icon?: ReactNode
  iconTooltip?: string
  extraIcon?: ReactNode
  className?: string
  collapsed?: boolean
}

export function StatCard({
  label,
  value,
  tabs,
  activeTab,
  onTabChange,
  icon,
  iconTooltip,
  extraIcon,
  className = "",
  collapsed = false
}: StatCardProps) {
  return (
    <Card className={`@container/card shadow-none transition-all duration-300 ${
      collapsed ? 'py-2' : 'py-4'
    } ${className}`}>
      <CardHeader className={`px-4 ${collapsed ? 'pb-2' : 'pb-2'}`}>
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <div className="flex items-center gap-2">
            {extraIcon}
            {icon && iconTooltip && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 -m-1 rounded-md hover:bg-muted/50 transition-colors">
                    {icon}
                  </button>
                </PopoverTrigger>
                <PopoverContent side="left" className="w-auto p-2">
                  <p className="text-sm text-muted-foreground">
                    {iconTooltip}
                  </p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        {!collapsed && (
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            {value}
          </CardTitle>
        )}
        {collapsed && (
          <CardTitle className="text-lg font-medium tabular-nums truncate">
            {value}
          </CardTitle>
        )}
      </CardHeader>
      {!collapsed && (
        <CardFooter className="px-4 pt-0">
          <div className="flex bg-muted/30 rounded-lg p-1 w-full">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
