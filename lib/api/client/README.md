# Client API Layer

A clean, function-based API client layer for making frontend API calls, following the same pattern as the Data Access Layer (DAL).

## Architecture

```
lib/api/client/
├── base.ts              # Core fetch wrapper with error handling
├── applications.ts      # Application-related API calls
├── jobs.ts             # Job-related API calls
├── mentors.ts          # Mentor-related API calls
├── messages.ts         # Messaging API calls
└── index.ts            # Exports all API services
```

## Features

- ✅ **Clean Function-Based API**: Simple, reusable functions instead of scattered fetch calls
- ✅ **Type-Safe**: Full TypeScript support with proper types for requests and responses
- ✅ **Error Handling**: Consistent error handling with custom `APIError` class
- ✅ **Request Timeout**: Built-in timeout support (default 30s)
- ✅ **Query Params**: Automatic query parameter handling
- ✅ **Cancellation**: Proper cleanup with AbortController
- ✅ **DRY Principle**: Eliminates code duplication across components

## Usage

### Basic Example

```tsx
import { ApplicationsAPI, APIError } from "@/lib/api/client";

// Instead of this messy code:
const res = await fetch("/api/applications");
const json = await res.json();
if (!res.ok || !json.success) {
    throw new Error(json?.error?.message || "Failed");
}
const data = json.data;

// Use this clean approach:
const data = await ApplicationsAPI.getUserApplications();
```

### With Error Handling

```tsx
import { JobsAPI, APIError } from "@/lib/api/client";

try {
    const jobs = await JobsAPI.searchJobs({
        searchTerm: "developer",
        location: "Naga City",
        employmentType: "full-time",
    });
    setJobs(jobs);
} catch (error) {
    if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.statusCode})`);
        toast.error(error.message);
    }
}
```

### In React Components with Cleanup

```tsx
useEffect(() => {
    let cancelled = false;

    (async () => {
        setLoading(true);
        try {
            const data = await ApplicationsAPI.getUserApplications();
            if (!cancelled) {
                setApplications(data);
            }
        } catch (error) {
            if (!cancelled) {
                const message =
                    error instanceof APIError ?
                        error.message
                    :   "Failed to load";
                toast.error(message);
            }
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    })();

    return () => {
        cancelled = true;
    };
}, []);
```

## API Modules

### ApplicationsAPI

```tsx
import { ApplicationsAPI } from "@/lib/api/client";

// Get all applications for current user
const applications = await ApplicationsAPI.getUserApplications();

// Update application status
await ApplicationsAPI.updateApplicationStatus(applicationId, {
    status: "interview",
    nextStep: "Technical interview scheduled",
    interviewDate: Date.now(),
});
```

### JobsAPI

```tsx
import { JobsAPI } from "@/lib/api/client";

// Search jobs with filters
const jobs = await JobsAPI.searchJobs({
    searchTerm: "frontend developer",
    location: "Naga City",
    employmentType: "full-time",
    experienceLevel: "entry",
    minSalary: 20000,
    limit: 20,
});

// Get job by ID
const job = await JobsAPI.getJobById(jobId);
```

### MentorsAPI

```tsx
import { MentorsAPI } from "@/lib/api/client";

// Search mentors
const mentors = await MentorsAPI.searchMentors({
    expertise: ["JavaScript", "React"],
    minRating: 4.5,
    maxHourlyRate: 1000,
});

// Connect to mentor
await MentorsAPI.connectToMentor({
    mentorId: mentor._id,
    message: "Hi, I'd like to learn React...",
});

// Book session
await MentorsAPI.bookMentorSession({
    mentorId: mentor._id,
    date: Date.now(),
    duration: 60,
    topic: "React fundamentals",
});
```

### MessagesAPI

```tsx
import { MessagesAPI } from "@/lib/api/client";

// Get conversations
const conversations = await MessagesAPI.getConversations();

// Get messages in a conversation
const messages = await MessagesAPI.getMessages(conversationId);

// Send message
await MessagesAPI.sendMessage({
    conversationId,
    content: "Hello!",
});

// Mark as read
await MessagesAPI.markAsRead(conversationId);
```

## Base API Utilities

You can also use the low-level base functions directly:

```tsx
import { get, post, put, patch, del } from "@/lib/api/client";

// GET request with query params
const data = await get("/api/custom", { page: 1, limit: 10 });

// POST request with body
const result = await post("/api/custom", { name: "John" });

// PATCH request
await patch("/api/custom/123", { status: "active" });

// DELETE request
await del("/api/custom/123");
```

## Error Types

```tsx
import { APIError } from "@/lib/api/client";

try {
    await JobsAPI.searchJobs();
} catch (error) {
    if (error instanceof APIError) {
        console.log(error.statusCode); // HTTP status code
        console.log(error.message); // Error message
        console.log(error.details); // Additional error details
    }
}
```

## Benefits Over Raw Fetch

| Before (Raw Fetch)    | After (API Client)       |
| --------------------- | ------------------------ |
| 15+ lines per call    | 1 line                   |
| Manual error handling | Automatic error handling |
| Manual query params   | Automatic query params   |
| Manual JSON parsing   | Automatic JSON parsing   |
| Type unsafe           | Type safe                |
| Code duplication      | Reusable functions       |
| Inconsistent patterns | Consistent patterns      |

## Adding New Endpoints

To add a new API endpoint:

1. Create a new file in `lib/api/client/` (e.g., `notifications.ts`)
2. Define types and functions:

```tsx
import { get, post } from "./base";
import type { Id } from "@/convex/_generated/dataModel";

export type Notification = {
    _id: Id<"notifications">;
    message: string;
    read: boolean;
};

export async function getNotifications(): Promise<Notification[]> {
    return get<Notification[]>("/api/notifications");
}

export async function markNotificationAsRead(
    id: Id<"notifications">,
): Promise<void> {
    return post<void>(`/api/notifications/${id}/read`, {});
}
```

3. Export from `index.ts`:

```tsx
export * as NotificationsAPI from "./notifications";
```

4. Use in components:

```tsx
import { NotificationsAPI } from "@/lib/api/client";
const notifications = await NotificationsAPI.getNotifications();
```

## Best Practices

1. **Always use the API client** instead of raw fetch in frontend components
2. **Handle errors properly** using try-catch and APIError
3. **Use proper cleanup** in useEffect hooks with cancelled flag
4. **Type everything** - leverage TypeScript for safety
5. **Keep functions simple** - one function per endpoint
6. **Document complex APIs** - add JSDoc comments for clarity

## Migration from Raw Fetch

Before:

```tsx
const res = await fetch(`/api/jobs?${params.toString()}`);
const json = await res.json();
if (!res.ok || !json.success) {
    throw new Error(json?.error?.message || "Failed");
}
setJobs(json.data);
```

After:

```tsx
const jobs = await JobsAPI.searchJobs({ searchTerm, location });
setJobs(jobs);
```

Cleaner, safer, and more maintainable! 🎉
