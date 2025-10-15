// services/api.ts
import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  TokenRefreshResponse,
  ProtectedData
} from '../types/auth'

const API_BASE_URL = 'http://localhost:8000'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Переменная для отслеживания текущего refresh запроса
let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null

// Функция для обновления токена
const refreshAuthToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios.post<TokenRefreshResponse>(
    `${API_BASE_URL}/api/v1/auth/refresh`,
    { refreshToken }
  )
  
  const { accessToken, refreshToken: newRefreshToken } = response.data
  return { accessToken, refreshToken: newRefreshToken }
}

// Функция для выполнения refresh с защитой от множественных вызовов
const executeRefresh = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  // Если уже есть активный refresh запрос, возвращаем его промис
  if (refreshPromise) {
    console.log('Refresh already in progress, waiting...')
    return refreshPromise
  }

  try {
    console.log('Starting token refresh...')
    refreshPromise = refreshAuthToken()
    const tokens = await refreshPromise
    return tokens
  } finally {
    // Очищаем промис после завершения (успешного или неудачного)
    refreshPromise = null
  }
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor для автоматического обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        console.log('Access token expired, attempting refresh...')
        const tokens = await executeRefresh()
        
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
        console.log('Token refreshed successfully, retrying request...')
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const login = (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> =>
  api.post<AuthResponse>('/api/v1/auth/sign-in', credentials)

export const register = (credentials: Omit<RegisterCredentials, 'confirmPassword'>): Promise<AxiosResponse<AuthResponse>> =>
  api.post<AuthResponse>('/api/v1/auth/sign-up', credentials)

export const refreshToken = (refreshToken: string): Promise<AxiosResponse<TokenRefreshResponse>> =>
  api.post<TokenRefreshResponse>('/api/v1/auth/refresh', { refreshToken })

export const validateToken = (): Promise<AxiosResponse<{valid: boolean; username: string; id: string}>> => {
  const token = localStorage.getItem('accessToken')
  return api.post(`/api/v1/auth/validate?token=${token}`)
}

export const getProtectedData = (): Promise<AxiosResponse<ProtectedData>> => 
  api.get<ProtectedData>('/api/v1/protected')

export default api