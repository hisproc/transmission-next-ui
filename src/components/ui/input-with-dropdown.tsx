import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import { IconChevronDown } from "@tabler/icons-react";

interface InputWithDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
    id?: string;
}

export function InputWithDropdown({
    value,
    onChange,
    options,
    placeholder = "Enter or select an option",
    className = "",
    id
}: InputWithDropdownProps) {
    return (
        <div className={`relative ${className}`}>
            <Input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pr-10"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="absolute inset-0 pointer-events-none">
                        <Button
                            variant="ghost"
                            className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-auto"
                            size="icon"
                            type="button"
                        >
                            <IconChevronDown />
                        </Button>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="start" 
                    side="bottom"
                    className="max-h-60 overflow-y-auto"
                    style={{ 
                        width: 'var(--radix-dropdown-menu-trigger-width)',
                        minWidth: 'var(--radix-dropdown-menu-trigger-width)'
                    }}
                >
                    {options.map((option) => (
                        <DropdownMenuItem 
                            key={option} 
                            onClick={() => onChange(option)}
                            className="break-all whitespace-normal !flex-col !items-start"
                        >
                            {option}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}