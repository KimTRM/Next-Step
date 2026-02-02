"use client";

/**
 * useExperienceManager Hook
 * Manages work experience entries with validation
 */

import { useState, useCallback } from "react";
import type { ExperienceEntry, ProfileValidationError } from "../types";
import { validateExperienceEntry } from "../helpers/validation";

interface UseExperienceManagerProps {
    initialEntries?: ExperienceEntry[];
    onChange?: (entries: ExperienceEntry[]) => void;
}

interface UseExperienceManagerReturn {
    entries: ExperienceEntry[];
    errors: Map<string, ProfileValidationError[]>;
    addEntry: (entry: Omit<ExperienceEntry, "id">) => void;
    updateEntry: (id: string, updates: Partial<ExperienceEntry>) => void;
    removeEntry: (id: string) => void;
    reorderEntries: (fromIndex: number, toIndex: number) => void;
    validateEntry: (id: string) => boolean;
    validateAll: () => boolean;
    clearErrors: (id?: string) => void;
}

/**
 * Generate unique ID for experience entry
 */
function generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook to manage experience entries
 */
export function useExperienceManager({
    initialEntries = [],
    onChange,
}: UseExperienceManagerProps = {}): UseExperienceManagerReturn {
    // Ensure all entries have IDs
    const entriesWithIds = initialEntries.map((entry) => ({
        ...entry,
        id: entry.id || generateId(),
    }));

    const [entries, setEntries] = useState<ExperienceEntry[]>(entriesWithIds);
    const [errors, setErrors] = useState<Map<string, ProfileValidationError[]>>(
        new Map(),
    );

    // Add new entry
    const addEntry = useCallback(
        (entry: Omit<ExperienceEntry, "id">) => {
            const newEntry: ExperienceEntry = {
                ...entry,
                id: generateId(),
            };

            const validationErrors = validateExperienceEntry(newEntry);
            if (validationErrors.length > 0 && newEntry.id) {
                setErrors((prev) =>
                    new Map(prev).set(newEntry.id!, validationErrors),
                );
            }

            const newEntries = [...entries, newEntry];
            setEntries(newEntries);
            onChange?.(newEntries);
        },
        [entries, onChange],
    );

    // Update existing entry
    const updateEntry = useCallback(
        (id: string, updates: Partial<ExperienceEntry>) => {
            const newEntries = entries.map((entry) =>
                entry.id === id ? { ...entry, ...updates } : entry,
            );

            // Validate updated entry
            const updatedEntry = newEntries.find((e) => e.id === id);
            if (updatedEntry) {
                const validationErrors = validateExperienceEntry(updatedEntry);
                setErrors((prev) => {
                    const newErrors = new Map(prev);
                    if (validationErrors.length > 0) {
                        newErrors.set(id, validationErrors);
                    } else {
                        newErrors.delete(id);
                    }
                    return newErrors;
                });
            }

            setEntries(newEntries);
            onChange?.(newEntries);
        },
        [entries, onChange],
    );

    // Remove entry
    const removeEntry = useCallback(
        (id: string) => {
            const newEntries = entries.filter((entry) => entry.id !== id);
            setErrors((prev) => {
                const newErrors = new Map(prev);
                newErrors.delete(id);
                return newErrors;
            });
            setEntries(newEntries);
            onChange?.(newEntries);
        },
        [entries, onChange],
    );

    // Reorder entries
    const reorderEntries = useCallback(
        (fromIndex: number, toIndex: number) => {
            const newEntries = [...entries];
            const [movedEntry] = newEntries.splice(fromIndex, 1);
            newEntries.splice(toIndex, 0, movedEntry);
            setEntries(newEntries);
            onChange?.(newEntries);
        },
        [entries, onChange],
    );

    // Validate single entry
    const validateEntry = useCallback(
        (id: string): boolean => {
            const entry = entries.find((e) => e.id === id);
            if (!entry) return false;

            const validationErrors = validateExperienceEntry(entry);
            setErrors((prev) => {
                const newErrors = new Map(prev);
                if (validationErrors.length > 0) {
                    newErrors.set(id, validationErrors);
                    return newErrors;
                } else {
                    newErrors.delete(id);
                    return newErrors;
                }
            });

            return validationErrors.length === 0;
        },
        [entries],
    );

    // Validate all entries
    const validateAll = useCallback((): boolean => {
        const newErrors = new Map<string, ProfileValidationError[]>();
        let isValid = true;

        entries.forEach((entry) => {
            const validationErrors = validateExperienceEntry(entry);
            if (validationErrors.length > 0 && entry.id) {
                newErrors.set(entry.id, validationErrors);
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [entries]);

    // Clear errors
    const clearErrors = useCallback((id?: string) => {
        if (id) {
            setErrors((prev) => {
                const newErrors = new Map(prev);
                newErrors.delete(id);
                return newErrors;
            });
        } else {
            setErrors(new Map());
        }
    }, []);

    return {
        entries,
        errors,
        addEntry,
        updateEntry,
        removeEntry,
        reorderEntries,
        validateEntry,
        validateAll,
        clearErrors,
    };
}
