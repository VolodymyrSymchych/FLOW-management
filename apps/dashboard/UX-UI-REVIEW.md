# UX/UI рев'ю додатку

Огляд структури автентифікованої частини продукту та сторінок авторизації з рекомендаціями щодо покращення взаємодії та візуальної узгодженості. Лендінг не розглядається. Особливий акцент — на розвитку патерну виїжджаючої панелі справа (right-side drawer) для всіх операцій редагування.

---

## 1. Загальний підсумок

**Оглянуто:** 26 маршрутів у `app/[locale]/(app)/dashboard/` + 6 маршрутів автентифікації.
**Компонентів у дизайн-системі:** ~29 у `components/ui/`.
**Загальна оцінка:** 62/100.

Продукт має солідний фундамент — готовий `Drawer` на Radix, велику бібліотеку примітивів (`button`, `card`, `status-badge`, `page-header`, `section-header`, `table-shell`, `empty-state`, `filter-chip`, `segmented-control`, `skeleton`), Tailwind-токени через CSS-змінні, i18n-каркас. Водночас накопичилося критичних непослідовностей: два паралельні набори токенів, хаотичне використання модальних вікон замість існуючого Drawer, велика кількість hardcoded mock-даних у сторінках, дубльовані маршрути (`/verify` vs `/verify-email`; `/chat` vs `/messages`; вкладка Billing у Settings vs `/billing`), `alert()` як канал помилок.

Найшвидше відчутний ROI дасть: (1) переведення всіх сценаріїв редагування на правий Drawer; (2) ліквідація дублікатів; (3) заміна `alert()` на `react-hot-toast` + inline-валідацію; (4) уніфікація токенів.

---

## 2. Наскрізні проблеми та базові рішення

### 2.1 Два паралельні набори токенів

Старі сторінки (Tasks, Projects, Invoices, Analytics) використовують inline CSS-змінні `var(--ink)`, `var(--muted)`, `var(--line)`, `var(--acc-bg)`, `var(--sage)` через `style={{ color: 'var(--ink)' }}`. Новіші (auth, частково settings) — семантичні Tailwind-класи `text-text-primary`, `bg-surface-elevated`, `border-border`.

**Рекомендація.**

Звести до одного набору семантичних токенів. Мапінг:

| Старий токен | Новий токен Tailwind |
|---|---|
| `var(--ink)` | `text-text-primary` |
| `var(--muted)` | `text-text-secondary` |
| `var(--faint)` / `var(--ghost)` | `text-text-tertiary` |
| `var(--bg)` | `bg-background` |
| `var(--bg2)` / `var(--bg3)` | `bg-surface` / `bg-surface-muted` |
| `var(--line)` / `var(--line2)` | `border-border` |
| `var(--accent)` / `var(--acc-bg)` | `text-accent` / `bg-accent-soft` |
| `var(--red)` / `var(--red-bg)` | `text-danger` / `bg-danger-soft` |
| `var(--sage)` / `var(--sage-bg)` | `text-success` / `bg-success-soft` |
| `var(--amber)` / `var(--amber-bg)` | `text-warning` / `bg-warning-soft` |

Після міграції видалити з `globals.css` блок із `--ink/--muted/...` (крім зворотної сумісності на час міграції). Додати до `tailwind.config.js` типографічну шкалу (`text-xs/sm/base/lg/xl/2xl/3xl` — вже є, але зафіксувати розміри через плагін чи CSS-змінні), шкалу spacing (4pt grid), стан `focus-visible` один на всі interactive.

### 2.2 Повернення до права: «Edit Drawer» як основний патерн

Наразі Drawer використовується лише у **одному** місці — `EmployeeAttendanceDrawer` на `/dashboard/team`. Скрізь інде редагування відкривається центрованим `Dialog` або веде на окрему сторінку. Це ламає відчуття потоку: користувач втрачає контекст списку/таблиці.

**Рекомендація — універсальний патерн `EntityEditDrawer`.**

```tsx
// components/ui/edit-drawer.tsx (нове)
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent className="w-full max-w-[560px] flex flex-col">
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <Badge variant="status" /> {/* тип/статус */}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-1">
        <IconButton aria-label="Actions"><MoreHorizontal /></IconButton>
        <DrawerClose asChild><IconButton aria-label="Close"><X /></IconButton></DrawerClose>
      </div>
    </header>

    <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
      <TabsList className="px-6 border-b border-border">...</TabsList>
      <TabsContent className="flex-1 overflow-y-auto px-6 py-5">...</TabsContent>
    </Tabs>

    <footer className="border-t border-border px-6 py-3 flex items-center justify-between">
      <span className="text-xs text-text-tertiary">Autosaved 2s ago</span>
      <div className="flex gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save</Button>
      </div>
    </footer>
  </DrawerContent>
</Drawer>
```

