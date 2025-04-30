import { torrentSchema } from "@/schemas/torrentSchema";
import { DialogType } from "./types";
import { Row } from "@tanstack/react-table";

export interface RowAction {
    dialogType: DialogType;
    targetRows: Row<torrentSchema>[];
}