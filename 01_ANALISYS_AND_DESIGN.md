# ORDER MANAGER - Project Context Document

> **Per Claude AI**: Questo documento contiene il contesto completo del progetto ORDER MANAGER. Quando l'utente ti chiede di lavorare su questo progetto, fai riferimento a questo documento per comprendere architettura, decisioni tecniche, pattern utilizzati e metodologie di sviluppo.

---

## 📋 PANORAMICA PROGETTO

**Nome**: ORDER MANAGER  
**Tipo**: Applicazione Web/Mobile per gestione ordini  
**Obiettivo**: Sistema completo per gestione ordini per dipendenti interni e clienti esterni con workflow di approvazione multi-livello

**Utenti Target**:
- **SYSTEM_ADMIN**: Gestione sistema completa
- **ADMIN**: Gestione compagnia/divisione
- **USER**: Dipendenti interni - gestione ordini
- **CUSTOMER**: Clienti esterni - creazione richieste ordini

---

## 🏗️ STACK TECNOLOGICO

### Backend
- **Framework**: NestJS (Node.js)
- **Linguaggio**: TypeScript
- **Database**: PostgreSQL 15
- **Message Broker**: RabbitMQ
- **Cache**: Redis
- **Report**: JSReport
- **API**: REST API

### Frontend
- **Framework**: React con TypeScript
- **Build**: Vite
- **State Management**: TBD (Context API, Redux, Zustand)

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **IaC**: Terraform (AWS)
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch/Grafana/Datadog

---

## 🎯 METODOLOGIE DI SVILUPPO

### Team
- **Dimensione**: 2 Sviluppatori Junior
- **Ruoli**: PM + Product Owner + Tech Lead (guida il team)
- **Modalità**: Pair Programming (XP)

### Approcci

#### 1. **Extreme Programming (XP)**
- Pair programming continuo
- Test-first development
- Continuous integration
- Small releases
- Simple design

#### 2. **Test-Driven Development (TDD)**
- **RED**: Scrivi test (fallisce)
- **GREEN**: Scrivi codice minimo (passa)
- **REFACTOR**: Migliora qualità

**Piramide dei Test**:
- 70% Unit Tests
- 20% Integration Tests  
- 10% E2E Tests

**Target**: >80% code coverage

#### 3. **Behavior-Driven Development (BDD)**
- Scenari in formato Gherkin (Given-When-Then)
- Collaborazione tra business e sviluppo
- Test leggibili come documentazione

**Tool**: Jest-Cucumber

#### 4. **Domain-Driven Design (DDD)**

**Concetti Chiave**:
- **Ubiquitous Language**: Linguaggio condiviso tra team e dominio
- **Bounded Context**: Confini logici del sistema
- **Aggregates**: Cluster di entità con un root
- **Entities**: Oggetti con identità univoca
- **Value Objects**: Oggetti immutabili senza identità
- **Domain Events**: Eventi che rappresentano fatti del business
- **Repositories**: Astrazione della persistenza
- **Use Cases**: Casi d'uso applicativi

**Struttura Layer**:
```
src/modules/[module-name]/
├── domain/              # Logica business pura
│   ├── aggregates/      # Aggregate roots
│   ├── entities/        # Entities
│   ├── value-objects/   # Value objects
│   └── events/          # Domain events
├── application/         # Use cases & DTOs
│   ├── use-cases/
│   ├── dtos/
│   └── event-handlers/
├── infrastructure/      # Implementazioni concrete
│   ├── repositories/
│   ├── controllers/
│   └── entities/        # TypeORM entities
└── tests/
    ├── unit/
    ├── integration/
    └── features/        # BDD scenarios
```

---

## 📊 ARCHITETTURA DI SISTEMA

### Bounded Contexts Identificati

1. **User Management Context**
   - Registrazione utenti con approvazione
   - Autenticazione (JWT)
   - Autorizzazione (RBAC)
   - Gestione profili

2. **Order Management Context** (Core)
   - Creazione ordini (CUSTOMER/USER)
   - Workflow approvazione multi-livello
   - Stati ordine (11 stati totali)
   - Tracking ordini

