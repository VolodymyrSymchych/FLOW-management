import { UnauthorizedError, logger } from '@project-scope-analyzer/shared';

export interface GoogleUser {
    sub: string;
    email: string;
    name: string;
    picture: string;
}

export interface MicrosoftUser {
    id: string;
    userPrincipalName: string; // email
    displayName: string;
}

export async function verifyGoogleToken(token: string): Promise<GoogleUser> {
    try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

        if (!response.ok) {
            throw new Error(`Google token validation failed: ${response.statusText}`);
        }

        const data = await response.json() as Record<string, unknown>;

        // Check if token is expired or audience is wrong if needed, 
        // but google's endpoint returns error for invalid tokens usually.

        return {
            sub: String(data.sub || ''),
            email: String(data.email || ''),
            name: String(data.name || ''),
            picture: String(data.picture || '')
        };
    } catch (error) {
        logger.error('Verify Google Token Error', { error });
        throw new UnauthorizedError('Invalid Google token');
    }
}

export async function verifyMicrosoftToken(token: string): Promise<MicrosoftUser> {
    try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Microsoft token validation failed: ${response.statusText}`);
        }

        const data = await response.json() as Record<string, unknown>;

        return {
            id: String(data.id || ''),
            userPrincipalName: String((data.userPrincipalName || data.mail) || ''),
            displayName: String(data.displayName || '')
        };
    } catch (error) {
        logger.error('Verify Microsoft Token Error', { error });
        throw new UnauthorizedError('Invalid Microsoft token');
    }
}
