"use client";

import { ExternalLink, Linkedin, Github, Globe, Link as LinkIcon } from "lucide-react";
import type { SocialLinkEntry } from "../../types";

interface SocialLinksProps {
    socialLinks?: SocialLinkEntry[];
    // Legacy fields for backward compatibility
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
}

export function SocialLinks({
    socialLinks,
    linkedInUrl,
    githubUrl,
    portfolioUrl
}: SocialLinksProps) {
    // Migrate legacy fields to new format if no socialLinks exist
    const links: SocialLinkEntry[] = socialLinks && socialLinks.length > 0
        ? socialLinks
        : [
            ...(linkedInUrl ? [{ id: "legacy-linkedin", label: "LinkedIn", url: linkedInUrl }] : []),
            ...(githubUrl ? [{ id: "legacy-github", label: "GitHub", url: githubUrl }] : []),
            ...(portfolioUrl ? [{ id: "legacy-portfolio", label: "Portfolio", url: portfolioUrl }] : []),
        ];

    if (links.length === 0) {
        return null;
    }

    // Icon mapping for common services
    const getIcon = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes("linkedin")) return <Linkedin className="h-4 w-4" />;
        if (lowerLabel.includes("github")) return <Github className="h-4 w-4" />;
        if (lowerLabel.includes("portfolio") || lowerLabel.includes("website")) return <Globe className="h-4 w-4" />;
        return <LinkIcon className="h-4 w-4" />;
    };

    // Color mapping for common services
    const getColorClass = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes("linkedin")) return "text-blue-600 hover:text-blue-700";
        if (lowerLabel.includes("github")) return "text-gray-700 hover:text-gray-900";
        if (lowerLabel.includes("portfolio") || lowerLabel.includes("website")) return "text-emerald-600 hover:text-emerald-700";
        return "text-indigo-600 hover:text-indigo-700";
    };

    return (
        <div>
            <h3 className="font-semibold text-gray-900 text-base mb-3">Social Links</h3>
            <div className="flex flex-wrap gap-3">
                {links.map((link, index) => (
                    <a
                        key={link.id || `link-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-sm ${getColorClass(link.label)} hover:underline`}
                    >
                        {getIcon(link.label)}
                        {link.label}
                        <ExternalLink className="h-3 w-3" />
                    </a>
                ))}
            </div>
        </div>
    );
}