3. **Organization Context**
   - Gerarchia: Company → Division → Department → Team
   - Gestione struttura organizzativa

4. **Notification Context**
   - Alert (urgenti)
   - Notify (standard)
   - Real-time stream (WebSocket)
   - Email, Push, SMS

5. **Calendar Context**
   - Integrazione Google Calendar
   - Gestione disponibilità
   - Eventi consegna
   - Reminder automatici

6. **Report Context**
   - Generazione PDF/Excel (JSReport)
   - Analytics dashboard
   - Export dati

---

## 🗄️ MODELLO DATI - ENTITÀ PRINCIPALI

### User Management

#### Users
```typescript
{
  id: UUID (PK)
  email: string (UK)
  password_hash: string
  first_name: string
  last_name: string
  phone: string?
  status: UserStatus (PENDING_APPROVAL, ACTIVE, SUSPENDED, INACTIVE, DELETED)
  role_id: UUID (FK → roles)
  company_id: UUID? (FK → companies)
  division_id: UUID? (FK → divisions)
  department_id: UUID? (FK → departments)
  team_id: UUID? (FK → teams)
  created_at: timestamp
  updated_at: timestamp
  deleted_at: timestamp? // SOFT DELETE
  version: int // OPTIMISTIC LOCKING
}
```

#### Registration Requests
```typescript
{
  id: UUID (PK)
  email: string (UK)
  first_name: string
  last_name: string
  phone: string?
  company_name: string
  reason: text
  status: RegistrationStatus (PENDING, APPROVED, REJECTED, EXPIRED)
  approved_by: UUID? (FK → users)
  approved_at: timestamp?
  rejection_reason: text?
  created_at: timestamp
  expires_at: timestamp // 7 days from creation
}
```

#### Roles & Permissions
```typescript
Role {
  id: UUID (PK)
  name: string (UK) // 'SYSTEM_ADMIN', 'ADMIN', 'USER', 'CUSTOMER'
  description: string
  is_system: boolean // Cannot be deleted if true
  created_at: timestamp
}

Permission {
  id: UUID (PK)
  resource: string // 'order', 'user', 'report'
  action: string   // 'create', 'read', 'update', 'delete', 'approve'
  code: string (UK) // 'order:create', 'user:delete'
  created_at: timestamp
}

RolePermission {
  role_id: UUID (FK)
  permission_id: UUID (FK)
  PRIMARY KEY (role_id, permission_id)
}
```

#### Refresh Tokens
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK → users)
  token: string (UK)
  expires_at: timestamp // 7 days
  is_revoked: boolean
  created_at: timestamp
}
```

### Organization Hierarchy

```typescript
Company {
  id: UUID (PK)
  name: string
  code: string (UK)
  is_active: boolean
  created_at: timestamp
  deleted_at: timestamp?
}

Division {
  id: UUID (PK)
  company_id: UUID (FK → companies)
  name: string
  code: string (UK)
  created_at: timestamp
  deleted_at: timestamp?
}

Department {
  id: UUID (PK)
  division_id: UUID (FK → divisions)
  name: string
  code: string (UK)
  created_at: timestamp
  deleted_at: timestamp?
}

