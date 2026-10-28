import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ApiError, apiRequest } from '@/api/client'
import { resetAccountData, restoreAnonymousData } from '@/api/sync'
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
  updateAvatar: (avatar: string | null) => Promise<void>
  logout: () => void
  clearError: () => void
}

function setAuth(response: AuthResponse, set: (state: Partial<AuthState>) => void): ApiUser {
  resetAccountData()
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
          if (get().token !== token) return null
          set({ user, error: null })
          return user
        } catch (error) {
          if (get().token !== token) return null
          if (error instanceof ApiError && error.status === 401) {
            get().logout()
            return null
          }
          set({ error: error instanceof Error ? error.message : 'Unable to load account' })
          return get().user
        } finally {
          set({ loading: false })
        }
      },
      updateAvatar: async (avatar) => {
        const token = get().token
        if (!token) throw new Error('Not signed in')
        const user = await apiRequest<ApiUser>('/auth/me/avatar', { method: 'PUT', body: JSON.stringify({ avatar }) }, token)
        if (get().token === token) set({ user })
      },
      logout: () => {
        set({ token: null, user: null, error: null })
        restoreAnonymousData()
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'focusly-auth',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