Ключові правила:

Ширина — три рівні замість поточного одного `max-w-xl`: `sm` (420 px — для коротких операцій, додати позначку); `md` (560 px — дефолт для редагування сутності); `lg` (720 px — для редагування зі вкладками й side-preview).

Клавіатура — `Esc` закриває, `Cmd/Ctrl+Enter` зберігає, `Cmd/Ctrl+K` переходить у командний режим. Перший інтерактив отримує фокус.

Поведінка — якщо користувач рухає фокус у панель, overlay залишається м'яким (22% — вже правильно), але натискання на overlay за замовчуванням викликає «soft-close» (показує toast «Discard changes?» якщо є незбережені зміни). Це знімає страх випадкового втрачання даних.

Анімація — slide-in 220 ms `cubic-bezier(0.32, 0.72, 0, 1)`, slide-out 180 ms. М'якше за дефолт Radix.

Адаптив — на `< 768 px` ця ж панель рендериться як `BottomSheet` (вже є як компонент) — одна логіка, два шейли.

Stacked drawers — якщо з правого Drawer потрібно відкрити вибір іншої сутності (наприклад, assignee picker), відкривати другий, вужчий Drawer зверху з offset +56 px замість вкладеного модального вікна. Це унікальний, зараз модний патерн (Linear, Height, Notion).

Deep-link — усі Edit Drawer повинні бути доступні через URL (`?edit=tsk_12ab`), тоді редагування можна шарити й відновлювати після перезавантаження.

### 2.3 Негайні великі фікси (поза сторінками)

Замінити всі `alert()` на `react-hot-toast` з двома варіантами: `toast.error(...)` для помилок мережі, inline form-error для валідації полів.

Уніфікувати feedback-канал: успіх — toast top-right, помилка — toast + inline, підтвердження знищення — `AlertDialog` (не `confirm()`).

Видалити `/verify-email` (залишити `/verify`) і `/dashboard/messages` (залишити `/dashboard/chat`) або навпаки — після UX-тесту зі стейкхолдером.

Винести `/dashboard/performance` за auth-роутинг у dev-only bundle або заховати за feature-flag `INTERNAL_TOOLS`.

Увімкнути `next-intl` на решту сторінок — hardcoded English у ~20 маршрутах робить UA-локаль непрацездатною.

---

## 3. Сторінки автентифікації

### `/sign-in`

**Сьогодні.** Центральна glass-картка, email + password із Eye-toggle, Remember me, Forgot password, submit, divider, Google + Microsoft OAuth, link на sign-up. OAuth-помилка показується через URL-параметр і негайно очищується.

**Проблеми.** Flash of error: користувач може пропустити повідомлення про провал OAuth бо URL очищується. Немає passkey/WebAuthn. Немає visual loading state після submit (тільки redirect).

**Рекомендовані покращення.**

Помилку автентифікації показувати у компактній `Banner` над формою з кнопкою «Try again» — триматися, поки користувач не почне друкувати.

Passwordless-first: кнопка «Continue with email» над OAuth-блоком відправляє magic-link; класичний password — за прихованим `disclosure` «Use password instead». Це сучасний патерн (Vercel, Notion) і знімає нав'язливість.

Додати `aria-live="polite"` на блок помилки; `<form>` з `autocomplete="email"`/`current-password`; на submit показати inline-spinner всередині кнопки (`<Button loading>`).

Підготувати UI для WebAuthn: компонент `<PasskeyButton />` з fallback на пароль — API можна пізніше. Так ми зарезервуємо візуальне місце.

Уніфікувати OAuth-кнопки з `components/ui/button.tsx` (variant `outline`, лого зліва, назва центровано) замість inline SVG у JSX.

### `/sign-up`

**Проблеми.** Банер з українським текстом на англійській сторінці; брак password strength; немає soft-validation до натискання Submit.

**Покращення.**

Progressive-disclosure: спочатку Email (step 1) → Password + Full Name (step 2) → Optional Username (step 3). Менше тертя на першому кроці.

Inline password strength (zxcvbn) з трьома поділками та підказками «Add a symbol», «Avoid common words». Це одночасно і візуальне, і UX-покращення.

