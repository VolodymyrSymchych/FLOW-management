# 📱 Flow Management - План мобільної адаптації

## 📋 Зміст
1. [Аналіз десктопного дизайну](#аналіз-десктопного-дизайну)
2. [Критичні проблеми поточної реалізації](#критичні-проблеми-поточної-реалізації)
3. [Стратегія мобільної адаптації](#стратегія-мобільної-адаптації)
4. [Детальні рекомендації по компонентах](#детальні-рекомендації-по-компонентах)
5. [План імплементації](#план-імплементації)

---

## 🖥️ Аналіз десктопного дизайну

### Технічний стек
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS з кастомними CSS змінними
- **UI Pattern:** Glassmorphism з backdrop-filter та blur ефектами
- **Інтерактивність:** React DnD (@dnd-kit)
- **Стан:** React Query для серверних даних + Context API

### Дизайн система

#### Кольорова палітра
```css
Light Mode:
  --background: hsl(0 0% 98%)
  --primary: hsl(189 100% 55%)     /* Cyan #00E5FF */
  --secondary: hsl(263 85% 65%)    /* Purple #8A2BE2 */
  --text-primary: hsl(222 47% 11%) /* Dark text */

Dark Mode:
  --background: hsl(222 47% 6%)    /* Deep navy */
  --primary: hsl(189 100% 55%)     /* Cyan #00E5FF */
  --secondary: hsl(263 85% 65%)    /* Purple #8A2BE2 */
  --text-primary: hsl(220 15% 95%) /* Light text */

Glassmorphism Theme:
  --background: hsl(26 30% 11%)    /* Warm dark */
  --primary: hsl(230 89% 74%)      /* Light blue #8098F9 */
```

#### Типографія
- **Font:** Inter (sans), Poppins (display), JetBrains Mono (mono)
- **Base size:** 90% (html) - може створювати проблеми на мобільних
- **Headers:**
  - h1: 2em (36px на desktop)
  - h2: 1.5em (27px)
  - h3: 1.17em (21px)

#### Spacing система
- **Container padding:** px-4 sm:px-6 lg:px-8
- **Card gaps:** gap-4 (16px) на mobile, gap-6 (24px) на desktop
- **Border radius:**
  - Small: rounded-lg (8px)
  - Medium: rounded-xl (12px)
  - Large: rounded-2xl (16px)

### Архітектура layout

#### 1. Sidebar (navigation)
```typescript
// Файл: dashboard/components/Sidebar.tsx
Характеристики:
- Position: fixed left-0
- Ширина:
  - Expanded: w-64 (256px)
  - Collapsed: w-20 (80px)
- Z-index: z-40
- Висота: h-screen (100vh)
```

**Проблеми для mobile:**
- Фіксований sidebar займає весь екран або його значну частину
- Колапсований режим (80px) все одно забирає багато місця на маленьких екранах
- Немає механізму повного ховання для мобільних пристроїв

#### 2. Header
```typescript
// Файл: dashboard/components/Header.tsx
Характеристики:
- Position: sticky top-0
- Z-index: z-40
- Background: glass-medium з backdrop-blur
- Padding: px-4 sm:px-6 lg:px-8 py-4
```

**Елементи header:**
- Teams dropdown (ліворуч)
- Search bar: w-32 sm:w-48 md:w-64
- Notification bell
- User dropdown (праворуч)

**Проблеми для mobile:**
- Search bar дуже малий на мобільних (w-32 = 128px)
- Занадто багато елементів в одному рядку
- Dropdown меню можуть виходити за межі екрану

#### 3. Dashboard Grid
```typescript
// Файл: dashboard/app/[locale]/(app)/dashboard/page.tsx
Характеристики:
- Grid columns: 12/16/24 (конфігурується)
- Gap: gap-6 (24px)
- Widgets: динамічна система з drag-and-drop
- Responsive: grid-cols-1 на mobile, xl:grid-cols-{n} на desktop
```

**Сильні сторони:**
- Гнучка система віджетів
- Адаптивна сітка (grid-cols-1 на mobile)
- Збереження конфігурації в localStorage

**Проблеми для mobile:**
- Drag-and-drop не оптимізований для touch
- Контроли ресайзу (+/-) дуже малі для тапу
- Кастомізаційна панель займає багато місця

#### 4. Glassmorphism ефекти
```css
.glass-medium {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
```

**Проблеми для mobile:**
- `backdrop-filter: blur()` дуже навантажує GPU на мобільних
- Може призводити до lag'ів при скролі
- Батарея швидше розряджається

### Компоненти

#### ProjectCard
```typescript
// Файл: dashboard/components/ProjectCard.tsx
Розмір: glass-light rounded-xl p-4
Елементи:
- Avatar (36x36px)
- Title (text-sm)
- Team badges (10px text)
- Team avatars (28x28px, overlapping)
- Progress bar (h-2)
- Risk badge
```

**Оцінка адаптивності:**
- ✅ Добре працює на mobile (завдяки truncate і min-w-0)
- ⚠️ Overlapping avatars можуть бути дрібні на маленьких екранах
- ⚠️ Delete button малий для тапу (w-3.5 h-3.5 = 14px)

#### StatsCard
```typescript
// Файл: dashboard/components/StatsCard.tsx (referenced)
Grid: grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
```

**Оцінка адаптивності:**
- ✅ Адаптивна сітка
- ⚠️ Карточки можуть бути занадто тісні на маленьких екранах

---

## 🚨 Критичні проблеми поточної реалізації

### 1. Performance issues на mobile

#### Backdrop-filter overdose
```css
/* Проблемні класи: */
.glass-heavy { backdrop-filter: blur(6px); }
.glass-medium { backdrop-filter: blur(8px); }
.glass-strong { backdrop-filter: blur(30px); }
```

**Вплив:**
- Високе навантаження на GPU
- Лаги при скролі (особливо на Android)
- Швидке розряджання батареї
- FPS drops до 30-40 замість 60

**Рішення:**
```css
@media (max-width: 768px) {
  .glass-heavy, .glass-medium, .glass-light {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: rgba(255, 255, 255, 0.15) !important;
  }
}
```

#### Font size issue
```css
html {
  font-size: 90%; /* 14.4px замість 16px */
}
```

**Проблема:**
- На мобільних текст стає занадто дрібним
- Погана читабельність
- Accessibility issues

**Рішення:**
```css
html {
  font-size: 100%; /* 16px - standard */
}

@media (max-width: 768px) {
  html {
    font-size: 100%; /* Не зменшувати на mobile */
  }
}
```

### 2. Layout проблеми

#### Sidebar на mobile
**Поточний стан:**
- Завжди присутній (fixed)
- Займає 80px (collapsed) або 256px (expanded)
- Немає overlay для закриття

**Проблема:**
- На екрані 375px (iPhone SE) sidebar займає 21-68% ширини
- Контент занадто стиснутий

#### Header на mobile
**Поточний стан:**
```tsx
<input
  className="w-32 sm:w-48 md:w-64" // 128px на mobile
  placeholder="Search"
/>
```

**Проблема:**
- 5 елементів в header на маленькому екрані:
  1. Teams dropdown (широкий)
  2. Search (128px - замалий)
  3. Notifications
  4. User avatar
  5. User name + email (hidden на md)

### 3. Touch interaction проблеми

#### Дрібні tap targets
```tsx
// Delete button в ProjectCard
<Trash2 className="w-3.5 h-3.5" /> // 14x14px - менше мінімуму 44x44px
```

**Apple HIG рекомендації:** 44x44pt (44x44px)
**Android Material:** 48x48dp (48x48px)

**Проблемні елементи:**
- Delete buttons (14px)
- Resize controls (+/- кнопки)
- Dropdown arrows (16px)
- Navigation icons в collapsed sidebar (20px)

#### Drag-and-drop на touch
```typescript
// dashboard/app/[locale]/(app)/dashboard/page.tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  })
);
```

**Проблема:**
- PointerSensor працює, але UX не оптимальний для touch
- Немає візуального feedback для початку драгу
- Немає haptic feedback
- Конфлікт зі скролом

### 4. Modal та dropdown проблеми

#### Dropdown меню
```typescript
// Header.tsx - Teams dropdown
style={{
  top: `${teamsDropdownPosition.top}px`,
  left: `${teamsDropdownPosition.left}px`
}}
```

**Проблема:**
- Fixed positioning може виходити за межі viewport на mobile
- Немає перевірки чи вміщається dropdown

#### Create Team Modal
```tsx
<div className="w-full max-w-md glass-medium rounded-2xl p-6">
```

**Проблема:**
- max-w-md (448px) - занадто широкий для 375px екранів
- Немає padding з боків на маленьких екранах

---

## 🎯 Стратегія мобільної адаптації

### Breakpoints система

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '375px',   // iPhone SE, small phones
      'sm': '640px',   // Large phones (landscape)
      'md': '768px',   // Tablets (portrait)
      'lg': '1024px',  // Tablets (landscape), small laptops
      'xl': '1280px',  // Desktop
      '2xl': '1536px', // Large desktop
    }
  }
}
```

### Mobile-first підхід

#### Пріоритети
1. **Performance** - видалити backdrop-filter на mobile
2. **Usability** - збільшити tap targets до 44x44px
3. **Navigation** - sidebar → bottom navigation
4. **Touch** - оптимізувати для тач-взаємодії

### Progressive Enhancement

```
Mobile (375-640px)
  ↓
  + Enhanced touch interactions
  ↓
Tablet (640-1024px)
  ↓
  + Sidebar visible
  ↓
Desktop (1024px+)
  ↓
  + Full glassmorphism
  + Advanced interactions
```

---

## 📱 Детальні рекомендації по компонентах

### 1. Navigation: Sidebar → Bottom Navigation Bar

#### Поточна реалізація
```tsx
// Sidebar.tsx - Fixed sidebar 256px/80px
<aside className="fixed left-0 w-64">
  {/* Navigation items */}
</aside>
```

#### Нова мобільна навігація

**Створити новий компонент:** `MobileBottomNav.tsx`

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Receipt,
  Menu
} from 'lucide-react';

const mainNavigation = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { name: 'More', href: '#', icon: Menu, action: 'openSheet' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-surface/95 backdrop-blur-md safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16">
        {mainNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-colors duration-200
                ${isActive
                  ? 'text-primary'
                  : 'text-text-tertiary active:text-text-secondary'
                }
              `}
            >
              <Icon
                className="w-6 h-6"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Ключові особливості:**
- Фіксований знизу (bottom-0)
- Safe area insets для iPhone з notch
- 5 головних розділів + "More" для решти
- Grid layout для рівномірного розподілу
- 64px висота (мінімум для touch)

#### Bottom Sheet для "More" навігації

**Створити:** `MobileNavSheet.tsx`

```tsx
'use client';

import { useState } from 'react';
import {
  CheckSquare, Clock, BarChart3, FileText,
  Users, Settings, X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const secondaryNavigation = [
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { name: 'Charts', href: '/dashboard/charts', icon: BarChart3 },
  { name: 'Docs', href: '/dashboard/documentation', icon: FileText },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavSheet({ isOpen, onClose }: Props) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[101] animate-in slide-in-from-bottom duration-300">
        <div className="bg-surface rounded-t-3xl border-t border-white/10 max-h-[80vh] overflow-y-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-text-primary">
              More Navigation
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="p-4 space-y-2">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${isActive
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-text-secondary hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
```

#### Layout оновлення

**Оновити:** `dashboard/app/[locale]/(app)/layout.tsx`

```tsx
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function AppLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="md:ml-64"> {/* Offset for desktop sidebar */}
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
```

### 2. Header - мобільна оптимізація

#### Компактний мобільний header

**Оновити:** `Header.tsx`

```tsx
export function Header() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface/95 backdrop-blur-md">
      {/* Desktop header - поточний варіант */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        {/* ... existing desktop header ... */}
      </div>

      {/* Mobile header */}
      <div className="flex md:hidden items-center justify-between px-4 py-3">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <Logo variant="icon" />
          <span className="text-sm font-semibold text-text-primary">
            Flow
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Open search"
          >
            <Search className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User menu */}
          <button
            onClick={() => setShowUserDropdown(true)}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
          >
            <span className="text-sm font-semibold text-white">
              {initials}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Sheet */}
      {showMobileSearch && (
        <MobileSearchSheet
          isOpen={showMobileSearch}
          onClose={() => setShowMobileSearch(false)}
        />
      )}
    </header>
  );
}
```

#### Mobile Search Sheet

**Створити:** `MobileSearchSheet.tsx`

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchSheet({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-focus input
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <button
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {query ? (
          <div className="space-y-2">
            {/* Search results here */}
            <p className="text-sm text-text-tertiary">
              Searching for "{query}"...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-text-tertiary" />
                <span className="text-sm font-medium text-text-secondary">
                  Recent searches
                </span>
              </div>
              <div className="space-y-2">
                {/* Recent searches */}
                <p className="text-sm text-text-tertiary">
                  No recent searches
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Dashboard - мобільна оптимізація

#### Віджети stack layout на mobile

**Оновити:** `dashboard/page.tsx`

```tsx
export default function DashboardPage() {
  // ... existing logic ...

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - компактний на mobile */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-text-primary">
            Dashboard
          </h1>

          {/* Customize button - тільки на tablet+ */}
          <button
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10"
            onClick={() => setIsCustomizationOpen(!isCustomizationOpen)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">Customize</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-text-tertiary">
          Overview of your workspace
        </p>
      </div>

      {/* Stats - horizontal scroll на mobile */}
      <div className="sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* На mobile - horizontal scroll */}
        <div className="sm:hidden flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          <div className="snap-start min-w-[280px]">
            <StatsCard {...stats1} />
          </div>
          <div className="snap-start min-w-[280px]">
            <StatsCard {...stats2} />
          </div>
          {/* ... more stats ... */}
        </div>

        {/* На tablet+ - grid */}
        <div className="hidden sm:contents">
          <StatsCard {...stats1} />
          <StatsCard {...stats2} />
          {/* ... more stats ... */}
        </div>
      </div>

      {/* Widgets - stack на mobile, grid на desktop */}
      <div className={cn(
        "space-y-4 sm:space-y-0",
        "sm:grid sm:gap-6",
        gridColsClass // xl:grid-cols-12 etc
      )}>
        {renderableWidgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              // Mobile - full width stack
              "w-full",
              // Desktop - grid span
              COL_SPAN_CLASSES[widgetSizes[widget.id]]
            )}
          >
            {widget.render({...})}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Horizontal scroll для stats cards

```tsx
// Додати до globals.css
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .snap-x {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .snap-start {
    scroll-snap-align: start;
  }
}
```

### 4. ProjectCard - touch оптимізація

**Оновити:** `ProjectCard.tsx`

```tsx
export function ProjectCard({
  id, name, team, status, risk_level, score,
  isOwner, isTeamProject, onClick, onDelete
}: ProjectCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="relative glass-light rounded-xl transition-all duration-200"
      onClick={onClick}
    >
      {/* Swipe indicator (mobile only) */}
      <div className="md:hidden absolute right-0 top-0 bottom-0 w-20 bg-danger/20 rounded-r-xl flex items-center justify-center pointer-events-none opacity-0 group-swipe:opacity-100 transition-opacity">
        <Trash2 className="w-6 h-6 text-danger" />
      </div>

      {/* Card content */}
      <div className="relative z-10 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar - збільшений для mobile */}
            <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-primary/80 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {name.substring(0, 2).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm sm:text-sm text-text-primary truncate">
                {name}
              </h4>

              <div className="flex items-center gap-2 mt-1">
                {isOwner && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    Owner
                  </span>
                )}
                {team && (
                  <p className="text-xs text-text-tertiary">
                    {team.length} Members
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delete button - збільшений tap target */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
              }}
              className="p-3 -mr-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Delete project"
            >
              <Trash2 className="w-5 h-5 text-danger" />
            </button>
          )}
        </div>

        {/* Team avatars - adaptive size */}
        {team && team.length > 0 && (
          <div className="flex items-center -space-x-2 mb-3">
            {team.slice(0, 4).map((member, idx) => (
              <div
                key={idx}
                className="w-8 h-8 sm:w-7 sm:h-7 rounded-full border-2 border-surface bg-primary flex items-center justify-center text-white text-xs font-semibold"
              >
                {member}
              </div>
            ))}
            {team.length > 4 && (
              <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full border-2 border-surface glass-light flex items-center justify-center text-xs font-semibold text-text-primary">
                +{team.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Progress bar - вища для кращої видимості */}
        {score !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-text-secondary">Scope Clarity</span>
              <span className="font-semibold text-text-primary">{score}%</span>
            </div>
            <div className="h-2.5 sm:h-2 glass-subtle rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  score >= 80 ? 'bg-success' : score >= 60 ? 'bg-primary' : 'bg-warning'
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        )}

        {/* Risk badge - більший на mobile */}
        {risk_level && (
          <div className="flex items-center justify-between">
            <span className={cn(
              'text-xs sm:text-xs px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full font-medium',
              getRiskColor(risk_level)
            )}>
              {risk_level}
            </span>
            {status && (
              <span className="text-xs text-text-tertiary">
                {status}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5. Модалки та Dropdown - mobile адаптація

#### Modal компонент

**Створити:** `components/ui/ResponsiveModal.tsx`

```tsx
'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function ResponsiveModal({
  isOpen, onClose, title, children, size = 'md'
}: Props) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    full: 'sm:max-w-full sm:m-4'
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] overflow-y-auto">
        <div className="flex min-h-full items-end sm:items-center justify-center">
          <div
            className={cn(
              // Mobile - bottom sheet style
              "w-full bg-surface rounded-t-3xl sm:rounded-2xl",
              // Desktop - centered modal
              "sm:w-auto",
              sizeClasses[size],
              // Animation
              "animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle (mobile only) */}
            <div className="sm:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

#### Dropdown адаптація

**Оновити:** `Header.tsx` dropdowns

```tsx
// Teams dropdown - адаптивний
{showTeamsDropdown && mounted && createPortal(
  <>
    <div className="fixed inset-0 z-[9998]" onClick={() => setShowTeamsDropdown(false)} />

    <div
      ref={teamsDropdownRef}
      className={cn(
        // Mobile - bottom sheet
        "fixed inset-x-0 bottom-0 rounded-t-3xl max-h-[80vh]",
        // Desktop - dropdown
        "md:absolute md:inset-x-auto md:bottom-auto md:rounded-xl md:max-h-[600px]",
        "w-full md:w-64",
        "glass-heavy border border-white/10 overflow-y-auto z-[10000]"
      )}
      style={{
        // Desktop positioning
        ...(window.innerWidth >= 768 && {
          top: `${teamsDropdownPosition.top}px`,
          left: `${teamsDropdownPosition.left}px`
        })
      }}
    >
      {/* Handle for mobile */}
      <div className="md:hidden flex justify-center pt-3 pb-2">
        <div className="w-12 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* ... existing dropdown content ... */}
      </div>
    </div>
  </>,
  document.body
)}
```

### 6. Performance оптимізації

#### Відключення glassmorphism на mobile

**Оновити:** `globals.css`

```css
/* Mobile performance optimization */
@media (max-width: 768px) {
  /* Disable expensive backdrop filters */
  .glass-heavy,
  .glass-medium,
  .glass-strong,
  .glass-light,
  .glass-subtle {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* Stronger solid backgrounds instead */
  .glass-heavy {
    background: rgba(255, 255, 255, 0.15) !important;
  }

  .glass-medium {
    background: rgba(255, 255, 255, 0.12) !important;
  }

  .glass-light {
    background: rgba(255, 255, 255, 0.08) !important;
  }

  .glass-subtle {
    background: rgba(255, 255, 255, 0.05) !important;
  }

  /* Simplify animations */
  * {
    animation-duration: 0.15s !important;
  }

  /* Remove expensive box-shadows */
  .glass-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }
}

/* Keep reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .glass-heavy, .glass-medium, .glass-light {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: rgba(255, 255, 255, 0.15) !important;
  }

  button, a, [role="button"], * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Lazy loading для важких компонентів

**Оновлення вже є в dashboard/page.tsx - добре!**

```tsx
// Це вже реалізовано ✅
const CalendarView = dynamic(() => import('@/components/CalendarView'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

**Додатково оптимізувати:**

```tsx
// Conditional loading based on viewport
const CalendarView = dynamic(
  () => import('@/components/CalendarView'),
  {
    ssr: false,
    loading: () => <CalendarSkeleton />,
    // Only load on desktop
    ...(typeof window !== 'undefined' && window.innerWidth < 768 && {
      suspense: false
    })
  }
);
```

### 7. Touch gestures

#### Swipe-to-delete для ProjectCard

**Створити hook:** `hooks/useSwipeActions.ts`

```tsx
import { useState, useRef, TouchEvent } from 'react';

interface UseSwipeActionsOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipeActions({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100
}: UseSwipeActionsOptions) {
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startX === null) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (startX === null || currentX === null) {
      setStartX(null);
      setCurrentX(null);
      return;
    }

    const diff = currentX - startX;

    if (Math.abs(diff) > threshold) {
      if (diff < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diff > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    setStartX(null);
    setCurrentX(null);
  };

  const swipeOffset = startX !== null && currentX !== null
    ? currentX - startX
    : 0;

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    swipeOffset,
    isSwipping: startX !== null,
    elementRef,
  };
}
```

**Використання в ProjectCard:**

```tsx
export function ProjectCard({ onDelete, ...props }: ProjectCardProps) {
  const { handlers, swipeOffset, isSwipping } = useSwipeActions({
    onSwipeLeft: () => {
      if (onDelete) {
        // Show confirmation
        if (confirm('Delete this project?')) {
          onDelete(new MouseEvent('click') as any);
        }
      }
    },
    threshold: 80
  });

  return (
    <div
      {...handlers}
      className="relative overflow-hidden"
      style={{
        transform: `translateX(${Math.min(0, swipeOffset)}px)`,
        transition: isSwipping ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Reveal delete action on swipe */}
      <div
        className="absolute right-0 top-0 bottom-0 w-20 bg-danger flex items-center justify-center"
        style={{
          transform: `translateX(${Math.max(0, -swipeOffset)}px)`
        }}
      >
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Card content */}
      <div className="glass-light rounded-xl p-4">
        {/* ... existing content ... */}
      </div>
    </div>
  );
}
```

### 8. Forms - мобільна оптимізація

#### Create Team Modal - адаптивний

**Оновити:** `Header.tsx` Create Team Modal

```tsx
{showCreateTeamModal && mounted && createPortal(
  <ResponsiveModal
    isOpen={showCreateTeamModal}
    onClose={() => setShowCreateTeamModal(false)}
    title="Create New Team"
    size="md"
  >
    <form onSubmit={handleCreateTeam} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Team Name *
        </label>
        <input
          type="text"
          required
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary text-base"
          placeholder="Enter team name"
          autoFocus
          // Mobile optimizations
          autoComplete="off"
          autoCapitalize="words"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Description (Optional)
        </label>
        <textarea
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary resize-none text-base"
          placeholder="Enter team description"
          // Mobile optimizations
          autoComplete="off"
          autoCapitalize="sentences"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setShowCreateTeamModal(false);
            setTeamName('');
            setTeamDescription('');
          }}
          className="flex-1 px-4 py-3 sm:py-2 rounded-xl text-text-primary border border-white/10 hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={creatingTeam || !teamName.trim()}
          className="flex-1 px-4 py-3 sm:py-2 bg-primary hover:bg-primary-dark text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {creatingTeam ? 'Creating...' : 'Create Team'}
        </button>
      </div>
    </form>
  </ResponsiveModal>,
  document.body
)}
```

**Ключові зміни:**
- `text-base` замість `text-sm` для inputs (16px - no zoom on iOS)
- `py-3` на mobile buttons (48px мінімум)
- `flex-col-reverse` для buttons (primary внизу на mobile)
- `autoComplete`, `autoCapitalize` для кращого UX

### 9. Calendar View - mobile scroll

**Оновити:** `CalendarView.tsx` (якщо потрібно)

```tsx
export function CalendarView() {
  return (
    <div className="glass-medium rounded-2xl p-4 sm:p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">
        Calendar
      </h3>

      {/* Mobile - horizontal scroll */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full px-4 sm:px-0">
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[700px] sm:min-w-0">
            {/* ... calendar cells ... */}
          </div>
        </div>
      </div>

      {/* Scroll hint (mobile only) */}
      <div className="sm:hidden flex items-center justify-center gap-2 mt-3 text-xs text-text-tertiary">
        <ArrowLeftRight className="w-3 h-3" />
        <span>Scroll horizontally to view more</span>
      </div>
    </div>
  );
}
```

### 10. Safe Area Insets (iPhone notch/island)

**Додати до:** `globals.css`

```css
/* Safe area insets for iPhone X+ */
:root {
  --sat: env(safe-area-inset-top);
  --sar: env(safe-area-inset-right);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
}

/* Bottom navigation with safe area */
.safe-area-inset-bottom {
  padding-bottom: calc(1rem + var(--sab));
}

/* Top header with safe area */
.safe-area-inset-top {
  padding-top: calc(0.5rem + var(--sat));
}

/* Full screen modals */
.safe-area-inset-all {
  padding-top: var(--sat);
  padding-right: var(--sar);
  padding-bottom: var(--sab);
  padding-left: var(--sal);
}
```

**Оновити:** `MobileBottomNav.tsx`

```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-surface/95 backdrop-blur-md">
  <div
    className="grid grid-cols-5"
    style={{
      height: 'calc(4rem + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}
  >
    {/* Navigation items */}
  </div>
</nav>
```

---

## 📋 План імплементації

### Фаза 1: Foundation (Week 1)

#### День 1-2: Navigation
- [ ] Створити `MobileBottomNav.tsx`
- [ ] Створити `MobileNavSheet.tsx`
- [ ] Оновити layout для умовного відображення Sidebar
- [ ] Додати safe area insets
- [ ] Тестування на iPhone і Android

#### День 3-4: Header
- [ ] Розділити Header на mobile/desktop версії
- [ ] Створити `MobileSearchSheet.tsx`
- [ ] Адаптувати Teams dropdown як bottom sheet
- [ ] Адаптувати User dropdown як bottom sheet
- [ ] Тестування tap targets (мінімум 44x44px)

#### День 5: Performance
- [ ] Додати media queries для відключення backdrop-filter
- [ ] Тестування на слабких Android пристроях
- [ ] Оптимізувати animations для mobile
- [ ] Видалити непотрібні transitions

### Фаза 2: Components (Week 2)

#### День 1-2: Dashboard
- [ ] Адаптувати Dashboard grid layout
- [ ] Horizontal scroll для stats cards
- [ ] Stack layout для widgets на mobile
- [ ] Приховати кастомізацію на mobile або спростити
- [ ] Тестування drag-and-drop на touch

#### День 3: Cards
- [ ] Оновити `ProjectCard.tsx` з більшими tap targets
- [ ] Додати swipe-to-delete gesture
- [ ] Збільшити avatars на mobile
- [ ] Адаптувати `StatsCard.tsx`
- [ ] Тестування на різних розмірах екранів

#### День 4: Forms & Modals
- [ ] Створити `ResponsiveModal.tsx`
- [ ] Оновити Create Team Modal
- [ ] Адаптувати всі інші форми
- [ ] Додати `autoComplete` і `autoCapitalize`
- [ ] Тестування на iOS (16px inputs для no-zoom)

#### День 5: Touch Gestures
- [ ] Створити `useSwipeActions.ts` hook
- [ ] Імплементувати swipe в ProjectCard
- [ ] Додати haptic feedback (if available)
- [ ] Pull-to-refresh для Dashboard
- [ ] Тестування жестів

### Фаза 3: Polish (Week 3)

#### День 1-2: Responsive Typography
- [ ] Оновити font sizes для mobile
- [ ] Перевірити line-heights
- [ ] Адаптувати headings
- [ ] Тестування читабельності

#### День 3: Images & Media
- [ ] Адаптувати avatars
- [ ] Оптимізувати images (srcset)
- [ ] Lazy loading images
- [ ] Тестування завантаження

#### День 4-5: Edge Cases
- [ ] Landscape orientation handling
- [ ] Tablet sizes (768-1024px)
- [ ] Foldable devices
- [ ] Small phones (320px width)
- [ ] Large phones (428px+ width)

### Фаза 4: Testing & QA (Week 4)

#### День 1-2: Device Testing
- [ ] iPhone SE (375x667)
- [ ] iPhone 12/13 (390x844)
- [ ] iPhone 14 Pro Max (430x932)
- [ ] Samsung Galaxy S21 (360x800)
- [ ] Samsung Galaxy S23 Ultra (360x900)
- [ ] iPad Mini (768x1024)
- [ ] iPad Pro (1024x1366)

#### День 3: Performance Testing
- [ ] Lighthouse Mobile Score (target: 90+)
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1

#### День 4: Accessibility Testing
- [ ] Touch target sizes (44x44px minimum)
- [ ] Color contrast ratios (WCAG AA)
- [ ] Screen reader testing (VoiceOver, TalkBack)
- [ ] Keyboard navigation на tablet
- [ ] Font scaling (up to 200%)

#### День 5: Cross-browser Testing
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Samsung Internet
- [ ] Firefox Mobile
- [ ] Edge Mobile

---

## 🎨 Design Tokens для Mobile

**Створити:** `styles/mobile-tokens.css`

```css
@layer base {
  :root {
    /* Mobile-specific spacing */
    --mobile-gutter: 1rem; /* 16px side padding */
    --mobile-gap: 0.75rem; /* 12px between elements */
    --mobile-section-gap: 1.5rem; /* 24px between sections */

    /* Touch targets */
    --touch-target-min: 44px;
    --touch-target-comfortable: 48px;

    /* Bottom navigation */
    --bottom-nav-height: 4rem; /* 64px */
    --bottom-nav-safe: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));

    /* Mobile header */
    --mobile-header-height: 3.5rem; /* 56px */

    /* Card sizes */
    --mobile-card-min-height: 5rem; /* 80px */
    --mobile-avatar-size: 2.5rem; /* 40px */

    /* Swipe thresholds */
    --swipe-threshold: 80px;
    --swipe-velocity-threshold: 0.3;
  }
}

@layer utilities {
  /* Mobile-only utilities */
  .mobile-only {
    @apply md:hidden;
  }

  .desktop-only {
    @apply hidden md:block;
  }

  .tablet-plus {
    @apply hidden sm:block;
  }

  /* Touch target helpers */
  .touch-target {
    min-width: var(--touch-target-min);
    min-height: var(--touch-target-min);
    @apply flex items-center justify-center;
  }

  .touch-target-comfortable {
    min-width: var(--touch-target-comfortable);
    min-height: var(--touch-target-comfortable);
    @apply flex items-center justify-center;
  }

  /* Mobile spacing */
  .mobile-gutter {
    @apply px-4 md:px-6 lg:px-8;
  }

  .mobile-section {
    @apply space-y-4 md:space-y-6;
  }

  /* Bottom navigation offset */
  .pb-bottom-nav {
    padding-bottom: var(--bottom-nav-safe);
  }

  /* Horizontal scroll */
  .mobile-scroll-horizontal {
    @apply flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-3 pb-2;
  }

  .mobile-scroll-item {
    @apply snap-start flex-shrink-0 min-w-[280px] max-w-[90vw];
  }
}
```

---

## ✅ Checklist для кожного компонента

При адаптації кожного компонента перевіряйте:

### Responsive Design
- [ ] Тестується на 375px (iPhone SE)
- [ ] Тестується на 390px (iPhone 12/13)
- [ ] Тестується на 430px (iPhone 14 Pro Max)
- [ ] Тестується на 360px (Android standard)
- [ ] Працює в landscape orientation
- [ ] Адаптивні breakpoints (xs, sm, md, lg, xl)

### Touch Optimization
- [ ] Всі інтерактивні елементи ≥ 44x44px
- [ ] Достатній spacing між tap targets (≥ 8px)
- [ ] Працюють touch gestures (tap, long press, swipe)
- [ ] Немає конфліктів між drag і scroll
- [ ] Visual feedback на touch (active states)

### Performance
- [ ] Немає backdrop-filter на mobile
- [ ] Animations ≤ 150ms
- [ ] Images lazy loaded
- [ ] Компоненти code-split
- [ ] Lighthouse Mobile Score ≥ 90

### Typography
- [ ] Input fields ≥ 16px (no zoom on iOS)
- [ ] Body text ≥ 14px
- [ ] Line height ≥ 1.5 для readability
- [ ] Text не truncates неправильно
- [ ] Працює з динамічним font scaling

### Layout
- [ ] Немає horizontal scroll (крім intended)
- [ ] Content fit в safe area
- [ ] Modals/sheets працюють як bottom sheets
- [ ] Dropdowns адаптовані для mobile
- [ ] Cards stack vertically

### Accessibility
- [ ] Touch targets ≥ 44x44px
- [ ] Color contrast ≥ 4.5:1 (WCAG AA)
- [ ] Працює з screen readers
- [ ] Aria labels присутні
- [ ] Focus indicators видимі

### Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Portrait і landscape
- [ ] Slow 3G connection
- [ ] With/without safe area insets

---

## 🚀 Приклад Pull Request Template

```markdown
## Mobile Adaptation - [Component Name]

### Changes
- [ ] Responsive layout (mobile-first)
- [ ] Touch-optimized interactions
- [ ] Performance improvements
- [ ] Accessibility improvements

### Screenshots
#### Before (Desktop only)
[Screenshot]

#### After (Mobile responsive)
[Screenshot - iPhone SE]
[Screenshot - iPhone 14 Pro Max]
[Screenshot - Android]

### Testing Checklist
- [ ] Tested on iPhone SE (375px)
- [ ] Tested on iPhone 14 Pro Max (430px)
- [ ] Tested on Android (360px)
- [ ] Tested landscape orientation
- [ ] Touch targets ≥ 44px
- [ ] Lighthouse Mobile Score ≥ 90
- [ ] No backdrop-filter on mobile
- [ ] Screen reader tested

### Performance Metrics
- **Before:** LCP: [X]s, FID: [X]ms, CLS: [X]
- **After:** LCP: [X]s, FID: [X]ms, CLS: [X]

### Related Issues
Closes #[issue-number]
```

---

## 📚 Resources

### Documentation
- [Apple Human Interface Guidelines - iOS](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design - Touch Targets](https://m3.material.io/foundations/interaction/states/state-layers)
- [Web.dev - Mobile UX](https://web.dev/mobile-ux/)
- [MDN - Mobile Web Best Practices](https://developer.mozilla.org/en-US/docs/Web/Guide/Mobile)

### Tools
- [Responsive Viewer](https://responsiveviewer.org/) - Chrome extension
- [BrowserStack](https://www.browserstack.com/) - Real device testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility

### Testing Devices Priority
1. **iPhone SE** (375x667) - Small screen baseline
2. **iPhone 14 Pro** (393x852) - Modern iPhone standard
3. **Samsung Galaxy S21** (360x800) - Android standard
4. **iPad Mini** (768x1024) - Tablet baseline

---

## 🎯 Success Metrics

### Performance Targets
- **Lighthouse Mobile Score:** ≥ 90
- **First Contentful Paint:** < 1.8s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.8s
- **Total Blocking Time:** < 200ms
- **Cumulative Layout Shift:** < 0.1

### Usability Targets
- **Touch Target Compliance:** 100% ≥ 44x44px
- **Color Contrast:** 100% WCAG AA compliant
- **Text Readability:** 100% ≥ 14px font size
- **Input Fields:** 100% ≥ 16px (no zoom)

### User Experience
- **Navigation:** ≤ 2 taps to any page
- **Load Time:** ≤ 3s on 3G
- **Scroll Performance:** 60 FPS
- **Battery Impact:** Minimal (no heavy blur)

---

## 📝 Notes

### Known Issues
1. **Backdrop-filter performance:** Disabled on mobile for better performance
2. **DnD on touch:** Requires special handling for conflict with scroll
3. **Safe area insets:** Requires testing on physical devices

### Future Improvements
1. **PWA support:** Add manifest.json, service worker
2. **Offline mode:** Cache critical resources
3. **Push notifications:** Real-time updates
4. **Haptic feedback:** Enhance touch interactions
5. **Gesture navigation:** Swipe between sections

---

**Версія документу:** 1.0
**Дата:** 2025-01-04
**Автор:** Claude Code Analysis
**Статус:** Draft → Review → Implementation
