import styles from './Navigation.module.css'

interface NavigationProps {
  activeTab: 'daily' | 'monthly' | 'settings'
  onTabChange: (tab: 'daily' | 'monthly' | 'settings') => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className={styles.nav}>
      <button
        className={`${styles.tab} ${activeTab === 'daily' ? styles.active : ''}`}
        onClick={() => onTabChange('daily')}
      >
        <span className={styles.icon}>📋</span>
        <span>Today</span>
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'monthly' ? styles.active : ''}`}
        onClick={() => onTabChange('monthly')}
      >
        <span className={styles.icon}>📊</span>
        <span>Month</span>
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
        onClick={() => onTabChange('settings')}
      >
        <span className={styles.icon}>⚙️</span>
        <span>Settings</span>
      </button>
    </nav>
  )
}
