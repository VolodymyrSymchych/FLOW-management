# План оптимізації продуктивності - 7 грудня 2025

## 🔴 Поточні метрики (Desktop)

| Метрика | Поточне значення | Цільове значення | Статус |
|---------|------------------|------------------|--------|
| **FCP** (First Contentful Paint) | 3.1s | <1.8s | 🔴 Poor |
| **LCP** (Largest Contentful Paint) | 3.1s | <2.5s | 🟡 Needs Improvement |
| **TTFB** (Time to First Byte) | 1s | <0.8s | 🟡 Needs Improvement |

---

## 🎯 Цілі оптимізації

1. **FCP**: Зменшити до <1.8s (покращення на ~40%)
2. **LCP**: Зменшити до <2.5s (покращення на ~20%)
3. **TTFB**: Зменшити до <0.8s (покращення на ~20%)

---

## 🚀 План дій

### 1. Оптимізація TTFB (Server Response Time)

#### A. Кешування на рівні CDN
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

#### B. Оптимізація API routes
- ✅ Вже використовуємо Redis кешування
- ⚠️ Потрібно збільшити TTL для статичних даних
- ⚠️ Додати Edge Runtime для критичних routes

**Файли для оновлення**:
- `/dashboard/app/api/*/route.ts` - додати `export const runtime = 'edge'`

#### C. Database Connection Pooling
- Перевірити налаштування connection pool в мікросервісах
- Використовувати prepared statements

---

### 2. Оптимізація FCP (First Contentful Paint)

#### A. Зменшення розміру JavaScript bundle

**Поточні проблеми**:
- Великі компоненти завантажуються синхронно
- Багато unused code в bundle

**Рішення**:

1. **Code Splitting** - розділити bundle на менші частини
```typescript
// Використовувати dynamic imports для великих компонентів
const GanttChart = dynamic(() => import('@/components/GanttChartView'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});
```

2. **Tree Shaking** - видалити unused code
```json
// package.json
{
  "sideEffects": false
}
```

3. **Bundle Analysis**
```bash
npm install @next/bundle-analyzer
ANALYZE=true npm run build
```

#### B. Критичний CSS inline
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: criticalCSS // Inline критичний CSS
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### C. Preload критичних ресурсів
```typescript
// app/layout.tsx
<head>
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://your-api.vercel.app" />
</head>
```

---

### 3. Оптимізація LCP (Largest Contentful Paint)

#### A. Оптимізація зображень
```typescript
// Використовувати Next.js Image замість <img>
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  priority // Для hero images
  placeholder="blur"
  alt="Hero"
/>
```

#### B. Lazy Loading для non-critical компонентів
```typescript
// Відкладене завантаження компонентів нижче fold
const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false
});

const Analytics = dynamic(() => import('@/components/Analytics'), {
  ssr: false
});
```

#### C. Prefetch критичних даних
```typescript
// app/[locale]/(app)/dashboard/page.tsx
export async function generateMetadata() {
  // Prefetch data during build
  const stats = await fetch('/api/stats').then(r => r.json());
  return { title: `Dashboard - ${stats.projectCount} Projects` };
}
```

---

### 4. Оптимізація React Query

#### A. Збільшити staleTime для статичних даних
```typescript
// hooks/useQueries.ts
export function useProjects(teamId?: number | string) {
  return useQuery({
    queryKey: ['projects', teamId || 'all'],
    queryFn: async () => { /* ... */ },
    staleTime: 5 * 60 * 1000, // Збільшити до 5 хвилин
    gcTime: 30 * 60 * 1000, // Зберігати в кеші 30 хвилин
  });
}
```

#### B. Prefetching для швидкої навігації
```typescript
// Prefetch data on hover
<Link
  href="/dashboard/projects"
  onMouseEnter={() => prefetchProjects()}
>
  Projects
</Link>
```

---

### 5. Оптимізація шрифтів

#### A. Font Display Swap
```css
/* globals.css */
@font-face {
  font-family: 'Inter';
  font-display: swap; /* Показувати fallback шрифт поки завантажується */
  src: url('/fonts/inter.woff2') format('woff2');
}
```

#### B. Preload шрифтів
```typescript
// app/layout.tsx
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

---

### 6. Compression та Minification

#### A. Enable Compression
```javascript
// next.config.js
module.exports = {
  compress: true, // Gzip compression
  swcMinify: true, // Use SWC for minification
};
```

#### B. Image Optimization
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
};
```

---

### 7. Service Worker для кешування

```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/scripts/main.js',
      ]);
    })
  );
});
```

---

## 📊 Очікувані результати

| Метрика | Поточне | Після оптимізації | Покращення |
|---------|---------|-------------------|------------|
| **FCP** | 3.1s | ~1.5s | 🟢 -52% |
| **LCP** | 3.1s | ~2.0s | 🟢 -35% |
| **TTFB** | 1.0s | ~0.6s | 🟢 -40% |

---

## 🔧 Пріоритети виконання

### Високий пріоритет (Швидкі wins)
1. ✅ Додати `dynamic imports` для великих компонентів
2. ✅ Preload критичних шрифтів
3. ✅ Збільшити React Query staleTime
4. ✅ Enable compression в next.config.js

### Середній пріоритет
5. ⚠️ Bundle analysis та tree shaking
6. ⚠️ Оптимізація зображень (Next.js Image)
7. ⚠️ Edge Runtime для API routes

### Низький пріоритет (Довгострокові)
8. 📋 Service Worker для offline support
9. 📋 Critical CSS extraction
10. 📋 Database query optimization

---

## 🛠️ Інструменти для моніторингу

1. **Vercel Analytics** - вже використовується
2. **Lighthouse CI** - додати в CI/CD
3. **Web Vitals** - додати клієнтський моніторинг

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 📝 Чеклист виконання

- [ ] Bundle analysis
- [ ] Додати dynamic imports для великих компонентів
- [ ] Preload критичних ресурсів
- [ ] Оптимізувати React Query settings
- [ ] Enable compression
- [ ] Оптимізувати зображення
- [ ] Додати Edge Runtime для API routes
- [ ] Тестування на Lighthouse
- [ ] Моніторинг метрик після deployment

---

**Дата**: 7 грудня 2025  
**Статус**: 📋 План створено, готовий до виконання  
**Очікуване покращення**: 35-50% для всіх метрик
