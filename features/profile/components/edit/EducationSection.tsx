"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Plus } from "lucide-react";
import { EducationEntryCard } from "../EducationEntryCard";
import type { EducationEntry } from "../../types";

interface EducationSectionProps {
    entries: EducationEntry[];
    errors: Map<string, Array<{ field: string; message: string }>>;
    onAddEntry: (entry: Omit<EducationEntry, "id">) => void;
    onUpdateEntry: (id: string, entry: Partial<EducationEntry>) => void;
    onRemoveEntry: (id: string) => void;
}

export function EducationSection({
    entries,
    errors,
    onAddEntry,
    onUpdateEntry,
    onRemoveEntry,
}: EducationSectionProps) {
    return (
        <Card className="animate-in fade-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Education History</CardTitle>
                <Button
                    size="sm"
                    onClick={() =>
                        onAddEntry({
                            institution: "",
                            degree: "",
                            field: "",
                            startDate: Date.now(),
                            isCurrent: false,
                        })
                    }
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {entries.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        No education entries yet. Click &quot;Add Education&quot; to get started.
                    </p>
                ) : (
                    entries.map((entry) => (
                        <EducationEntryCard
                            key={entry.id}
                            entry={entry}
                            errors={errors.get(entry.id!) || []}
                            onUpdate={(updated: EducationEntry) => onUpdateEntry(entry.id!, updated)}
                            onRemove={() => onRemoveEntry(entry.id!)}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}
