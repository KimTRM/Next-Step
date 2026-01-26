/**
 * Applications Feature - Constants
 */

import type { ApplicationStatus } from "./types";

// Application status labels
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
    pending: "Pending",
    reviewing: "Under Review",
    interview: "Interview",
    accepted: "Accepted",
    rejected: "Rejected",
};

// Application status colors (for UI)
export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewing: "bg-blue-100 text-blue-800",
    interview: "bg-purple-100 text-purple-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
};

// Application status order (for sorting)
export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
    "pending",
    "reviewing",
    "interview",
    "accepted",
    "rejected",
];
