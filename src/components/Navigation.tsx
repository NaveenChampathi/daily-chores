import styles from './Navigation.module.css'

interface NavigationProps {
  activeTab: 'daily' | 'monthly'
  onTabChange: (tab: 'daily' | 'monthly') => void
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
    </nav>
  )
}
