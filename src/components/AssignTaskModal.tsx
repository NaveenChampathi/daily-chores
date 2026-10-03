import { useState, useEffect } from 'react'
import { db } from '../utils/firebase'
import { ref, get, set } from 'firebase/database'
import { User, Task } from '../types'
import styles from './AssignTaskModal.module.css'

interface AssignTaskModalProps {
  onClose: () => void
  onSuccess: () => void
  users: Record<string, User>
  tasks: Record<string, Task>
}

export function AssignTaskModal({ onClose, onSuccess, users, tasks }: AssignTaskModalProps) {
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({})
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing assignments for selected user
  useEffect(() => {
    if (!selectedUser) return

    const loadAssignments = async () => {
      try {
        const assignmentRef = ref(db, `assignments/${selectedUser}`)
        const snapshot = await get(assignmentRef)

        if (snapshot.exists()) {
          const assignments = snapshot.val()
          const taskIds = Object.keys(assignments)
          setSelectedTasks(
            Object.keys(tasks).reduce((acc, taskId) => {
              acc[taskId] = taskIds.includes(taskId)
              return acc
            }, {} as Record<string, boolean>)
          )
        } else {
          setSelectedTasks(Object.keys(tasks).reduce((acc, taskId) => {
            acc[taskId] = false
            return acc
          }, {} as Record<string, boolean>))
        }
      } catch (err) {
        console.error('Failed to load assignments:', err)
      }
    }

    loadAssignments()
  }, [selectedUser, tasks])

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedUser) {
      setError('Please select a user')
      return
    }

    const selectedTaskIds = Object.entries(selectedTasks)
      .filter(([_, selected]) => selected)
      .map(([taskId, _]) => taskId)

    if (selectedTaskIds.length === 0) {
      setError('Please select at least one task')
      return
    }

    try {
      setLoading(true)
      const assignmentRef = ref(db, `assignments/${selectedUser}`)
      const newAssignments: Record<string, any> = {}

      for (const taskId of selectedTaskIds) {
        const amount = customAmounts[taskId] ? parseInt(customAmounts[taskId]) : tasks[taskId].amount
        if (isNaN(amount) || amount <= 0) {
          setError(`Invalid amount for ${tasks[taskId].name}`)
          setLoading(false)
          return
        }
        newAssignments[taskId] = {
          assignedAt: Date.now(),
          amount,
        }
      }

      await set(assignmentRef, newAssignments)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to assign tasks:', err)
      setError('Failed to assign tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Assign Tasks</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.group}>
            <label>Select User *</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              disabled={loading}
              className={styles.select}
            >
              <option value="">-- Choose a user --</option>
              {Object.entries(users).map(([userId, user]) => (
                <option key={userId} value={userId}>
                  {user.displayName} ({userId})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className={styles.tasksGroup}>
              <label>Select Tasks *</label>
              <div className={styles.tasksList}>
                {Object.entries(tasks).map(([taskId, task]) => (
                  <div key={taskId} className={styles.taskItem}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={selectedTasks[taskId] || false}
                        onChange={() => handleToggleTask(taskId)}
                        disabled={loading}
                      />
                      <span className={styles.taskLabel}>{task.name}</span>
                    </label>
                    {selectedTasks[taskId] && (
                      <input
                        type="number"
                        value={customAmounts[taskId] || task.amount}
                        onChange={e =>
                          setCustomAmounts(prev => ({
                            ...prev,
                            [taskId]: e.target.value,
                          }))
                        }
                        placeholder={`₹${task.amount}`}
                        className={styles.amountInput}
                        disabled={loading}
                        min="1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttons}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !selectedUser}
            >
              {loading ? 'Assigning...' : 'Assign Tasks'}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
