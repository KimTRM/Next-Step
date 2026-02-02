"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Plus } from "lucide-react";
import { ExperienceEntryCard } from "../ExperienceEntryCard";
import type { ExperienceEntry } from "../../types";

interface ExperienceSectionProps {
    entries: ExperienceEntry[];
    errors: Map<string, Array<{ field: string; message: string }>>;
    onAddEntry: (entry: Omit<ExperienceEntry, "id">) => void;
    onUpdateEntry: (id: string, entry: Partial<ExperienceEntry>) => void;
    onRemoveEntry: (id: string) => void;
}

export function ExperienceSection({
    entries,
    errors,
    onAddEntry,
    onUpdateEntry,
    onRemoveEntry,
}: ExperienceSectionProps) {
    return (
        <Card className="animate-in fade-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                <Button
                    size="sm"
                    onClick={() =>
                        onAddEntry({
                            title: "",
                            company: "",
                            startDate: Date.now(),
                            isCurrent: false,
                        })
                    }
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {entries.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        No experience entries yet. Click &quot;Add Experience&quot; to get started.
                    </p>
                ) : (
                    entries.map((entry) => (
                        <ExperienceEntryCard
                            key={entry.id}
                            entry={entry}
                            errors={errors.get(entry.id!) || []}
                            onUpdate={(updated: ExperienceEntry) => onUpdateEntry(entry.id!, updated)}
                            onRemove={() => onRemoveEntry(entry.id!)}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}