Прийняти OAuth-prefill: якщо прийшли з Google, показати зверху чип `Continuing as user@example.com · Change`. Видалити всі україномовні рядки з цієї сторінки — перевести через `next-intl`.

«Confirm password» прибрати — паролі з паролевих менеджерів однакові за замовчуванням; лишити лише «Show password». Це також зменшує висоту форми на 80 px.

### `/forgot-password`

Практично без проблем. Єдине: після надсилання листа додати «Resend in 30s» таймер (кнопка disabled до кінця countdown) — це позбавляє спаму та водночас дає користувачу чіткий контроль.

### `/reset-password`

**Проблеми.** Один Eye-toggle на два поля (розкриває обидва одночасно); немає password strength.

**Покращення.** Окремі toggle на кожне поле; той самий індикатор міцності; явне повідомлення про вимоги (мінімум 8 символів, 1 цифра, 1 спецсимвол) видиме завжди, не лише після помилки.

### `/verify` і `/verify-email`

Дубль. **Рекомендація:** залишити `/verify`, `/verify-email` замінити на redirect через `middleware.ts`. Єдиний стан-машина: `verifying | success | expired | invalid`. Для `expired` — primary-кнопка «Resend verification email» одразу.

---

## 4. Dashboard — сторінки продукту

### `/dashboard` (головна)

**Сьогодні.** Уся логіка в `<DashboardMockup />` (чорна скринька для ревью).

**Рекомендоване бачення.**

Шапка «Good morning, {name}» + підрядок із сьогоднішнім focus («You have 3 tasks due today, 2 sprints ending this week»). Ліворуч — віджет-грід 12-column `grid-cols-12` з перетягуваними картами (dnd-kit) — «Today's tasks», «This week attendance», «Upcoming deadlines», «Team activity», «Budget burn». Кожна карта — `Card` з `section-header` + short-list + `View all →` навігацією у свій маршрут.

Right-rail (виїжджає при натисканні `⌘+.`) — персональні швидкі дії: «Start timer», «Create task», «Log time off» — як mini-drawer (~360 px). Це розширення патерну drawer: не тільки для редагування, а і для «quick add».

Емпті-стейт (новий юзер) — onboarding-checklist з 5 кроків (Connect calendar, Invite team, Create project, Log first entry, Explore analytics). Використати вже існуючий `empty-state` примітив.

### `/dashboard/tasks`

**Сьогодні.** List / Board toggle, фільтри по даті, проект-таби, групи «Overdue / This week / Upcoming / Done», new-task через кастомний центровий modal, редагування — `EditTaskModal`. Board-колонки без drag-n-drop. Assignee — вільний текст.

**Перебудова.**

Топбар зі `segmented-control` List / Board / Timeline (третій — лінивий Gantt для тих, хто прийшов зі `/projects-timeline`). Поруч — `SearchInput` з `⌘K`-хоткеєм і `FilterChip` під пошуком (Assignee, Priority, Status, Tag, Due, Project). Фільтри стекаються і запам'ятовуються у URL (`?assignee=me&status=open`).

**Edit task — тільки drawer (не modal).** Клік по рядку/картці → slide-in 560 px:

| Зона | Вміст |
|---|---|
| Header | Inline-editable title (як у Linear), quick-actions (Duplicate, Copy link, Archive) у `DropdownMenu`, кнопка Close |
| Tabs | Details · Activity · Comments · Subtasks |
| Details | Status (Kanban-перелік), Assignee (avatar-picker з search), Priority (segmented з кольором), Due date (`DatePicker`), Project (combobox), Tags (multi-select), Story points (numeric stepper), Description (rich-text) |
| Footer | Created/Updated time, Save автоматичний (autosave debounced 700 ms), toast «Saved» в низу праворуч |

Subtasks — inline checkable list з `↵` на створення нового. Коментарі — @mention picker, підписка на сутність.

**Board** — увімкнути drag-n-drop (`@dnd-kit/core`), ghost-стан у колонці-цілі, автоскрол при drag до краю. Додати кастомізацію колонок (Add column, Rename, WIP-limit) за патерном Linear.

Assignee перевести з text-input на `Combobox` з avatar'ами і результатами з `/api/users` (або members поточного workspace).

Пагінація / віртуалізація — якщо >100 тасок, `react-window` для листа. Це вирішує потенційну продуктивність.

### `/dashboard/tasks/[id]` (зараз redirect)

