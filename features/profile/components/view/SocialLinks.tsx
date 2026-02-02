"use client";

import { Linkedin, Github, Globe, ExternalLink } from "lucide-react";

interface SocialLinksProps {
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
}

export function SocialLinks({ linkedInUrl, githubUrl, portfolioUrl }: SocialLinksProps) {
    const hasAnyLinks = linkedInUrl || githubUrl || portfolioUrl;

    if (!hasAnyLinks) {
        return null;
    }

    return (
        <div>
            <h3 className="font-semibold text-gray-900 text-base mb-3">Social Links</h3>
            <div className="flex flex-wrap gap-3">
                {linkedInUrl && (
                    <a
                        href={linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
                {githubUrl && (
                    <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline"
                    >
                        <Github className="h-4 w-4" />
                        GitHub
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
                {portfolioUrl && (
                    <a
                        href={portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                        <Globe className="h-4 w-4" />
                        Portfolio
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </div>
        </div>
    );
}
