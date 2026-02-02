"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Plus } from "lucide-react";
import { EducationEntryCard } from "../EducationEntryCard";
import type { EducationEntry } from "../../types";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface EducationSectionProps {
    entries: EducationEntry[];
    errors: Map<string, Array<{ field: string; message: string }>>;
    onAddEntry: (entry: Omit<EducationEntry, "id">) => void;
    onUpdateEntry: (id: string, entry: Partial<EducationEntry>) => void;
    onRemoveEntry: (id: string) => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
}

export function EducationSection({
    entries,
    errors,
    onAddEntry,
    onUpdateEntry,
    onRemoveEntry,
    onReorder,
}: EducationSectionProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = entries.findIndex((entry) => entry.id === active.id);
            const newIndex = entries.findIndex((entry) => entry.id === over.id);
            onReorder(oldIndex, newIndex);
        }
    };

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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={entries.map((entry) => entry.id || "")}
                            strategy={verticalListSortingStrategy}
                        >
                            {entries.map((entry) => (
                                <EducationEntryCard
                                    key={entry.id}
                                    entry={entry}
                                    errors={errors.get(entry.id!) || []}
                                    onUpdate={(updated: EducationEntry) => onUpdateEntry(entry.id!, updated)}
                                    onRemove={() => onRemoveEntry(entry.id!)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
            </CardContent>
        </Card>
    );
}
