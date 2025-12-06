# Backend Implementation for Social Login

It appears your current `auth-service` deployment on Vercel does not have the endpoints for Google and Microsoft login (`/api/auth/google` and `/api/auth/microsoft`), which causes the "Not Found" error when trying to login from the mobile app.

To fix this, you need to update your `services/auth-service` with the following code and redeploy.

## 1. Install Dependencies
You need to install the Google Auth library to verify tokens.

```bash
cd services/auth-service
npm install google-auth-library axios
```

## 2. Update `src/controllers/auth.controller.ts`

Add these imports:

```typescript
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
```

Add these methods to the `AuthController` class:

```typescript
  async googleLogin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) throw new ValidationError('Token is required');

      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new ValidationError('Invalid Google Token');
      }

      let user = await authService.getUserByEmail(payload.email);
      
      if (!user) {
        // Create new user from Google profile
        user = await authService.createUser({
          email: payload.email,
          username: payload.email.split('@')[0],
          fullName: payload.name || payload.given_name,
          provider: 'google',
          providerId: payload.sub,
          emailVerified: true,
          isActive: true,
          role: 'user',
        });
        
        // Publish registered event
         publishEvent({
            type: 'user.registered',
            userId: user.id,
            email: user.email,
            username: user.username,
            timestamp: new Date(),
         });
      }

      const jwt = await jwtService.createToken({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
        },
        token: jwt,
      });
    } catch (error) {
      next(error);
    }
  }

  async microsoftLogin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body; // Access Token
      if (!token) throw new ValidationError('Token is required');

      // Verify token by calling Microsoft Graph API
      const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const profile = graphResponse.data;
      if (!profile || !profile.mail && !profile.userPrincipalName) {
        throw new ValidationError('Could not fetch Microsoft profile');
      }

      const email = profile.mail || profile.userPrincipalName;
      let user = await authService.getUserByEmail(email);

      if (!user) {
         user = await authService.createUser({
          email: email,
          username: email.split('@')[0],
          fullName: profile.displayName,
          provider: 'microsoft',
          providerId: profile.id,
          emailVerified: true,
          isActive: true,
          role: 'user',
        });

          publishEvent({
            type: 'user.registered',
            userId: user.id,
            email: user.email,
            username: user.username,
            timestamp: new Date(),
         });
      }

      const jwt = await jwtService.createToken({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
        },
        token: jwt,
      });
    } catch (error) {
      next(error);
    }
  }
```

## 3. Update `src/routes/auth.ts`

Add these routes:

```typescript
router.post('/google', authController.googleLogin.bind(authController));
router.post('/microsoft', authController.microsoftLogin.bind(authController));
```

## 4. Redeploy
Push these changes to your repository to update the Vercel deployment.
