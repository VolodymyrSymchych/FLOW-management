# 🏗️ Architecture Overview

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        Dashboard[Dashboard<br/>Next.js 14]
        Mobile[Mobile App<br/>Expo/React Native]
    end

    subgraph "API Gateway / Load Balancer"
        Gateway[Vercel Edge Network]
    end

    subgraph "Microservices Layer"
        Auth[auth-service<br/>✅ 66 tests]
        User[user-service<br/>✅ 21 tests]
        Project[project-service<br/>✅ 34 tests]
        Task[task-service<br/>✅ 31 tests]
        Team[team-service<br/>✅ 34 tests]
        Chat[chat-service<br/>✅ 26 tests]
        Invoice[invoice-service<br/>❌ failing]
        Notify[notification-service<br/>✅ 27 tests]
        File[file-service<br/>⚠️ 29 tests]
    end

    subgraph "Data Layer"
        DB[(Neon PostgreSQL<br/>Drizzle ORM)]
        Redis[(Upstash Redis<br/>Caching)]
        S3[(AWS S3/R2<br/>File Storage)]
    end

    subgraph "External Services"
        Pusher[Pusher<br/>Real-time Chat]
        Resend[Resend<br/>Email]
        Stripe[Stripe<br/>Payments]
        Sentry[Sentry<br/>⏳ TODO]
    end

    Dashboard --> Gateway
    Mobile --> Gateway
    
    Gateway --> Auth
    Gateway --> User
    Gateway --> Project
    Gateway --> Task
    Gateway --> Team
    Gateway --> Chat
    Gateway --> Invoice
    Gateway --> Notify
    Gateway --> File

    Auth --> DB
    User --> DB
    Project --> DB
    Task --> DB
    Team --> DB
    Chat --> DB
    Invoice --> DB
    Notify --> DB
    File --> S3

    Auth --> Redis
    User --> Redis
    Project --> Redis
    Task --> Redis
    Team --> Redis

    Chat --> Pusher
    Notify --> Resend
    Invoice --> Stripe

    Auth -.-> Sentry
    User -.-> Sentry
    Project -.-> Sentry
    Task -.-> Sentry
    Team -.-> Sentry
    Chat -.-> Sentry
    Invoice -.-> Sentry
    Notify -.-> Sentry
    File -.-> Sentry

    classDef working fill:#90EE90,stroke:#228B22,stroke-width:2px
    classDef failing fill:#FFB6C1,stroke:#DC143C,stroke-width:2px
    classDef warning fill:#FFD700,stroke:#FF8C00,stroke-width:2px
    classDef todo fill:#D3D3D3,stroke:#808080,stroke-width:2px,stroke-dasharray: 5 5

    class Auth,User,Project,Task,Team,Chat,Notify working
    class Invoice failing
    class File warning
    class Sentry todo
```

## Testing Status

```mermaid
pie title Test Coverage by Service
    "auth-service (66)" : 66
    "user-service (21)" : 21
    "project-service (34)" : 34
    "task-service (31)" : 31
    "team-service (34)" : 34
    "chat-service (26)" : 26
    "notification-service (27)" : 27
    "file-service (29)" : 29
```

## Production Readiness

```mermaid
gantt
    title Production Readiness Timeline
    dateFormat YYYY-MM-DD
    section Testing
    Unit Tests (DONE)           :done, 2026-01-01, 2026-01-11
    Fix invoice-service         :crit, 2026-01-11, 1d
    E2E Tests Enhancement       :2026-01-12, 3d
    
    section Security
    Basic Security (DONE)       :done, 2026-01-01, 2026-01-11
    Rate Limiting All Services  :crit, 2026-01-13, 2d
    Security Audit             :crit, 2026-02-01, 5d
    
    section CI/CD
    Basic Pipeline (DONE)       :done, 2026-01-01, 2026-01-11
    Fix CI/CD Pipeline         :crit, 2026-01-12, 1d
    Enhanced Pipeline          :2026-01-15, 2d
    
    section Monitoring
    Setup Sentry               :crit, 2026-01-16, 1d
    Configure Alerts           :2026-01-17, 1d
    
    section Documentation
    API Docs (Swagger)         :crit, 2026-01-18, 3d
    Architecture Docs          :2026-01-21, 2d
    
    section Infrastructure
    Production Setup           :crit, 2026-02-15, 5d
    Staging Testing            :2026-02-20, 5d
    
    section Launch
    Final QA                   :2026-03-01, 7d
    Production Deploy          :milestone, 2026-03-15, 0d
```

## Service Dependencies

```mermaid
graph LR
    subgraph "Core Services"
        Auth[Auth Service]
        User[User Service]
    end

    subgraph "Business Logic"
        Team[Team Service]
        Project[Project Service]
        Task[Task Service]
        Invoice[Invoice Service]
    end

    subgraph "Communication"
        Chat[Chat Service]
        Notify[Notification Service]
    end

    subgraph "Utility"
        File[File Service]
    end

    Auth --> User
    User --> Team
    Team --> Project
    Project --> Task
    Task --> Notify
    Team --> Chat
    Project --> Invoice
    Task --> File
    Invoice --> Notify
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard
    participant A as Auth Service
    participant P as Project Service
    participant DB as Database
    participant R as Redis

    U->>D: Login Request
    D->>A: POST /api/auth/login
    A->>DB: Verify Credentials
    DB-->>A: User Data
    A->>R: Cache Session
    A-->>D: JWT Token
    D-->>U: Authenticated

    U->>D: Get Projects
    D->>P: GET /api/projects
    P->>R: Check Cache
    alt Cache Hit
        R-->>P: Cached Data
    else Cache Miss
        P->>DB: Query Projects
        DB-->>P: Project Data
        P->>R: Update Cache
    end
    P-->>D: Projects List
    D-->>U: Display Projects
```

## Current Status Summary

| Component | Status | Coverage | Priority |
|-----------|--------|----------|----------|
| **Testing** | 🟢 Good | 98.5% | Maintain |
| **Security** | 🟡 Partial | 60% | **Critical** |
| **CI/CD** | 🟡 Basic | 40% | **High** |
| **Monitoring** | 🔴 None | 0% | **Critical** |
| **Documentation** | 🔴 Minimal | 20% | **High** |
| **Infrastructure** | 🟡 Local | 40% | **Medium** |

**Legend:**
- 🟢 Good (>80%)
- 🟡 Partial (40-80%)
- 🔴 Needs Work (<40%)

## Next Steps

1. **Week 1:** Fix critical issues (invoice-service, CI/CD)
2. **Week 2-4:** Security hardening & monitoring
3. **Month 2:** Production setup & audit
4. **Month 3:** Launch preparation

**Target Launch Date: March 15, 2026** 🚀
