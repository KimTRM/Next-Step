/**
 * Client API Layer
 * Export all API services for easy imports
 */

// Base utilities
export { APIError, apiFetch, get, post, put, patch, del } from "./base";
export type { APIResponse, RequestOptions } from "./base";

// Applications
export * as ApplicationsAPI from "./applications";

// Jobs
export * as JobsAPI from "./jobs";

// Mentors
export * as MentorsAPI from "./mentors";

// Messages
export * as MessagesAPI from "./messages";
