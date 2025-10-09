# MSW (Mock Service Worker) - Guida Completa

## 📋 Panoramica

**MSW (Mock Service Worker)** è configurato per intercettare le chiamate API durante lo sviluppo e il testing, permettendo di lavorare sul frontend senza bisogno di un backend attivo.

## 🚀 Come Funziona

MSW utilizza un **Service Worker** nel browser per intercettare le richieste HTTP a livello di rete e restituire risposte mock personalizzate.

### Vantaggi
- ✅ **Sviluppo offline**: Lavora senza backend attivo
- ✅ **Testing affidabile**: Risposte deterministiche e controllabili
- ✅ **Simulazione realistica**: Intercetta richieste reali (no polyfill)
- ✅ **Ritardi simulati**: Testa loading states e UX
- ✅ **Scenari multipli**: Simula successo, errori, timeout

## 📁 Struttura File

```
frontend/
├── mocks/
│   ├── handlers.ts      # Mock API handlers
│   ├── browser.ts       # Setup per browser (dev)
│   └── server.ts        # Setup per Node (test)
├── public/
│   └── mockServiceWorker.js  # Service Worker (generato)
└── main.tsx             # Entry point con MSW
```

## 🔧 Configurazione

### 1. Installazione
```bash
npm install --save-dev msw@latest
npx msw init public/ --save
```

### 2. Environment Variables
File `.env`:
```env
VITE_API_URL=http://localhost:4000
VITE_ENABLE_MSW=true
```

### 3. Attivazione in `main.tsx`
```typescript
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return
  }
  const { startMSW } = await import('./mocks/browser')
  return startMSW()
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
  )
})
```

## 🎯 Handlers Disponibili

### Autenticazione

#### 1. Login (POST /auth/login)
**Credenziali di test:**
```json
// Admin
{
  "email": "admin@example.com",
  "password": "Admin123!"
}

// User
{
  "email": "user@example.com",
  "password": "User123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "mock-jwt-token-admin",
    "refreshToken": "mock-refresh-token-admin",
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "ADMIN",
      "permissions": ["order:create", "order:approve", "user:manage"]
    }
  }
}
```

**Response (401) - Credenziali errate:**
```json
{
  "success": false,
  "error": "Credenziali non valide",
  "message": "Email o password errati"
}
```

#### 2. Signup (POST /auth/signup)
**Request:**
```json
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "password": "Mario123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "Registrazione completata con successo",
    "user": {
      "id": "3",
      "email": "mario@example.com",
      "name": "Mario Rossi",
      "role": "USER"
    }
  }
}
```

**Response (409) - Email esistente:**
```json
{
  "success": false,
  "error": "Email già registrata",
  "message": "Questo indirizzo email è già in uso"
}
```

#### 3. OAuth URLs (GET /auth/oauth/{provider})
- `/auth/oauth/google` - URL per OAuth Google
- `/auth/oauth/github` - URL per OAuth GitHub

#### 4. Verifica Token (GET /auth/me)
Richiede header: `Authorization: Bearer <token>`

#### 5. Refresh Token (POST /auth/refresh)
```json
{
  "refreshToken": "mock-refresh-token-admin"
}
```

## 🧪 Testing

### Setup per Vitest
File `vitest.setup.ts`:
```typescript
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Esempio Test con MSW
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import LoginComponent from './LoginComponent'

describe('LoginComponent', () => {
  it('should login successfully', async () => {
    const user = userEvent.setup()
    render(<LoginComponent />)

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Admin123!')
    await user.click(screen.getByRole('button', { name: /accedi/i }))

    await waitFor(() => {
      expect(screen.getByText(/login effettuato con successo/i)).toBeInTheDocument()
    })
  })

  it('should handle login error', async () => {
    // Override handler per questo test
    server.use(
      http.post('http://localhost:4000/auth/login', () => {
        return HttpResponse.json({
          success: false,
          error: 'Server error'
        }, { status: 500 })
      })
    )

    const user = userEvent.setup()
    render(<LoginComponent />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /accedi/i }))

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })
})
```

## 🎨 Aggiungere Nuovi Handlers

### 1. Definire il Mock Handler
File `mocks/handlers.ts`:
```typescript
export const orderHandlers = [
  http.get(`${API_URL}/orders`, async ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || '1'
    
    await delay(500)
    
    return HttpResponse.json({
      success: true,
      data: {
        orders: [
          { id: '1', title: 'Order 1', amount: 1500 },
          { id: '2', title: 'Order 2', amount: 2500 }
        ],
        total: 2,
        page: parseInt(page)
      }
    })
  }),

  http.post(`${API_URL}/orders`, async ({ request }) => {
    const body = await request.json()
    
    await delay(700)
    
    return HttpResponse.json({
      success: true,
      data: {
        id: '123',
        ...body,
        status: 'DRAFT'
      }
    }, { status: 201 })
  })
]

// Aggiungi agli handlers
export const handlers = [...authHandlers, ...orderHandlers]
```

