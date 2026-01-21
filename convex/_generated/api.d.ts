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
import type * as applications from "../applications.js";
import type * as jobApplications from "../jobApplications.js";
import type * as jobs from "../jobs.js";
import type * as mentorMigration from "../mentorMigration.js";
import type * as mentors from "../mentors.js";
import type * as messages from "../messages.js";
import type * as migration from "../migration.js";
import type * as opportunities from "../opportunities.js";
import type * as seed from "../seed.js";
import type * as userMutations from "../userMutations.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  api: typeof api_;
  applications: typeof applications;
  jobApplications: typeof jobApplications;
  jobs: typeof jobs;
  mentorMigration: typeof mentorMigration;
  mentors: typeof mentors;
  messages: typeof messages;
  migration: typeof migration;
  opportunities: typeof opportunities;
  seed: typeof seed;
  userMutations: typeof userMutations;
  users: typeof users;
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
