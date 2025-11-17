# Налаштування OAuth аутентифікації (Google та Microsoft)

## Google OAuth

1. Перейдіть до [Google Cloud Console](https://console.cloud.google.com/)
2. Створіть новий проект або виберіть існуючий
3. **ВАЖЛИВО: Налаштуйте OAuth consent screen ПЕРЕД створенням credentials:**
   - Перейдіть до "APIs & Services" > "OAuth consent screen"
   - Виберіть тип користувача:
     - **External** (для публічних додатків) - рекомендовано
     - **Internal** (тільки для користувачів вашої організації)
   - Заповніть обов'язкові поля:
     - **App name**: назва вашого додатку (наприклад, "FLOW Management")
     - **User support email**: ваш email для підтримки
     - **Developer contact information**: ваш email
   - Додайте **Authorized domains** (якщо потрібно):
     - `vercel.app` (для Vercel deployments)
     - Ваш власний домен (якщо є)
   - Натисніть "Save and Continue"
   - У розділі "Scopes" натисніть "Add or Remove Scopes" та додайте:
     - `openid`
     - `email`
     - `profile`
   - Натисніть "Save and Continue"
   - У розділі "Test users" (якщо додаток в режимі Testing) додайте тестових користувачів
   - Натисніть "Save and Continue" та завершіть налаштування
4. Увімкніть Google+ API (опціонально, для деяких функцій):
   - Перейдіть до "APIs & Services" > "Library"
   - Знайдіть "Google+ API" та увімкніть її (якщо потрібно)
5. Створіть OAuth 2.0 credentials:
   - Перейдіть до "APIs & Services" > "Credentials"
   - Натисніть "Create Credentials" > "OAuth client ID"
   - Виберіть "Web application"
   - Додайте Authorized redirect URIs:
     - `http://localhost:3001/api/auth/oauth/google/callback` (для розробки)
     - `https://flow-managment.vercel.app/api/auth/oauth/google/callback` (для продакшену)
     - Або ваш продакшн домен: `https://yourdomain.com/api/auth/oauth/google/callback`
6. Скопіюйте Client ID та Client Secret
7. Додайте їх до `.env.local` файлу:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

## Microsoft OAuth

**Примітка:** Microsoft OAuth налаштовується виключно через Azure Portal (Microsoft Entra ID). Це офіційний та єдиний спосіб реєстрації OAuth додатків для Microsoft.

1. Перейдіть до [Azure Portal](https://portal.azure.com/)
2. Перейimage.pngдіть до "Azure Active Directory" > "App registrations" (або "Microsoft Entra ID" > "App registrations")
3. Натисніть "New registration"
4. Заповніть форму:
   - **Name**: назва вашого додатку (наприклад, "Project Scope Analyzer")
   - **Supported account types**: 
     - "Accounts in any organizational directory and personal Microsoft accounts" (рекомендовано для публічних додатків)
     - або "Accounts in this organizational directory only" (тільки для корпоративних додатків)
   - **Redirect URI**: 
     - Platform: **Web**
     - URI: `http://localhost:3001/api/auth/oauth/microsoft/callback` (для розробки)
     - Натисніть "Add" та додайте також продакшн URI: `https://flow-managment.vercel.app/api/auth/oauth/microsoft/callback`
     - Або ваш продакшн домен: `https://yourdomain.com/api/auth/oauth/microsoft/callback`
5. Натисніть "Register"
6. Після створення, перейдіть до "Certificates & secrets" в меню зліва
7. У розділі "Client secrets" натисніть "New client secret"
   - **Description**: опис (наприклад, "Production secret")
   - **Expires**: виберіть термін дії (рекомендовано 24 months)
   - Натисніть "Add"
   - **ВАЖЛИВО**: Скопіюйте значення secret одразу (воно більше не буде показано!)
8. Скопіюйте **Application (client) ID** зі сторінки "Overview"
9. Додайте їх до `.env.local` файлу:
   ```
   MICROSOFT_CLIENT_ID=your_microsoft_client_id
   MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
   ```

### Альтернативні способи (не рекомендовано):
- Microsoft Graph API Explorer - тільки для тестування, не для продакшену
- Personal Microsoft Account - обмежені можливості

## Як зменшити сповіщення Microsoft про нові програми

Microsoft надсилає електронні листи про безпеку кожного разу, коли новий додаток підключається до облікового запису. Це стандартна поведінка для захисту користувачів. Ось кілька способів зменшити або прибрати ці повідомлення:

### 1. Налаштування в Azure Portal (рекомендовано)

1. Перейдіть до [Azure Portal](https://portal.azure.com/)
2. Відкрийте ваш додаток в "App registrations"
3. Перейдіть до "Branding & properties"
4. Заповніть всі поля:
   - **Display name**: назва вашого додатку
   - **Home page URL**: URL вашого сайту
   - **Terms of service URL**: URL умов використання (якщо є)
   - **Privacy statement URL**: URL політики конфіденційності (якщо є)
   - **Logo**: завантажте логотип вашого додатку
5. Перейдіть до "API permissions"
6. Переконайтеся, що використовуються тільки необхідні дозволи:
   - `openid` (вбудований)
   - `email` (вбудований)
   - `profile` (вбудований)
   - Приберіть `User.Read`, якщо він не потрібен
7. Натисніть "Save"

### 2. Використання мінімальних дозволів

Додаток використовує тільки базові дозволи (`openid email profile`), що мінімізує сповіщення. Дозвіл `User.Read` було видалено з коду, щоб уникнути сповіщень про безпеку. Замість Microsoft Graph API використовується OpenID Connect userinfo endpoint, який надає всю необхідну інформацію (email, ім'я) без додаткових дозволів.

**Важливо:** Якщо вам потрібен доступ до фото користувача або інших даних з Microsoft Graph API, вам потрібно додати дозвіл `User.Read` назад, але це викличе сповіщення про безпеку.

### 3. Налаштування фільтрів електронної пошти (для користувачів)

Користувачі можуть налаштувати фільтри в своїй поштовій скриньці:

1. У Gmail/Outlook створіть фільтр для адреси `account-security-noreply@accountprotection.microsoft.com`
2. Налаштуйте автоматичне переміщення таких листів у папку "Спам" або окрему папку
3. Або налаштуйте автоматичне видалення таких листів

### 4. Відключення сповіщень про безпеку (для користувачів)

Користувачі можуть відключити сповіщення про безпеку:

1. Перейдіть на [account.microsoft.com](https://account.microsoft.com/)
2. Перейдіть до "Security" > "Advanced security options"
3. Знайдіть розділ "Security notifications"
4. Відключіть сповіщення про нові програми (якщо доступно)

**Примітка:** Повністю прибрати ці повідомлення неможливо, оскільки це частина системи безпеки Microsoft. Однак, після першого підключення додатку, подальші логіни не повинні викликати нові сповіщення.

## Важливо

- Переконайтеся, що `NEXT_PUBLIC_BASE_URL` або `NEXT_PUBLIC_APP_URL` встановлено правильно:
  - Для розробки: `http://localhost:3001`
  - Для продакшену: `https://flow-managment.vercel.app` (без trailing slash!)
- Для продакшену використовуйте HTTPS URLs
- Client secrets повинні бути захищені та не комітитися в репозиторій
- Redirect URIs в Google Cloud Console та Azure Portal мають точно співпадати з тими, що використовуються в коді

## Перевірка

Після налаштування:
1. Перезапустіть сервер розробки
2. Перейдіть на сторінку `/sign-in` або `/sign-up`
3. Натисніть кнопку "Google" або "Microsoft"
4. Ви повинні бути перенаправлені на сторінку авторизації провайдера