### 2. Simulare Errori Specifici
```typescript
http.post(`${API_URL}/orders`, async ({ request }) => {
  const body = await request.json()
  
  // Simula validazione fallita
  if (!body.title) {
    return HttpResponse.json({
      success: false,
      error: 'Validation error',
      message: 'Title is required'
    }, { status: 400 })
  }
  
  // Simula errore di autorizzazione
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return HttpResponse.json({
      success: false,
      error: 'Unauthorized'
    }, { status: 401 })
  }
  
  // Simula rate limiting
  return HttpResponse.json({
    success: false,
    error: 'Too many requests'
  }, { status: 429 })
})
```

### 3. Simulare Timeout
```typescript
http.get(`${API_URL}/slow-endpoint`, async () => {
  await delay(30000) // 30 secondi
  return HttpResponse.json({ data: 'Slow response' })
})
```

## 🔍 Debugging

### Console del Browser
MSW stampa automaticamente le richieste intercettate nella console:
```
[MSW] GET http://localhost:4000/auth/me (200 OK)
[MSW] POST http://localhost:4000/auth/login (401 Unauthorized)
```

### Disabilitare MSW Temporaneamente
File `.env`:
```env
VITE_ENABLE_MSW=false
```

Oppure modifica `main.tsx`:
```typescript
async function enableMocking() {
  if (import.meta.env.MODE !== 'development' || import.meta.env.VITE_ENABLE_MSW !== 'true') {
    return
  }
  // ...
}
```

### Ispezionare Richieste Non Gestite
File `mocks/browser.ts`:
```typescript
export function startMSW() {
  return worker.start({
    onUnhandledRequest: 'warn', // o 'error' per bloccare
  })
}
```

## 📊 Scenari Avanzati

### 1. Risposta Condizionale Basata su Header
```typescript
http.get(`${API_URL}/data`, ({ request }) => {
  const locale = request.headers.get('Accept-Language')
  
  if (locale?.includes('it')) {
    return HttpResponse.json({ message: 'Ciao!' })
  }
  
  return HttpResponse.json({ message: 'Hello!' })
})
```

### 2. Paginazione
```typescript
http.get(`${API_URL}/items`, ({ request }) => {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }))
  const start = (page - 1) * limit
  const end = start + limit
  
  return HttpResponse.json({
    data: items.slice(start, end),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit)
    }
  })
})
```

### 3. GraphQL Support
```typescript
import { graphql, HttpResponse } from 'msw'

export const graphqlHandlers = [
  graphql.query('GetUser', ({ variables }) => {
    return HttpResponse.json({
      data: {
        user: {
          id: variables.id,
          name: 'John Doe'
        }
      }
    })
  })
]
```

## 🎯 Best Practices

1. **Mantieni handlers realistici**: Risposte simili al backend reale
2. **Usa delay()**: Simula latenza di rete realistica (300-1000ms)
3. **Testa edge cases**: Errori, timeout, dati mancanti
4. **Documenta credenziali**: Credenziali di test chiare nel README
5. **Version handlers**: Segui le versioni API del backend
6. **Separa concerns**: Handler diversi per domini diversi
7. **Reset tra test**: `server.resetHandlers()` in `afterEach()`

## 📚 Risorse

- [Documentazione MSW](https://mswjs.io/docs/)
- [MSW Examples](https://github.com/mswjs/examples)
- [MSW + React Testing Library](https://kentcdodds.com/blog/stop-mocking-fetch)

## 🐛 Troubleshooting

### Service Worker non si registra
- Verifica che `public/mockServiceWorker.js` esista
- Controlla la console del browser per errori
- Riavvia il dev server

### Richieste non intercettate
- Verifica che l'URL corrisponda esattamente
- Controlla che MSW sia avviato prima del render
- Usa `onUnhandledRequest: 'error'` per debug

### CORS errors
MSW intercetta prima di CORS, quindi non dovrebbero esserci problemi.
Se presenti, il problema è nella configurazione del browser/server reale.

---

**Credenziali di test rapido:**
- Admin: `admin@example.com` / `Admin123!`
- User: `user@example.com` / `User123!`
