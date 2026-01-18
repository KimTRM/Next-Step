/**
 * Mentor Data Access Layer
 * Handles mentor database operations for server-side components
 */

import { queryConvex, mutateConvex, api } from "./convex";
import { DALError } from "../types/common.types";
import type {
    Mentor,
    CreateMentorInput,
    UpdateMentorInput,
    MentorSearchParams,
    BookSessionInput,
} from "../types/mentor.types";
import type { Id } from "@/convex/_generated/dataModel";

export class MentorDAL {
    /**
     * Get all mentors with optional filtering
     */
    static async getAllMentors(params?: MentorSearchParams): Promise<Mentor[]> {
        try {
            return await queryConvex<Mentor[]>(
                api.mentors.getAllMentors,
                (params || {}) as Record<string, unknown>,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch mentors",
                error,
            );
        }
    }

    /**
     * Get mentor by ID
     */
    static async getMentorById(
        mentorId: Id<"mentors">,
    ): Promise<Mentor | null> {
        try {
            return await queryConvex<Mentor | null>(api.mentors.getMentorById, {
                mentorId,
            });
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch mentor",
                error,
            );
        }
    }

    /**
     * Get top-rated mentors
     */
    static async getTopRatedMentors(params?: {
        limit?: number;
    }): Promise<Mentor[]> {
        try {
            return await queryConvex<Mentor[]>(
                api.mentors.getTopRatedMentors,
                params || {},
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch top-rated mentors",
                error,
            );
        }
    }

    /**
     * Get recommended mentors based on user profile
     */
    static async getRecommendedMentors(params: {
        userId: Id<"users">;
        limit?: number;
    }): Promise<Mentor[]> {
        try {
            return await queryConvex<Mentor[]>(
                api.mentors.getRecommendedMentors,
                params,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch recommended mentors",
                error,
            );
        }
    }

    /**
     * Get mentors by expertise
     */
    static async getMentorsByExpertise(params: {
        expertise: string[];
        limit?: number;
    }): Promise<Mentor[]> {
        try {
            return await queryConvex<Mentor[]>(
                api.mentors.getMentorsByExpertise,
                params,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch mentors by expertise",
                error,
            );
        }
    }

    /**
     * Get similar mentors based on another mentor
     */
    static async getSimilarMentors(params: {
        mentorId: Id<"mentors">;
        limit?: number;
    }): Promise<Mentor[]> {
        try {
            return await queryConvex<Mentor[]>(
                api.mentors.getSimilarMentors,
                params,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch similar mentors",
                error,
            );
        }
    }

    /**
     * Search mentors by name or expertise
     */
    static async searchMentors(params: {
        query: string;
        limit?: number;
    }): Promise<Mentor[]> {
        try {
            return await queryConvex<Mentor[]>(
                api.mentors.searchMentors,
                params,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to search mentors",
                error,
            );
        }
    }

    /**
     * Create a new mentor profile
     */
    static async createMentor(input: CreateMentorInput): Promise<Mentor> {
        try {
            const mentorId = await mutateConvex<Id<"mentors">>(
                api.mentors.createMentor,
                input as unknown as Record<string, unknown>,
            );
            const mentor = await this.getMentorById(mentorId);
            if (!mentor) {
                throw new Error("Failed to retrieve created mentor");
            }
            return mentor;
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to create mentor",
                error,
            );
        }
    }

    /**
     * Update mentor profile
     */
    static async updateMentor(
        mentorId: Id<"mentors">,
        updates: UpdateMentorInput,
    ): Promise<void> {
        try {
            await mutateConvex(api.mentors.updateMentor, {
                mentorId,
                ...updates,
            });
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to update mentor",
                error,
            );
        }
    }

    /**
     * Book a mentorship session
     */
    static async bookSession(input: BookSessionInput): Promise<void> {
        try {
            await mutateConvex(
                api.mentors.bookSession,
                input as unknown as Record<string, unknown>,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to book session",
                error,
            );
        }
    }

    /**
     * Send a connection request to a mentor
     */
    static async sendConnectionRequest(params: {
        mentorId: Id<"mentors">;
        message: string;
    }): Promise<void> {
        try {
            await mutateConvex(api.mentors.sendConnectionRequest, params);
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to send connection request",
                error,
            );
        }
    }

    /**
     * Get mentor statistics
     */
    static async getMentorStats(mentorId: Id<"mentors">): Promise<{
        sessionsCompleted: number;
        averageRating: number;
        totalReviews: number;
        responseTime: string;
    }> {
        try {
            // This would be a dedicated query in the real implementation
            const mentor = await this.getMentorById(mentorId);
            if (!mentor) {
                throw new Error("Mentor not found");
            }
            return {
                sessionsCompleted: mentor.sessionsCompleted || 0,
                averageRating: mentor.rating,
                totalReviews: mentor.testimonialCount || 0,
                responseTime: mentor.responseTime || "N/A",
            };
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch mentor stats",
                error,
            );
        }
    }
}
