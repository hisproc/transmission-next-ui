import React, { useEffect, useRef, useState } from "react";
import { DialogType } from "@/lib/api/types.ts";
import { RowAction } from "@/lib/utils/rowAction.ts";

interface UseDragAndDropUploadProps {
    setFile: (file: File) => void;
    setRowAction: React.Dispatch<React.SetStateAction<RowAction | null>>;
}
export function useDragAndDropUpload({ setFile, setRowAction }: UseDragAndDropUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            dragCounter.current++;
            setIsDragging(true);
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            dragCounter.current--;
            if (dragCounter.current <= 0) {
                setIsDragging(false);
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDrop = (e: DragEvent) => {
            console.log("Dropped");
            e.preventDefault();
            setIsDragging(false);
            dragCounter.current = 0;
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                setFile(file);
                setRowAction({
                    dialogType: DialogType.Add,
                    targetRows: [],
                });
            }
        };

        window.addEventListener("dragenter", handleDragEnter);
        window.addEventListener("dragleave", handleDragLeave);
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("drop", handleDrop);

        return () => {
            window.removeEventListener("dragenter", handleDragEnter);
            window.removeEventListener("dragleave", handleDragLeave);
            window.removeEventListener("dragover", handleDragOver);
            window.removeEventListener("drop", handleDrop);
        };
    }, [setFile, setRowAction]);

    return { isDragging, dragCounter };
}