# Auth Service

Мікросервіс аутентифікації та авторизації.

## Функціональність

- Реєстрація користувачів
- Вхід (login)
- Вихід (logout)
- Email верифікація
- JWT токени
- Account lockout (захист від brute force)
- OAuth (Google, Microsoft) - в розробці

## API Endpoints

- `POST /auth/signup` - Реєстрація
- `POST /auth/login` - Вхід
- `POST /auth/logout` - Вихід
- `POST /auth/verify-email` - Верифікація email
- `GET /auth/me` - Отримати поточного користувача

## Запуск

```bash
npm install
npm run dev
```

## Конфігурація

Скопіюйте `.env.example` в `.env` та налаштуйте змінні оточення.

## База даних

Сервіс використовує окрему PostgreSQL базу даних `auth_db`.

Таблиці:
- `users` - користувачі
- `email_verifications` - токени верифікації email

## Події

Сервіс публікує події:
- `user.registered` - при реєстрації
- `user.verified` - при верифікації email
- `user.logged_in` - при вході
- `user.logged_out` - при виході
