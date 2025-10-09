export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
}

export interface UserInfo {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export type UserRole = 'SYSTEM_ADMIN' | 'ADMIN' | 'USER' | 'CUSTOMER'

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  acceptTerms: boolean
}

export interface SignupResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}