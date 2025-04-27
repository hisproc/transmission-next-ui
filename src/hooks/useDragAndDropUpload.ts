import { useEffect, useRef, useState } from "react";
import { DialogType } from "@/lib/types";

export function useDragAndDropUpload(setFile: (file: File) => void, setDialogType: (type: DialogType) => void) {
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
                setDialogType(DialogType.Add);
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
    }, [setFile, setDialogType]);

    return { isDragging, dragCounter };
}