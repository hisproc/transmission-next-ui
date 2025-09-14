import {IconArrowDown, IconArrowUp} from "@tabler/icons-react";
import {ChevronsUpDown} from "lucide-react";
import {cn} from "@/lib/utils/utils.ts";
import {Column} from "@tanstack/react-table";
import {torrentSchema} from "@/schemas/torrentSchema.ts";

export function SortableHeader({ column, title, className }: { column: Column<torrentSchema>, title: string, className?: string }) {
    const sort = column.getIsSorted()
    
    const iconClasses = "h-4 w-4 text-muted-foreground/70 transition-colors duration-150 group-hover:text-foreground"
    
    const icon =
        sort === "asc"
            ? <IconArrowUp className={iconClasses} />
            : sort === "desc"
                ? <IconArrowDown className={iconClasses} />
                : <ChevronsUpDown className={`${iconClasses} group-hover:scale-105`} />

    return (
        <div
            className={cn("group cursor-pointer select-none flex items-center gap-1", className)}
            onClick={() => column.toggleSorting()}
        >
            <span>{title}</span>
            {icon}
        </div>
    )
}
