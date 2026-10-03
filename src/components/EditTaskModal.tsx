import { useState } from 'react'
import { db } from '../utils/firebase'
import { ref, update, remove } from 'firebase/database'
import { Task } from '../types'
import styles from './EditTaskModal.module.css'

interface EditTaskModalProps {
  task: Task & { id: string }
  onClose: () => void
  onSuccess: () => void
}

export function EditTaskModal({ task, onClose, onSuccess }: EditTaskModalProps) {
  const [name, setName] = useState(task.name)
  const [description, setDescription] = useState(task.description || '')
  const [amount, setAmount] = useState(task.amount.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !amount.trim()) {
      setError('Please fill in task name and amount')
      return
    }

    const amountNum = parseInt(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number')
      return
    }

    try {
      setLoading(true)
      const taskRef = ref(db, `tasks/${task.id}`)
      await update(taskRef, {
        name: name.trim(),
        description: description.trim() || undefined,
        amount: amountNum,
      })

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to update task:', err)
      setError('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      setLoading(true)
      const taskRef = ref(db, `tasks/${task.id}`)
      await remove(taskRef)

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to delete task:', err)
      setError('Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Edit Task</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.group}>
            <label>Task Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.group}>
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.group}>
            <label>Amount (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={loading}
              min="1"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttons}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Updating...' : 'Update Task'}
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

        {!showDeleteConfirm ? (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={loading}
          >
            🗑️ Delete Task
          </button>
        ) : (
          <div className={styles.deleteConfirm}>
            <p>Delete this task? This cannot be undone.</p>
            <div className={styles.confirmButtons}>
              <button
                className={styles.confirmDeleteBtn}
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                className={styles.cancelDeleteBtn}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
