import { TaskCard } from './TaskCard'
import styles from './TasksList.module.css'

interface TaskItem {
  id: string
  name: string
  amount: number
  completed: boolean
}

export function TasksList({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className={styles.list}>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
