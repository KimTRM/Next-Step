"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

interface ImageUploadProps {
    currentImage?: string;
    onImageChange: (imageUrl: string) => void;
    onImageRemove?: () => void;
    label?: string;
    aspectRatio?: "square" | "cover"; // square for avatar, cover for banner
    maxSizeMB?: number;
}

export function ImageUpload({
    currentImage,
    onImageChange,
    onImageRemove,
    label = "Upload Image",
    aspectRatio = "square",
    maxSizeMB = 5,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | undefined>(currentImage);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            toast.error(`Image size must be less than ${maxSizeMB}MB`);
            return;
        }

        setIsUploading(true);

        try {
            // Convert to base64 for preview and storage
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreview(base64String);
                onImageChange(base64String);
                toast.success("Image uploaded successfully");
            };
            reader.onerror = () => {
                toast.error("Failed to read image file");
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(undefined);
        onImageRemove?.();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.success("Image removed");
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {preview ? (
                <div className="relative group">
                    <div
                        className={`relative overflow-hidden rounded-lg ${aspectRatio === "cover"
                            ? "aspect-3/1 max-h-48"
                            : "aspect-square max-w-xs"
                            }`}
                    >
                        <Image
                            src={preview}
                            alt={label}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={triggerFileSelect}
                                disabled={isUploading}
                            >
                                <Camera className="h-4 w-4 mr-2" />
                                Change
                            </Button>
                            {onImageRemove && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleRemove}
                                    disabled={isUploading}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={triggerFileSelect}
                    disabled={isUploading}
                    className={`relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 transition-colors bg-gray-50 hover:bg-gray-100 ${aspectRatio === "cover"
                        ? "aspect-3/1 max-h-48 w-full"
                        : "aspect-square max-w-xs"
                        } flex items-center justify-center`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                            <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-500">{label}</p>
                            <p className="text-xs text-gray-400">Max {maxSizeMB}MB</p>
                        </div>
                    )}
                </button>
            )}
        </div>
    );
}
