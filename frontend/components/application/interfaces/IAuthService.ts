// Application Layer - Service Interfaces (Dependency Inversion)

import { Credentials, User, AuthResult } from '../../domain/entities'

/**
 * IAuthService Interface
 * Definisce il contratto per i servizi di autenticazione
 * Segue il Dependency Inversion Principle
 */
export interface IAuthService {
    /**
     * Autentica un utente con credenziali
     */
    login(credentials: Credentials): Promise<AuthResult>

    /**
     * Registra un nuovo utente
     */
    signup(user: User): Promise<AuthResult>

    /**
     * Ottiene l'URL per OAuth redirect
     */
    getOAuthUrl(provider: 'google' | 'github'): Promise<string>

    /**
     * Verifica se l'utente è autenticato
     */
    isAuthenticated(): boolean

    /**
     * Effettua il logout
     */
    logout(): Promise<void>
}

/**
 * ITokenStorage Interface
 * Gestione sicura dei token JWT
 */
export interface ITokenStorage {
    saveToken(token: string, rememberMe: boolean): void
    getToken(): string | null
    removeToken(): void
    isTokenValid(): boolean
}

/**
 * IValidationService Interface
 * Validazione cross-field e business rules
 */
export interface IValidationService {
    validateCredentials(email: string, password: string): ValidationResult
    validateUserRegistration(
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ): ValidationResult
}

export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
}

export interface ValidationError {
    field: string
    message: string
}
