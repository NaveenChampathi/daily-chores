import { CheckCircle, BarChart3, Settings } from 'lucide-react'
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
        title="Today"
      >
        <CheckCircle size={24} />
        <span>Today</span>
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'monthly' ? styles.active : ''}`}
        onClick={() => onTabChange('monthly')}
        title="Monthly"
      >
        <BarChart3 size={24} />
        <span>Month</span>
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
        onClick={() => onTabChange('settings')}
        title="Settings"
      >
        <Settings size={24} />
        <span>Settings</span>
      </button>
    </nav>
  )
}
