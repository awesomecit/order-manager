import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '../mocks/server'

// Setup MSW per i test
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('MSW Mock Handlers', () => {
  it('should mock login endpoint successfully', async () => {
    const response = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin123!'
      })
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.token).toBe('mock-jwt-token-admin')
    expect(data.data.user.email).toBe('admin@example.com')
    expect(data.data.user.role).toBe('ADMIN')
  })

  it('should return 401 for invalid credentials', async () => {
    const response = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })
    })

    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Credenziali non valide')
  })

  it('should mock signup endpoint successfully', async () => {
    const response = await fetch('http://localhost:4000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'NewUser123!'
      })
    })

    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.user.email).toBe('newuser@example.com')
    expect(data.data.user.name).toBe('New User')
  })

  it('should return 409 for existing email', async () => {
    const response = await fetch('http://localhost:4000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Admin123!'
      })
    })

    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Email già registrata')
  })

  it('should verify JWT token', async () => {
    const response = await fetch('http://localhost:4000/auth/me', {
      headers: {
        'Authorization': 'Bearer mock-jwt-token-admin'
      }
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.email).toBe('admin@example.com')
    expect(data.data.role).toBe('ADMIN')
  })

  it('should return 401 for invalid token', async () => {
    const response = await fetch('http://localhost:4000/auth/me', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })

    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })
})
