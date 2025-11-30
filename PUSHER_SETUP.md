 # Налаштування Pusher для Chat

## Крок 1: Створіть акаунт на Pusher

1. Перейдіть на https://pusher.com/
2. Зареєструйтесь або увійдіть
3. Створіть новий App (Channels)

## Крок 2: Отримайте credentials

На сторінці вашого App знайдіть:
- **App ID** (наприклад: 1234567)
- **Key** (наприклад: abcd1234efgh5678)
- **Secret** (наприклад: secret1234567890)
- **Cluster** (наприклад: eu)

## Крок 3: Додайте environment variables

### Dashboard (.env.local)

```bash
# Pusher Channels
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu

# Public variables для frontend
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

### Vercel Environment Variables

В Vercel Dashboard -> Settings -> Environment Variables додайте:

```
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

## Крок 4: Перевірте інсталяцію

Переконайтесь, що встановлено необхідні пакети:

```bash
cd dashboard
npm list pusher pusher-js
```

Якщо не встановлено:

```bash
npm install pusher pusher-js
```

## Крок 5: Тестування локально

```bash
cd dashboard
npm run dev
```

Перейдіть на http://localhost:3001 і спробуйте:
1. Створити чат
2. Відправити повідомлення
3. Перевірте консоль браузера на наявність "Pusher connected"

## Архітектура

### Backend (Next.js API Routes)
- **Pusher Server SDK** (`pusher`) - тригерить події
- API routes в `/api/chat/*` використовують `lib/pusher-server.ts`
- Автентифікація через `/api/pusher/auth`

### Frontend
- **Pusher Client SDK** (`pusher-js`) - підписується на події
- Хук `usePusher` ініціалізує клієнта
- Хук `useChatPusher` управляє підпискою на канали чату

### Real-time події:
- `new-message` - нове повідомлення
- `message-updated` - редагування повідомлення
- `message-deleted` - видалення повідомлення
- `message-reaction` - реакція на повідомлення
- `user-joined` - користувач приєднався
- `user-left` - користувач вийшов
- `user-typing` - користувач друкує
- `chat-updated` - оновлення чату

## Безкоштовний тарифний план

Pusher Channels має безкоштовний план:
- 200,000 повідомлень/день
- 100 одночасних підключень
- Підтримка SSL
- Достатньо для development та невеликих проектів

## Troubleshooting

### Помилка: "Pusher key not configured"
Переконайтесь, що `NEXT_PUBLIC_PUSHER_KEY` встановлено в `.env.local`

### Помилка: "Pusher credentials not configured"
Переконайтесь, що серверні змінні (`PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`) встановлені

### Не працює real-time
1. Перевірте консоль браузера на помилки
2. Перевірте Network tab - чи відправляється запит до `/api/pusher/auth`
3. Перевірте Pusher Dashboard -> Debug Console на наявність подій

