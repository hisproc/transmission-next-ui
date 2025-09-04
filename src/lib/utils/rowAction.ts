import { torrentSchema } from "@/schemas/torrentSchema.ts";
import { DialogType } from "@/lib/api/types.ts";
import { Row } from "@tanstack/react-table";

export interface RowAction {
    dialogType: DialogType;
    targetRows: Row<torrentSchema>[];
}