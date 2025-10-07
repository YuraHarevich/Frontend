export interface User {
  id: string
  username: string
  email: string
  firstname: string
  lastname: string
  birthDate: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  firstname: string
  lastname: string
  birthDate: string
  confirmPassword?: string
}

export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface ProtectedData {
  message: string
  userId: string
  data?: any
}