// MSW Node Setup (per test)
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW Server per Node.js (usato nei test)
 */
export const server = setupServer(...handlers)
