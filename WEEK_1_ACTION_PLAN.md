# 🎯 **IMMEDIATE ACTION PLAN - ТИЖДЕНЬ 1**

**Період:** 11-17 січня 2026  
**Мета:** Виправити критичні проблеми та підготувати базу для production

---

## 🔥 **CRITICAL FIXES - День 1-2**

### **1. Виправити invoice-service тести** (1 день)

**Проблема:** Тести падають при запуску

**Кроки:**
```bash
cd services/invoice-service
npm test -- --verbose --no-coverage
```

**Що перевірити:**
- [ ] Database schema правильний
- [ ] Mock функції працюють
- [ ] Async/await правильно обробляється
- [ ] Imports коректні

**Очікуваний результат:** ✅ Всі тести проходять

---

### **2. Виправити CI/CD Pipeline** (0.5 дня)

**Файл:** `.github/workflows/ci.yml`

**Зміни:**

```yaml
# БУЛО:
strategy:
  matrix:
    service: [shared]

# СТАЛО:
strategy:
  matrix:
    service: [
      auth-service,
      user-service,
      project-service,
      task-service,
      team-service,
      chat-service,
      invoice-service,
      notification-service,
      file-service
    ]

# БУЛО:
- name: Test
  run: npm test || true

# СТАЛО:
- name: Test
  run: npm test -- --coverage
  
# БУЛО:
- name: Lint
  run: npm run lint || true
  
# СТАЛО:
- name: Lint
  run: npm run lint
```

**Додати E2E тестування:**

```yaml
e2e-tests:
  runs-on: ubuntu-latest
  needs: lint-and-test
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: dashboard/package-lock.json
    
    - name: Install dependencies
      working-directory: dashboard
      run: npm ci
    
    - name: Install Playwright Browsers
      working-directory: dashboard
      run: npx playwright install --with-deps chromium
    
    - name: Run E2E Tests
      working-directory: dashboard
      run: npm run test:e2e
      env:
        TEST_BASE_URL: http://localhost:3001
    
    - name: Upload Playwright Report
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: dashboard/playwright-report/
        retention-days: 30
```

---

### **3. Покращити file-service coverage** (0.5 дня)

**Поточний стан:** 94.94% coverage

**Файли що потребують уваги:**
- `r2.service.ts` - 89.36% coverage
- Непокриті рядки: 13, 43, 75, 101, 126

**Задача:** Написати тести для edge cases в R2 service

---

## 🔒 **SECURITY HARDENING - День 3-4**

### **4. Rate Limiting для ВСІХ сервісів** (2 дні)

**Поточний стан:** Тільки auth-service має rate limiting

**План:**

#### **Крок 1: Створити shared rate limiter**

```typescript
// shared/src/middleware/rate-limiter.ts

import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis';

export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  keyPrefix?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    
    // Use Redis store for distributed rate limiting
    store: redis ? new RedisStore({
      client: redis,
      prefix: options.keyPrefix || 'rl:',
    }) : undefined,
  });
};

// Preset limiters
export const rateLimiters = {
  strict: createRateLimiter({ max: 10, windowMs: 60000 }), // 10/min
  normal: createRateLimiter({ max: 100, windowMs: 900000 }), // 100/15min
  relaxed: createRateLimiter({ max: 1000, windowMs: 900000 }), // 1000/15min
};
```

#### **Крок 2: Застосувати в кожному сервісі**

**Файли для редагування:**
- [ ] `services/user-service/src/app.ts`
- [ ] `services/project-service/src/app.ts`
- [ ] `services/task-service/src/app.ts`
- [ ] `services/team-service/src/app.ts`
- [ ] `services/chat-service/src/app.ts`
- [ ] `services/invoice-service/src/app.ts`
- [ ] `services/notification-service/src/app.ts`
- [ ] `services/file-service/src/app.ts`

**Приклад (user-service/src/app.ts):**

```typescript
import { rateLimiters } from '@project-scope-analyzer/shared';

app.use('/api', rateLimiters.normal);
app.use('/api/auth', rateLimiters.strict); // More strict for auth
```

---

### **5. Environment Variables Validation** (1 день)

**Мета:** Валідувати всі .env змінні при старті

**Файл:** Створити `shared/src/config/env-validation.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string(),
  
  // CORS
  ALLOWED_ORIGINS: z.string().transform((val) => val.split(',')),
  
  // Service-specific
  SERVICE_NAME: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.errors);
      process.exit(1);
    }
    throw error;
  }
}
```

**Використання в кожному сервісі:**

```typescript
// services/*/src/index.ts
import { validateEnv } from '@project-scope-analyzer/shared';

const env = validateEnv();

// Now use env.DATABASE_URL instead of process.env.DATABASE_URL
```

---

## 📊 **MONITORING SETUP - День 5**

### **6. Налаштувати Sentry** (1 день)

**Кроки:**

#### **Крок 1: Створити Sentry account**
1. Зареєструватися на https://sentry.io
2. Створити organization "Project Scope Analyzer"
3. Створити проекти:
   - `psa-auth-service`
   - `psa-user-service`
   - `psa-project-service`
   - `psa-task-service`
   - `psa-team-service`
   - `psa-chat-service`
   - `psa-invoice-service`
   - `psa-notification-service`
   - `psa-file-service`
   - `psa-dashboard`

