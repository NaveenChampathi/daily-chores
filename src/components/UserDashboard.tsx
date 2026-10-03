import { useState } from 'react'
import { DailyDashboard } from './DailyDashboard'
import { MonthlySummary } from './MonthlySummary'
import { Navigation } from './Navigation'
import styles from './UserDashboard.module.css'

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily')

  return (
    <div className={styles.container}>
      {activeTab === 'daily' ? <DailyDashboard /> : <MonthlySummary />}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
