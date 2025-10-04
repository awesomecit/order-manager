# Task A: Environment Setup - LOGIN VISTA

## 🎯 OBIETTIVO TASK

**Deliverable**: Environment multi-stack funzionante per sviluppare login component con MSW mocks

**Tempo stimato**: 30-45 minuti  
**Priorità**: P1 (Bloccante per tutto il resto)

**Success Criteria**:
- ✅ `watt start` avvia environment completo
- ✅ Lit component scaffold caricabile su Storybook
- ✅ MSW intercetta chiamate API mock
- ✅ Hot reload funzionante per development

---

## 📁 DIRECTORY STRUCTURE TARGET

```
order-manager/
├── watt.json                    # 🎯 Watt orchestration
├── package.json                 # Root package
├── .env                         # Environment variables
├── .gitignore                   # Git exclusions
├── gateway/                     # 🚪 Fastify Gateway (minimal)
│   ├── package.json
│   ├── platformatic.json
│   ├── app.js                   # Main entry
│   └── routes/
│       └── proxy.js             # Basic proxy setup
├── frontend/
│   ├── components/              # 🎨 Lit Elements
│   │   ├── package.json
│   │   ├── rollup.config.js
│   │   ├── src/
│   │   │   ├── login-component/
│   │   │   │   ├── login-component.ts
│   │   │   │   └── login-component.stories.ts
│   │   │   └── index.ts
│   │   ├── .storybook/
│   │   │   ├── main.ts
│   │   │   └── preview.ts
│   │   └── mocks/
│   │       ├── browser.ts       # MSW browser setup
│   │       └── handlers.ts      # API mock handlers
│   └── dashboard/               # 🎨 React Dashboard (future)
│       └── package.json
├── shared/
│   └── types/
│       ├── package.json
│       └── auth.types.ts        # Shared TypeScript types
└── scripts/
    ├── setup.sh                 # Initial setup
    └── dev.sh                   # Development start
```

---

## ⚙️ CONFIGURATION FILES

### 1. Root watt.json
```json
{
  "name": "order-manager",
  "entrypoint": "gateway",
  "services": [
    {
      "id": "gateway",
      "name": "api-gateway",
      "path": "./gateway",
      "type": "platformatic",
      "port": 3000
    }
  ],
  "web": [
    {
      "id": "components",
      "name": "components-storybook",
      "path": "./frontend/components",
      "type": "node",
      "port": 6006,
      "command": "npm run storybook"
    }
  ],
  "watch": {
    "enabled": true,
    "paths": [
      "./gateway",
      "./frontend/components/src",
      "./shared"
    ]
  }
}
```

### 2. Root package.json
```json
{
  "name": "order-manager",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "watt start",
    "setup": "bash scripts/setup.sh",
    "build": "watt build",
    "test": "npm run test --workspaces",
    "storybook": "npm run storybook --workspace=@order-manager/components"
  },
  "workspaces": [
    "gateway",
    "frontend/components",
    "frontend/dashboard",
    "shared/types"
  ],
  "devDependencies": {
    "@platformatic/cli": "^1.0.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3. Environment Variables (.env)
```bash
# Development environment
NODE_ENV=development

# Gateway
GATEWAY_PORT=3000
CORS_ORIGIN=http://localhost:6006,http://localhost:5173

# Logging
LOG_LEVEL=debug

# Future backend services (commented for now)
# DATABASE_URL=postgresql://admin:secret@localhost:5432/order_manager
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-super-secret-jwt-key
```

### 4. .gitignore
```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.rollup.cache/

# Environment
.env.local
.env.production

# Logs
*.log
logs/

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Temporary
tmp/
temp/
```

---

## 🚪 GATEWAY MINIMAL SETUP

### gateway/package.json
```json
{
  "name": "@order-manager/gateway",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "platformatic start",
    "dev": "platformatic start --watch"
  },
  "dependencies": {
    "@platformatic/service": "^1.0.0",
    "@fastify/cors": "^9.0.0"
  }
}
```

### gateway/platformatic.json
```json
{
  "name": "api-gateway",
  "entrypoint": "app.js",
  "server": {
    "hostname": "0.0.0.0",
    "port": "{PORT}",
    "cors": {
      "origin": [
        "http://localhost:6006",
        "http://localhost:5173"
      ],
      "credentials": true
    }
  },
  "plugins": {
    "paths": ["./routes"]
  },
  "watch": {
    "enabled": true
  }
}
```

### gateway/app.js
```javascript
'use strict'

