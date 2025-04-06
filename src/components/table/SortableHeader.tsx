import {IconArrowDown, IconArrowUp} from "@tabler/icons-react";
import {ChevronsUpDown} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {Column} from "@tanstack/react-table";
import {torrentSchema} from "@/schemas/torrentSchema.ts";

export function SortableHeader({ column, title, className }: { column: Column<torrentSchema>, title: string, className?: string }) {
    const sort = column.getIsSorted()
    const icon =
        sort === "asc"
            ? <IconArrowUp className="h-5 w-5 text-muted-foreground/70" />
            : sort === "desc"
                ? <IconArrowDown className="h-5 w-5 text-muted-foreground/70" />
                : <ChevronsUpDown className="h-5 w-5 text-muted-foreground/70" />

    return (
        <div
            className={cn("cursor-pointer select-none flex items-center gap-1", className)}
            onClick={() => column.toggleSorting()}
        >
            <span>{title}</span>
            {icon}
        </div>
    )
}
