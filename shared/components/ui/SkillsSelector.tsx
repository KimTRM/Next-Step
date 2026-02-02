"use client";

/**
 * SkillsSelector Component
 * Reusable multi-select component for skills, interests, or any tag-like items
 */

import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { X, Plus } from "lucide-react";

interface SkillsSelectorProps {
    label: string;
    value: string[];
    onChange: (skills: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
    maxSuggestions?: number;
    disabled?: boolean;
    error?: string;
}

export function SkillsSelector({
    label,
    value,
    onChange,
    suggestions = [],
    placeholder = "Add a skill...",
    maxSuggestions = 8,
    disabled = false,
    error,
}: SkillsSelectorProps) {
    const [inputValue, setInputValue] = useState("");

    const handleAdd = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue("");
    };

    const handleRemove = (skill: string) => {
        onChange(value.filter((s) => s !== skill));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd(inputValue);
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            {/* Selected skills */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((skill) => (
                        <Badge
                            key={skill}
                            variant="secondary"
                            className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200"
                        >
                            {skill}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(skill)}
                                    className="ml-2 hover:text-green-900"
                                    disabled={disabled}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Add skill input */}
            {!disabled && (
                <>
                    <div className="flex gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={placeholder}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            className={error ? "border-red-500" : ""}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAdd(inputValue)}
                            disabled={!inputValue.trim() || disabled}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions
                                    .filter((s) => !value.includes(s))
                                    .slice(0, maxSuggestions)
                                    .map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleAdd(skill)}
                                        >
                                            + {skill}
                                        </Badge>
                                    ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Error message */}
            {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
        </div>
    );
}
