import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { FaGithub } from "react-icons/fa";
import { GrUpgrade } from "react-icons/gr";
import { IoLanguage } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import axios from "axios";
import { Tooltip, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

export function SiteHeader() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const [newVersion, setNewVersion] = useState(false);

  useEffect(() => {
    axios.get("https://api.github.co/repos/hisproc/transmission-next-ui/releases/latest")
      .then((res) => res.data)
      .then((data) => {
        const latest = data.tag_name;
        const current = import.meta.env.VITE_APP_VERSION || "unknown";
        if (latest && current && latest !== current) {
          setNewVersion(true);
          console.log("New version available:", latest);
          console.log("Current version:", current);
        }
      });
  }, []);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          {location.pathname === "/" && t("Dashboard")}
          {location.pathname === "/settings" && t("Settings")}
          {location.pathname === "/about" && t("About")}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {newVersion && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <a href="https://github.com/hisproc/transmission-next-ui/releases">
                      <GrUpgrade className="aspect-square text-green-500" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{t("New version available")}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/hisproc/Transmission-next-ui"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              <FaGithub />
            </a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IoLanguage className="aspect-square" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => i18n.changeLanguage("zh")}>
                中文
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header >
  )
}
