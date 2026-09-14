import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { apiRequest } from '@/api/client'
import type { ApiUser, AuthResponse } from '@/api/types'
import { safeStorage } from '@/utils/storage'

interface AuthState {
  token: string | null
  user: ApiUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<ApiUser>
  register: (name: string, email: string, password: string) => Promise<ApiUser>
  loadCurrentUser: () => Promise<ApiUser | null>
  logout: () => void
  clearError: () => void
}

function setAuth(response: AuthResponse, set: (state: Partial<AuthState>) => void): ApiUser {
  set({ token: response.access_token, user: response.user, error: null })
  return response.user
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
          return setAuth(response, set)
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Login failed' })
          throw error
        } finally {
          set({ loading: false })
        }
      },
      register: async (name, email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
          return setAuth(response, set)
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Registration failed' })
          throw error
        } finally {
          set({ loading: false })
        }
      },
      loadCurrentUser: async () => {
        const token = get().token
        if (!token) return null
        set({ loading: true })
        try {
          const user = await apiRequest<ApiUser>('/auth/me', {}, token)
          set({ user, error: null })
          return user
        } catch {
          set({ token: null, user: null })
          return null
        } finally {
          set({ loading: false })
        }
      },
      logout: () => set({ token: null, user: null, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'focusly-auth',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
