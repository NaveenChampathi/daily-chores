import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTask } from '../context/TaskContext'
import { db } from '../utils/firebase'
import { ref, get } from 'firebase/database'
import { getCurrentMonth } from '../utils/auth'
import { Header } from './Header'
import styles from './MonthlySummary.module.css'

interface DailyEntry {
  date: string
  amount: number
}

export function MonthlySummary() {
  const { currentUser, logout } = useAuth()
  const { tasks, assignments, monthlyEarnings } = useTask()
  const [dailyHistory, setDailyHistory] = useState<DailyEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    const loadDailyHistory = async () => {
      try {
        const month = getCurrentMonth()
        const dailyRef = ref(db, `dailyEarnings/${month}`)
        const snapshot = await get(dailyRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          const userDailyEarnings = data[currentUser.id] || {}

          // Convert to array and sort by date
          const entries = Object.entries(userDailyEarnings).map(([date, amount]) => ({
            date,
            amount: amount as number,
          }))
          entries.sort((a, b) => b.date.localeCompare(a.date))
          setDailyHistory(entries)
        }
        setLoading(false)
      } catch (err) {
        console.error('Failed to load daily history:', err)
        setLoading(false)
      }
    }

    loadDailyHistory()
  }, [currentUser])

  if (!currentUser) return null

  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const taskBreakdown = Object.entries(assignments).map(([taskId, assignment]) => ({
    taskId,
    taskName: tasks[taskId]?.name || 'Unknown',
    amount: assignment.amount,
  }))

  return (
    <div className={styles.container}>
      <Header userName={currentUser.displayName} onLogout={logout} />

      <div className={styles.content}>
        <div className={styles.earningsCard}>
          <h2 className={styles.earningsLabel}>Total Earned</h2>
          <div className={styles.earningsAmount}>₹{monthlyEarnings}</div>
          <div className={styles.earningsSubtext}>{month}</div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Summary</h3>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Days Active</div>
            <div className={styles.statValue}>{dailyHistory.length}</div>
          </div>
          {dailyHistory.length > 0 && (
            <>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Daily Average</div>
                <div className={styles.statValue}>
                  ₹{Math.round(monthlyEarnings / dailyHistory.length)}
                </div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Highest Day</div>
                <div className={styles.statValue}>
                  ₹{Math.max(...dailyHistory.map(d => d.amount))}
                </div>
              </div>
            </>
          )}
        </div>

        {taskBreakdown.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Task Assignments</h3>
            {taskBreakdown.map(task => (
              <div key={task.taskId} className={styles.taskBreakdown}>
                <div className={styles.taskName}>{task.taskName}</div>
                <div className={styles.taskAmount}>₹{task.amount}</div>
              </div>
            ))}
          </div>
        )}

        {dailyHistory.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Daily History</h3>
            <div className={styles.history}>
              {dailyHistory.map(entry => (
                <div key={entry.date} className={styles.historyItem}>
                  <div className={styles.historyDate}>{entry.date}</div>
                  <div className={styles.historyAmount}>₹{entry.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && <div className={styles.loading}>Loading...</div>}
      </div>

      <div className={styles.bottomSpacer} />
    </div>
  )
}