/** @param {import('fastify').FastifyInstance} fastify */
export default async function (fastify, opts) {
  
  // Health check
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString()
    }
  })

  // Basic info endpoint
  fastify.get('/api/info', async (request, reply) => {
    return {
      name: 'ORDER MANAGER API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  })
}
```

### gateway/routes/proxy.js
```javascript
'use strict'

/** @param {import('fastify').FastifyInstance} fastify */
export default async function (fastify, opts) {
  
  // Mock auth endpoints for development
  fastify.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body
    
    // Simple mock validation
    if (!email || !password) {
      return reply.code(400).send({
        error: 'Email and password are required'
      })
    }
    
    // Mock successful response
    if (email === 'admin@example.com' && password === 'password123') {
      return {
        accessToken: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          id: '1',
          email: email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        }
      }
    }
    
    // Mock error response
    return reply.code(401).send({
      error: 'Invalid credentials'
    })
  })
  
  // Mock refresh endpoint
  fastify.post('/api/auth/refresh', async (request, reply) => {
    return {
      accessToken: 'mock-refreshed-jwt-token-' + Date.now()
    }
  })
}
```

---

## 🎨 LIT COMPONENTS SETUP

### frontend/components/package.json
```json
{
  "name": "@order-manager/components",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "dev": "rollup -c -w",
    "build": "rollup -c && tsc --emitDeclarationOnly",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test": "jest"
  },
  "dependencies": {
    "lit": "^3.1.0",
    "@order-manager/shared-types": "workspace:*"
  },
  "devDependencies": {
    "@rollup/plugin-node-resolve": "^15.2.0",
    "@rollup/plugin-typescript": "^11.1.0",
    "@storybook/web-components": "^7.6.0",
    "@storybook/web-components-vite": "^7.6.0",
    "msw": "^2.0.0",
    "msw-storybook-addon": "^2.0.0",
    "rollup": "^4.9.0",
    "storybook": "^7.6.0",
    "typescript": "^5.3.0"
  }
}
```

### frontend/components/rollup.config.js
```javascript
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  plugins: [
    nodeResolve(),
    typescript({
      declaration: true,
      outDir: 'dist'
    })
  ],
  external: ['lit']
}
```

### frontend/components/.storybook/main.ts
```typescript
import type { StorybookConfig } from '@storybook/web-components-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    'msw-storybook-addon'
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  }
}

export default config
```

### frontend/components/.storybook/preview.ts
```typescript
import { initialize, mswLoader } from 'msw-storybook-addon'

// Initialize MSW
initialize()

export const loaders = [mswLoader]

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  msw: {
    handlers: [] // Default handlers, can be overridden per story
  }
}
```

---

## 🔧 MSW MOCK SETUP

### frontend/components/mocks/browser.ts
```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// Start worker in development
if (process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'warn'
  })
}
```

### frontend/components/mocks/handlers.ts
```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Successful login
  http.post('http://localhost:3000/api/auth/login', async ({ request }) => {
    const body = await request.json()
    const { email, password } = body as any

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    if (email === 'admin@example.com' && password === 'password123') {
      return HttpResponse.json({
        accessToken: 'mock-jwt-token-success',
        refreshToken: 'mock-refresh-token-success',
        user: {
          id: '1',
          email: email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        }
      })
    }

    if (email === 'user@example.com' && password === 'password123') {
      return HttpResponse.json({
        accessToken: 'mock-jwt-token-user',
        refreshToken: 'mock-refresh-token-user',
        user: {
          id: '2',
          email: email,
          firstName: 'Regular',
          lastName: 'User',
          role: 'USER'
        }
      })
    }

    // Invalid credentials
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  // Network error simulation
  http.post('http://localhost:3000/api/auth/login-error', () => {
    return HttpResponse.error()
  }),

  // Slow response simulation
  http.post('http://localhost:3000/api/auth/login-slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 5000))
    return HttpResponse.json({ message: 'Eventually succeeded' })
  })
]
```

---

## 🎭 LOGIN COMPONENT SCAFFOLD

### frontend/components/src/login-component/login-component.ts
```typescript
import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

