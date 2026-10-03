import { useState } from 'react'
import { DailyDashboard } from './DailyDashboard'
import { MonthlySummary } from './MonthlySummary'
import { SettingsScreen } from './SettingsScreen'
import { Navigation } from './Navigation'
import styles from './UserDashboard.module.css'

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'settings'>('daily')

  return (
    <div className={styles.container}>
      {activeTab === 'daily' && <DailyDashboard />}
      {activeTab === 'monthly' && <MonthlySummary />}
      {activeTab === 'settings' && <SettingsScreen />}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
