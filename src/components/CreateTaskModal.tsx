import { useState } from 'react'
import { db } from '../utils/firebase'
import { ref, set, push } from 'firebase/database'
import styles from './CreateTaskModal.module.css'

interface CreateTaskModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateTaskModal({ onClose, onSuccess }: CreateTaskModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const tasksRef = ref(db, 'tasks')
      const newTaskRef = push(tasksRef)

      await set(newTaskRef, {
        name: name.trim(),
        description: description.trim() || undefined,
        amount: amountNum,
        frequency: 'daily',
        createdAt: Date.now(),
        createdBy: 'admin',
      })

      setName('')
      setDescription('')
      setAmount('')
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to create task:', err)
      setError('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Create New Task</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.group}>
            <label>Task Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Walk the Dog"
              disabled={loading}
            />
          </div>

          <div className={styles.group}>
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., 30 min walk in the morning"
              disabled={loading}
            />
          </div>

          <div className={styles.group}>
            <label>Amount (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g., 100"
              disabled={loading}
              min="1"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttons}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
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