@customElement('order-login')
export class LoginComponent extends LitElement {
  
  @property({ type: String, attribute: 'api-url' })
  apiUrl = 'http://localhost:3000/api'
  
  @state() private isLoading = false
  @state() private email = ''
  @state() private password = ''
  @state() private rememberMe = false
  @state() private error: string | null = null

  static styles = css`
    :host {
      display: block;
      max-width: 400px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
      border: var(--debug-border, 1px dashed #ccc);
    }
    
    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    label {
      font-weight: 500;
      color: #374151;
    }
    
    input {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
    }
    
    input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    button {
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 1rem;
      cursor: pointer;
    }
    
    button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    
    .error {
      background: #fef2f2;
      border: 1px solid #ef4444;
      color: #ef4444;
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }
    
    .loading {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `

  private async handleSubmit(e: Event) {
    e.preventDefault()
    
    if (!this.email || !this.password) {
      this.error = 'Email and password are required'
      return
    }

    this.isLoading = true
    this.error = null

    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
          rememberMe: this.rememberMe
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data: LoginResponse = await response.json()
      
      // Emit success event
      this.dispatchEvent(new CustomEvent('login-success', {
        detail: data,
        bubbles: true
      }))

      console.log('Login successful:', data)

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Login failed'
      this.password = ''
      
      this.dispatchEvent(new CustomEvent('login-error', {
        detail: { error: this.error },
        bubbles: true
      }))

    } finally {
      this.isLoading = false
    }
  }

  render() {
    return html`
      <form class="form" @submit=${this.handleSubmit}>
        <h2>Login</h2>
        
        ${this.error ? html`
          <div class="error">${this.error}</div>
        ` : ''}
        
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            .value=${this.email}
            @input=${(e: Event) => {
              this.email = (e.target as HTMLInputElement).value
            }}
            ?disabled=${this.isLoading}
            required
          />
        </div>
        
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            .value=${this.password}
            @input=${(e: Event) => {
              this.password = (e.target as HTMLInputElement).value
            }}
            ?disabled=${this.isLoading}
            required
          />
        </div>
        
        <div class="checkbox">
          <input
            id="remember"
            type="checkbox"
            .checked=${this.rememberMe}
            @change=${(e: Event) => {
              this.rememberMe = (e.target as HTMLInputElement).checked
            }}
            ?disabled=${this.isLoading}
          />
          <label for="remember">Remember me</label>
        </div>
        
        <button type="submit" ?disabled=${this.isLoading}>
          ${this.isLoading ? html`
            <span class="loading"></span> Logging in...
          ` : 'Login'}
        </button>
      </form>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'order-login': LoginComponent
  }
}
```

### frontend/components/src/login-component/login-component.stories.ts
```typescript
import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import { http, HttpResponse } from 'msw'
import './login-component'

const meta: Meta = {
  title: 'Components/Login',
  component: 'order-login',
  parameters: {
    docs: {
      description: {
        component: 'Login component with MSW mock integration for development'
      }
    }
  },
  argTypes: {
    'api-url': { control: 'text' }
  }
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => html`<order-login></order-login>`
}

export const WithMockSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('http://localhost:3000/api/auth/login', async () => {
          await new Promise(resolve => setTimeout(resolve, 1000))
          return HttpResponse.json({
            accessToken: 'story-mock-token',
            refreshToken: 'story-refresh-token',
            user: {
              id: '1',
              email: 'admin@example.com',
              firstName: 'Story',
              lastName: 'User',
              role: 'ADMIN'
            }
          })
        })
      ]
    }
  },
  render: () => html`
    <order-login
      @login-success=${(e: CustomEvent) => {
        console.log('Login success event:', e.detail)
        alert('Login successful! Check console for details.')
      }}
    ></order-login>
    <p><strong>Test credentials:</strong> admin@example.com / password123</p>
  `
}

export const WithMockError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('http://localhost:3000/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Invalid credentials from story mock' },
            { status: 401 }
          )
        })
      ]
    }
  },
  render: () => html`
    <order-login></order-login>
    <p><strong>This story will always fail</strong> to test error handling</p>
  `
}

export const WithNetworkError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('http://localhost:3000/api/auth/login', () => {
          return HttpResponse.error()
        })
      ]
    }
  },
  render: () => html`
    <order-login></order-login>
    <p><strong>This story simulates network failure</strong></p>
  `
}
```

### frontend/components/src/index.ts
```typescript
export { LoginComponent } from './login-component/login-component'
export type { LoginCredentials, LoginResponse } from './login-component/login-component'
```

---

## 📝 SHARED TYPES

### shared/types/package.json
```json
{
  "name": "@order-manager/shared-types",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

### shared/types/auth.types.ts
```typescript
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
}

