"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Plus } from "lucide-react";
import { SocialLinkEntryCard } from "../SocialLinkEntryCard";
import type { SocialLinkEntry } from "../../types";
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

interface SocialLinksSectionProps {
    entries: SocialLinkEntry[];
    errors: Map<string, Array<{ field: string; message: string }>>;
    onAddEntry: (entry: Omit<SocialLinkEntry, "id">) => void;
    onUpdateEntry: (id: string, entry: Partial<SocialLinkEntry>) => void;
    onRemoveEntry: (id: string) => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
}

export function SocialLinksSection({
    entries,
    errors,
    onAddEntry,
    onUpdateEntry,
    onRemoveEntry,
    onReorder,
}: SocialLinksSectionProps) {
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
                <CardTitle>Social Links</CardTitle>
                <Button
                    size="sm"
                    onClick={() =>
                        onAddEntry({
                            label: "",
                            url: "",
                        })
                    }
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {entries.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        No social links yet. Click &quot;Add Link&quot; to get started.
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
                            {entries.map((entry, index) => (
                                <SocialLinkEntryCard
                                    key={entry.id || `social-${index}`}
                                    entry={entry}
                                    errors={errors.get(entry.id!) || []}
                                    onUpdate={(updated: SocialLinkEntry) => onUpdateEntry(entry.id!, updated)}
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
