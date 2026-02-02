"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { EDUCATION_LEVELS } from "../../constants";
import type { EducationLevel } from "../../types";
import { Badge } from "@/shared/components/ui/badge";
import { X } from "lucide-react";

interface BasicInfoSectionProps {
    formData: {
        name: string;
        location: string;
        bio: string;
        educationLevel: string;
        coverPhotoUrl?: string;
        avatarUrl?: string;
        specialization: string;
        technology: string[];
    };
    setName: (value: string) => void;
    setLocation: (value: string) => void;
    setBio: (value: string) => void;
    setEducationLevel: (value: EducationLevel | "") => void;
    setCoverPhotoUrl: (value: string) => void;
    setAvatarUrl: (value: string) => void;
    setSpecialization: (value: string) => void;
    setTechnology: (value: string[]) => void;
    getBasicError: (field: string) => string | undefined;
}

export function BasicInfoSection({
    formData,
    setName,
    setLocation,
    setBio,
    setEducationLevel,
    setCoverPhotoUrl,
    setAvatarUrl,
    setSpecialization,
    setTechnology,
    getBasicError,
}: BasicInfoSectionProps) {
    return (
        <Card className="animate-in fade-in duration-200">
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Profile Photo Upload */}
                <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <ImageUpload
                        currentImage={formData.avatarUrl}
                        onImageChange={setAvatarUrl}
                        onImageRemove={() => setAvatarUrl("")}
                        label="Upload Profile Photo"
                        aspectRatio="square"
                        maxSizeMB={5}
                    />
                    <p className="text-xs text-gray-500">
                        Recommended: Square image, at least 400x400px
                    </p>
                </div>

                {/* Cover Photo Upload */}
                <div className="space-y-2">
                    <Label>Cover Photo</Label>
                    <ImageUpload
                        currentImage={formData.coverPhotoUrl}
                        onImageChange={setCoverPhotoUrl}
                        onImageRemove={() => setCoverPhotoUrl("")}
                        label="Upload Cover Photo"
                        aspectRatio="cover"
                        maxSizeMB={5}
                    />
                    <p className="text-xs text-gray-500">
                        Recommended: 1200x400px or 3:1 aspect ratio
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                        {getBasicError("name") && (
                            <p className="text-sm text-red-600">{getBasicError("name")}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={formData.location || ""}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, Country"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="resize-none"
                    />
                    {getBasicError("bio") && (
                        <p className="text-sm text-red-600">{getBasicError("bio")}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="educationLevel">Education Level</Label>
                        <Select
                            value={formData.educationLevel}
                            onValueChange={setEducationLevel}
                        >
                            <SelectTrigger id="educationLevel">
                                <SelectValue placeholder="Select your education level" />
                            </SelectTrigger>
                            <SelectContent>
                                {EDUCATION_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                        {level.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {getBasicError("educationLevel") && (
                            <p className="text-sm text-red-600">
                                {getBasicError("educationLevel")}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                            id="specialization"
                            value={formData.specialization || ""}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="e.g., Frontend Development, Data Science"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="technology">Technologies</Label>
                    <div className="space-y-2">
                        <Input
                            id="technology"
                            placeholder="Add a technology (e.g., React, Python, AWS)"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                    e.preventDefault();
                                    const newTech = e.currentTarget.value.trim();
                                    if (!formData.technology.includes(newTech)) {
                                        setTechnology([...formData.technology, newTech]);
                                    }
                                    e.currentTarget.value = "";
                                }
                            }}
                        />
                        {formData.technology.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.technology.map((tech, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        {tech}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                                            onClick={() => {
                                                setTechnology(formData.technology.filter((_, i) => i !== index));
                                            }}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-500">
                            Press Enter to add technologies. Click X to remove.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
