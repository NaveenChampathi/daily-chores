import { useState } from 'react'
import { Lock, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/firebase'
import { ref, update } from 'firebase/database'
import { hashPasscode } from '../utils/auth'
import { Header } from './Header'
import styles from './SettingsScreen.module.css'

export function SettingsScreen() {
  const { currentUser, logout } = useAuth()
  const [showChangePasscode, setShowChangePasscode] = useState(false)
  const [currentPasscode, setCurrentPasscode] = useState('')
  const [newPasscode, setNewPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!currentUser) return null

  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!currentPasscode || !newPasscode || !confirmPasscode) {
      setError('Please fill in all fields')
      return
    }

    if (newPasscode !== confirmPasscode) {
      setError('New passcodes do not match')
      return
    }

    if (newPasscode.length < 4) {
      setError('Passcode must be at least 4 characters')
      return
    }

    try {
      setLoading(true)
      const newHash = hashPasscode(newPasscode)
      const userRef = ref(db, `users/${currentUser.id}`)
      await update(userRef, { passcodeHash: newHash })

      setSuccess('Passcode changed successfully!')
      setCurrentPasscode('')
      setNewPasscode('')
      setConfirmPasscode('')
      setShowChangePasscode(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to change passcode:', err)
      setError('Failed to change passcode')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Header userName={currentUser.displayName} onLogout={logout} />

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account Settings</h2>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>User ID</div>
            <div className={styles.settingValue}>{currentUser.id}</div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>Display Name</div>
            <div className={styles.settingValue}>{currentUser.displayName}</div>
          </div>

          <button
            className={styles.settingButton}
            onClick={() => setShowChangePasscode(!showChangePasscode)}
          >
            <Lock size={18} />
            <span>{showChangePasscode ? 'Cancel' : 'Change Passcode'}</span>
          </button>

          {showChangePasscode && (
            <form onSubmit={handleChangePasscode} className={styles.form}>
              <div className={styles.group}>
                <label>Current Passcode</label>
                <input
                  type="password"
                  value={currentPasscode}
                  onChange={e => setCurrentPasscode(e.target.value)}
                  placeholder="Enter current passcode"
                  disabled={loading}
                />
              </div>

              <div className={styles.group}>
                <label>New Passcode</label>
                <input
                  type="password"
                  value={newPasscode}
                  onChange={e => setNewPasscode(e.target.value)}
                  placeholder="Enter new passcode"
                  disabled={loading}
                />
              </div>

              <div className={styles.group}>
                <label>Confirm Passcode</label>
                <input
                  type="password"
                  value={confirmPasscode}
                  onChange={e => setConfirmPasscode(e.target.value)}
                  placeholder="Confirm new passcode"
                  disabled={loading}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Passcode'}
              </button>
            </form>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <div className={styles.aboutText}>
            <p>Daily Chores v1.0</p>
            <p>Track your tasks and earnings daily</p>
          </div>
        </div>

        <div className={styles.dangerZone}>
          <button className={styles.logoutButton} onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className={styles.bottomSpacer} />
    </div>
  )
}
