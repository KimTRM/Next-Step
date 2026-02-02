"use client";

/**
 * Step 3: Update NextStep Profile
 * Edit career history, education, certifications, and skills
 */

import { useState } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    Briefcase,
    GraduationCap,
    Award,
    Lightbulb,
    Calendar,
    ChevronDown,
    ChevronUp,
    X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/shared/components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import type { ExperienceEntry, EducationEntry, CertificationEntry } from "../../../types/apply-flow";

// Helper to format date
const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
};

// Helper to generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// Experience Entry Component
// ============================================

interface ExperienceItemProps {
    entry: ExperienceEntry;
    onEdit: (entry: ExperienceEntry) => void;
    onDelete: (id: string) => void;
}

function ExperienceItem({ entry, onEdit, onDelete }: ExperienceItemProps) {
    return (
        <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
            <div className="flex gap-3">
                <div className="p-2 rounded-md bg-primary/10 h-fit">
                    <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-medium text-sm">{entry.title}</h4>
                    <p className="text-sm text-muted-foreground">{entry.company}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {formatDate(entry.startDate)} -{" "}
                            {entry.isCurrent ? "Present" : formatDate(entry.endDate)}
                        </span>
                    </div>
                    {entry.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {entry.description}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(entry)}
                    aria-label="Edit experience"
                >
                    <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => entry.id && onDelete(entry.id)}
                    aria-label="Delete experience"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

// ============================================
// Education Entry Component
// ============================================

interface EducationItemProps {
    entry: EducationEntry;
    onEdit: (entry: EducationEntry) => void;
    onDelete: (id: string) => void;
}

function EducationItem({ entry, onEdit, onDelete }: EducationItemProps) {
    return (
        <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
            <div className="flex gap-3">
                <div className="p-2 rounded-md bg-blue-500/10 h-fit">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-medium text-sm">{entry.degree}</h4>
                    <p className="text-sm text-muted-foreground">{entry.institution}</p>
                    {entry.field && (
                        <p className="text-xs text-muted-foreground">{entry.field}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {formatDate(entry.startDate)} -{" "}
                            {entry.isCurrent ? "Present" : formatDate(entry.endDate)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(entry)}
                    aria-label="Edit education"
                >
                    <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => entry.id && onDelete(entry.id)}
                    aria-label="Delete education"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

// ============================================
// Certification Entry Component
// ============================================

interface CertificationItemProps {
    entry: CertificationEntry;
    onEdit: (entry: CertificationEntry) => void;
    onDelete: (id: string) => void;
}

function CertificationItem({ entry, onEdit, onDelete }: CertificationItemProps) {
    return (
        <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
            <div className="flex gap-3">
                <div className="p-2 rounded-md bg-amber-500/10 h-fit">
                    <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-medium text-sm">{entry.name}</h4>
                    <p className="text-sm text-muted-foreground">{entry.issuingOrganization}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {entry.issueDate ? formatDate(entry.issueDate) : "N/A"}
                            {entry.neverExpires
                                ? " · No Expiration"
                                : entry.expiryDate
                                    ? ` · Expires ${formatDate(entry.expiryDate)}`
                                    : ""}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(entry)}
                    aria-label="Edit certification"
                >
                    <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => entry.id && onDelete(entry.id)}
                    aria-label="Delete certification"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

// ============================================
// Main Profile Step Component
// ============================================

export function ProfileStep() {
    const { state, updateProfile } = useApplicationFlow();
    const { formData } = state;
    const { profile } = formData;

    // Collapsible states
    const [expandedSections, setExpandedSections] = useState({
        experience: true,
        education: true,
        certifications: false,
        skills: true,
    });

    // Dialog states
    const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
    const [educationDialogOpen, setEducationDialogOpen] = useState(false);
    const [certificationDialogOpen, setCertificationDialogOpen] = useState(false);

    // Edit states
    const [editingExperience, setEditingExperience] = useState<ExperienceEntry | null>(null);
    const [editingEducation, setEditingEducation] = useState<EducationEntry | null>(null);
    const [editingCertification, setEditingCertification] = useState<CertificationEntry | null>(null);

    // Skill input
    const [skillInput, setSkillInput] = useState("");

    // Toggle section
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    // ============================================
    // Experience Handlers
    // ============================================

    const handleAddExperience = () => {
        setEditingExperience(null);
        setExperienceDialogOpen(true);
    };

    const handleEditExperience = (entry: ExperienceEntry) => {
        setEditingExperience(entry);
        setExperienceDialogOpen(true);
    };

    const handleDeleteExperience = (id: string) => {
        updateProfile({
            experience: profile.experience.filter((e: ExperienceEntry) => e.id !== id),
        });
    };

    const handleSaveExperience = (entry: ExperienceEntry) => {
        if (editingExperience?.id) {
            // Update existing
            updateProfile({
                experience: profile.experience.map((e: ExperienceEntry) =>
                    e.id === editingExperience.id ? entry : e
                ),
            });
        } else {
            // Add new
            updateProfile({
                experience: [...profile.experience, { ...entry, id: generateId() }],
            });
        }
        setExperienceDialogOpen(false);
    };

    // ============================================
    // Education Handlers
    // ============================================

    const handleAddEducation = () => {
        setEditingEducation(null);
        setEducationDialogOpen(true);
    };

    const handleEditEducation = (entry: EducationEntry) => {
        setEditingEducation(entry);
        setEducationDialogOpen(true);
    };

    const handleDeleteEducation = (id: string) => {
        updateProfile({
            education: profile.education.filter((e: EducationEntry) => e.id !== id),
        });
    };

    const handleSaveEducation = (entry: EducationEntry) => {
        if (editingEducation?.id) {
            updateProfile({
                education: profile.education.map((e: EducationEntry) =>
                    e.id === editingEducation.id ? entry : e
                ),
            });
        } else {
            updateProfile({
                education: [...profile.education, { ...entry, id: generateId() }],
            });
        }
        setEducationDialogOpen(false);
    };

    // ============================================
    // Certification Handlers
    // ============================================

    const handleAddCertification = () => {
        setEditingCertification(null);
        setCertificationDialogOpen(true);
    };

    const handleEditCertification = (entry: CertificationEntry) => {
        setEditingCertification(entry);
        setCertificationDialogOpen(true);
    };

    const handleDeleteCertification = (id: string) => {
        updateProfile({
            certifications: profile.certifications.filter((e: CertificationEntry) => e.id !== id),
        });
    };

    const handleSaveCertification = (entry: CertificationEntry) => {
        if (editingCertification?.id) {
            updateProfile({
                certifications: profile.certifications.map((e: CertificationEntry) =>
                    e.id === editingCertification.id ? entry : e
                ),
            });
        } else {
            updateProfile({
                certifications: [...profile.certifications, { ...entry, id: generateId() }],
            });
        }
        setCertificationDialogOpen(false);
    };

    // ============================================
    // Skills Handlers
    // ============================================

    const handleAddSkill = () => {
        const skill = skillInput.trim();
        if (skill && !profile.skills.includes(skill)) {
            updateProfile({ skills: [...profile.skills, skill] });
            setSkillInput("");
        }
    };

    const handleRemoveSkill = (skill: string) => {
        updateProfile({ skills: profile.skills.filter((s: string) => s !== skill) });
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddSkill();
        }
    };

    return (
        <div className="space-y-4">
            {/* Info Banner */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <span>
                            Update your profile information to make your application stand out.
                            These changes will be saved to your NextStep profile.
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Career History Section */}
            <Collapsible
                open={expandedSections.experience}
                onOpenChange={() => toggleSection("experience")}
            >
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    <CardTitle className="text-lg">Career History</CardTitle>
                                    <Badge variant="secondary">{profile.experience.length}</Badge>
                                </div>
                                {expandedSections.experience ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-3 pt-0">
                            {profile.experience.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No work experience added yet
                                </p>
                            ) : (
                                profile.experience.map((entry: ExperienceEntry) => (
                                    <ExperienceItem
                                        key={entry.id}
                                        entry={entry}
                                        onEdit={handleEditExperience}
                                        onDelete={handleDeleteExperience}
                                    />
                                ))
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddExperience}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Experience
                            </Button>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Education Section */}
            <Collapsible
                open={expandedSections.education}
                onOpenChange={() => toggleSection("education")}
            >
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-blue-500" />
                                    <CardTitle className="text-lg">Education</CardTitle>
                                    <Badge variant="secondary">{profile.education.length}</Badge>
                                </div>
                                {expandedSections.education ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-3 pt-0">
                            {profile.education.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No education added yet
                                </p>
                            ) : (
                                profile.education.map((entry: EducationEntry) => (
                                    <EducationItem
                                        key={entry.id}
                                        entry={entry}
                                        onEdit={handleEditEducation}
                                        onDelete={handleDeleteEducation}
                                    />
                                ))
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddEducation}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Education
                            </Button>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Certifications Section */}
            <Collapsible
                open={expandedSections.certifications}
                onOpenChange={() => toggleSection("certifications")}
            >
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-500" />
                                    <CardTitle className="text-lg">Licenses & Certifications</CardTitle>
                                    <Badge variant="secondary">{profile.certifications.length}</Badge>
                                </div>
                                {expandedSections.certifications ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-3 pt-0">
                            {profile.certifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No certifications added yet
                                </p>
                            ) : (
                                profile.certifications.map((entry: CertificationEntry) => (
                                    <CertificationItem
                                        key={entry.id}
                                        entry={entry}
                                        onEdit={handleEditCertification}
                                        onDelete={handleDeleteCertification}
                                    />
                                ))
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddCertification}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Certification
                            </Button>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Skills Section */}
            <Collapsible
                open={expandedSections.skills}
                onOpenChange={() => toggleSection("skills")}
            >
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-green-500" />
                                    <CardTitle className="text-lg">Skills</CardTitle>
                                    <Badge variant="secondary">{profile.skills.length}</Badge>
                                </div>
                                {expandedSections.skills ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-3 pt-0">
                            {/* Skill Tags */}
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill: string) => (
                                    <Badge
                                        key={skill}
                                        variant="secondary"
                                        className="gap-1 pr-1"
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                                            aria-label={`Remove ${skill}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>

                            {/* Add Skill Input */}
                            <div className="flex gap-2">
                                <Input
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleSkillKeyDown}
                                    placeholder="Type a skill and press Enter"
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddSkill}
                                    disabled={!skillInput.trim()}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Experience Dialog */}
            <ExperienceDialog
                open={experienceDialogOpen}
                onOpenChange={setExperienceDialogOpen}
                entry={editingExperience}
                onSave={handleSaveExperience}
            />

            {/* Education Dialog */}
            <EducationDialog
                open={educationDialogOpen}
                onOpenChange={setEducationDialogOpen}
                entry={editingEducation}
                onSave={handleSaveEducation}
            />

            {/* Certification Dialog */}
            <CertificationDialog
                open={certificationDialogOpen}
                onOpenChange={setCertificationDialogOpen}
                entry={editingCertification}
                onSave={handleSaveCertification}
            />
        </div>
    );
}

// ============================================
// Experience Dialog
// ============================================

// Initial form state for new experience entry
const getInitialExperienceForm = (): ExperienceEntry => ({
    title: "",
    company: "",
    location: "",
    startDate: 0, // Will be set properly on form open
    endDate: undefined,
    isCurrent: false,
    description: "",
});

interface ExperienceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entry: ExperienceEntry | null;
    onSave: (entry: ExperienceEntry) => void;
}

function ExperienceDialog({ open, onOpenChange, entry, onSave }: ExperienceDialogProps) {
    const [form, setForm] = useState<ExperienceEntry>(getInitialExperienceForm);

    // Update form when entry changes or dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && entry) {
            setForm(entry);
        } else if (isOpen) {
            setForm({
                ...getInitialExperienceForm(),
                startDate: Date.now(),
            });
        }
        onOpenChange(isOpen);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {entry ? "Edit Experience" : "Add Experience"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="exp-title">Job Title *</Label>
                        <Input
                            id="exp-title"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Software Engineer"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="exp-company">Company *</Label>
                        <Input
                            id="exp-company"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            placeholder="e.g. Tech Company Inc."
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="exp-location">Location</Label>
                        <Input
                            id="exp-location"
                            value={form.location || ""}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="e.g. Manila, Philippines"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="exp-start">Start Date *</Label>
                            <Input
                                id="exp-start"
                                type="month"
                                value={
                                    form.startDate
                                        ? new Date(form.startDate).toISOString().slice(0, 7)
                                        : ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        startDate: new Date(e.target.value).getTime(),
                                    })
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exp-end">End Date</Label>
                            <Input
                                id="exp-end"
                                type="month"
                                value={
                                    form.endDate
                                        ? new Date(form.endDate).toISOString().slice(0, 7)
                                        : ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        endDate: e.target.value
                                            ? new Date(e.target.value).getTime()
                                            : undefined,
                                    })
                                }
                                disabled={form.isCurrent}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="exp-current"
                            checked={form.isCurrent}
                            onCheckedChange={(checked) =>
                                setForm({
                                    ...form,
                                    isCurrent: !!checked,
                                    endDate: checked ? undefined : form.endDate,
                                })
                            }
                        />
                        <Label htmlFor="exp-current" className="text-sm font-normal">
                            I currently work here
                        </Label>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="exp-desc">Description</Label>
                        <Textarea
                            id="exp-desc"
                            value={form.description || ""}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe your responsibilities and achievements..."
                            className="min-h-25"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={!form.title || !form.company}>
                            {entry ? "Save Changes" : "Add Experience"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// Education Dialog
// ============================================

// Initial form state for new education entry
const getInitialEducationForm = (): EducationEntry => ({
    institution: "",
    degree: "",
    field: "",
    startDate: 0, // Will be set properly on form open
    endDate: undefined,
    isCurrent: false,
    description: "",
});

interface EducationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entry: EducationEntry | null;
    onSave: (entry: EducationEntry) => void;
}

function EducationDialog({ open, onOpenChange, entry, onSave }: EducationDialogProps) {
    const [form, setForm] = useState<EducationEntry>(getInitialEducationForm);

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && entry) {
            setForm(entry);
        } else if (isOpen) {
            setForm({
                ...getInitialEducationForm(),
                startDate: Date.now(),
            });
        }
        onOpenChange(isOpen);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {entry ? "Edit Education" : "Add Education"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edu-school">School/University *</Label>
                        <Input
                            id="edu-school"
                            value={form.institution}
                            onChange={(e) => setForm({ ...form, institution: e.target.value })}
                            placeholder="e.g. University of the Philippines"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edu-degree">Degree *</Label>
                        <Input
                            id="edu-degree"
                            value={form.degree}
                            onChange={(e) => setForm({ ...form, degree: e.target.value })}
                            placeholder="e.g. Bachelor of Science"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edu-field">Field of Study</Label>
                        <Input
                            id="edu-field"
                            value={form.field || ""}
                            onChange={(e) => setForm({ ...form, field: e.target.value })}
                            placeholder="e.g. Computer Science"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edu-start">Start Date *</Label>
                            <Input
                                id="edu-start"
                                type="month"
                                value={
                                    form.startDate
                                        ? new Date(form.startDate).toISOString().slice(0, 7)
                                        : ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        startDate: new Date(e.target.value).getTime(),
                                    })
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edu-end">End Date</Label>
                            <Input
                                id="edu-end"
                                type="month"
                                value={
                                    form.endDate
                                        ? new Date(form.endDate).toISOString().slice(0, 7)
                                        : ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        endDate: e.target.value
                                            ? new Date(e.target.value).getTime()
                                            : undefined,
                                    })
                                }
                                disabled={form.isCurrent}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="edu-current"
                            checked={form.isCurrent}
                            onCheckedChange={(checked) =>
                                setForm({
                                    ...form,
                                    isCurrent: !!checked,
                                    endDate: checked ? undefined : form.endDate,
                                })
                            }
                        />
                        <Label htmlFor="edu-current" className="text-sm font-normal">
                            I&apos;m currently studying here
                        </Label>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={!form.institution || !form.degree}>
                            {entry ? "Save Changes" : "Add Education"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// Certification Dialog
// ============================================

interface CertificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entry: CertificationEntry | null;
    onSave: (entry: CertificationEntry) => void;
}

function CertificationDialog({ open, onOpenChange, entry, onSave }: CertificationDialogProps) {
    const [form, setForm] = useState<CertificationEntry>({
        name: "",
        issuingOrganization: "",
        issueDate: undefined,
        expiryDate: undefined,
        credentialId: "",
        credentialUrl: "",
        neverExpires: false,
    });

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && entry) {
            setForm(entry);
        } else if (isOpen) {
            setForm({
                name: "",
                issuingOrganization: "",
                issueDate: undefined,
                expiryDate: undefined,
                credentialId: "",
                credentialUrl: "",
                neverExpires: false,
            });
        }
        onOpenChange(isOpen);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {entry ? "Edit Certification" : "Add Certification"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cert-name">Certification Name *</Label>
                        <Input
                            id="cert-name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. AWS Solutions Architect"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cert-issuer">Issuing Organization *</Label>
                        <Input
                            id="cert-issuer"
                            value={form.issuingOrganization}
                            onChange={(e) =>
                                setForm({ ...form, issuingOrganization: e.target.value })
                            }
                            placeholder="e.g. Amazon Web Services"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cert-issue">Issue Date</Label>
                            <Input
                                id="cert-issue"
                                type="month"
                                value={
                                    form.issueDate
                                        ? new Date(form.issueDate).toISOString().slice(0, 7)
                                        : ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        issueDate: e.target.value
                                            ? new Date(e.target.value).getTime()
                                            : undefined,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cert-expiry">Expiry Date</Label>
                            <Input
                                id="cert-expiry"
                                type="month"
                                value={
                                    form.expiryDate
                                        ? new Date(form.expiryDate).toISOString().slice(0, 7)
                                        : ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        expiryDate: e.target.value
                                            ? new Date(e.target.value).getTime()
                                            : undefined,
                                    })
                                }
                                disabled={form.neverExpires}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="cert-no-expiry"
                            checked={form.neverExpires}
                            onCheckedChange={(checked) =>
                                setForm({
                                    ...form,
                                    neverExpires: !!checked,
                                    expiryDate: checked ? undefined : form.expiryDate,
                                })
                            }
                        />
                        <Label htmlFor="cert-no-expiry" className="text-sm font-normal">
                            This credential does not expire
                        </Label>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cert-id">Credential ID</Label>
                        <Input
                            id="cert-id"
                            value={form.credentialId || ""}
                            onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                            placeholder="Optional"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={!form.name || !form.issuingOrganization}
                        >
                            {entry ? "Save Changes" : "Add Certification"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
