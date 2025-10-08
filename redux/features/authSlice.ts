import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  user: any | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error?: string
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: undefined,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.error = undefined
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = undefined
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearError: (state) => {
      state.error = undefined
    },
  },
})

export const { 
  setLoading, 
  setUser, 
  setToken, 
  clearAuth, 
  setError, 
  clearError 
} = authSlice.actions

export default authSlice.reducer 