// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import * as api from '../../services/api'
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User
} from '../../types/auth'

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isCheckingAuth: true,
}

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.login(credentials)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Login failed'
      )
    }
  }
)

export const registerUser = createAsyncThunk<
  AuthResponse,
  Omit<RegisterCredentials, 'confirmPassword'>,
  { rejectValue: string }
>(
  'auth/register',
  async (credentials: Omit<RegisterCredentials, 'confirmPassword'>, { rejectWithValue }) => {
    try {
      const response = await api.register(credentials)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed'
      )
    }
  }
)

export const validateToken = createAsyncThunk<
  { valid: boolean; username: string; id: string },
  void,
  { rejectValue: string }
>(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Calling validateToken API...')
      const response = await api.validateToken()
      console.log('validateToken API response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('validateToken API error:', error)
      return rejectWithValue(
        error.response?.data?.message || 
        'Token validation failed'
      )
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      state.isCheckingAuth = false
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    clearError: (state: AuthState) => {
      state.error = null
    },
    setCheckingAuth: (state: AuthState, action: PayloadAction<boolean>) => {
      state.isCheckingAuth = action.payload
    },
    setUser: (state: AuthState, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state: AuthState) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state: AuthState, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.isCheckingAuth = false
        state.error = null
        
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(loginUser.rejected, (state: AuthState, action) => {
        state.isLoading = false
        state.isCheckingAuth = false
        state.error = action.payload || 'Login failed'
      })
      // Register cases
      .addCase(registerUser.pending, (state: AuthState) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state: AuthState, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.isCheckingAuth = false
        state.error = null
        
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(registerUser.rejected, (state: AuthState, action) => {
        state.isLoading = false
        state.isCheckingAuth = false
        state.error = action.payload || 'Registration failed'
      })
      // Validate token cases
      .addCase(validateToken.pending, (state: AuthState) => {
        state.isCheckingAuth = true
      })
      .addCase(validateToken.fulfilled, (state: AuthState, action) => {
        console.log('validateToken.fulfilled:', action.payload)
        state.isCheckingAuth = false
        if (action.payload.valid) {
          state.isAuthenticated = true
          // Если у нас еще нет пользователя, создаем базового
          if (!state.user) {
            state.user = {
              id: action.payload.id,
              username: action.payload.username,
              email: '', // Эти поля могут быть заполнены позже
              firstname: '',
              lastname: '',
              birthDate: ''
            }
            console.log('Created new user:', state.user)
          } else {
            // Обновляем информацию о пользователе
            state.user.username = action.payload.username
            state.user.id = action.payload.id
            console.log('Updated existing user:', state.user)
          }
        } else {
          state.isAuthenticated = false
          state.user = null
          state.accessToken = null
          state.refreshToken = null
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      })
      .addCase(validateToken.rejected, (state: AuthState) => {
        state.isCheckingAuth = false
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      })
  },
})

export const { logout, clearError, setCheckingAuth, setUser } = authSlice.actions
export default authSlice.reducer