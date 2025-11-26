import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            /**
             * Authenticated user ID added by authentication middleware.
             */
            userId?: number;
            /**
             * Authenticated user information added by authentication middleware.
             */
            user?: {
                id: number;
                email: string;
                role: string;
            };
        }
    }
}

