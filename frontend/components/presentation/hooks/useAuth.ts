// Presentation Layer - Custom Hooks

import { useState, useCallback } from 'react'
import { LoginUseCase, SignupUseCase, OAuthLoginUseCase } from '../../application/use-cases'
import { Result } from '../../domain/value-objects'

/**
 * useAuth Hook
 * Gestisce la logica di autenticazione
 */
export function useAuth(
    loginUseCase: LoginUseCase,
    signupUseCase: SignupUseCase,
    oauthUseCase: OAuthLoginUseCase
) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const login = useCallback(
        async (email: string, password: string, rememberMe: boolean = false) => {
            setLoading(true)
            setError(null)
            setSuccess(null)

            const result = await loginUseCase.execute(email, password, rememberMe)

            setLoading(false)

            if (result.isFailure) {
                setError(result.getError())
                return Result.fail(result.getError())
            }

            const authResult = result.getValue()
            
            // Salva token
            if (authResult.token) {
                const storage = rememberMe ? localStorage : sessionStorage
                storage.setItem('auth_token', authResult.token)
            }

            setSuccess('Login effettuato con successo!')
            return Result.ok(authResult)
        },
        [loginUseCase]
    )

    const signup = useCallback(
        async (
            name: string,
            email: string,
            password: string,
            confirmPassword: string,
            acceptedTerms: boolean
        ) => {
            setLoading(true)
            setError(null)
            setSuccess(null)

            const result = await signupUseCase.execute(
                name,
                email,
                password,
                confirmPassword,
                acceptedTerms
            )

            setLoading(false)

            if (result.isFailure) {
                setError(result.getError())
                return Result.fail(result.getError())
            }

            setSuccess('Registrazione completata! Effettua il login.')
            return Result.ok(result.getValue())
        },
        [signupUseCase]
    )

    const loginWithOAuth = useCallback(
        async (provider: 'google' | 'github') => {
            const result = await oauthUseCase.execute(provider)

            if (result.isFailure) {
                setError(result.getError())
                return
            }

            // Redirect to OAuth provider
            window.location.href = result.getValue()
        },
        [oauthUseCase]
    )

    const clearMessages = useCallback(() => {
        setError(null)
        setSuccess(null)
    }, [])

    return {
        loading,
        error,
        success,
        login,
        signup,
        loginWithOAuth,
        clearMessages
    }
}

/**
 * useFormValidation Hook
 * Gestisce la validazione real-time dei form
 */
export function useFormValidation() {
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateEmail = useCallback((email: string) => {
        if (!email) {
            setErrors(prev => ({ ...prev, email: 'Email obbligatoria' }))
            return false
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors(prev => ({ ...prev, email: 'Email non valida' }))
            return false
        }
        setErrors(prev => {
            const { email, ...rest } = prev
            return rest
        })
        return true
    }, [])

    const validatePassword = useCallback((password: string) => {
        if (!password) {
            setErrors(prev => ({ ...prev, password: 'Password obbligatoria' }))
            return false
        }
        if (password.length < 8) {
            setErrors(prev => ({ ...prev, password: 'Minimo 8 caratteri' }))
            return false
        }
        setErrors(prev => {
            const { password, ...rest } = prev
            return rest
        })
        return true
    }, [])

    const validateName = useCallback((name: string) => {
        if (!name || name.trim().length < 2) {
            setErrors(prev => ({ ...prev, name: 'Nome non valido' }))
            return false
        }
        setErrors(prev => {
            const { name, ...rest } = prev
            return rest
        })
        return true
    }, [])

    const clearErrors = useCallback(() => {
        setErrors({})
    }, [])

    return {
        errors,
        validateEmail,
        validatePassword,
        validateName,
        clearErrors
    }
}
