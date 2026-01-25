/**
 * Opportunity Data Access Layer
 * Handles all opportunity-related database operations
 */

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { queryConvex, mutateConvex } from "./convex";
import { DALError } from "../types/common.types";
import type {
    Opportunity,
    OpportunitySearchParams,
    CreateOpportunityInput,
    UpdateOpportunityInput,
} from "../types/opportunity.types";

type AuthProvider = string | (() => Promise<string | null>);

export class OpportunityDAL {
    /**
     * Get all opportunities with optional filtering
     */
    static async getAllOpportunities(
        params?: OpportunitySearchParams,
        auth?: AuthProvider,
    ): Promise<Opportunity[]> {
        try {
            return await queryConvex<Opportunity[]>(
                api.opportunities.getAllOpportunities,
                (params || {}) as unknown as Record<string, unknown>,
                auth,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch opportunities",
                error,
            );
        }
    }

    /**
     * Get a single opportunity by ID
     */
    static async getOpportunityById(
        id: Id<"opportunities">,
        auth?: AuthProvider,
    ): Promise<Opportunity | null> {
        try {
            return await queryConvex<Opportunity | null>(
                api.opportunities.getOpportunityById,
                { id },
                auth,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch opportunity",
                error,
            );
        }
    }

    /**
     * Create a new opportunity
     */
    static async createOpportunity(
        data: CreateOpportunityInput,
        auth: AuthProvider,
    ): Promise<Id<"opportunities">> {
        try {
            return await mutateConvex<Id<"opportunities">>(
                api.opportunities.createOpportunity,
                data as unknown as Record<string, unknown>,
                auth,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to create opportunity",
                error,
            );
        }
    }

    /**
     * Update an opportunity
     */
    static async updateOpportunity(
        id: Id<"opportunities">,
        data: UpdateOpportunityInput,
        auth: AuthProvider,
    ): Promise<Id<"opportunities">> {
        try {
            return await mutateConvex<Id<"opportunities">>(
                api.opportunities.updateOpportunity,
                { id, ...data },
                auth,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to update opportunity",
                error,
            );
        }
    }

    /**
     * Delete an opportunity
     */
    static async deleteOpportunity(
        id: Id<"opportunities">,
        auth: AuthProvider,
    ): Promise<boolean> {
        try {
            return await mutateConvex<boolean>(
                api.opportunities.deleteOpportunity,
                { id },
                auth,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to delete opportunity",
                error,
            );
        }
    }

    /**
     * Apply to an opportunity (creates application)
     */
    static async applyToOpportunity(
        opportunityId: Id<"opportunities">,
        userId: Id<"users">,
        coverLetter: string,
        auth: AuthProvider,
    ): Promise<Id<"applications">> {
        try {
            return await mutateConvex<Id<"applications">>(
                api.applications.createApplication,
                {
                    opportunityId,
                    userId,
                    coverLetter,
                },
                auth,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to apply to opportunity",
                error,
            );
        }
    }
}