**Рекомендація.** Не redirect, а відкривати список + Edit Drawer цього таску одразу (`?edit=tsk_id`). Deep-link з повідомлень/коментарів працює, контекст списку не втрачається. Повну сторінку можна зберегти як fallback для `/dashboard/tasks/[id]/full`, якщо потрібен print-mode або embed.

### `/dashboard/projects`

**Сьогодні.** 4-column stat strip, фільтр-пілс по «командах» (що насправді фільтрує по `industry`/`type` — маркетинговий баг), grid карт проекту, «New project» placeholder card, `DeleteConfirmModal`.

**Перебудова.**

View toggle `Grid / List / Portfolio` (третій — Kanban по статусам: Discovery / Active / At Risk / Done).

Замінити фільтр «All teams» на дві окремі колонки: Team (combobox з реальними teams) та Status (pills). Підказка-плейсхолдер: «Filter by team or status».

Card-hover → `ActionOverlay` на карті з Quick actions (Open · Edit · Pin · Archive). Menu (3-dot) у верхньому правому куті карти — зараз там тільки delete (owners), треба уніфікувати через `DropdownMenu`.

Клік на карту → Edit Drawer `lg` (720 px) зі вкладками: Overview · Team · Finance · Files · Report. Це дозволить переглянути проект без втрати скрол-позиції у списку. Кнопка «Open full page» у шапці drawer для переходу на повну сторінку (`/dashboard/projects/[id]`) — на випадок, коли потрібен простір (звіти, великі документи).

Stat strip перевести на `TrendCard` (число + delta vs previous period + sparkline 14 днів) — дає миттєвий контекст замість голого числа.

Member avatars зараз косметичні (зі `initials(name)`) — замінити на реальних, із `avatar-group` з `+N more` overflow.

### `/dashboard/projects/new`

**Сьогодні.** Повна сторінка, три секції (Information / Team / Document), template-selector inline, помилки через `alert()`.

**Покращення.**

Зберегти full-page (для створення проекту це коректний вибір — операція важлива, потребує фокусу), але додати **ліву sticky-панель «Outline»** з прогресом заповнення (3 секції, чекмарки при валідних).

Замінити Budget/Team size на типізовані інпути: `CurrencyInput` (формат 1,200,000) та `NumericStepper` з підказкою «members».

Template selector — замість inline-заміни частини сторінки зробити `Dialog` (важлива зміна контексту) або окремий step. Після вибору — показати diff-preview «What will be filled» перед застосуванням.

Errors — inline (`FormField` з error-state), submit-кнопка disabled до валідності, submit-loading spinner всередині кнопки. `alert()` заборонити як стиль.

Document-ingest — прогрес-бар парсингу з конкретними кроками («Reading file → Extracting sections → Suggesting structure»), щоб користувач не думав, що UI завис.

### `/dashboard/projects/[id]` (детальна)

**Сьогодні.** Sticky header, 6 табів (Overview / Team / Finance / Files / Comments / Report), Edit через центр-modal `EditProjectModal`, Report рендериться у `<pre>` замість markdown.

**Покращення.**

Перевести Edit на правий drawer (`lg`, 720 px) з tab-list таким самим, як і у картці проекту — узгодити патерн з `/projects` (див. вище).

Report — використати `react-markdown` з GFM + подсвітка коду (`rehype-highlight`). Зробити content-width читабельним (макс. 680 px), додати «Copy», «Download PDF» (через уже існуючий endpoint /download-report).

State `?tab=` перевести на Next.js `useRouter().replace(...)` з `shallow: true` замість `window.history.replaceState` — збережемо router-layer transitions.

Lazy-import табів лишити, але показати `Skeleton` замість «pop-in» — користувач не повинен бачити пустий каркас.

Додати `Project Health` віджет у шапці (5-зіркова шкала / color ring): Scope risk + Budget burn + Team load + Timeline slippage. Це топовий патерн у 2025 (Linear Cycles, Asana Portfolios).

### `/dashboard/invoices`

**Сьогодні.** Пошук, status tabs, розкривна advanced-filter bar, 4 stat cards, data-table, `DeleteConfirmModal`. У колонці Actions по 4 кнопки (Send / Email / PDF / Delete), де перші дві — ідентичні.

**Покращення.**

Прибрати дубль: лише одна кнопка «Send» (переіменувати `Mail`-icon-button на цю ж дію або видалити). Решту дій звести до `DropdownMenu` «...» — з пунктами Send, Email copy, Download PDF, Duplicate, Mark as paid, Delete. Це прибирає cluttering і дає місце для майбутніх дій.

