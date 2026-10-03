import { createContext, useContext, useState, useCallback } from 'react'
import { db } from '../utils/firebase'
import { ref, get } from 'firebase/database'
import { verifyPasscode } from '../utils/auth'
import { User, Admin, AuthState } from '../types'

interface AuthContextType extends AuthState {
  loginUser: (passcode: string) => Promise<void>
  loginAdmin: (adminId: string, passcode: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    currentAdmin: null,
    loading: false,
    error: undefined,
  })

  const loginUser = useCallback(async (passcode: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: undefined }))

      const usersRef = ref(db, 'users')
      const snapshot = await get(usersRef)

      if (!snapshot.exists()) {
        throw new Error('No users found')
      }

      const users = snapshot.val() as Record<string, User>

      // Find user with matching passcode
      let matchedUser: User | null = null
      for (const userId in users) {
        const user = users[userId]
        if (verifyPasscode(passcode, user.passcodeHash)) {
          matchedUser = user
          break
        }
      }

      if (!matchedUser) {
        throw new Error('Invalid passcode')
      }

      setAuthState(prev => ({
        ...prev,
        currentUser: matchedUser,
        currentAdmin: null,
        loading: false,
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw err
    }
  }, [])

  const loginAdmin = useCallback(async (adminId: string, passcode: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: undefined }))

      const adminRef = ref(db, `admins/${adminId}`)
      const snapshot = await get(adminRef)

      if (!snapshot.exists()) {
        throw new Error('Admin not found')
      }

      const adminData = snapshot.val() as Admin

      if (!verifyPasscode(passcode, adminData.passcodeHash)) {
        throw new Error('Invalid passcode')
      }

      setAuthState(prev => ({
        ...prev,
        currentAdmin: adminData,
        currentUser: null,
        loading: false,
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    setAuthState({
      currentUser: null,
      currentAdmin: null,
      loading: false,
      error: undefined,
    })
  }, [])

  const value: AuthContextType = {
    ...authState,
    loginUser,
    loginAdmin,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
