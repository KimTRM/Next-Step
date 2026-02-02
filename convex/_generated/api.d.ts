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
import type * as applications_index from "../applications/index.js";
import type * as applications_mutations from "../applications/mutations.js";
import type * as applications_queries from "../applications/queries.js";
import type * as connections_index from "../connections/index.js";
import type * as connections_mutations from "../connections/mutations.js";
import type * as connections_queries from "../connections/queries.js";
import type * as jobs_index from "../jobs/index.js";
import type * as jobs_mutations from "../jobs/mutations.js";
import type * as jobs_queries from "../jobs/queries.js";
import type * as mentors_index from "../mentors/index.js";
import type * as mentors_mutations from "../mentors/mutations.js";
import type * as mentors_queries from "../mentors/queries.js";
import type * as messages_index from "../messages/index.js";
import type * as messages_mutations from "../messages/mutations.js";
import type * as messages_queries from "../messages/queries.js";
import type * as notifications_index from "../notifications/index.js";
import type * as notifications_mutations from "../notifications/mutations.js";
import type * as notifications_queries from "../notifications/queries.js";
import type * as users_helpers from "../users/helpers.js";
import type * as users_index from "../users/index.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";
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
  "applications/index": typeof applications_index;
  "applications/mutations": typeof applications_mutations;
  "applications/queries": typeof applications_queries;
  "connections/index": typeof connections_index;
  "connections/mutations": typeof connections_mutations;
  "connections/queries": typeof connections_queries;
  "jobs/index": typeof jobs_index;
  "jobs/mutations": typeof jobs_mutations;
  "jobs/queries": typeof jobs_queries;
  "mentors/index": typeof mentors_index;
  "mentors/mutations": typeof mentors_mutations;
  "mentors/queries": typeof mentors_queries;
  "messages/index": typeof messages_index;
  "messages/mutations": typeof messages_mutations;
  "messages/queries": typeof messages_queries;
  "notifications/index": typeof notifications_index;
  "notifications/mutations": typeof notifications_mutations;
  "notifications/queries": typeof notifications_queries;
  "users/helpers": typeof users_helpers;
  "users/index": typeof users_index;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
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
