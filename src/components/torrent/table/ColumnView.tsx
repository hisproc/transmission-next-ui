import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import {IconChevronDown, IconLayoutColumns } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import {torrentSchema} from "@/schemas/torrentSchema.ts";
import {Column} from "@tanstack/react-table";

export function ColumnView({ columns }: { columns: Column<torrentSchema>[] }) {

    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <IconLayoutColumns />
                    <span className="hidden lg:inline">{t("Customize Columns")}</span>
                    <span className="lg:hidden">{t("Columns")}</span>
                    <IconChevronDown />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {columns.filter(
                        (column) =>
                            typeof column.accessorFn !== "undefined" &&
                            column.getCanHide()
                    )
                    .map((column) => {
                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                    column.toggleVisibility(value)
                                }
                            >
                                {t(column.id)}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
        )

}