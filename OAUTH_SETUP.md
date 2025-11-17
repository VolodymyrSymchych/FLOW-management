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

