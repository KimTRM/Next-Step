/**
 * Common types used across the Data Access Layer
 */

export class DALError extends Error {
    constructor(
        public code: string,
        message: string,
        public details?: unknown,
    ) {
        super(message);
        this.name = "DALError";
    }
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}
