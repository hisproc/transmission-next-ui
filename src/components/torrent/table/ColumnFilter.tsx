import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Button } from "@/components/ui/button.tsx";
import { PlusCircle, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Column } from "@tanstack/react-table";
import { torrentSchema } from "@/schemas/torrentSchema.ts";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command.tsx";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { useTranslation } from "react-i18next";

interface ColumnFilterProps {
    title: string;
    column?: Column<torrentSchema>;
    options: { value: string; label: string }[];
}

export function ColumnFilter({ title, column, options }: ColumnFilterProps) {

    const { t } = useTranslation();
    const columnFilterValue = column?.getFilterValue();
    const selectedValues = new Set(
        Array.isArray(columnFilterValue) ? columnFilterValue : [],
    );

    const onItemSelect = React.useCallback(
        (option: { value: string; label: string }, isSelected: boolean) => {
            if (!column) return;

            const newSelectedValues = new Set(selectedValues);
            if (isSelected) {
                newSelectedValues.delete(option.value);
            } else {
                newSelectedValues.add(option.value);
            }
            const filterValues = Array.from(newSelectedValues);
            column.setFilterValue(filterValues.length ? filterValues : undefined);
        },
        [column, selectedValues],
    );

    const onReset = React.useCallback(
        (event?: React.MouseEvent) => {
            event?.stopPropagation();
            column?.setFilterValue(undefined);
        },
        [column],
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="border-dashed">
                    {selectedValues?.size > 0 ? (
                        <div
                            role="button"
                            aria-label={`Clear filter`}
                            tabIndex={0}
                            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <XCircle />
                        </div>
                    ) : (
                        <PlusCircle />
                    )}
                    {title}
                    {selectedValues?.size > 0 && (
                        <>
                            <Separator
                                orientation="vertical"
                                className="mx-0.5 data-[orientation=vertical]:h-4"
                            />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden items-center gap-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {selectedValues.size} selected
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => selectedValues.has(option.value))
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option.value}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {option.label}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto max-w-64 p-0" align="start">
                <Command>
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {
                            options.length > 0 && (
                                <CommandGroup>
                                    {options.map((option) => {
                                        const isSelected = selectedValues.has(option.value);
                                        return (
                                            <CommandItem
                                                key={option.value}
                                                onSelect={() => onItemSelect(option, isSelected)}
                                            >
                                                <Checkbox checked={isSelected} />
                                                <span className="truncate">{option.label}</span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            )
                        }
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => onReset()}
                                        className="justify-center text-center"
                                    >
                                        {t("Clear filters")}
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>

        </Popover>
    );
}