Team {
  id: UUID (PK)
  department_id: UUID (FK → departments)
  name: string
  code: string (UK)
  created_at: timestamp
  deleted_at: timestamp?
}
```

### Order Management

#### Orders
```typescript
{
  id: UUID (PK)
  status: OrderStatus
  customer_id: UUID (FK → users)
  assigned_user_id: UUID? (FK → users)
  total_amount: decimal(10,2)
  delivery_date: timestamp?
  created_at: timestamp
  updated_at: timestamp
  deleted_at: timestamp? // SOFT DELETE
  version: int // OPTIMISTIC LOCKING
}
```

**OrderStatus Enum**:
```
DRAFT              → Bozza, editabile dal creator
SUBMITTED          → Inviato per approvazione
PENDING_APPROVAL   → In attesa di firme
REQUIRES_CHANGES   → Necessita modifiche
APPROVED           → Approvato, pronto per lavorazione
REJECTED           → Rifiutato
IN_PROGRESS        → In lavorazione
SHIPPED            → Spedito
DELIVERED          → Consegnato
COMPLETED          → Completato
CANCELLED          → Annullato
```

#### Order Items
```typescript
{
  id: UUID (PK)
  order_id: UUID (FK → orders)
  product_id: string
  quantity: int
  unit_price: decimal(10,2)
  description: string
  created_at: timestamp
}
```

#### Approvals
```typescript
{
  id: UUID (PK)
  order_id: UUID (FK → orders)
  approver_id: UUID (FK → users)
  signature: string // Digital signature/hash
  approved_at: timestamp
  created_at: timestamp
}
```

---

## 🔄 WORKFLOW ORDINI

### Stati e Transizioni

```
DRAFT → SUBMITTED → PENDING_APPROVAL → APPROVED → IN_PROGRESS → SHIPPED → DELIVERED → COMPLETED
                  ↓                  ↓
              CANCELLED          REJECTED
                                    ↓
                              REQUIRES_CHANGES → SUBMITTED (loop)
```

### Logica Approvazione Multi-livello

**Basata su Importo Totale**:

| Importo Ordine | Approvazioni Richieste | Ruoli |
|----------------|------------------------|-------|
| < €1,000 | 0 (Auto-approvato) | - |
| €1,000 - €4,999 | 1 firma | Manager |
| €5,000 - €19,999 | 2 firme | Manager + Director |
| ≥ €20,000 | 3 firme | Manager + Director + Admin |

**Default**: Tutto permesso → Blocco con Firma/Autorizzazione

**Entità che richiedono approvazione**:
- ORDER (sopra soglia)
- ORDER_MODIFICATION (modifiche a ordini approvati)
- BUDGET_ALLOCATION
- VENDOR_CHANGE
- URGENT_REQUEST

---

## 🎨 PATTERN ARCHITETTURALI

### 1. Repository Pattern ⭐⭐⭐
**Quando**: Accesso ai dati  
**Pro**: Astrazione, testabilità, separazione concerns  
**Utilizzo**: Tutti i bounded context

**Esempio**:
```typescript
interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  findPendingApprovals(approverId: string): Promise<Order[]>;
  softDelete(id: string): Promise<void>;
}
```

### 2. Domain Events Pattern ⭐⭐⭐
**Quando**: Comunicazione tra bounded contexts  
**Pro**: Disaccoppiamento, audit trail, estensibilità  
**Utilizzo**: Tutti gli aggregate roots

**Eventi Principali**:
- `UserCreatedEvent`
- `RegistrationRequestCreatedEvent`
- `RegistrationRequestApprovedEvent`
- `OrderCreatedEvent`
- `OrderSubmittedEvent`
- `OrderApprovedEvent`
- `OrderRejectedEvent`

**Pubblicazione**: RabbitMQ (async) o Event Bus in-memory (sync)

### 3. Value Objects Pattern ⭐⭐
**Quando**: Concetti senza identità  
**Pro**: Immutabilità, validazione, semantica chiara

**Esempi**:
- `Email`
- `UserProfile`
- `OrganizationReference`
- `Money`
- `Address`

### 4. Aggregate Pattern ⭐⭐⭐
**Quando**: Cluster di entità correlate  
**Pro**: Consistenza transazionale, invarianti protette

**Aggregates Identificati**:
- `User` (root) + `RefreshToken`
- `RegistrationRequest` (root)
- `Order` (root) + `OrderItem` + `Approval`
- `Role` (root) + `Permission` (via junction)

### 5. CQRS (Light) ⭐
**Quando**: Separazione letture/scritture complesse  
**Pro**: Performance query, scalabilità  
**Utilizzo**: Analytics, Dashboard (opzionale)

### 6. Optimistic Locking ⭐⭐⭐
**Quando**: Gestione concorrenza  
**Pro**: Performance migliori di pessimistic lock  
**Implementazione**: Campo `version` in ogni aggregate root

**Esempio**:
```typescript
UPDATE orders 
SET status = 'APPROVED', version = version + 1
WHERE id = :id AND version = :currentVersion
```

Se `affected = 0` → `OptimisticLockError`

### 7. Soft Delete Pattern ⭐⭐⭐
**Quando**: Tracciabilità eliminazioni  
**Pro**: Recupero dati, audit, compliance  
**Implementazione**: Campo `deleted_at` nullable

**Query Filter**:
```sql
SELECT * FROM users WHERE deleted_at IS NULL
```

### 8. Factory Pattern ⭐⭐
**Quando**: Creazione oggetti complessi  
**Pro**: Centralizza logica creazione, validazione

**Esempio**:
```typescript
class Order {
  private constructor(...) {}
  
