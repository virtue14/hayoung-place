import { create } from 'zustand'
import { api } from '@/lib/api/axios'

interface User {
    id: string
    email: string
    name: string
    nickname: string
    picture?: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    setUser: (user: User | null) => void
    login: (accessToken: string, refreshToken: string) => void
    logout: () => void
    initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
    login: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        set({ isLoading: true })
    },
    logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        delete api.defaults.headers.common['Authorization']
        set({ user: null, isAuthenticated: false, isLoading: false })
    },
    initialize: async () => {
        try {
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) {
                set({ isLoading: false })
                return
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            const { data: user } = await api.get<User>('/api/users/me')
            set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
            console.error('Failed to initialize auth:', error)
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            delete api.defaults.headers.common['Authorization']
            set({ user: null, isAuthenticated: false, isLoading: false })
        }
    }
})) 