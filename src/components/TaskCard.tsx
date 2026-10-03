import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTask } from '../context/TaskContext'
import styles from './TaskCard.module.css'

interface TaskItem {
  id: string
  name: string
  amount: number
  completed: boolean
}

export function TaskCard({ task }: { task: TaskItem }) {
  const { currentUser } = useAuth()
  const { markTaskComplete } = useTask()
  const [marking, setMarking] = useState(false)

  const handleMarkComplete = async () => {
    if (!currentUser) return

    setMarking(true)
    try {
      await markTaskComplete(task.id, currentUser.id)
    } catch (err) {
      console.error('Failed to mark task complete:', err)
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className={`${styles.card} ${task.completed ? styles.completed : ''}`}>
      <div className={styles.left}>
        <div className={styles.name}>{task.name}</div>
        <div className={styles.value}>₹{task.amount}</div>
        <div className={styles.status}>
          {task.completed ? 'Completed' : 'Not completed'}
        </div>
      </div>
      <div className={styles.right}>
        <button
          className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
          onClick={handleMarkComplete}
          disabled={marking || task.completed}
          aria-label={`Mark ${task.name} complete`}
        >
          {task.completed ? '✓' : ''}
        </button>
      </div>
    </div>
  )
}
