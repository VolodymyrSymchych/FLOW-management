
declare global {
    namespace Express {
        interface Request {
            /**
             * Authenticated user information added by authentication middleware.
             */
            user?: {
                userId?: string | number;
                // Additional fields can be added as needed.
                [key: string]: unknown;
            };
        }
    }
}

