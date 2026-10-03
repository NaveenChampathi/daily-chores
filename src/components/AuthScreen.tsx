import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AuthScreen.module.css'

type LoginMode = 'user' | 'admin'

export function AuthScreen() {
  const { loginUser, loginAdmin, loading, error } = useAuth()
  const [mode, setMode] = useState<LoginMode>('user')
  const [adminId, setAdminId] = useState('')
  const [passcode, setPasscode] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!passcode.trim()) {
      setLocalError('Please enter your passcode')
      return
    }

    try {
      await loginUser(passcode)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setLocalError(msg)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!adminId.trim() || !passcode.trim()) {
      setLocalError('Please fill in all fields')
      return
    }

    try {
      await loginAdmin(adminId.trim(), passcode)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setLocalError(msg)
    }
  }

  const currentError = localError || error

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Daily Chores</h1>
        <p className={styles.subtitle}>Track tasks and earnings</p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'user' ? styles.active : ''}`}
            onClick={() => {
              setMode('user')
              setLocalError(null)
              setAdminId('')
            }}
          >
            User Login
          </button>
          <button
            className={`${styles.tab} ${mode === 'admin' ? styles.active : ''}`}
            onClick={() => {
              setMode('admin')
              setLocalError(null)
              setPasscode('')
            }}
          >
            Admin Login
          </button>
        </div>

        {mode === 'user' ? (
          <form onSubmit={handleUserLogin} className={styles.form}>
            <div className={styles.group}>
              <label htmlFor="passcode">Passcode</label>
              <input
                id="passcode"
                type="password"
                placeholder="Enter your passcode"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            {currentError && <div className={styles.error}>{currentError}</div>}
            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className={styles.form}>
            <div className={styles.group}>
              <label htmlFor="adminId">Admin ID</label>
              <input
                id="adminId"
                type="text"
                placeholder="Enter your admin ID"
                value={adminId}
                onChange={e => setAdminId(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <div className={styles.group}>
              <label htmlFor="passcode">Passcode</label>
              <input
                id="passcode"
                type="password"
                placeholder="Enter your passcode"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                disabled={loading}
              />
            </div>
            {currentError && <div className={styles.error}>{currentError}</div>}
            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
