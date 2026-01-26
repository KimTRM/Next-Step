/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as api_ from "../api.js";
import type * as functions_applications from "../functions/applications.js";
import type * as functions_jobApplications from "../functions/jobApplications.js";
import type * as functions_jobs from "../functions/jobs.js";
import type * as functions_mentors from "../functions/mentors.js";
import type * as functions_messages from "../functions/messages.js";
import type * as functions_userMutations from "../functions/userMutations.js";
import type * as functions_users from "../functions/users.js";
import type * as utils_mentorMigration from "../utils/mentorMigration.js";
import type * as utils_migration from "../utils/migration.js";
import type * as utils_seed from "../utils/seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  api: typeof api_;
  "functions/applications": typeof functions_applications;
  "functions/jobApplications": typeof functions_jobApplications;
  "functions/jobs": typeof functions_jobs;
  "functions/mentors": typeof functions_mentors;
  "functions/messages": typeof functions_messages;
  "functions/userMutations": typeof functions_userMutations;
  "functions/users": typeof functions_users;
  "utils/mentorMigration": typeof utils_mentorMigration;
  "utils/migration": typeof utils_migration;
  "utils/seed": typeof utils_seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
