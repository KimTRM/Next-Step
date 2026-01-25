/**
 * Base API Client
 * Provides core fetch functionality with error handling and type safety
 */

export class APIError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public details?: unknown,
    ) {
        super(message);
        this.name = "APIError";
    }
}

export interface APIResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
    timeout?: number;
}

/**
 * Base fetch wrapper with error handling and type safety
 */
export async function apiFetch<T>(
    endpoint: string,
    options: RequestOptions = {},
): Promise<T> {
    const { params, timeout = 30000, ...fetchOptions } = options;

    // Build URL with query params
    let url = endpoint;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...fetchOptions.headers,
            },
        });

        clearTimeout(timeoutId);

        // Parse response
        const json: APIResponse<T> = await response.json();

        // Handle errors
        if (!response.ok || !json.success) {
            throw new APIError(
                response.status,
                json.error?.message || "Request failed",
                json.error?.details,
            );
        }

        return json.data as T;
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort errors
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new APIError(408, "Request timeout");
        }

        // Re-throw API errors
        if (error instanceof APIError) {
            throw error;
        }

        // Handle network errors
        throw new APIError(
            0,
            error instanceof Error ? error.message : "Network error occurred",
        );
    }
}

/**
 * GET request helper
 */
export async function get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    options: Omit<RequestOptions, "params" | "method"> = {},
): Promise<T> {
    return apiFetch<T>(endpoint, {
        ...options,
        method: "GET",
        params,
    });
}

/**
 * POST request helper
 */
export async function post<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<RequestOptions, "body" | "method"> = {},
): Promise<T> {
    return apiFetch<T>(endpoint, {
        ...options,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PUT request helper
 */
export async function put<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<RequestOptions, "body" | "method"> = {},
): Promise<T> {
    return apiFetch<T>(endpoint, {
        ...options,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PATCH request helper
 */
export async function patch<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<RequestOptions, "body" | "method"> = {},
): Promise<T> {
    return apiFetch<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * DELETE request helper
 */
export async function del<T>(
    endpoint: string,
    options: Omit<RequestOptions, "method"> = {},
): Promise<T> {
    return apiFetch<T>(endpoint, {
        ...options,
        method: "DELETE",
    });
}
