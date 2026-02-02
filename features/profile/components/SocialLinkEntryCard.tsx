"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { GripVertical, Trash2 } from "lucide-react";
import type { SocialLinkEntry } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SocialLinkEntryCardProps {
    entry: SocialLinkEntry;
    errors: Array<{ field: string; message: string }>;
    onUpdate: (entry: SocialLinkEntry) => void;
    onRemove: () => void;
}

export function SocialLinkEntryCard({
    entry,
    errors,
    onUpdate,
    onRemove,
}: SocialLinkEntryCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: entry.id || "" });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getError = (field: string) =>
        errors.find((e) => e.field === field)?.message;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border rounded-lg p-3 bg-gray-50"
        >
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="touch-none cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded shrink-0"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                </button>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor={`label-${entry.id}`} className="text-xs">
                            Label <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id={`label-${entry.id}`}
                            value={entry.label}
                            onChange={(e) =>
                                onUpdate({ ...entry, label: e.target.value })
                            }
                            placeholder="LinkedIn, Twitter, etc."
                            className="h-9"
                        />
                        {getError("label") && (
                            <p className="text-xs text-red-600">{getError("label")}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor={`url-${entry.id}`} className="text-xs">
                            URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id={`url-${entry.id}`}
                            type="url"
                            value={entry.url}
                            onChange={(e) =>
                                onUpdate({ ...entry, url: e.target.value })
                            }
                            placeholder="https://..."
                            className="h-9"
                        />
                        {getError("url") && (
                            <p className="text-xs text-red-600">{getError("url")}</p>
                        )}
                    </div>
                </div>

                <Button variant="ghost" size="sm" onClick={onRemove} className="shrink-0">
                    <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            </div>
        </div>
    );
}