Перевести редагування на Drawer — `md`, 560 px. У drawer: tabs Details · Items · History. Для швидкого перегляду PDF — кнопка «Open PDF preview →» відкриває додатковий drawer справа поверх (stacked pattern, 720 px з iframe PDF).

Bulk actions — якщо вибрано >1 рядок, угорі таблиці з'являється `Toolbar` «3 selected · Send · Mark paid · Delete · Dismiss». Стандартний патерн (Linear, Stripe).

Stat cards — замінити на `TrendCard` (з delta). Додати «Aging» — скільки прострочено >30d / >60d / >90d (heatmap або stacked bar).

Empty state — додати secondary CTA «Import from CSV» + link «Connect Stripe» (якщо конектор доступний).

### `/dashboard/invoices/[id]`

**Сьогодні.** 2-column: ліворуч read-only поля (виглядають як disabled inputs), праворуч print-preview. Edit веде на окрему сторінку. Status-бейдж — кнопка з `Ban` icon (семантично невірно).

**Покращення.**

Ліву колонку зробити реально readonly — стилізувати як `DefinitionList` (`<dl>` з термами й описами), не як поля вводу. Це прибере плутанину «чому я не можу клікнути й редагувати».

«Edit» — перевести на той самий Drawer, що і у списку. Повернення із Drawer оновлює читальний режим без reload.

Status перевести на `StatusBadge` з dropdown-опціями (Mark as paid / Send reminder / Void). Icon `Ban` — прибрати.

Додати activity timeline у print-preview-колонку: «Sent to client ・ Viewed by client ・ Paid» — це критичний UX-сигнал для B2B-юзерів.

### `/dashboard/settings`

**Сьогодні.** Ліве sidebar-nav (220 px), контент праворуч. Profile — поля permanently disabled. Team — hardcoded mock. Billing — дубль з `/dashboard/billing`.

**Покращення.**

Розширити sidebar до двох рівнів (Workspace / Account / Preferences) і додати search (`⌘K` in Settings). Для продуктів із >10 розділів це must-have.

Profile — зробити поля редагованими; при змінах — inline Save/Cancel біля секції (autosave можна — тоді toast «Saved»).

Team members — реальний API + Edit Drawer для зміни ролі й permissions (см. «Team member» розділ нижче). Видалити hardcoded mock.

Billing — видалити дубль (залишити одну локацію; рекомендую у Settings, бо контекст акаунта). Перенаправити `/dashboard/billing` на `/dashboard/settings/billing`.

Integrations — зробити Integration cards клікабельними і відкривати Drawer з деталями: «Permissions · Connected accounts · Sync history · Disconnect». Це той самий патерн редагування сутностей.

Notifications — замість плоского списку toggles — групування (Account · Projects · Mentions · Billing) з master-toggle на групу і опціями каналу (Email · In-app · Slack).

Security — додати activity log (останні 10 логінів з IP/device), керування sessions, passkeys.

### `/dashboard/team`

**Сьогодні.** Team selector, stat strip, grid member cards, `EmployeeAttendanceDrawer` по кліку (єдине місце, де живе drawer-патерн).

**Покращення.**

Розширити Drawer (він уже правий — це good) на повний Edit-сценарій: вкладки Overview · Attendance · Projects · Permissions · Activity. Role-editing теж у цьому Drawer. Це референсний приклад для всіх інших сторінок.

На картці — прибрати dead `MoreVertical` або підключити до `DropdownMenu` (Edit, Remove, Copy email, View profile).

Додати view-toggle Grid / List / Org-chart. Org-chart (навіть простий, 2-3 рівня) — прикраса й водночас інструмент: роль manager → direct reports.

Stat strip — показати distribution: «Today: 5 active · 2 away · 1 on leave» (stacked horizontal bar) замість одного числа.

Search + фільтри: за роллю, командою, статусом (active/invited/paused).

### `/dashboard/profile/[id]`

**Сьогодні.** Back-button, profile card, 4 stat cards (два показують "-"), attendance block, recent activity (mock).

**Покращення.**

Profile-хедер зробити повноцінним (cover-image + avatar + name + role + location) — стандартний «user profile» патерн 2025.

Tabs під хедером: About · Projects · Activity · Files · Connections. Кожен з реальними даними.

Для власника профілю — кнопка «Edit profile» відкриває той самий Edit Drawer, що й у Settings > Profile (один компонент — два входи).