  static create(data: CreateOrderData): Order {
    // Validation
    // Domain event
    return new Order(...);
  }
}
```

---

## 🔒 SICUREZZA & AUTENTICAZIONE

### JWT Token Strategy

**Access Token**:
- Durata: 1 ora
- Payload: `{ sub: userId, email, role, permissions[] }`
- Signed con secret key
- Inviato in header: `Authorization: Bearer <token>`

**Refresh Token**:
- Durata: 7 giorni
- Generazione: Random 32 bytes (hex)
- Stored in database con `expires_at` e `is_revoked`
- Endpoint: `POST /auth/refresh`

### Password Security
- **Hashing**: bcrypt (10 rounds)
- **Validation**: Min 8 char, uppercase, lowercase, number, special char
- Pattern regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/`

### RBAC (Role-Based Access Control)

**Guard Implementation**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SYSTEM_ADMIN')
@Post('orders/:id/approve')
async approveOrder(...) {}
```

**Permission Check**:
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('order:approve')
async approveOrder(...) {}
```

---

## 📧 SISTEMA NOTIFICHE

### Canali Supportati
1. **Email** (SMTP)
2. **Push Notification** (FCM)
3. **WebSocket** (Socket.io) - Real-time
4. **SMS** (Twilio) - Opzionale

### Eventi che Generano Notifiche

| Evento | Destinatari | Canali | Priorità |
|--------|-------------|--------|----------|
| RegistrationRequestCreated | ADMIN | Email | Normal |
| RegistrationApproved | Customer | Email | High |
| RegistrationRejected | Customer | Email | Normal |
| OrderSubmitted | Approvers | Email, Push, WebSocket | High |
| OrderApproved | Customer, Assigned User | Email, WebSocket | High |
| OrderRejected | Customer | Email | Normal |
| OrderShipped | Customer | Email, SMS, Push | High |
| DeliveryReminder | Customer, Team | Email, Push | Normal |

### Retry Policy
- Max retries: 3
- Backoff: Exponential (1s, 2s, 4s)
- DLQ: Dead Letter Queue per failed messages

---

## 📅 CALENDAR INTEGRATION

### Use Cases
1. **Delivery Scheduling**: Crea evento quando order approved
2. **Approval Deadlines**: Alert prima della scadenza
3. **Follow-up Meetings**: Meeting tra customer e team
4. **Availability Check**: Verifica slot disponibili

### Eventi Calendar

| Tipo Evento | Trigger | Partecipanti | Reminder |
|-------------|---------|--------------|----------|
| Delivery | Order APPROVED + delivery_date | Customer + Team | -24h, -2h |
| Approval Deadline | Order SUBMITTED | Approvers | -48h, -24h |
| Follow-up | Order IN_PROGRESS | Customer + Assigned User | -1h |
| Review | Order REQUIRES_CHANGES | Creator + Reviewer | Immediate |

### Google Calendar API
- OAuth2 authentication
- Calendar.events.insert
- Inviti automatici via email
- Sync bidirezionale (opzionale)

---

## 📊 REPORT & ANALYTICS

### JSReport Templates
1. **Order Summary** (PDF)
   - Dettagli ordine
   - Items list
   - Approval history
   - QR code per tracking

2. **Sales Report** (Excel)
   - Filtri: date range, customer, status
   - Aggregations: totale vendite, avg order value
   - Charts: trend temporale

3. **Performance Dashboard** (HTML → PDF)
   - KPIs: total orders, pending approvals, avg processing time
   - Charts: orders by status, monthly trend

