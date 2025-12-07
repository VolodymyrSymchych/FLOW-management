# TestFlight - Швидкий старт

Короткий посібник для публікації додатку в TestFlight.

## Що вам потрібно

- [ ] Apple Developer Account ($99/рік) - https://developer.apple.com
- [ ] Expo Account (безкоштовно) - https://expo.dev
- [ ] Виправлені іконки (PNG 1024x1024)

## 5 простих кроків

### 1. Виправте іконки

```bash
cd mobile/assets
# Переконайтеся що icon.png, adaptive-icon.png - це PNG файли 1024x1024
```

**Швидке рішення:** Використайте https://www.appicon.co/

### 2. Встановіть EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 3. Створіть додаток в App Store Connect

1. Відкрийте https://appstoreconnect.apple.com
2. My Apps → "+" → New App
3. Bundle ID: `com.projectscopeanalyzer.app`
4. Збережіть ASC App ID (з URL)

### 4. Оновіть eas.json

Відкрийте `eas.json` і оновіть:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "ваш-email@example.com",
      "ascAppId": "ваш-app-id",
      "appleTeamId": "ваш-team-id"
    }
  }
}
```

Знайти Team ID: https://developer.apple.com/account → Membership

### 5. Створіть білд і відправте в TestFlight

```bash
cd mobile

# Налаштуйте EAS Build (один раз)
eas build:configure

# Створіть production білд
eas build --platform ios --profile production

# Після завершення білду - відправте в TestFlight
eas submit --platform ios --latest
```

## Що далі?

1. Відкрийте https://appstoreconnect.apple.com
2. Перейдіть у ваш додаток → TestFlight
3. Дочекайтеся обробки білду (5-15 хв)
4. Додайте тестувальників
5. Почніть тестування!

## Детальні інструкції

Повний посібник: [TESTFLIGHT_GUIDE.md](TESTFLIGHT_GUIDE.md)

## Типові проблеми

**Білд падає?**
```bash
# Перегляньте логи
eas build:list
eas build:logs [BUILD_ID]
```

**Missing credentials?**
```bash
eas credentials
# Виберіть "Let Expo handle the process"
```

**Потрібна допомога?**
- Discord: https://chat.expo.dev/
- Документація: https://docs.expo.dev/build/introduction/
