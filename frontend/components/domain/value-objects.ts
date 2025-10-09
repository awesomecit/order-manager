// Domain Layer - Value Objects

/**
 * Email Value Object
 * Garantisce validità dell'email secondo RFC 5322
 */
export class Email {
    private readonly value: string

    private constructor(email: string) {
        this.value = email
    }

    static create(email: string): Result<Email> {
        if (!email || email.trim().length === 0) {
            return Result.fail('Email è obbligatoria')
        }

        // RFC 5322 Email Validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        
        if (!emailRegex.test(email)) {
            return Result.fail('Formato email non valido')
        }

        return Result.ok(new Email(email))
    }

    getValue(): string {
        return this.value
    }

    equals(other: Email): boolean {
        return this.value === other.value
    }
}

/**
 * Password Value Object
 * Applica policy di sicurezza password
 */
export class Password {
    private readonly value: string

    private constructor(password: string) {
        this.value = password
    }

    static create(password: string): Result<Password> {
        if (!password || password.length < 8) {
            return Result.fail('La password deve contenere almeno 8 caratteri')
        }

        // Verifica complessità password
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumbers = /\d/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            return Result.fail(
                'La password deve contenere maiuscole, minuscole, numeri e caratteri speciali'
            )
        }

        // Controlla password comuni (top 10k passwords)
        const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password1']
        if (commonPasswords.includes(password.toLowerCase())) {
            return Result.fail('Password troppo comune, scegline una più sicura')
        }

        return Result.ok(new Password(password))
    }

    getValue(): string {
        return this.value
    }

    matches(other: Password): boolean {
        return this.value === other.value
    }
}

/**
 * Name Value Object
 */
export class Name {
    private readonly value: string

    private constructor(name: string) {
        this.value = name
    }

    static create(name: string): Result<Name> {
        if (!name || name.trim().length === 0) {
            return Result.fail('Il nome è obbligatorio')
        }

        if (name.trim().length < 2) {
            return Result.fail('Il nome deve contenere almeno 2 caratteri')
        }

        if (name.length > 100) {
            return Result.fail('Il nome non può superare 100 caratteri')
        }

        // Sanitize input (XSS prevention)
        const sanitized = name.trim().replace(/[<>]/g, '')

        return Result.ok(new Name(sanitized))
    }

    getValue(): string {
        return this.value
    }
}

/**
 * Result Pattern per gestione errori type-safe
 */
export class Result<T> {
    public readonly isSuccess: boolean
    public readonly isFailure: boolean
    public readonly error?: string
    private readonly _value?: T

    private constructor(isSuccess: boolean, error?: string, value?: T) {
        if (isSuccess && error) {
            throw new Error('Cannot create success result with error')
        }
        if (!isSuccess && !error) {
            throw new Error('Cannot create failure result without error')
        }

        this.isSuccess = isSuccess
        this.isFailure = !isSuccess
        this.error = error
        this._value = value

        Object.freeze(this)
    }

    static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value)
    }

    static fail<U>(error: string): Result<U> {
        return new Result<U>(false, error)
    }

    getValue(): T {
        if (!this.isSuccess) {
            throw new Error('Cannot get value from failed result')
        }
        return this._value as T
    }

    getError(): string {
        if (this.isSuccess) {
            throw new Error('Cannot get error from successful result')
        }
        return this.error as string
    }
}
