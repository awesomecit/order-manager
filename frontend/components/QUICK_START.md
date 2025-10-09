# 🚀 Quick Start Guide - Refactored LoginComponent

## 📦 Installazione

```bash
cd frontend/components
npm install
npm run dev
```

Apri: `http://localhost:3001`

---

## 🏗️ Struttura Progetto

```
frontend/components/
├── domain/                         # 📐 Business Logic
│   ├── value-objects.ts           # Email, Password, Name + Result
│   └── entities.ts                # Credentials, User
│
├── application/                    # 🎯 Use Cases
│   ├── use-cases.ts               # Login, Signup, OAuth
│   └── interfaces/
│       └── IAuthService.ts        # Service interfaces
│
├── infrastructure/                 # 🔌 External Deps
│   ├── auth-service.ts            # API calls implementation
│   └── http-client.ts             # HTTP client + retry
│
├── presentation/                   # 🎨 UI Hooks
│   └── hooks/
│       └── useAuth.ts             # Custom hooks
│
├── login-component-refactored.tsx  # ✨ Main Component
├── login-component.tsx             # 📄 Old version (backup)
└── index.ts                        # 📤 Public exports
```

---

## 💡 Usage Examples

### **1. Basic Usage (Component)**

```tsx
import LoginComponent from './frontend/components'

function App() {
  return <LoginComponent />
}
```

### **2. Using Domain Objects Directly**

```typescript
import { Email, Password, Credentials, Result } from './frontend/components'

// Validazione email
const emailResult = Email.create('test@example.com')
if (emailResult.isSuccess) {
  const email = emailResult.getValue()
  console.log(email.getValue()) // 'test@example.com'
}

// Validazione password
const passwordResult = Password.create('SecurePass123!@#')
if (passwordResult.isFailure) {
  console.error(passwordResult.getError())
}

// Creazione credenziali
const credentialsResult = Credentials.create(
  'user@test.com',
  'ValidPass123!',
  true // rememberMe
)
```

### **3. Using Use Cases Directly**

```typescript
import { 
  LoginUseCase, 
  AuthService, 
  HttpClient 
} from './frontend/components'

// Setup
const httpClient = new HttpClient()
const authService = new AuthService(httpClient)
const loginUseCase = new LoginUseCase(authService)

// Esegui login
const result = await loginUseCase.execute(
  'user@example.com',
  'password123',
  false
)

if (result.isSuccess) {
  const authResult = result.getValue()
  console.log('Token:', authResult.token)
  console.log('User:', authResult.user)
} else {
  console.error('Error:', result.getError())
}
```

### **4. Custom Hook Usage**

```tsx
import { useState } from 'react'
import { useAuth } from './frontend/components'

function MyLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { loading, error, login } = useAuth(
    loginUseCase,
    signupUseCase,
    oauthUseCase
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password, false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error}</div>}
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button disabled={loading}>Login</button>
    </form>
  )
}
```

---

## 🧪 Testing Examples

### **Unit Test - Value Objects**

```typescript
import { Email, Password } from './domain/value-objects'

describe('Email Value Object', () => {
  it('should validate email format', () => {
    const valid = Email.create('test@example.com')
    expect(valid.isSuccess).toBe(true)

    const invalid = Email.create('invalid-email')
    expect(invalid.isFailure).toBe(true)
    expect(invalid.getError()).toBe('Formato email non valido')
  })
})

describe('Password Value Object', () => {
  it('should enforce password complexity', () => {
    const weak = Password.create('weak')
    expect(weak.isFailure).toBe(true)

    const strong = Password.create('Strong123!@#')
    expect(strong.isSuccess).toBe(true)
  })
})
```

### **Integration Test - Use Case**

