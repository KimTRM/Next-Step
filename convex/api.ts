/**
 * Convex API Routing
 * Feature-based module exports
 */

// Feature modules
import * as usersModule from "./users";
import * as jobsModule from "./jobs";
import * as applicationsModule from "./applications";
import * as mentorsModule from "./mentors";
import * as messagesModule from "./messages";

// Export feature namespaces
export const users = usersModule;
export const jobs = jobsModule;
export const applications = applicationsModule;
export const mentors = mentorsModule;
export const messages = messagesModule;

// Legacy aliases for backwards compatibility during migration
// These can be removed once all frontend imports are updated
export const userMutations = usersModule;
export const jobApplications = applicationsModule;
