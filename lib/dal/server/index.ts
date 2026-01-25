/**
 * Server-side Data Access Layer exports
 */

export { AuthDAL } from "./auth-service";
export { UserDAL } from "./user-service";
export { MentorDAL } from "./mentor-service";
export { JobDAL } from "./job-service";
export { JobApplicationDAL } from "./job-application-service";
export { MessageDAL } from "./message-service";
export { OpportunityDAL } from "./opportunity-service";
export { DashboardDAL } from "./dashboard-service";
export { queryConvex, mutateConvex, api } from "./convex";

export * from "../types/common.types";
export * from "../types/user.types";
export * from "../types/mentor.types";
export * from "../types/job.types";
export * from "../types/opportunity.types";
export * from "../types/dashboard.types";
