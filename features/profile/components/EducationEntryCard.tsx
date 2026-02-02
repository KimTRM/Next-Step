"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { GripVertical, Trash2 } from "lucide-react";
import type { EducationEntry } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface EducationEntryCardProps {
    entry: EducationEntry;
    errors: Array<{ field: string; message: string }>;
    onUpdate: (entry: EducationEntry) => void;
    onRemove: () => void;
}

export function EducationEntryCard({
    entry,
    errors,
    onUpdate,
    onRemove,
}: EducationEntryCardProps) {
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
            className="border rounded-lg p-4 space-y-4 bg-gray-50"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="touch-none cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    <h4 className="font-semibold text-gray-900">Education Entry</h4>
                </div>
                <Button variant="ghost" size="sm" onClick={onRemove}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`institution-${entry.id}`}>
                        Institution <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`institution-${entry.id}`}
                        value={entry.institution}
                        onChange={(e) =>
                            onUpdate({ ...entry, institution: e.target.value })
                        }
                        placeholder="University name"
                    />
                    {getError("institution") && (
                        <p className="text-sm text-red-600">{getError("institution")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`degree-${entry.id}`}>
                        Degree <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`degree-${entry.id}`}
                        value={entry.degree}
                        onChange={(e) => onUpdate({ ...entry, degree: e.target.value })}
                        placeholder="e.g., Bachelor of Science"
                    />
                    {getError("degree") && (
                        <p className="text-sm text-red-600">{getError("degree")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`field-${entry.id}`}>Field of Study</Label>
                    <Input
                        id={`field-${entry.id}`}
                        value={entry.field}
                        onChange={(e) =>
                            onUpdate({ ...entry, field: e.target.value })
                        }
                        placeholder="e.g., Computer Science"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`start-${entry.id}`}>
                        Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`start-${entry.id}`}
                        type="date"
                        value={new Date(entry.startDate).toISOString().split('T')[0]}
                        onChange={(e) => onUpdate({ ...entry, startDate: new Date(e.target.value).getTime() })}
                    />
                    {getError("startDate") && (
                        <p className="text-sm text-red-600">{getError("startDate")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`end-${entry.id}`}>End Date</Label>
                    <Input
                        id={`end-${entry.id}`}
                        type="date"
                        value={entry.endDate ? new Date(entry.endDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => onUpdate({ ...entry, endDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                        disabled={entry.isCurrent}
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`current-${entry.id}`}
                            checked={entry.isCurrent}
                            onChange={(e) =>
                                onUpdate({ ...entry, isCurrent: e.target.checked })
                            }
                            className="rounded"
                        />
                        <Label htmlFor={`current-${entry.id}`} className="font-normal">
                            Currently studying here
                        </Label>
                    </div>
                    {getError("endDate") && (
                        <p className="text-sm text-red-600">{getError("endDate")}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor={`description-${entry.id}`}>Description</Label>
                <Textarea
                    id={`description-${entry.id}`}
                    value={entry.description || ""}
                    onChange={(e) => onUpdate({ ...entry, description: e.target.value })}
                    placeholder="Achievements, activities, relevant coursework..."
                    rows={3}
                />
            </div>
        </div>
    );
}
