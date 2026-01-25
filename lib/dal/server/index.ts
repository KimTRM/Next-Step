/**
 * Server-side Data Access Layer exports
 */

import { AuthDAL } from "./auth-service";
import { UserDAL } from "./user-service";
import { MentorDAL } from "./mentor-service";
import { JobDAL } from "./job-service";
import { JobApplicationDAL } from "./job-application-service";
import { MessageDAL } from "./message-service";
import { OpportunityDAL } from "./opportunity-service";
import { DashboardDAL } from "./dashboard-service";

// Unified DAL export - single import for all services
export const DAL = {
    auth: AuthDAL,
    users: UserDAL,
    mentors: MentorDAL,
    jobs: JobDAL,
    jobApplications: JobApplicationDAL,
    messages: MessageDAL,
    opportunities: OpportunityDAL,
    dashboard: DashboardDAL,
};

// Individual exports for backward compatibility or specific imports
export { AuthDAL } from "./auth-service";
export { UserDAL } from "./user-service";
export { MentorDAL } from "./mentor-service";
export { JobDAL } from "./job-service";
export { JobApplicationDAL } from "./job-application-service";
export { MessageDAL } from "./message-service";
export { OpportunityDAL } from "./opportunity-service";
export { DashboardDAL } from "./dashboard-service";

// Convex utilities
export { queryConvex, mutateConvex, api } from "./convex";

// Type exports (for backward compatibility)
export * from "../types/common.types";
export * from "../types/user.types";
export * from "../types/mentor.types";
export * from "../types/job.types";
export * from "../types/opportunity.types";
export * from "../types/dashboard.types";
export * from "../types/message.types";
export * from "../types/job-application.types";