export interface UserInfo {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export type UserRole = 'SYSTEM_ADMIN' | 'ADMIN' | 'USER' | 'CUSTOMER'

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface ApiError {
  error: string
  statusCode?: number
  timestamp?: string
}
```

### shared/types/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🔧 SETUP SCRIPTS

### scripts/setup.sh
```bash
#!/bin/bash

set -e

echo "🚀 Setting up ORDER MANAGER - Task A: Environment Setup"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ is required (found v$NODE_VERSION)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Step 2: Install Watt CLI
echo -e "${BLUE}📦 Installing Platformatic Watt CLI...${NC}"
npm install -g @platformatic/cli

# Step 3: Install root dependencies
echo -e "${BLUE}📦 Installing project dependencies...${NC}"
npm install

# Step 4: Setup workspaces
echo -e "${BLUE}🔧 Setting up workspaces...${NC}"

# Gateway
cd gateway && npm install && cd ..

# Components
cd frontend/components && npm install && cd ../..

# Shared types
cd shared/types && npm install && npm run build && cd ../..

# Step 5: Create environment file
echo -e "${BLUE}⚙️  Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || cat > .env << EOF
NODE_ENV=development
GATEWAY_PORT=3000
CORS_ORIGIN=http://localhost:6006,http://localhost:5173
LOG_LEVEL=debug
EOF
    echo -e "${YELLOW}⚠️  .env file created with defaults${NC}"
fi

# Step 6: Test setup
echo -e "${BLUE}🧪 Testing setup...${NC}"

# Test Watt configuration
if watt --help &> /dev/null; then
    echo -e "${GREEN}✅ Watt CLI installed successfully${NC}"
else
    echo -e "${RED}❌ Watt CLI installation failed${NC}"
    exit 1
fi

# Test TypeScript compilation
cd shared/types && npm run build && cd ../..
echo -e "${GREEN}✅ TypeScript compilation working${NC}"

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📍 Next steps:${NC}"
echo "  1. Start development: npm run dev"
echo "  2. Open Storybook: http://localhost:6006"
echo "  3. Check Gateway: http://localhost:3000/health"
echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo "  npm run dev          # Start all services"
echo "  npm run storybook    # Open Storybook only"
echo "  watt logs            # View all logs"
echo "  watt stop            # Stop all services"
```

### scripts/dev.sh
```bash
#!/bin/bash

echo "🚀 Starting ORDER MANAGER Development Environment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎯 Starting all services with Watt...${NC}"

# Start Watt orchestration
watt start

echo -e "${GREEN}✅ Development environment ready!${NC}"
echo ""
echo -e "${BLUE}📍 Available URLs:${NC}"
echo "  🚪 API Gateway:    http://localhost:3000"
echo "  📚 Storybook:      http://localhost:6006"
echo "  🔍 Health Check:   http://localhost:3000/health"
echo ""
echo -e "${YELLOW}💡 Development Tips:${NC}"
echo "  • Login component: http://localhost:6006/?path=/story/components-login--default"
echo "  • Test credentials: admin@example.com / password123"
echo "  • All changes auto-reload"
echo "  • Check watt logs for debugging"
```

---

## ✅ ACCEPTANCE CRITERIA

### AC-1: Environment Startup
```gherkin
Feature: Development Environment Setup

