import { useAuth } from '../context/AuthContext'
import { useTask } from '../context/TaskContext'
import { TasksList } from './TasksList'
import { Header } from './Header'
import styles from './DailyDashboard.module.css'

export function DailyDashboard() {
  const { currentUser, logout } = useAuth()
  const { tasks, assignments, completions, dailyEarnings, loading } = useTask()

  if (!currentUser) return null

  // Get assigned tasks for this user
  const assignedTaskIds = Object.keys(assignments)
  const assignedTasks = assignedTaskIds.map(taskId => ({
    ...tasks[taskId],
    id: taskId,
    amount: assignments[taskId].amount,
    completed: !!completions[taskId],
  }))

  return (
    <div className={styles.container}>
      <Header
        userName={currentUser.displayName}
        onLogout={logout}
      />

      <div className={styles.content}>
        <div className={styles.earningsCard}>
          <h2 className={styles.earningsLabel}>Earned Today</h2>
          <div className={styles.earningsAmount}>₹{dailyEarnings}</div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Tasks</h3>
          {loading ? (
            <div className={styles.loading}>Loading tasks...</div>
          ) : assignedTasks.length === 0 ? (
            <div className={styles.empty}>No tasks assigned</div>
          ) : (
            <TasksList tasks={assignedTasks} />
          )}
        </div>
      </div>
    </div>
  )
}
