# Project Scope Analyzer - Microservices Architecture

Мікросервісна архітектура для Project Scope Analyzer.

## Структура проєкту

```
project-scope-analyzer/
├── services/                    # Мікросервіси
│   └── _template/              # Шаблон для нових сервісів
├── shared/                      # Спільні бібліотеки
│   ├── types/                  # TypeScript типи
│   ├── utils/                  # Утиліти
│   ├── database/               # Database helpers
│   └── events/                 # Event types та Event Bus
├── infrastructure/              # Інфраструктура
│   ├── docker-compose.yml      # Docker Compose конфігурація
│   ├── monitoring/             # Prometheus та Grafana
│   ├── nginx/                  # API Gateway
│   └── database/               # Database міграції
├── scripts/                     # Допоміжні скрипти
├── docs/                        # Документація
└── dashboard/                   # Існуючий Next.js фронтенд
```

## Швидкий старт

### 1. Запуск інфраструктури

```bash
cd infrastructure
docker-compose up -d
```

### 2. Налаштування shared libraries

```bash
cd shared
npm install
npm run build
```

### 3. Створення нового сервісу

```bash
cd services
cp -r _template my-service
cd my-service
npm install
```

### 4. Запуск сервісу

```bash
npm run dev
```

## Документація

- [Development Guide](docs/DEVELOPMENT.md) - Гайд по розробці
- [Deployment Guide](docs/DEPLOYMENT.md) - Гайд по деплою
- [Architecture Audit](ARCHITECTURE_AUDIT.md) - Архітектурний аудит
- [Shared Libraries](shared/README.md) - Документація shared libraries
- [Service Template](services/_template/README.md) - Документація шаблону сервісу
- [Infrastructure](infrastructure/README.md) - Документація інфраструктури

## Мікросервіси

Плановані мікросервіси:

1. **Auth Service** - Аутентифікація та авторизація
2. **User Service** - Управління користувачами
3. **Project Service** - Управління проєктами
4. **Task Service** - Управління завданнями
5. **Team Service** - Управління командами
6. **Chat Service** - Чат та повідомлення
7. **Financial Service** - Фінансове управління
8. **File Service** - Управління файлами
9. **Time Tracking Service** - Відстеження часу
10. **Notification Service** - Сповіщення
11. **Analytics Service** - Аналітика
12. **AI Service** - AI функції

## Інфраструктура

- **PostgreSQL** - Бази даних для кожного сервісу
- **Redis** - Кешування та pub/sub
- **RabbitMQ** - Message queue
- **Prometheus** - Збір метрик
- **Grafana** - Візуалізація метрик
- **Nginx** - API Gateway

## Розробка

Дивіться [Development Guide](docs/DEVELOPMENT.md) для детальної інформації.

## Деплой

Дивіться [Deployment Guide](docs/DEPLOYMENT.md) для детальної інформації.

## Статус

Фаза 1: Підготовка інфраструктури - ✅ Завершено

Наступні кроки:
- Фаза 2: Виділення перших сервісів (Auth, User, File)