Stat cards з "-" прибрати або замінити на conditional-rendering (не показувати, якщо нема даних).

Activity — замінити mock на реальний stream (можна із `/api/user/activity`, якщо ще нема — приховати вкладку).

### `/dashboard/analytics`

**Сьогодні.** Date range chip, Export (toast без дії), 4 hardcoded stats, 2×2 grid charts, 4 insight-cards (hardcoded).

**Покращення.**

Головне — пустити реальні дані. Без цього всі косметичні зміни марні.

Topbar: date range (7/30/90/Custom), compare-to (previous period · year-over-year), export (CSV · PDF) — оформити як `IconButton` групу справа.

Chart grid — зробити resizable/reorderable (drag grip вгорі картки). Стандартний 2025-патерн для analytics-products (Amplitude, Mixpanel).

Кожен chart повинен мати hover-details, consistent axes, empty-state, `ChartSkeleton` при loading.

«Key Insights» — замінити hardcoded-текст на AI-generated (використати вже існуючі AI-ендпойнти) — «This week, velocity dropped 12% compared to last week due to 3 blocked tasks». Кожен insight — з `Learn more →` у drawer з deep-dive.

Click на будь-який chart bar/line — відкрити правий Drawer з drilldown (relevant tasks, projects, people).

### `/dashboard/calendar`

**Сьогодні.** Monthly grid з week-number column, sidebar з today/upcoming, `AddTaskModal`. Всі події hardcoded на March 2026.

**Покращення.**

Перейти на React-календар або кастомний grid, але першочергово — повязати з реальними даними (events + tasks with due dates + attendance leaves).

View-switcher: Month / Week / Day / Agenda. Це base-level expectation.

Додати «layer» toggle: Tasks · Events · Attendance · Invoices (overlay checkboxes). Кожен layer — свій колір, в легенді внизу.

Click на день → правий Drawer з повним списком дня + «+ New event/task» CTA. Це розвиток drawer-патерну.

Drag-select по кількох днях → create event span. Inline-rename в календарі (ESC скасовує, Enter підтверджує).

Integration з Google Calendar / Outlook (у products.md) — показати `Connect calendar` plug з onboarding-flow, бо справа — B2B.

### `/dashboard/chat` і `/dashboard/messages` (дубль)

**Рекомендація.**

Лишити **один** маршрут. Найкращий UX — `Chat` (sidebar + thread + composer — краще масштабується для realtime). `/messages` має inbox-метафору, яка зараз старомодна для team-продукту; її логіку (список + preview) можна переяка в sidebar chat.

Розширення Chat:

Sidebar — pinned / unread / all, із search та «+New chat» drawer.

Thread — reactions, threads-within-thread (Slack-style), reply-to, edit, delete, mentions (@), links-preview, file upload.

Composer — inline formatting, slash-commands (`/task`, `/meeting`, `/poll`), voice-message (базовий stretch).

Right Drawer — «Details panel» (учасники, pinned messages, files, search within chat). Відкривається по іконці у thread-header. Це ще один приклад drawer-патерну.

### `/dashboard/attendance`

**Сьогодні.** Export (нічого не качає), Clock In/Out card з task-select, 3 stat cards, view-toggle (нічого не фільтрує), table. Month hours обчислюються як `week * 4`.

**Покращення.**

Верхня секція — великий `TimerCard` з digital clock, «Currently working on: {task}», кнопка «Stop» (primary red). Це візуальна фокусна точка.

View-toggle (Day/Week/Month) повинен реально фільтрувати table. Month hours рахувати з реальних entries по діапазону, не множити на 4.

Timeline view — horizontal bar з часом від 00:00 до 24:00 з кольоровими блоками per task. Подібно до /timesheets — але компактніше для одного дня.

Edit-entry — правий Drawer (md, 560 px): task, start, end, duration (auto), notes. Save / Delete. Тут drawer-патерн природний.

Bulk-operations: вибрати декілька entries → «Change task · Merge · Export · Delete».

Export — реально експортувати CSV (`exceljs` чи просто `Blob` + `URL.createObjectURL`).

### `/dashboard/timesheets`

**Сьогодні.** Дуже гарна сітка з per-day timeline, hour-range preset, sidebar з summary/categories. Але — всі дані mock, Add/Bulk disabled, Save у Dialog disabled.

**Покращення.**

Увімкнути write-операції через **Edit Drawer замість Dialog**. Double-click на блок → slide-in справа (md): Category (combobox), Task (sub-combobox), Start / End (timeline-aware picker), Duration (readonly), Description. Save applies instantly. Delete з confirm.

