export const config = {
  service: {
    name: 'file-service',
    port: parseInt(process.env.PORT || '3007', 10),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  r2: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.AWS_ENDPOINT || '',
    bucketName: process.env.AWS_BUCKET_NAME || '',
    region: process.env.AWS_REGION || 'auto',
    publicUrl: process.env.R2_PUBLIC_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    serviceApiKey: process.env.FILE_SERVICE_API_KEY || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '7d',
    issuer: 'file-service',
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(','),
    credentials: true,
  },
  eventBus: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    type: 'rabbitmq' as const,
  },
};