#### **Крок 2: Встановити Sentry SDK**

```bash
# Backend services
cd shared
npm install @sentry/node @sentry/profiling-node

# Dashboard
cd ../dashboard
npm install @sentry/nextjs
```

#### **Крок 3: Налаштувати Sentry в shared**

```typescript
// shared/src/monitoring/sentry.ts

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(serviceName: string) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Set service name as tag
    tags: {
      service: serviceName,
    },
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new ProfilingIntegration(),
    ],
    
    // Filter out health checks
    beforeSend(event) {
      if (event.request?.url?.includes('/health')) {
        return null;
      }
      return event;
    },
  });
}

export { Sentry };
```

#### **Крок 4: Додати в кожен сервіс**

```typescript
// services/*/src/index.ts
import { initSentry, Sentry } from '@project-scope-analyzer/shared';

initSentry('auth-service'); // або відповідний service name

// В errorHandler middleware:
app.use(Sentry.Handlers.errorHandler());
```

#### **Крок 5: Dashboard Sentry (Next.js)**

```bash
cd dashboard
npx @sentry/wizard@latest -i nextjs
```

---

## 📝 **DOCUMENTATION - День 6-7**

### **7. API Documentation з Swagger** (2 дні)

**Мета:** Створити OpenAPI документацію для всіх сервісів

#### **Крок 1: Встановити swagger**

```bash
cd shared
npm install swagger-jsdoc swagger-ui-express @types/swagger-ui-express
```

#### **Крок 2: Створити Swagger config**

```typescript
// shared/src/docs/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';

export function createSwaggerSpec(serviceName: string, version: string) {
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: `${serviceName} API`,
        version,
        description: `API documentation for ${serviceName}`,
      },
      servers: [
        {
          url: process.env.API_URL || 'http://localhost:3000',
          description: 'Development server',
        },
        {
          url: process.env.PRODUCTION_API_URL,
          description: 'Production server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
  });
}
```

#### **Крок 3: Додати в app.ts**

```typescript
// services/*/src/app.ts

import swaggerUi from 'swagger-ui-express';
import { createSwaggerSpec } from '@project-scope-analyzer/shared';

const swaggerSpec = createSwaggerSpec('Auth Service', '1.0.0');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

#### **Крок 4: Документувати endpoints**

**Приклад (auth.controller.ts):**

```typescript
/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
export async function signup(req: Request, res: Response) {
  // ...
}
```

---

## ✅ **CHECKLIST ТИЖНЯ 1**

### **Day 1:**
- [ ] Виправити invoice-service тести
- [ ] Запустити всі тести локально
- [ ] Підтвердити 100% success rate

### **Day 2:**
- [ ] Оновити CI/CD pipeline
- [ ] Додати всі 9 сервісів в matrix
- [ ] Додати E2E тести в CI
- [ ] Запустити CI/CD і підтвердити що працює

### **Day 3:**
- [ ] Створити shared rate limiter
- [ ] Додати rate limiting в 4 сервіси
- [ ] Протестувати rate limiting

### **Day 4:**
- [ ] Додати rate limiting в решту 4 сервісів
- [ ] Створити env validation schema
- [ ] Додати env validation в всі сервіси

### **Day 5:**
- [ ] Створити Sentry account
- [ ] Налаштувати Sentry в shared
- [ ] Додати Sentry в всі сервіси
- [ ] Протестувати error tracking

### **Day 6:**
- [ ] Створити Swagger configuration
- [ ] Додати Swagger в 5 сервісів
- [ ] Документувати основні endpoints

### **Day 7:**
- [ ] Додати Swagger в решту 4 сервісів
- [ ] Завершити документацію endpoints
- [ ] Перевірити всі Swagger UI
- [ ] **REVIEW ТИЖНЯ**

---

## 📊 **МЕТРИКИ УСПІХУ**

**Після тижня 1 повинні мати:**

✅ **100% проходження тестів** - всі 297+ тестів  
✅ **CI/CD блокує bad code** - failing tests/lints  
✅ **Rate limiting працює** - у всіх 9 сервісах  
✅ **Env validation працює** - при старті кожного сервісу  
✅ **Sentry tracking працює** - можемо бачити errors  
✅ **API docs доступні** - `/api-docs` для кожного сервісу  

**Прогрес:**
```
До тижня:  60% готовності
Після:     75% готовності (+15%)
```

---

## 🎯 **НАСТУПНІ КРОКИ (ТИЖДЕНЬ 2)**

**Preview:**

1. **Security Headers Audit** - CSP, X-Frame-Options, etc.
2. **JWT Refresh Token Implementation** - якщо ще немає
3. **Database Backup Strategy** - Neon automated backups
4. **Performance Profiling** - знайти bottlenecks
5. **Architecture Documentation** - Mermaid diagrams

---

**Створено:** 11 січня 2026  
**Тривалість:** 1 тиждень (7 днів)  
**Очікуваний результат:** +15% до production readiness