```typescript
import { LoginUseCase } from './application/use-cases'
import { IAuthService } from './application/interfaces/IAuthService'

describe('LoginUseCase', () => {
  let mockAuthService: jest.Mocked<IAuthService>
  let useCase: LoginUseCase

  beforeEach(() => {
    mockAuthService = {
      login: jest.fn(),
      signup: jest.fn(),
      getOAuthUrl: jest.fn(),
      isAuthenticated: jest.fn(),
      logout: jest.fn()
    }
    useCase = new LoginUseCase(mockAuthService)
  })

  it('should return error for invalid credentials', async () => {
    const result = await useCase.execute('invalid', 'weak', false)
    expect(result.isFailure).toBe(true)
    expect(mockAuthService.login).not.toHaveBeenCalled()
  })

  it('should call auth service with valid credentials', async () => {
    mockAuthService.login.mockResolvedValue({
      success: true,
      token: 'mock-token',
      user: { id: '1', email: 'test@test.com', name: 'Test User' }
    })

    const result = await useCase.execute(
      'test@test.com',
      'ValidPass123!',
      false
    )

    expect(result.isSuccess).toBe(true)
    expect(mockAuthService.login).toHaveBeenCalledTimes(1)
  })
})
```

### **Component Test - React Testing Library**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginComponent from './login-component-refactored'

describe('LoginComponent', () => {
  it('should render login form', () => {
    render(<LoginComponent />)
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('should show validation error on invalid email', async () => {
    render(<LoginComponent />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText(/email non valida/i)).toBeInTheDocument()
    })
  })

  it('should toggle between login and signup', () => {
    render(<LoginComponent />)
    
    const toggleButton = screen.getByRole('button', { name: /registrati/i })
    fireEvent.click(toggleButton)

    expect(screen.getByRole('heading', { name: /registrazione/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
  })
})
```

---

## 🎯 Key Features

### ✅ **Type-Safe Error Handling**

```typescript
const result = Email.create('test@example.com')

if (result.isSuccess) {
  const email = result.getValue() // Type: Email
  console.log(email.getValue())   // Type: string
} else {
  const error = result.getError() // Type: string
  console.error(error)
}
```

### ✅ **Immutable Value Objects**

```typescript
const email = Email.create('test@example.com').getValue()
// email.value = 'other' // ❌ Error: Cannot assign to 'value'
```

### ✅ **Dependency Injection**

```typescript
// Facile mockare per i test
const mockService = new MockAuthService()
const useCase = new LoginUseCase(mockService)
```

### ✅ **Retry Logic con Exponential Backoff**

```typescript
const httpClient = new HttpClient()
httpClient.post('/api/login', data, { retry: 3 })
// Auto-retry con backoff: 1s, 2s, 4s
```

---

## 🔧 Configuration

### **Environment Variables**

Crea `.env.local`:

```env
VITE_API_URL=http://localhost:4000
```

### **Customizing HTTP Client**

```typescript
import { HttpClient } from './infrastructure/http-client'

const httpClient = new HttpClient('http://api.example.com')

// Add request interceptor (es. JWT token)
httpClient.addRequestInterceptor(async (config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }
  return config
})

// Add response interceptor (es. logging)
httpClient.addResponseInterceptor((response) => {
  console.log('Response:', response.status)
  return response
})
```

---

## 📊 Performance Tips

### **1. Lazy Loading**

```typescript
const LoginComponent = React.lazy(() => import('./login-component-refactored'))

<Suspense fallback={<Loading />}>
  <LoginComponent />
</Suspense>
```

### **2. Memoization**

```typescript
import { useMemo } from 'react'

const useCase = useMemo(() => {
  const httpClient = new HttpClient()
  const authService = new AuthService(httpClient)
  return new LoginUseCase(authService)
}, [])
```

---

## 🐛 Common Issues

### **Issue: "Property 'env' does not exist on type 'ImportMeta'"**

**Solution**: Assicurati che `vite-env.d.ts` sia incluso nel progetto

### **Issue: "Cannot find module './domain/value-objects'"**

**Solution**: Verifica che tutti i file siano stati creati correttamente

### **Issue: "fetch is not defined"**

**Solution**: Aggiungi polyfill per Node.js:

```bash
npm install node-fetch
```

---

## 📚 Further Reading

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Result Pattern in TypeScript](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/handling-errors-result-class/)

---

## 🤝 Contributing

Per contribuire al progetto:

1. Segui i principi SOLID
2. Scrivi test per ogni feature
3. Mantieni separazione layer (Domain → Application → Infrastructure)
4. Usa Result Pattern per error handling
5. Documenta con JSDoc

---

**Happy Coding!** 🚀
