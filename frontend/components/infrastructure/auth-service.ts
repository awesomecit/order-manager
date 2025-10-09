// Infrastructure Layer - HTTP Auth Service Implementation

import { IAuthService } from '../application/interfaces/IAuthService'
import { Credentials, User, AuthResult } from '../domain/entities'
import { HttpClient } from './http-client'

/**
 * AuthService Implementation
 * Implementazione concreta del servizio di autenticazione
 */
export class AuthService implements IAuthService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    ) {}

    async login(credentials: Credentials): Promise<AuthResult> {
        try {
            const response = await this.httpClient.post<{
                token: string
                user: { id: string; email: string; name: string }
            }>(`${this.baseUrl}/auth/login`, credentials.toJSON())

            return {
                success: true,
                token: response.token,
                user: response.user
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Errore durante il login'
            }
        }
    }

    async signup(user: User): Promise<AuthResult> {
        try {
            const response = await this.httpClient.post<{
                success: boolean
                data?: {
                    token: string
                    user: { id: string; email: string; name: string }
                }
                error?: string
            }>(`${this.baseUrl}/auth/signup`, user.toJSON())

            console.log('[AuthService.signup] Response:', response);

            // Handle MSW response format: { success: true, data: { token, user } }
            if (response.success && response.data) {
                return {
                    success: true,
                    token: response.data.token,
                    user: response.data.user
                }
            }

            // Handle error response
            return {
                success: false,
                error: response.error || 'Errore durante la registrazione'
            }
        } catch (error: any) {
            console.error('[AuthService.signup] Error:', error);
            
            // Handle network errors
            if (error.message?.includes('Network') || error.message?.includes('fetch')) {
                return {
                    success: false,
                    error: 'Errore di rete. Controlla la tua connessione.'
                }
            }
            
            return {
                success: false,
                error: error.message || 'Errore durante la registrazione'
            }
        }
    }

    async getOAuthUrl(provider: 'google' | 'github'): Promise<string> {
        return `${this.baseUrl}/auth/oauth/${provider}`
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem('auth_token')
        return !!token && this.isTokenValid(token)
    }

    async logout(): Promise<void> {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
    }

    private isTokenValid(token: string): boolean {
        try {
            // Decodifica JWT (semplificato, in produzione usa libreria)
            const payload = JSON.parse(atob(token.split('.')[1]))
            const expiry = payload.exp * 1000
            return Date.now() < expiry
        } catch {
            return false
        }
    }
}