### Storage
- **S3 Bucket**: `order-manager-reports`
- **Lifecycle**: Auto-delete dopo 90 giorni
- **Access**: Pre-signed URLs (expiring links)

---

## 🧪 TESTING STRATEGY

### Struttura Test

```
tests/
├── unit/                    # 70% coverage target
│   ├── domain/             # Entities, Value Objects
│   ├── use-cases/          # Business logic
│   └── services/           # Domain services
├── integration/            # 20% coverage target
│   ├── repositories/       # Database operations
│   ├── api/               # Controller endpoints
│   └── events/            # Event handlers
└── e2e/                   # 10% coverage target
    └── features/          # BDD scenarios (Gherkin)
```

### Example TDD Cycle

```typescript
// 1. RED - Write failing test
describe('Order.submit()', () => {
  it('should transition from DRAFT to SUBMITTED', () => {
    const order = Order.create({...});
    order.addItem(...);
    order.submit();
    expect(order.status).toBe(OrderStatus.SUBMITTED);
  });
});

// 2. GREEN - Minimal implementation
submit(): void {
  if (this.items.length === 0) {
    throw new Error('No items');
  }
  this.status = OrderStatus.SUBMITTED;
}

// 3. REFACTOR - Improve
submit(): void {
  if (![OrderStatus.DRAFT, OrderStatus.REQUIRES_CHANGES].includes(this.status)) {
    throw new InvalidStateTransitionError();
  }
  if (this.items.length === 0) {
    throw new BusinessRuleViolationError('Order must have items');
  }
  this.status = OrderStatus.SUBMITTED;
  this.updatedAt = new Date();
  this.version++;
  this.addDomainEvent(new OrderSubmittedEvent(this));
}
```

### BDD Example

```gherkin
Feature: Order Approval
  Scenario: Manager approves small order
    Given an order with amount €800
    When the order is submitted
    Then it should be auto-approved
    And customer receives notification
    And order status is APPROVED
```

---

## 🚀 INFRASTRUCTURE AS CODE

### Docker Compose (Development)

```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports: ["5672:5672", "15672:15672"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  jsreport:
    image: jsreport/jsreport:latest
    ports: ["5488:5488"]
```

### Kubernetes (Production)

**Deployment**:
- Replicas: 3 (auto-scaling)
- Resources: 256Mi-512Mi RAM, 250m-500m CPU
- Probes: Liveness (30s), Readiness (5s)

**Services**:
- LoadBalancer per API
- ClusterIP per database

### Terraform (AWS)

**Resources**:
- VPC con subnet pubbliche/private
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis
- EKS Cluster
- S3 Bucket (reports)
- CloudWatch Alarms (CPU > 80%)

---

## 📝 CONVENZIONI CODICE

