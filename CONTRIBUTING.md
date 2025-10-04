# 🤝 Contributing to ORDER MANAGER

We love your input! We want to make contributing to ORDER MANAGER as easy and transparent as possible, whether it's:

- 🐛 Reporting a bug
- 💡 Discussing the current state of the code
- ✨ Submitting a feature request
- 🔧 Submitting a fix
- 🎨 Proposing new features

## 🚀 Development Process

We use GitHub to host code, track issues and feature requests, and accept pull requests.

### 📋 Our Workflow

1. **Issues**: All changes happen through GitHub issues
2. **Pull Requests**: We actively welcome your pull requests
3. **Code Review**: All submissions require review
4. **Testing**: We practice Test-Driven Development (TDD)

## 🏗️ Development Setup

### Prerequisites
- Node.js ≥ 18.19.0
- npm ≥ 9.0.0
- Git

### Quick Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/order-manager.git
cd order-manager

# Install dependencies
npm install
cd gateway && npm install && cd ..
cd shared/types && npm install && cd ../..

# Start development environment
npm run dev
```

## 🎯 Our Development Principles

### 1. Test-Driven Development (TDD)
**Always follow the RED-GREEN-REFACTOR cycle:**

```bash
# 1. RED: Write failing test
npm test -- --watch

# 2. GREEN: Write minimal code to pass
# (implement feature)

# 3. REFACTOR: Improve code quality
# (clean up implementation)
```

### 2. Domain-Driven Design (DDD)
- Follow DDD layered architecture
- Keep domain logic pure (no external dependencies)
- Use aggregates for consistency boundaries
- Emit domain events for cross-context communication

### 3. Atomic Commits
- One logical change per commit
- Use conventional commit messages
- Follow the format: `type(scope): description`

### 4. Code Quality
- TypeScript strict mode enabled
- 80%+ test coverage required
- All tests must pass before PR merge
- ESLint and Prettier configured

## 📝 Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): subject

Examples:
feat(auth): add JWT refresh token endpoint
fix(orders): resolve optimistic locking issue
test(users): add BDD scenarios for registration
docs(readme): update setup instructions
refactor(gateway): improve error handling
chore(deps): update dependencies
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

## 🔄 Pull Request Process

### Before You Start
1. **Check existing issues** to avoid duplicate work
2. **Create an issue** for new features or bugs
3. **Discuss** the approach before implementing

### PR Workflow
1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Follow** TDD principles
4. **Write** comprehensive tests
5. **Update** documentation if needed
6. **Ensure** all checks pass
7. **Submit** pull request

### Branch Naming Convention
```
type/short-description

Examples:
feature/login-component
bugfix/order-validation
refactor/gateway-error-handling
docs/contributing-guide
```

### PR Checklist
- [ ] Branch follows naming convention
- [ ] Tests written following TDD
- [ ] All tests pass locally
- [ ] Code follows project conventions
- [ ] Documentation updated if needed
- [ ] Self-reviewed the changes
- [ ] Ready for code review

## 🧪 Testing Guidelines

### Test Structure
```
tests/
├── unit/                    # 70% coverage target
│   ├── domain/             # Entities, Value Objects, Aggregates
│   ├── use-cases/          # Application logic
│   └── services/           # Domain services
├── integration/            # 20% coverage target
│   ├── repositories/       # Database operations
│   ├── api/               # Controller endpoints
│   └── events/            # Event handlers
└── e2e/                   # 10% coverage target
    └── features/          # BDD scenarios (Gherkin)
```

### Test Naming Convention
```typescript
// Unit tests
describe('Order.submit()', () => {
  it('should transition from DRAFT to SUBMITTED', () => {
    // Test implementation
  })
})

// Integration tests
describe('OrderRepository.save()', () => {
  it('should persist order with optimistic locking', async () => {
    // Test implementation
  })
})

// BDD scenarios
Feature: Order Approval
  Scenario: Manager approves small order
    Given an order with amount €800
    When the order is submitted
    Then it should be auto-approved
```

### Test Requirements
- **Unit Tests**: Fast, isolated, no external dependencies
- **Integration Tests**: Test component integration points
- **E2E Tests**: Test complete user scenarios
- **Coverage**: Minimum 80% overall coverage

## 🎨 Code Style Guidelines

### TypeScript Standards
```typescript
// ✅ Good
interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

class OrderService {
  async createOrder(data: CreateOrderData): Promise<Order> {
    // Implementation
  }
}

// ❌ Bad
interface loginRequest {
  Email: string
  Password: string
  remember_me?: boolean
}

class orderService {
  createOrder(data: any): any {
    // Implementation
  }
}
```

### Naming Conventions
- **Files**: `kebab-case` (e.g., `user.repository.ts`)
- **Classes**: `PascalCase` (e.g., `UserRepository`)
- **Methods/Variables**: `camelCase` (e.g., `findById`, `userName`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `IUserRepository`)

### Domain-Driven Design Patterns
```typescript
// Aggregate Root
class Order {
  private constructor() {} // Always private constructor
  
  static create(data: CreateOrderData): Order {
    // Factory method with validation
    // Emit domain events
    return new Order(...)
  }
  
  submit(): void {
    // Business logic
    // State validation
    // Emit domain events
    this.addDomainEvent(new OrderSubmittedEvent(this))
  }
}

// Repository Interface
interface IOrderRepository {
  findById(id: string): Promise<Order | null>
  save(order: Order): Promise<void>
  softDelete(id: string): Promise<void>
}
```

## 🔍 Code Review Guidelines

### As a Reviewer
- [ ] **Functionality**: Does the code work as intended?
- [ ] **Tests**: Adequate test coverage and quality?
- [ ] **Architecture**: Follows DDD principles?
- [ ] **Performance**: Any performance concerns?
- [ ] **Security**: Any security vulnerabilities?
- [ ] **Style**: Follows project conventions?
- [ ] **Documentation**: Adequate documentation?

### As an Author
- [ ] **Self-Review**: Review your own code first
- [ ] **Context**: Provide clear PR description
- [ ] **Tests**: Include comprehensive tests
- [ ] **Documentation**: Update relevant docs
- [ ] **Size**: Keep PRs focused and reasonably sized

## 🏷️ Issue Management

### Issue Types
- **🐛 Bug**: Something isn't working
- **✨ Feature**: New functionality request
- **📚 Documentation**: Improve or fix docs
- **🔧 Enhancement**: Improve existing features
- **📋 Epic**: Large feature requiring multiple issues

### Issue Lifecycle
1. **New** → **Triaged** → **In Progress** → **Review** → **Done**
2. Use labels for categorization
3. Assign to milestones for planning
4. Link related issues and PRs

### Epic Breakdown
Large features should be broken into atomic issues:

```
Epic: User Authentication System
├── Issue #1: Setup JWT authentication service
├── Issue #2: Implement refresh token mechanism
├── Issue #3: Add password reset functionality
└── Issue #4: Create user registration workflow
```

## 🚀 Release Process

### Versioning
We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] Release notes prepared

## 📚 Resources

### Documentation
- [Architecture Overview](./README.md#architecture-overview)
- [Domain Model](./01_ANALISYS_AND_DESIGN.md)
- [Copilot Instructions](./.github/copilot-instructions.md)

### External Resources
- [Domain-Driven Design](https://domainlanguage.com/ddd/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Conventional Commits](https://conventionalcommits.org/)

## 🆘 Getting Help

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Report bugs via GitHub Issues
- 📧 **Email**: [Contact maintainers](mailto:maintainers@order-manager.com)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to ORDER MANAGER! 🎉**