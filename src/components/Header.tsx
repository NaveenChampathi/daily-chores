import { useState } from 'react'
import { Menu, LogOut } from 'lucide-react'
import styles from './Header.module.css'

export function Header({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.userName}>{userName}</div>
        </div>
        <div className={styles.right}>
          <button
            className={styles.menuBtn}
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Menu"
          >
            <Menu size={24} />
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
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
