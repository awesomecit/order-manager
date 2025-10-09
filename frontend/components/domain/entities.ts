// Domain Layer - Entities

import { Email, Password, Name, Result } from './value-objects'

/**
 * Credentials Entity
 * Rappresenta le credenziali di autenticazione
 */
export class Credentials {
    private constructor(
        public readonly email: Email,
        public readonly password: Password,
        public readonly rememberMe: boolean = false
    ) {}

    static create(
        email: string,
        password: string,
        rememberMe: boolean = false
    ): Result<Credentials> {
        const emailResult = Email.create(email)
        if (emailResult.isFailure) {
            return Result.fail(emailResult.getError())
        }

        const passwordResult = Password.create(password)
        if (passwordResult.isFailure) {
            return Result.fail(passwordResult.getError())
        }

        return Result.ok(
            new Credentials(
                emailResult.getValue(),
                passwordResult.getValue(),
                rememberMe
            )
        )
    }

    toJSON() {
        return {
            email: this.email.getValue(),
            password: this.password.getValue(),
            rememberMe: this.rememberMe
        }
    }
}

/**
 * User Entity (for registration)
 */
export class User {
    private constructor(
        public readonly name: Name,
        public readonly email: Email,
        public readonly password: Password
    ) {}

    static create(
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ): Result<User> {
        const nameResult = Name.create(name)
        if (nameResult.isFailure) {
            return Result.fail(nameResult.getError())
        }

        const emailResult = Email.create(email)
        if (emailResult.isFailure) {
            return Result.fail(emailResult.getError())
        }

        const passwordResult = Password.create(password)
        if (passwordResult.isFailure) {
            return Result.fail(passwordResult.getError())
        }

        const confirmPasswordResult = Password.create(confirmPassword)
        if (confirmPasswordResult.isFailure) {
            return Result.fail('Password di conferma non valida')
        }

        if (!passwordResult.getValue().matches(confirmPasswordResult.getValue())) {
            return Result.fail('Le password non coincidono')
        }

        return Result.ok(
            new User(
                nameResult.getValue(),
                emailResult.getValue(),
                passwordResult.getValue()
            )
        )
    }

    toJSON() {
        return {
            name: this.name.getValue(),
            email: this.email.getValue(),
            password: this.password.getValue()
        }
    }
}

/**
 * AuthResult - Domain Event
 */
export interface AuthResult {
    success: boolean
    token?: string
    user?: {
        id: string
        email: string
        name: string
    }
    error?: string
}
