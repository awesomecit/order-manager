import { useState } from 'react'
import { LoginRequest, LoginResponse, ApiError } from '../../shared/types/auth.types'

interface FormData {
    name: string
    email: string
    password: string
    confirmPassword: string
    remember: boolean
    acceptTerms: boolean
}

interface Message {
    type: 'success' | 'error' | 'info'
    text: string
}

export default function LoginComponent() {
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        remember: false,
        acceptTerms: false
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<Message | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const validateForm = (): boolean => {
        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Email e password sono obbligatori.' })
            return false
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setMessage({ type: 'error', text: 'Inserisci un indirizzo email valido.' })
            return false
        }
        if (formData.password.length < 8) {
            setMessage({ type: 'error', text: 'La password deve contenere almeno 8 caratteri.' })
            return false
        }
        if (!isLogin) {
            if (!formData.name) {
                setMessage({ type: 'error', text: 'Il nome è obbligatorio.' })
                return false
            }
            if (formData.password !== formData.confirmPassword) {
                setMessage({ type: 'error', text: 'Le password non coincidono.' })
                return false
            }
            if (!formData.acceptTerms) {
                setMessage({ type: 'error', text: 'Devi accettare i termini e condizioni.' })
                return false
            }
        }
        return true
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (!validateForm()) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    remember: formData.remember
                })
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Login effettuato con successo!' })
                // TODO: Gestisci token JWT e redirect
                console.log('Login successful:', data)
            } else {
                setMessage({ type: 'error', text: data.message || 'Errore durante il login.' })
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Si è verificato un errore imprevisto.' })
            console.error('Login failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (!validateForm()) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Registrazione completata! Effettua il login.' })
                setIsLogin(true)
            } else {
                setMessage({ type: 'error', text: data.message || 'Errore durante la registrazione.' })
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Si è verificato un errore imprevisto.' })
            console.error('Signup failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOAuthLogin = (provider: 'google' | 'github') => {
        // TODO: Implementa OAuth redirect
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/auth/oauth/${provider}`
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    {/* Header */}
                    <h2 className="card-title text-3xl font-bold text-center justify-center mb-4">
                        {isLogin ? 'Login' : 'Registrazione'}
                    </h2>

                    {/* Message Alert */}
                    {message && (
                        <div className={`alert ${message.type === 'success' ? 'alert-success' : message.type === 'error' ? 'alert-error' : 'alert-info'} mb-4`} role="alert">
                            <span>{message.text}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                        {/* Name field (only for signup) */}
                        {!isLogin && (
                            <div className="form-control">
                                <label className="label" htmlFor="name">
                                    <span className="label-text">Nome completo</span>
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Mario Rossi"
                                    className="input input-bordered w-full"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {/* Email field */}
                        <div className="form-control">
                            <label className="label" htmlFor="email">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="email@example.com"
                                className="input input-bordered w-full"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                                aria-required="true"
                            />
                        </div>

                        {/* Password field */}
                        <div className="form-control">
                            <label className="label" htmlFor="password">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={formData.password}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                                aria-required="true"
                            />
                            {isLogin && (
                                <label className="label">
                                    <a href="#" className="label-text-alt link link-hover">Password dimenticata?</a>
                                </label>
                            )}
                        </div>

                        {/* Confirm Password field (only for signup) */}
                        {!isLogin && (
                            <div className="form-control">
                                <label className="label" htmlFor="confirmPassword">
                                    <span className="label-text">Conferma Password</span>
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="input input-bordered w-full"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {/* Remember me checkbox (only for login) */}
                        {isLogin && (
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-2">
                                    <input
                                        name="remember"
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={formData.remember}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                    <span className="label-text">Ricordami</span>
                                </label>
                            </div>
                        )}

                        {/* Accept terms checkbox (only for signup) */}
                        {!isLogin && (
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-2">
                                    <input
                                        name="acceptTerms"
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={formData.acceptTerms}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        required={!isLogin}
                                    />
                                    <span className="label-text">
                                        Accetto i <a href="#" className="link link-primary">termini e condizioni</a>
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Submit button */}
                        <div className="form-control mt-6">
                            <button 
                                type="submit" 
                                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Caricamento...' : isLogin ? 'Accedi' : 'Registrati'}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="divider">OPPURE</div>

                    {/* OAuth buttons */}
                    <div className="space-y-2">
                        <button
                            onClick={() => handleOAuthLogin('google')}
                            className="btn btn-outline w-full gap-2"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continua con Google
                        </button>
                        
                        <button
                            onClick={() => handleOAuthLogin('github')}
                            className="btn btn-outline w-full gap-2"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            Continua con GitHub
                        </button>
                    </div>

                    {/* Toggle login/signup */}
                    <div className="text-center mt-4">
                        <p className="text-sm">
                            {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setMessage(null)
                                }}
                                className="link link-primary ml-1"
                                type="button"
                                disabled={loading}
                            >
                                {isLogin ? 'Registrati' : 'Accedi'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}