// Index - Public API exports

// Domain Layer
export { Email, Password, Name, Result } from './domain/value-objects'
export { Credentials, User } from './domain/entities'
export type { AuthResult } from './domain/entities'

// Application Layer
export { LoginUseCase, SignupUseCase, OAuthLoginUseCase } from './application/use-cases'
export type { IAuthService, ITokenStorage, IValidationService } from './application/interfaces/IAuthService'

// Infrastructure Layer
export { AuthService } from './infrastructure/auth-service'
export { HttpClient, HttpError } from './infrastructure/http-client'
export type { RequestOptions } from './infrastructure/http-client'

// Presentation Layer
export { useAuth, useFormValidation } from './presentation/hooks/useAuth'
export { default as LoginComponent } from './login-component-refactored'
