# Налаштування OAuth аутентифікації (Google та Microsoft)

## Google OAuth

1. Перейдіть до [Google Cloud Console](https://console.cloud.google.com/)
2. Створіть новий проект або виберіть існуючий
3. Увімкніть Google+ API:
   - Перейдіть до "APIs & Services" > "Library"
   - Знайдіть "Google+ API" та увімкніть її
4. Створіть OAuth 2.0 credentials:
   - Перейдіть до "APIs & Services" > "Credentials"
   - Натисніть "Create Credentials" > "OAuth client ID"
   - Виберіть "Web application"
   - Додайте Authorized redirect URIs:
     - `http://localhost:3001/api/auth/oauth/google/callback` (для розробки)
     - `https://yourdomain.com/api/auth/oauth/google/callback` (для продакшену)
5. Скопіюйте Client ID та Client Secret
6. Додайте їх до `.env` файлу:
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
     - Натисніть "Add" та додайте також продакшн URI: `https://yourdomain.com/api/auth/oauth/microsoft/callback`
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

- Переконайтеся, що `NEXT_PUBLIC_BASE_URL` або `NEXT_PUBLIC_APP_URL` встановлено правильно в `.env` файлі
- Для продакшену використовуйте HTTPS URLs
- Client secrets повинні бути захищені та не комітитися в репозиторій

## Перевірка

Після налаштування:
1. Перезапустіть сервер розробки
2. Перейдіть на сторінку `/sign-in` або `/sign-up`
3. Натисніть кнопку "Google" або "Microsoft"
4. Ви повинні бути перенаправлені на сторінку авторизації провайдера

