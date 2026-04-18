/**
 * Pagination Request Parameters
 */
export interface PaginationParams {
    limit?: number;
    offset?: number;
    cursor?: string;
}

/**
 * Pagination Response Metadata
 */
export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextCursor?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

/**
 * Default pagination constants
 */
export const PAGINATION_DEFAULTS = {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
} as const;

/**
 * Parse and validate pagination parameters from query string
 */
export function parsePaginationParams(query: Record<string, unknown>): Required<PaginationParams> {
    const limit = Math.min(
        Math.max(
            parseInt(String(query.limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT), 10),
            PAGINATION_DEFAULTS.MIN_LIMIT
        ),
        PAGINATION_DEFAULTS.MAX_LIMIT
    );

    const offset = Math.max(parseInt(String(query.offset || 0), 10), 0);
    const cursor = query.cursor ? String(query.cursor) : undefined;

    return {
        limit,
        offset,
        cursor: cursor || '',
    };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
    total: number,
    limit: number,
    offset: number,
    hasNextPage: boolean
): PaginationMeta {
    return {
        total,
        limit,
        offset,
        hasMore: hasNextPage,
        nextCursor: hasNextPage ? Buffer.from(`${offset + limit}`).toString('base64') : undefined,
    };
}
