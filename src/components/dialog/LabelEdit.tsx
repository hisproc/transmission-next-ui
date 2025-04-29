import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {TorrentLabel} from "@/lib/torrentLabel.ts";
import React, {useState} from "react";
import {useTranslation} from "react-i18next";

interface LabelEditProps {
    labels: TorrentLabel[];
    setLabels: React.Dispatch<React.SetStateAction<TorrentLabel[]>>
}
export function LabelEdit({labels, setLabels}: LabelEditProps) {

    const [newLabel, setNewLabel] = useState<TorrentLabel>();

    const [showLabelInput, setShowLabelInput] = useState(false);

    const {t} = useTranslation();

    return (
        <div className="flex flex-wrap gap-2">
            {labels.map((label, index) => (
                <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-sm relative group"
                >
                    {label.text}
                    <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                            const newLabels = [...labels];
                            newLabels.splice(index, 1);
                            setLabels(newLabels);
                        }}
                    >
                        ✕
                    </button>
                </div>
            ))}
            {showLabelInput ? (
                <Input
                    autoFocus
                    className="w-32"
                    value={newLabel?.text}
                    onChange={(e) => setNewLabel({ text: e.target.value })}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && newLabel?.text.trim()) {
                            if (!labels.includes(newLabel)) {
                                setLabels([...labels, newLabel]);
                            }
                            setNewLabel(undefined);
                            setShowLabelInput(false);
                        } else if (e.key === "Escape") {
                            setNewLabel(undefined);
                            setShowLabelInput(false);
                        }
                    }}
                    onBlur={() => {
                        if (newLabel?.text.trim()) {
                            if (!labels.includes(newLabel)) {
                                setLabels([...labels, newLabel]);
                            }
                        }
                        setNewLabel(undefined);
                        setShowLabelInput(false);
                    }}
                />
            ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowLabelInput(true)}>
                    + {t("Add")}
                </Button>
            )}
        </div>
    )
}