### Naming
- **Files**: kebab-case (`user.repository.ts`)
- **Classes**: PascalCase (`UserRepository`)
- **Methods/Variables**: camelCase (`findById`, `userName`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase con `I` prefix (`IUserRepository`)

### Commit Messages (Conventional Commits)
```
type(scope): subject

feat(auth): add JWT refresh token endpoint
fix(orders): resolve optimistic locking issue
test(users): add BDD scenarios for registration
docs(readme): update setup instructions
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

### Branch Strategy
```
main              → Production
develop           → Integration
feature/XXX-123   → Feature branches
bugfix/XXX-456    → Bug fixes
hotfix/XXX-789    → Urgent production fixes
```

---

## 🎯 ROADMAP & PRIORITÀ

### MVP Scope (Dicembre 2025)
1. ✅ User registration con approvazione
2. ✅ Authentication (JWT)
3. ✅ RBAC (roles & permissions)
4. ✅ Order CRUD
5. ✅ Approval workflow
6. ✅ Email notifications
7. ✅ Basic dashboard

### Phase 2 (Q1 2026)
- Calendar integration
- Report generation (JSReport)
- Real-time WebSocket
- Advanced analytics
- Mobile app (React Native)

### Phase 3 (Q2 2026)
- Microservices splitting
- Event sourcing
- Multi-region deployment
- Advanced monitoring

---

## 🔧 ENVIRONMENT SETUP

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- Git

### Quick Start

```bash
# Clone repository
git clone <repo>
cd order-manager

# Install dependencies
npm install

# Start infrastructure
docker-compose up -d

# Run migrations
npm run migration:run

# Seed database
npm run seed

# Start development
npm run start:dev

# Run tests
npm run test:watch      # TDD mode
npm run test:e2e        # E2E tests
npm run test:cov        # Coverage
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://admin:secret@localhost:5432/order_manager

# RabbitMQ
RABBITMQ_URL=amqp://admin:secret@localhost:5672

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App
APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 📚 RIFERIMENTI UTILI

### Documentation
- **NestJS**: https://docs.nestjs.com
- **TypeORM**: https://typeorm.io
- **RabbitMQ**: https://www.rabbitmq.com/tutorials
- **Domain-Driven Design**: "Domain-Driven Design" by Eric Evans
- **Clean Code**: "Clean Code" by Robert C. Martin

### Code Style
- **ESLint**: `.eslintrc.js`
- **Prettier**: `.prettierrc`
- **EditorConfig**: `.editorconfig`

---

## 💡 INDICAZIONI PER CLAUDE

### Quando l'utente chiede di:

**1. "Implementare una feature"**
- Inizia sempre con TDD (test first)
- Segui la struttura DDD (domain → application → infrastructure)
- Emetti domain events appropriati
- Implementa soft delete e optimistic locking dove necessario
- Crea BDD scenarios

**2. "Creare una nuova entità"**
- Definisci prima l'aggregate root
- Identifica value objects
- Crea migration SQL
- Implementa repository con pattern
- Aggiungi indici per performance

**3. "Aggiungere un endpoint"**
- Crea DTO con validazione
- Implementa use case
- Aggiungi controller con Swagger docs
- Implementa guards (auth + RBAC)
- Scrivi integration test

**4. "Fixare un bug"**
- Scrivi test che riproduce il bug (RED)
- Fixa il codice (GREEN)
- Refactor se necessario
- Verifica non abbia rotto altri test

**5. "Fare refactoring"**
- Assicurati che tutti i test passino prima
- Refactor incrementalmente
- Esegui test dopo ogni step
- Mantieni coverage >80%

**6. "Revieware codice"**
- Verifica aderenza a DDD patterns
- Controlla test coverage
- Valida naming conventions
- Verifica security (password hashing, SQL injection, XSS)
- Controlla performance (N+1 queries, indici)

### Pattern da Seguire SEMPRE

✅ **DO**:
- Usa aggregates per consistenza transazionale
- Emetti domain events per comunicazione tra contexts
- Implementa soft delete per audit
- Usa optimistic locking per concorrenza
- Valida input a livello domain
- Scrivi test PRIMA del codice
- Documenta decisioni architetturali

❌ **DON'T**:
- Non mettere logica business nei controller
- Non fare query dirette nel domain layer
- Non usare `any` type in TypeScript
- Non skippare i test
- Non fare commit senza test passati
- Non esporre password/secrets in logs

---

## 🎓 GLOSSARIO TERMINI BUSINESS

- **Order**: Richiesta di prodotti/servizi
- **Approval**: Firma digitale su un ordine
- **Signature**: Hash o token che valida approvazione
- **Registration Request**: Richiesta di creazione account in attesa
- **Soft Delete**: Eliminazione logica (flag, non fisica)
- **Optimistic Locking**: Gestione concorrenza via versioning
- **Aggregate**: Cluster di entità trattate come unità
- **Bounded Context**: Confine logico di un sottodominio
- **Domain Event**: Fatto accaduto nel business
- **Use Case**: Operazione applicativa che orchestra il dominio

---

**Versione Documento**: 1.0  
**Ultimo Aggiornamento**: Ottobre 2025  
**Stato**: 🟢 ACTIVE - In Sviluppo

---

**FINE DOCUMENTO - Usa questo come riferimento per tutte le conversazioni future sul progetto ORDER MANAGER**