Drag-to-create: драгнути по порожній зоні дня — малюєм блок, автоматично відкривається Drawer з pre-filled start/end.

Drag-to-move/resize — поки не відпущено, показувати live-duration tooltip. Resizing handles на краях.

Snap to 15-min grid; Cmd для free-resize без snap.

Sidebar: перетворити на colapsible з preserved state. На md-breakpoint перетворювати на top-sheet або вкладку toggle.

Toolbar: Add manual entry → Drawer; Bulk (multiselect) → shift-click / drag-select блоки, `BulkActionsBar` внизу.

Print / Export PDF (timesheet report) — стандартна B2B-вимога.

### `/dashboard/burndown`

**Сьогодні.** Sprint selector, 4 stat cards, conditional overrun alert, `BurndownChart`, sprint details. Все mock.

**Покращення.**

Переключити на реальні sprints. Sprint selector — `Combobox` з «Active · Upcoming · Completed» групами.

Додати альтернативні режими: Burndown / Burnup / Cumulative Flow / Velocity. Segmented-control угорі.

Ideal line (сіра пунктирна), actual line (бренд-кольор), forecast (прогноз до кінця — інтерполяція). Tooltip з deltas.

Click на день → Drawer з подіями того дня (closed tasks, scope changes, added tasks).

Retro-link — «Start sprint retro →» якщо sprint completed; відкриває drawer з шаблоном retro (Went well / Need improve / Actions).

### `/dashboard/projects-timeline`

**Сьогодні.** Timeline-bars косметичні (hardcoded left:10%, width:60%), фільтр/експорт — заглушки, table з projects.

**Покращення.**

Переписати timeline як справжній Gantt. Бібліотеки: `gantt/` вже є у `components/ui/` — розширити. Позиціювання barsпо real dates, scale toggle (day/week/month/quarter), snapping.

Dependency arrows (predecessor → successor) — fundamental для Gantt. Створюються через drag від краю bar.

Milestone-diamond icons для key dates.

Today-line (вертикальна червона) з labels.

Click на bar → Edit Drawer з тими самими tab'ами, що й картка проекту. Це узгоджує UX.

Zoom controls (buttons + Cmd+scroll).

Group rows: Project → Phases → Tasks. Collapse/expand групи.

### `/dashboard/achievements`

**Сьогодні.** Stat strip, user level progress, category-pills, 2-col achievements grid, `AchievementNotification` по кліку unlocked. All mock.

**Покращення.**

Hero-секція: великий «Level 12 — Project Wizard» з XP-bar і next-level preview. Celebratory gradient.

Progress sections: Recently earned · In progress · Locked. In-progress показує actionable прогрес («Complete 2 more tasks to unlock»).

Click на achievement → Drawer з опис + історія earn-events + related users («5 teammates also earned this»). Це соціальний driver.

Toast-celebration при earn (вже є `AchievementNotification` — треба підключити до real triggers).

Leaderboard tab (optional): команда / workspace / global (з opt-in privacy).

### `/dashboard/billing` (дубль Settings > Billing)

**Рекомендація.** Видалити сторінку, redirect на `/dashboard/settings/billing` (або навпаки — залежно від IA). Ніколи не мати двох окремих URL з різним UI для одного фічера.

Якщо лишати — то тільки як read-only summary widget на dashboard home, не full page.

### `/dashboard/friends` + `/dashboard/friends/add`

**Сьогодні.** Tabs Friends / Requests / Find, Add Friend button робить hard-nav замість modal, Find Friends search — dead input, error-messages в UA на EN-UI.

**Покращення.**

«Add Friend» — відкрити Drawer (sm, 420 px): Search by email/username/name, autocomplete results, Send invite. Це і є drawer-патерн «create entity». Видалити окрему `/add` сторінку.

Find Friends search — підключити до `/api/users/search` з debounce 300 ms; показувати mutual connections, role, team overlap.

Error localisation: замінити hardcoded UA на `t('friends.errors.acceptFailed')`.

Pending requests — кнопки Accept/Decline inline; при accept — `Celebration` toast + refresh counts.

### `/dashboard/integrations`, `/dashboard/documentation`, `/dashboard/scope-guard`, `/dashboard/payment`, `/dashboard/charts`

Не читав у деталях, але базові принципи ті самі:

