import { useState, useCallback } from "react";
import type { SocialLinkEntry } from "../types";

interface UseSocialLinksManagerResult {
    entries: SocialLinkEntry[];
    errors: Map<string, Array<{ field: string; message: string }>>;
    addEntry: (entry: Omit<SocialLinkEntry, "id">) => void;
    updateEntry: (id: string, updates: Partial<SocialLinkEntry>) => void;
    removeEntry: (id: string) => void;
    reorderEntries: (fromIndex: number, toIndex: number) => void;
    validateEntry: (
        entry: SocialLinkEntry,
    ) => Array<{ field: string; message: string }>;
    validateAll: () => boolean;
    clearErrors: () => void;
}

export function useSocialLinksManager(
    initialEntries: SocialLinkEntry[] = [],
    onChange?: (entries: SocialLinkEntry[]) => void,
): UseSocialLinksManagerResult {
    const [entries, setEntries] = useState<SocialLinkEntry[]>(initialEntries);
    const [errors, setErrors] = useState<
        Map<string, Array<{ field: string; message: string }>>
    >(new Map());

    const validateEntry = useCallback((entry: SocialLinkEntry) => {
        const entryErrors: Array<{ field: string; message: string }> = [];

        if (!entry.label?.trim()) {
            entryErrors.push({
                field: "label",
                message: "Label is required",
            });
        }

        if (!entry.url?.trim()) {
            entryErrors.push({
                field: "url",
                message: "URL is required",
            });
        } else {
            // Basic URL validation
            try {
                new URL(entry.url);
            } catch {
                entryErrors.push({
                    field: "url",
                    message: "Please enter a valid URL",
                });
            }
        }

        return entryErrors;
    }, []);

    const addEntry = useCallback(
        (entry: Omit<SocialLinkEntry, "id">) => {
            const newEntry: SocialLinkEntry = {
                ...entry,
                id: `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
            setEntries((prevEntries) => {
                const newEntries = [...prevEntries, newEntry];
                onChange?.(newEntries);
                return newEntries;
            });
        },
        [onChange],
    );

    const updateEntry = useCallback(
        (id: string, updates: Partial<SocialLinkEntry>) => {
            setEntries((prevEntries) => {
                const newEntries = prevEntries.map((entry) =>
                    entry.id === id ? { ...entry, ...updates } : entry,
                );

                // Validate the updated entry
                const updatedEntry = newEntries.find((e) => e.id === id);
                if (updatedEntry) {
                    const entryErrors = validateEntry(updatedEntry);
                    setErrors((prev) => {
                        const newErrors = new Map(prev);
                        if (entryErrors.length > 0) {
                            newErrors.set(id, entryErrors);
                        } else {
                            newErrors.delete(id);
                        }
                        return newErrors;
                    });
                }

                onChange?.(newEntries);
                return newEntries;
            });
        },
        [onChange, validateEntry],
    );

    const removeEntry = useCallback(
        (id: string) => {
            setEntries((prevEntries) => {
                const newEntries = prevEntries.filter(
                    (entry) => entry.id !== id,
                );
                setErrors((prev) => {
                    const newErrors = new Map(prev);
                    newErrors.delete(id);
                    return newErrors;
                });
                onChange?.(newEntries);
                return newEntries;
            });
        },
        [onChange],
    );

    const reorderEntries = useCallback(
        (fromIndex: number, toIndex: number) => {
            setEntries((prevEntries) => {
                const newEntries = [...prevEntries];
                const [movedEntry] = newEntries.splice(fromIndex, 1);
                newEntries.splice(toIndex, 0, movedEntry);
                onChange?.(newEntries);
                return newEntries;
            });
        },
        [onChange],
    );

    const validateAll = useCallback(() => {
        const newErrors = new Map<
            string,
            Array<{ field: string; message: string }>
        >();
        let isValid = true;

        entries.forEach((entry) => {
            const entryErrors = validateEntry(entry);
            if (entryErrors.length > 0) {
                newErrors.set(entry.id!, entryErrors);
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [entries, validateEntry]);

    const clearErrors = useCallback(() => {
        setErrors(new Map());
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
