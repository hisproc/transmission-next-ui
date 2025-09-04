import { getColumns } from "@/components/torrent/table/TorrentColumns.tsx";
import { STORAGE_KEYS } from "@/constants/storage";
import { RowAction } from "@/lib/utils/rowAction.ts";
import { torrentSchema } from "@/schemas/torrentSchema";
import { ColumnFiltersState, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface UseTorrentTableProps {
    tabFilterData: torrentSchema[];
    setRowAction: React.Dispatch<React.SetStateAction<RowAction | null>>;
}
export function useTorrentTable({ tabFilterData, setRowAction }: UseTorrentTableProps) {

    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([{ id: "Added Date", desc: true }])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({
        pageIndex: 0, pageSize: Number(localStorage.getItem(STORAGE_KEYS.PAGE_SIZE)) || 50,
    })
    const { t } = useTranslation();

    const columns = useMemo(() => {
        return getColumns({ t, setRowAction });
    }, [t]);

    const table = useReactTable({
        data: tabFilterData,
        columns: columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        autoResetPageIndex: false
    })

    return { ...table }
}