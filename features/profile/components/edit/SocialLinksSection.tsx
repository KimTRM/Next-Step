"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface SocialLinksSectionProps {
    linkedInUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    onLinkedInChange: (value: string) => void;
    onGithubChange: (value: string) => void;
    onPortfolioChange: (value: string) => void;
    getSocialLinksError: (field: string) => string | undefined;
}

export function SocialLinksSection({
    linkedInUrl,
    githubUrl,
    portfolioUrl,
    onLinkedInChange,
    onGithubChange,
    onPortfolioChange,
    getSocialLinksError,
}: SocialLinksSectionProps) {
    return (
        <Card className="animate-in fade-in duration-200">
            <CardHeader>
                <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input
                            id="linkedin"
                            type="url"
                            value={linkedInUrl}
                            onChange={(e) => onLinkedInChange(e.target.value)}
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="truncate"
                        />
                        {getSocialLinksError("linkedInUrl") && (
                            <p className="text-sm text-red-600">
                                {getSocialLinksError("linkedInUrl")}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub Profile</Label>
                        <Input
                            id="github"
                            type="url"
                            value={githubUrl}
                            onChange={(e) => onGithubChange(e.target.value)}
                            placeholder="https://github.com/yourusername"
                            className="truncate"
                        />
                        {getSocialLinksError("githubUrl") && (
                            <p className="text-sm text-red-600">
                                {getSocialLinksError("githubUrl")}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio Website</Label>
                    <Input
                        id="portfolio"
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => onPortfolioChange(e.target.value)}
                        placeholder="https://yourportfolio.com"
                        className="truncate"
                    />
                    {getSocialLinksError("portfolioUrl") && (
                        <p className="text-sm text-red-600">
                            {getSocialLinksError("portfolioUrl")}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
