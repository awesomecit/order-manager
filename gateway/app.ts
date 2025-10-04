import Fastify from 'fastify'
import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true
})

// Register CORS
await fastify.register(cors, {
  origin: [
    'http://localhost:6006',
    'http://localhost:5173'
  ],
  credentials: true
})

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

// Mock auth endpoints
fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body as any
  
  if (!email || !password) {
    return reply.code(400).send({
      error: 'Email and password are required'
    })
  }
  
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
  
  return reply.code(401).send({
    error: 'Invalid credentials'
  })
})

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.GATEWAY_PORT || '3000', 10)
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚪 Gateway running on http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()