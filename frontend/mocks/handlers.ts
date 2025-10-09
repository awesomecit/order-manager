// MSW Handlers - Mock API responses
import { http, HttpResponse } from 'msw'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

/**
 * Mock handlers per le API di autenticazione
 * Seguono le specifiche del backend NestJS
 */
export const authHandlers = [
  // POST /auth/login - Login con email/password
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string; remember?: boolean }

    // Simula ritardo di rete
    await delay(500)

    // Mock: Credenziali di test
    if (body.email === 'admin@example.com' && body.password === 'Admin123!') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token-admin',
          refreshToken: 'mock-refresh-token-admin',
          user: {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'ADMIN',
            permissions: ['order:create', 'order:approve', 'user:manage']
          }
        }
      }, { status: 200 })
    }

    if (body.email === 'user@example.com' && body.password === 'User123!') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token-user',
          refreshToken: 'mock-refresh-token-user',
          user: {
            id: '2',
            email: 'user@example.com',
            name: 'Regular User',
            role: 'USER',
            permissions: ['order:create']
          }
        }
      }, { status: 200 })
    }

    // Credenziali errate
    return HttpResponse.json({
      success: false,
      error: 'Credenziali non valide',
      message: 'Email o password errati'
    }, { status: 401 })
  }),

  // POST /auth/signup - Registrazione nuovo utente
  http.post(`${API_URL}/auth/signup`, async ({ request }) => {
    const body = await request.json() as { name: string; email: string; password: string }

    await delay(700)

    console.log('[MSW Handler] Signup request:', { email: body.email, name: body.name });

    // Simula email già esistente
    if (body.email === 'admin@example.com' || body.email === 'user@example.com' || body.email === 'existing@example.com') {
      console.log('[MSW Handler] Email already exists:', body.email);
      return HttpResponse.json({
        success: false,
        error: 'Email già registrata',
        message: 'Questo indirizzo email è già in uso'
      }, { status: 409 })
    }

    // Simula errore di rete se email contiene "network-error"
    if (body.email.includes('network-error')) {
      console.log('[MSW Handler] Simulating network error');
      return HttpResponse.error();
    }

    // Registrazione riuscita - ritorna token E user
    console.log('[MSW Handler] Signup successful');
    return HttpResponse.json({
      success: true,
      data: {
        token: `mock-jwt-token-${body.email.split('@')[0]}`,
        refreshToken: `mock-refresh-token-${body.email.split('@')[0]}`,
        user: {
          id: Math.random().toString(36).substr(2, 9),
          email: body.email.toLowerCase(),
          name: body.name,
          role: 'USER'
        },
        message: 'Registrazione completata con successo'
      }
    }, { status: 201 })
  }),

  // GET /auth/oauth/google - OAuth Google URL
  http.get(`${API_URL}/auth/oauth/google`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=mock&redirect_uri=http://localhost:3001/auth/callback'
      }
    }, { status: 200 })
  }),

  // GET /auth/oauth/github - OAuth GitHub URL
  http.get(`${API_URL}/auth/oauth/github`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        url: 'https://github.com/login/oauth/authorize?client_id=mock&redirect_uri=http://localhost:3001/auth/callback'
      }
    }, { status: 200 })
  }),

  // GET /auth/me - Verifica token corrente
  http.get(`${API_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({
        success: false,
        error: 'Non autorizzato',
        message: 'Token mancante o non valido'
      }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    if (token === 'mock-jwt-token-admin') {
      return HttpResponse.json({
        success: true,
        data: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN',
          permissions: ['order:create', 'order:approve', 'user:manage']
        }
      }, { status: 200 })
    }

    if (token === 'mock-jwt-token-user') {
      return HttpResponse.json({
        success: true,
        data: {
          id: '2',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'USER',
          permissions: ['order:create']
        }
      }, { status: 200 })
    }

    return HttpResponse.json({
      success: false,
      error: 'Token non valido',
      message: 'Il token fornito non è valido o è scaduto'
    }, { status: 401 })
  }),

  // POST /auth/refresh - Refresh token
  http.post(`${API_URL}/auth/refresh`, async ({ request }) => {
    const body = await request.json() as { refreshToken: string }

    await delay(300)

    if (body.refreshToken === 'mock-refresh-token-admin') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token-admin-refreshed',
          refreshToken: 'mock-refresh-token-admin-new'
        }
      }, { status: 200 })
    }

    return HttpResponse.json({
      success: false,
      error: 'Refresh token non valido',
      message: 'Il refresh token fornito non è valido'
    }, { status: 401 })
  })
]

// Utility: Simula ritardo di rete
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Export handlers combinati
export const handlers = [...authHandlers]
