"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  PauseCircle,
  Settings,
  Search,
  Plus
} from "lucide-react"

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { AddTorrentDialog } from "@/components/add-torrent-dialog"
import { cn } from "@/lib/utils"
import { useLocation } from "react-router-dom"
import { useI18n } from "@/lib/i18n-context"
import { APP_CONFIG } from "@/lib/config"

const data = {
  navMain: [
    {
      title: "All Torrents",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Active",
      url: "/active",
      icon: Activity,
    },
    {
      title: "Downloading",
      url: "/downloading",
      icon: ArrowDownCircle,
    },
    {
      title: "Seeding",
      url: "/seeding",
      icon: ArrowUpCircle,
    },
    {
      title: "Paused",
      url: "/paused",
      icon: PauseCircle,
    },
  ],
  secondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

import { Link } from "react-router-dom"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { t } = useI18n()

  const getTitle = (title: string) => {
    const keyMap: Record<string, string> = {
      "All Torrents": "common.all_torrents",
      "Active": "common.active",
      "Downloading": "common.downloading",
      "Seeding": "common.seeding",
      "Paused": "common.paused",
      "Settings": "common.settings"
    }
    return t(keyMap[title] || title)
  }

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="h-16 flex flex-row items-center px-4 justify-start group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center border-b font-sans">
        <div className="flex items-center gap-3 font-medium text-lg leading-none group-data-[collapsible=icon]:gap-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-medium">{APP_CONFIG.name.charAt(0)}</span>
          </div>
          <span className="truncate group-data-[collapsible=icon]:hidden">{APP_CONFIG.name}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {data.navMain.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={getTitle(item.title)}
                      isActive={isActive}
                      className={cn(
                        "h-11 text-base [&_svg]:size-5 gap-3 transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-0",
                        isActive && "bg-primary! text-primary-foreground! shadow-md shadow-primary/20 scale-[1.02] border-none"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className={cn("transition-transform duration-300", isActive && "scale-110")} />
                        <span className="font-semibold group-data-[collapsible=icon]:hidden">{getTitle(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto border-t border-muted/30 pt-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {data.secondary.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={getTitle(item.title)}
                      isActive={isActive}
                      className={cn(
                        "h-11 text-base [&_svg]:size-5 gap-3 transition-all duration-300 group/item relative group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-0",
                        isActive && "bg-primary! text-primary-foreground! shadow-md shadow-primary/20 scale-[1.02] border-none"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className={cn("transition-transform duration-300", isActive && "scale-110")} />
                        <span className="font-semibold group-data-[collapsible=icon]:hidden">{getTitle(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden justify-center w-full">
          <Link
            to={APP_CONFIG.githubUrl}
            target="_blank"
            className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
            title="View on GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-primary/80 tracking-tight">v{APP_CONFIG.version}</span>
          </div>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
          <Link
            to={APP_CONFIG.githubUrl}
            target="_blank"
            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Github className="h-4 w-4" />
          </Link>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