**Documentation.** Dual-pane (tree ліворуч · content праворуч · TOC/comments drawer-справа). Edit → Drawer з rich-text (Tiptap). Versioning + mentions + @-references to tasks/projects.

**Integrations.** Grid карт, click → Drawer з details / permissions / logs. Disconnect у Danger zone.

**Scope guard** (AI assist). Sticky assistant-panel справа (drawer, 380 px, `pinned` mode) + main content з change proposals. Accept/Reject on each. Activity-log.

**Payment / success.** Stripe Checkout redirect — success-page з confetti / CheckCircle / «Continue to dashboard» CTA. Максимум feedback.

---

## 5. Нові компоненти для розширення дизайн-системи

| Компонент | Призначення | Базується на |
|---|---|---|
| `EditDrawer` | Універсальний правий drawer для редагування сутності | `Drawer` + власні tabs/footer |
| `StackedDrawer` | Вкладений drawer поверх іншого (+56 px offset) | `EditDrawer` |
| `Combobox` / `AvatarPicker` | Пошук + select зі стрілками | `@radix-ui/react-popover` |
| `DatePicker` / `DateRangePicker` | Вибір дати з keyboard | `react-day-picker` |
| `RichTextEditor` | Description / Comments / Docs | `Tiptap` |
| `CommandPalette` | ⌘K global nav + actions | `cmdk` |
| `TrendCard` | Stat-cards з delta + sparkline | `recharts` + `Card` |
| `BulkActionsBar` | Bottom sticky toolbar при multiselect | — |
| `AlertDialog` | Deструктивні підтвердження | `@radix-ui/react-alert-dialog` |
| `Toast` | Заміна `alert()` | `react-hot-toast` (вже є) |
| `FilterBar` | Stacked chip filters з URL-state | `filter-chip` (вже є) |

---

## 6. Пріоритетний план (4 спринти)

**Sprint 1 — Fundament.**

Уніфікація токенів (видалити `var(--ink)` etc.). Заміна `alert()` на toast. `EditDrawer` як новий компонент. `AlertDialog` для destructive. Підключення `next-intl` на всі сторінки (мінімум — витягнути hardcoded рядки).

**Sprint 2 — Drawer everywhere.**

Task edit → drawer (+ `tasks/[id]` як `?edit=`). Project edit → drawer (у списку та детальній). Invoice edit → drawer. Team member → розширити існуючий drawer на Edit. Attendance entry edit → drawer. Timesheet block edit → drawer (замість поточного Dialog).

**Sprint 3 — Data & duplicates.**

Зняти hardcoded mock з Analytics, Calendar, Burndown, Billing, Achievements, Projects Timeline. Злити `/verify-email` у `/verify`. Злити `/messages` у `/chat` (або навпаки). Видалити `/dashboard/billing` (redirect на settings). Сховати `/dashboard/performance` за feature-flag.

**Sprint 4 — Patterns & polish.**

`CommandPalette` (⌘K). `BulkActionsBar` в Invoices/Tasks/Attendance. `TrendCard` — замінити прості stat-cards. Drag-n-drop на Tasks Board. Реальний Gantt на `/projects-timeline`. Activity Timelines в Invoices та Projects.

---

## 7. Дрібні, але помітні деталі

`focus-visible` ring уніфікувати через CSS-змінну `--ring` (вже є токен) — зараз у деяких компонентах ring відсутній.

Touch-target — перевірити, що IconButton не менше 40×40 px (зараз у Drawer close — 24×24 з padding = може бути меншим за 40).

Skeleton-loading на всіх data-heavy сторінках замість spinners.

Адаптив — на tablet / mobile переводити drawer у `BottomSheet` (вже є примітив).

Dark mode — `darkMode: 'class'` вже у Tailwind. Перевірити всі токени у темному режимі (зараз більшість custom CSS-змінних не мають dark-варіантів).

`prefers-reduced-motion` — для drawer/slide-анімацій додати fallback до `opacity-only`.

Accessibility — `aria-label` на всіх IconButton без тексту; `role="region"` + `aria-labelledby` на section-cards; live-regions для toast; keyboard-order у drawer (Tab → Cancel → Save → Close → перший інпут).

---

Поточний стан закладає добру основу. Найбільш трансформаційна зміна — поставити `EditDrawer` у центр патерну редагування: одна метафора скрізь, менше втрати контексту, швидке сприйняття. Далі — розчистити дублікати й перевести мок-дані на реальний API. Після цих трьох кроків продукт відчуватиметься значно сучаснішим без кардинальної переробки архітектури.
