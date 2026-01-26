// Create namespaced exports for Convex routing
import * as usersModule from "./functions/users";
import * as userMutationsModule from "./functions/userMutations";
import * as jobsModule from "./functions/jobs";
import * as applicationsModule from "./functions/applications";
import * as jobApplicationsModule from "./functions/jobApplications";
import * as mentorsModule from "./functions/mentors";
import * as messagesModule from "./functions/messages";

export const users = usersModule;
export const userMutations = userMutationsModule;
export const jobs = jobsModule;
export const applications = applicationsModule;
export const jobApplications = jobApplicationsModule;
export const mentors = mentorsModule;
export const messages = messagesModule;
