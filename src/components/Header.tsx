import { useState } from 'react'
import styles from './Header.module.css'

export function Header({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const [showMenu, setShowMenu] = useState(false)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.left}>
          <h1 className={styles.title}>Daily Chores</h1>
          <p className={styles.date}>{today}</p>
        </div>
        <div className={styles.right}>
          <div className={styles.userGreeting}>Hi, {userName}</div>
          <button
            className={styles.menu}
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Menu"
          >
            ☰
          </button>
          {showMenu && (
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  onLogout()
                  setShowMenu(false)
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
