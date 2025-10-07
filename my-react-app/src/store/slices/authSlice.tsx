import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import * as api from '../../services/api'
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse
} from '../../types/auth'

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
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
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    clearError: (state: AuthState) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.error = null
        
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(loginUser.rejected, (state: AuthState, action) => {
        state.isLoading = false
        state.error = action.payload || 'Login failed'
      })
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
        state.error = null
        
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(registerUser.rejected, (state: AuthState, action) => {
        state.isLoading = false
        state.error = action.payload || 'Registration failed'
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer