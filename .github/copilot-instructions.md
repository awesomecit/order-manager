# ORDER MANAGER - AI Coding Instructions

## 🏗️ Architecture Overview

This is a multi-stack **order management system** using **Domain-Driven Design (DDD)** with **Extreme Programming (XP)** and **Test-Driven Development (TDD)** methodologies.

**Tech Stack**:
- **Backend**: NestJS microservices with TypeScript, PostgreSQL, Redis, RabbitMQ
- **Frontend**: React (all components and dashboard)
- **Gateway**: Platformatic (Fastify) for service orchestration
- **Orchestration**: Watt for multi-stack development
- **Infrastructure**: Docker, Kubernetes, Terraform (AWS)

## 🎯 Core Domain Concepts

### Bounded Contexts
- **User Management**: Registration, JWT auth, RBAC (4 roles: SYSTEM_ADMIN, ADMIN, USER, CUSTOMER)
- **Order Management**: Multi-level approval workflow (11 states), €-based approval thresholds
- **Organization**: Company → Division → Department → Team hierarchy
- **Notification**: Email, WebSocket, Push via RabbitMQ events
- **Calendar**: Google Calendar integration for delivery scheduling
- **Report**: JSReport for PDF/Excel generation

### Key Aggregates
- `User` (root) + `RefreshToken` - Authentication and profile management
- `RegistrationRequest` (root) - Pending user approvals  
- `Order` (root) + `OrderItem` + `Approval` - Core business entity with workflow
- `Role` (root) + `Permission` - RBAC authorization

## 📁 Directory Structure

**DDD Module Pattern** (NestJS services):
```
src/modules/[module-name]/
├── domain/              # Pure business logic
│   ├── aggregates/      # Aggregate roots  
│   ├── entities/        # Domain entities
│   ├── value-objects/   # Immutable objects
│   └── events/          # Domain events
├── application/         # Use cases & DTOs
│   ├── use-cases/
│   ├── dtos/
│   └── event-handlers/
├── infrastructure/      # Concrete implementations
│   ├── repositories/
│   ├── controllers/
│   └── entities/        # TypeORM entities
└── tests/
    ├── unit/            # 70% coverage target
    ├── integration/     # 20% coverage  
    └── features/        # BDD scenarios (10%)
```

**Multi-Stack Structure**:
- `gateway/` - Platformatic proxy/load balancer
- `services/` - NestJS microservices (auth, order, user, notification)
- `frontend/components/` - React component library with Storybook
- `frontend/dashboard/` - React admin interface
- `shared/` - Common TypeScript types and utilities

## 🔄 Development Workflow

### TDD Cycle (ALWAYS follow)
1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve code quality

### Code Patterns to Follow

**Domain Aggregate Creation**:
```typescript
// Use factory pattern with validation
class Order {
  private constructor(...) {}
  
  static create(data: CreateOrderData): Order {
    // Validation logic
    // Emit domain event
    return new Order(...);
  }
}
```

**Repository Pattern** (all data access):
```typescript
interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  findPendingApprovals(approverId: string): Promise<Order[]>;
}
```

**Domain Events** (cross-context communication):
```typescript
// Always emit events from aggregates
this.addDomainEvent(new OrderSubmittedEvent(this));
```

### Critical Implementation Rules

**ALWAYS implement**:
- **Soft Delete**: `deleted_at` timestamp field for audit trail
- **Optimistic Locking**: `version` field for concurrency control  
- **Domain Events**: For all aggregate state changes
- **JWT Auth**: 1-hour access + 7-day refresh tokens
- **RBAC Guards**: `@UseGuards(JwtAuthGuard, RolesGuard)` on endpoints

**Order Approval Logic**:
- < €1,000: Auto-approved
- €1,000-€4,999: 1 signature (Manager)
- €5,000-€19,999: 2 signatures (Manager + Director)  
- ≥ €20,000: 3 signatures (Manager + Director + Admin)

## 🧪 Testing Strategy

**BDD Scenarios** (Gherkin format):
```gherkin
Feature: Order Approval
  Scenario: Manager approves small order
    Given an order with amount €800
    When the order is submitted
    Then it should be auto-approved
    And customer receives notification
```

**File Structure**:
- Unit tests: `*.spec.ts` (domain logic, use cases)
- Integration: `*.integration.spec.ts` (repositories, controllers)
- E2E: `*.e2e-spec.ts` (full scenarios)

## 🚀 Commands & Environment

**Development Start**:
```bash
watt start    # Starts all services via orchestration
```

**Service-Specific**:
```bash
npm run start:dev     # NestJS service development
npm run storybook     # React components development  
npm run test:watch    # TDD mode
```

**Database**:
```bash
npm run migration:generate
npm run migration:run
npm run seed
```

## 🔐 Security Implementation

**Password Requirements**:
- Min 8 chars, uppercase, lowercase, number, special char
- bcrypt hashing (10 rounds)

**JWT Implementation**:
```typescript
// Payload structure
{ sub: userId, email, role, permissions[] }
```

**RBAC Decorators**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SYSTEM_ADMIN')
@RequirePermissions('order:approve')
```

## 📝 Naming Conventions

- **Files**: kebab-case (`user.repository.ts`)
- **Classes**: PascalCase (`UserRepository`)  
- **Methods**: camelCase (`findById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase with `I` prefix (`IUserRepository`)

## 🎨 Frontend Components (React)

**Component Structure**:
```typescript
import { useState } from 'react';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div>{/* JSX template */}</div>
  );
};

export default LoginComponent;
```

**Always include**:
- Storybook stories (`.stories.tsx`)
- MSW mock handlers for API calls
- Accessibility attributes (ARIA)
- Form validation with error states
- TypeScript types for props and state

## 🔄 State Management

**Order Status Flow**:
```
DRAFT → SUBMITTED → PENDING_APPROVAL → APPROVED → IN_PROGRESS → SHIPPED → DELIVERED → COMPLETED
          ↓              ↓
      CANCELLED      REJECTED → REQUIRES_CHANGES (loops back)
```

When implementing features, always:
1. Start with domain model and tests
2. Follow DDD layered architecture  
3. Implement soft delete and optimistic locking
4. Add domain events for cross-context communication
5. Create BDD scenarios for acceptance criteria
6. Use proper RBAC guards for security