  Scenario: Clean environment startup
    Given I have run the setup script
    When I execute "npm run dev"
    Then Watt should start successfully
    And Gateway should respond on http://localhost:3000/health
    And Storybook should be accessible on http://localhost:6006
    And no error messages should appear in logs

  Scenario: Hot reload functionality
    Given the development environment is running
    When I modify a component file
    Then the changes should appear automatically
    And Storybook should reflect the updates
    And no manual restart should be required
```

### AC-2: Login Component Rendering
```gherkin
Feature: Login Component Basic Functionality

  Scenario: Component renders in Storybook
    Given Storybook is running
    When I navigate to Login component story
    Then I should see email and password inputs
    And I should see a login button
    And the component should have debug borders visible

  Scenario: Form validation
    Given the login component is displayed
    When I click login without entering credentials
    Then I should see validation errors
    And the form should not submit
```

### AC-3: MSW Mock Integration
```gherkin
Feature: MSW API Mocking

  Scenario: Successful login mock
    Given MSW is intercepting API calls
    When I enter "admin@example.com" and "password123"
    And I click the login button
    Then I should see loading state
    And MSW should return success response
    And login-success event should be dispatched

  Scenario: Error handling mock
    Given MSW is configured for error responses
    When I enter invalid credentials
    And I click the login button
    Then I should see error message
    And the form should remain editable
```

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### 1. Watt Command Not Found
```bash
# Solution
npm install -g @platformatic/cli
# Or use npx
npx @platformatic/cli start
```

#### 2. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :6006

# Kill processes if needed
kill -9 <PID>
```

#### 3. MSW Not Intercepting
```bash
# Check browser console for MSW messages
# Ensure MSW is started in Storybook preview
# Verify handlers are properly exported
```

#### 4. TypeScript Build Errors
```bash
# Clean and rebuild
cd shared/types
rm -rf dist
npm run build
```

#### 5. Hot Reload Not Working
```bash
# Check watt.json watch configuration
# Verify file paths in watch.paths array
# Restart watt if needed
```

---

## 📊 SUCCESS METRICS

### Task Completion Criteria
- [ ] ✅ `watt start` completes without errors
- [ ] ✅ Gateway responds at http://localhost:3000/health
- [ ] ✅ Storybook opens at http://localhost:6006
- [ ] ✅ Login component renders with debug borders
- [ ] ✅ MSW intercepts API calls successfully
- [ ] ✅ Form validation works correctly
- [ ] ✅ Loading states display properly
- [ ] ✅ Error handling shows appropriate messages
- [ ] ✅ Hot reload updates components automatically
- [ ] ✅ TypeScript compilation succeeds

### Performance Targets
- **Startup time**: < 30 seconds for complete environment
- **Hot reload**: < 2 seconds for component updates
- **Storybook build**: < 10 seconds
- **Memory usage**: < 500MB for development environment

---

## 🎯 NEXT STEPS

### After Task A Completion
1. **Task B**: Enhance login component with advanced validation
2. **Task C**: Add more sophisticated MSW scenarios
3. **Task D**: Implement token storage and management
4. **Task E**: Add real NestJS auth service integration

### Ready for Next Sprint
- ✅ Environment foundation complete
- ✅ Development workflow established  
- ✅ Component architecture proven
- ✅ Mock strategy validated

---

**🎯 TASK STATUS**: READY FOR IMPLEMENTATION  
**⏱️ ESTIMATED TIME**: 30-45 minutes  
**🚀 START COMMAND**: `bash scripts/setup.sh`

*Focus: Get login component visible and interactive with MSW mocks as fast as possible for immediate feedback loop.*
