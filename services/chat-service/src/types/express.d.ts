import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    username: string;
    role?: string;
  };
}
