import { useState } from "react"
import { Badge } from "@/components/ui/badge.tsx"
import { IconCopy, IconCheck } from "@tabler/icons-react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

interface CopyButtonProps {
    text: string
    id?: string
    variant?: "outline" | "default" | "secondary" | "destructive"
    size?: "sm" | "default" | "lg"
    showText?: boolean
    successMessage?: string
    errorMessage?: string
    className?: string
}

export function CopyButton({
    text,
    id,
    variant = "outline",
    size = "default",
    showText = true,
    successMessage,
    errorMessage,
    className = ""
}: CopyButtonProps) {
    const [copied, setCopied] = useState<string | null>(null)
    const { t } = useTranslation()

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(id || text)
            toast.success(successMessage || t("Copied to clipboard"))
            setTimeout(() => setCopied(null), 2000)
        } catch (err) {
            toast.error(errorMessage || t("Failed to copy"))
        }
    }

    const isCopied = copied === (id || text)

    const sizeClasses = {
        sm: "text-xs px-1.5 py-0.5",
        default: "text-xs px-2 py-1",
        lg: "text-sm px-3 py-1.5"
    }

    const iconSizes = {
        sm: "h-2.5 w-2.5",
        default: "h-3 w-3", 
        lg: "h-4 w-4"
    }

    return (
        <Badge 
            variant={variant}
            className={`cursor-pointer hover:bg-muted transition-colors flex items-center gap-1 ${sizeClasses[size]} ${className}`}
            onClick={copyToClipboard}
        >
            {isCopied ? (
                <>
                    <IconCheck className={iconSizes[size]} />
                    {showText && t("Copied")}
                </>
            ) : (
                <>
                    <IconCopy className={iconSizes[size]} />
                    {showText && t("Copy")}
                </>
            )}
        </Badge>
    )
}
