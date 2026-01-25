/**
 * Opportunity types for Data Access Layer
 */

import { Id } from "@/convex/_generated/dataModel";

export interface Opportunity {
    _id: Id<"opportunities">;
    _creationTime: number;
    title: string;
    type: "job" | "internship" | "mentorship";
    description: string;
    company?: string;
    mentor?: string;
    location: string;
    skills: string[];
    isRemote: boolean;
    salary?: string;
    postedBy: Id<"users">;
    postedDate: number;
}

export interface OpportunitySearchParams {
    type?: string;
    location?: string;
    isRemote?: boolean;
    search?: string;
}

export interface CreateOpportunityInput {
    title: string;
    type: "job" | "internship" | "mentorship";
    description: string;
    company?: string;
    mentor?: string;
    location: string;
    skills: string[];
    isRemote: boolean;
    salary?: string;
}

export interface UpdateOpportunityInput {
    title?: string;
    description?: string;
    location?: string;
    skills?: string[];
    isRemote?: boolean;
    salary?: string;
}

export interface OpportunityApplicationInput {
    opportunityId: Id<"opportunities">;
    userId: Id<"users">;
    coverLetter?: string;
}
