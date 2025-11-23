
import { SignJWT, jwtVerify } from 'jose';

const SECRET_STR = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
const JWT_SECRET = new TextEncoder().encode(SECRET_STR);
const ISSUER = 'project-scope-analyzer';

async function test() {
    console.log('Testing JWT logic with provided secret...');

    // 1. Create Token (Dashboard Logic)
    const payload = {
        userId: 123,
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User'
    };

    try {
        const token = await new SignJWT({ ...payload })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .setIssuer(ISSUER)
            .sign(JWT_SECRET);

        console.log('✅ Token created successfully');
        console.log('Token:', token);

        // 2. Verify Token (Project Service Logic)
        const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET, {
            issuer: ISSUER,
        });

        console.log('✅ Token verified successfully');
        console.log('Verified Payload:', verifiedPayload);

        // 3. Check payload requirements
        if (!verifiedPayload.userId || !verifiedPayload.email || !verifiedPayload.username) {
            throw new Error('Invalid token payload - missing fields');
        }
        console.log('✅ Payload structure valid');

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

test();
