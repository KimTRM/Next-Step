"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { GripVertical, Trash2 } from "lucide-react";
import type { ExperienceEntry } from "../types";

interface ExperienceEntryCardProps {
    entry: ExperienceEntry;
    errors: Array<{ field: string; message: string }>;
    onUpdate: (entry: ExperienceEntry) => void;
    onRemove: () => void;
}

export function ExperienceEntryCard({
    entry,
    errors,
    onUpdate,
    onRemove,
}: ExperienceEntryCardProps) {
    const getError = (field: string) =>
        errors.find((e) => e.field === field)?.message;

    return (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <h4 className="font-semibold text-gray-900">Experience Entry</h4>
                </div>
                <Button variant="ghost" size="sm" onClick={onRemove}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`company-${entry.id}`}>
                        Company <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`company-${entry.id}`}
                        value={entry.company}
                        onChange={(e) => onUpdate({ ...entry, company: e.target.value })}
                        placeholder="Company name"
                    />
                    {getError("company") && (
                        <p className="text-sm text-red-600">{getError("company")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`position-${entry.id}`}>
                        Position <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`position-${entry.id}`}
                        value={entry.title}
                        onChange={(e) => onUpdate({ ...entry, title: e.target.value })}
                        placeholder="Job title"
                    />
                    {getError("title") && (
                        <p className="text-sm text-red-600">{getError("title")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`location-${entry.id}`}>Location</Label>
                    <Input
                        id={`location-${entry.id}`}
                        value={entry.location || ""}
                        onChange={(e) => onUpdate({ ...entry, location: e.target.value })}
                        placeholder="City, Country"
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
                            Currently working here
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
                    placeholder="Key responsibilities and achievements..."
                    rows={3}
                />
            </div>
        </div>
    );
}
