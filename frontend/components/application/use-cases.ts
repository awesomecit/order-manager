// Application Layer - Use Cases

import { Credentials, User, AuthResult } from '../domain/entities'
import { Result } from '../domain/value-objects'
import { IAuthService } from './interfaces/IAuthService'

/**
 * Login Use Case
 * Implementa la logica di business per il login
 */
export class LoginUseCase {
    constructor(private readonly authService: IAuthService) {}

    async execute(
        email: string,
        password: string,
        rememberMe: boolean = false
    ): Promise<Result<AuthResult>> {
        // 1. Validazione Domain
        const credentialsResult = Credentials.create(email, password, rememberMe)
        
        if (credentialsResult.isFailure) {
            return Result.fail(credentialsResult.getError())
        }

        const credentials = credentialsResult.getValue()

        // 2. Chiamata al servizio
        try {
            const authResult = await this.authService.login(credentials)
            
            if (!authResult.success) {
                return Result.fail(authResult.error || 'Login fallito')
            }

            return Result.ok(authResult)
        } catch (error: any) {
            // Log error per monitoring (senza esporre dettagli sensibili)
            console.error('[LoginUseCase] Error:', error.message)
            return Result.fail('Errore durante il login. Riprova più tardi.')
        }
    }
}

/**
 * Signup Use Case
 * Implementa la logica di business per la registrazione
 */
export class SignupUseCase {
    constructor(private readonly authService: IAuthService) {}

    async execute(
        name: string,
        email: string,
        password: string,
        confirmPassword: string,
        acceptedTerms: boolean
    ): Promise<Result<AuthResult>> {
        console.log('[SignupUseCase.execute] Starting with:', { name, email, acceptedTerms });

        // 1. Verifica accettazione termini
        if (!acceptedTerms) {
            console.log('[SignupUseCase.execute] Terms not accepted');
            return Result.fail('Devi accettare i termini e condizioni')
        }

        // 2. Validazione Domain
        const userResult = User.create(name, email, password, confirmPassword)
        
        if (userResult.isFailure) {
            console.log('[SignupUseCase.execute] Validation failed:', userResult.getError());
            return Result.fail(userResult.getError())
        }

        const user = userResult.getValue()
        console.log('[SignupUseCase.execute] User validated, calling auth service');

        // 3. Chiamata al servizio
        try {
            const authResult = await this.authService.signup(user)
            
            console.log('[SignupUseCase.execute] Auth service response:', authResult);
            
            if (!authResult.success) {
                console.log('[SignupUseCase.execute] Signup failed:', authResult.error);
                return Result.fail(authResult.error || 'Registrazione fallita')
            }

            console.log('[SignupUseCase.execute] Signup successful, returning:', {
                hasUser: !!authResult.user,
                hasToken: !!authResult.token
            });

            return Result.ok(authResult)
        } catch (error: any) {
            // Log error per monitoring
            console.error('[SignupUseCase] Error:', error.message)
            return Result.fail('Errore durante la registrazione. Riprova più tardi.')
        }
    }
}

/**
 * OAuth Login Use Case
 */
export class OAuthLoginUseCase {
    constructor(private readonly authService: IAuthService) {}

    async execute(provider: 'google' | 'github'): Promise<Result<string>> {
        try {
            const redirectUrl = await this.authService.getOAuthUrl(provider)
            return Result.ok(redirectUrl)
        } catch (error: any) {
            console.error('[OAuthLoginUseCase] Error:', error.message)
            return Result.fail(`Errore OAuth con ${provider}`)
        }
    }
}
