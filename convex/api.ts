// Export user-related functions
export { getAllUsers, getUserById, getUserByClerkId, getCurrentUser } from "./functions/users";
export { upsertUser, updateUserProfile, updateUser, deleteUser } from "./functions/userMutations";

// Export jobs-related functions
export * from "./functions/jobs";

// Export opportunity applications (generic applications for opportunities)
export {
  getUserApplications as getOpportunityUserApplications,
  getOpportunityApplications,
  createApplication as createOpportunityApplication,
  updateApplicationStatus as updateOpportunityApplicationStatus,
} from "./functions/applications";

// Export job applications (specific applications for jobs)
export {
  getUserJobApplications,
  getJobApplications,
  createJobApplication,
  updateApplicationStatus as updateJobApplicationStatus,
  updateApplicationNotes,
  deleteApplication as deleteJobApplication,
} from "./functions/jobApplications";

// Export mentors-related functions
export * from "./functions/mentors";

// Export messages-related functions
export * from "./functions/messages";

// Export opportunities-related functions
export * from "./functions/opportunities";
