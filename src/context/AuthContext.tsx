import { createContext, useContext, useState, useCallback } from 'react'
import { db } from '../utils/firebase'
import { ref, get } from 'firebase/database'
import { verifyPasscode } from '../utils/auth'
import { User, Admin, AuthState } from '../types'

interface AuthContextType extends AuthState {
  loginUser: (userId: string, passcode: string) => Promise<void>
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

  const loginUser = useCallback(async (userId: string, passcode: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: undefined }))

      const userRef = ref(db, `users/${userId}`)
      const snapshot = await get(userRef)

      if (!snapshot.exists()) {
        throw new Error('User not found')
      }

      const userData = snapshot.val() as User

      if (!verifyPasscode(passcode, userData.passcodeHash)) {
        throw new Error('Invalid passcode')
      }

      setAuthState(prev => ({
        ...prev,
        currentUser: userData,
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
