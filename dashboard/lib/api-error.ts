import { NextResponse } from 'next/server';

export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
}

export function handleApiError(error: unknown, context?: string): NextResponse {
    console.error(`[API Error${context ? ` - ${context}` : ''}]:`, error);

    if (error instanceof Error) {
        const apiError = error as ApiError;
        const statusCode = apiError.statusCode || 500;
        const message = apiError.message || 'Internal server error';
        const code = apiError.code || 'INTERNAL_ERROR';

        // Log stack trace in development
        if (process.env.NODE_ENV !== 'production') {
            console.error('Stack trace:', apiError.stack);
        }

        return NextResponse.json(
            {
                error: message,
                code,
                ...(process.env.NODE_ENV !== 'production' && { stack: apiError.stack }),
            },
            { status: statusCode }
        );
    }

    // Unknown error type
    return NextResponse.json(
        {
            error: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
        },
        { status: 500 }
    );
}

export function createApiError(message: string, statusCode: number = 500, code?: string): ApiError {
    const error = new Error(message) as ApiError;
    error.statusCode = statusCode;
    error.code = code;
    return error;
}
