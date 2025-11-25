import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    userId?: number;
    user?: {
        id: number;
        email: string;
        role: string;
    };
}
