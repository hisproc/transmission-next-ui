import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

interface FileUploadProps {
  value?: File | null
  onChange?: (file: File) => void
  accept?: string
  maxSize?: number
}

export function FileUpload({ value, onChange, accept, maxSize }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dropRef = useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation()

  const handleFile = (file: File) => {
    if (maxSize && file.size > maxSize) {
      setError("File is too large.")
      return
    }
    setFileName(file.name)
    setError(null)
    onChange?.(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  useEffect(() => {
    if (value && value.name !== fileName) {
      setFileName(value.name)
      setError(null)
    }
  }, [value])

  return (
    <div className="space-y-2">
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={cn(
          "border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-muted"
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onFileChange}
        />
        <p className="text-sm text-muted-foreground">
          {t("Drag and drop a file here, or click to select one")}
        </p>
        {fileName && (
          <p className="text-sm mt-2 font-medium break-words whitespace-pre-wrap">
            {fileName}
          </p>
        )}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  )
}
