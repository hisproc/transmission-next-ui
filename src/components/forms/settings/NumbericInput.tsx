import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input.tsx";

type NumericInputProps = {
    value: number;
    onChange: (val: number) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
    placeholder?: string;
};

export function NumericInput({ value, onChange, ...rest }: NumericInputProps) {
    const [internalValue, setInternalValue] = useState(String(value));

    useEffect(() => {
        setInternalValue(String(value));
    }, [value]);

    return (
        <Input
            type="number"
            value={internalValue}
            onChange={(e) => {
                const val = e.target.value;
                setInternalValue(val);
                if (/^\d*$/.test(val)) {
                    onChange(val === "" ? 0 : Number(val));
                }
            }}
            {...rest}
        />
    );
}