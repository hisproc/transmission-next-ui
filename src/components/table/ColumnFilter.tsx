import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Check, PlusCircle, XCircle } from "lucide-react";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Column } from "@tanstack/react-table";
import { torrentSchema } from "@/schemas/torrentSchema";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "../ui/command";
import { cn } from "@/lib/utils";
import React from "react";

export function ColumnFilter({
    title,
    column,
    options,
}: {
    title: string,
    column?: Column<torrentSchema>,
    options: { value: string; label: string }[]
}) {

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
            <PopoverContent className="max-w-64 p-0" align="start">
                <Command>
                    {/* <CommandInput placeholder={title} /> */}
                    <CommandList className="max-h-full">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
                            {options.map((option) => {
                                const isSelected = selectedValues.has(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => onItemSelect(option, isSelected)}
                                    >
                                        <div
                                            className={cn(
                                                "flex size-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary"
                                                    : "opacity-50 [&_svg]:invisible",
                                            )}
                                        >
                                            <Check />
                                        </div>
                                        <span className="truncate">{option.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => onReset()}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
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