import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/firebase'
import { ref, onValue, set } from 'firebase/database'
import { User, Task } from '../types'
import { hashPasscode, generatePasscode } from '../utils/auth'
import { Header } from './Header'
import { CreateTaskModal } from './CreateTaskModal'
import { AssignTaskModal } from './AssignTaskModal'
import { EditTaskModal } from './EditTaskModal'
import styles from './AdminDashboard.module.css'

type AdminTab = 'users' | 'tasks'

export function AdminDashboard() {
  const { currentAdmin, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('users')
  const [users, setUsers] = useState<Record<string, User>>({})
  const [tasks, setTasks] = useState<Record<string, Task>>({})
  const [userEarnings, setUserEarnings] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showAssignTask, setShowAssignTask] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newUserName, setNewUserName] = useState('')
  const [newUserId, setNewUserId] = useState('')
  const [newUserPasscode, setNewUserPasscode] = useState('')

  // Load all users
  useEffect(() => {
    const usersRef = ref(db, 'users')
    const unsubscribe = onValue(usersRef, snapshot => {
      if (snapshot.exists()) {
        setUsers(snapshot.val())
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Load all tasks
  useEffect(() => {
    const tasksRef = ref(db, 'tasks')
    const unsubscribe = onValue(tasksRef, snapshot => {
      if (snapshot.exists()) {
        setTasks(snapshot.val())
      }
    })
    return unsubscribe
  }, [])

  // Load user earnings
  useEffect(() => {
    const earningsRef = ref(db, 'monthlyEarnings')
    const unsubscribe = onValue(earningsRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setUserEarnings(data)
      }
    })
    return unsubscribe
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserId.trim() || !newUserName.trim() || !newUserPasscode.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      const passcodeHash = hashPasscode(newUserPasscode)
      const userRef = ref(db, `users/${newUserId}`)
      await set(userRef, {
        id: newUserId,
        displayName: newUserName,
        passcodeHash,
        isAdmin: false,
        createdAt: Date.now(),
      })

      setNewUserId('')
      setNewUserName('')
      setNewUserPasscode('')
      setShowCreateUser(false)
      alert(`User "${newUserName}" created with passcode: ${newUserPasscode}`)
    } catch (err) {
      console.error('Failed to create user:', err)
      alert('Failed to create user')
    }
  }

  if (!currentAdmin) return null

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthKey = new Date().toISOString().slice(0, 7)

  return (
    <div className={styles.container}>
      <Header userName={`Admin - ${currentAdmin.displayName}`} onLogout={logout} />

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tasks' ? styles.active : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✓ Tasks
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'users' ? (
          <>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Manage Users</h2>
              <button
                className={styles.createBtn}
                onClick={() => setShowCreateUser(!showCreateUser)}
              >
                + New User
              </button>
            </div>

            {showCreateUser && (
              <form onSubmit={handleCreateUser} className={styles.form}>
                <div className={styles.group}>
                  <label>User ID</label>
                  <input
                    type="text"
                    value={newUserId}
                    onChange={e => setNewUserId(e.target.value)}
                    placeholder="e.g., amma"
                  />
                </div>
                <div className={styles.group}>
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    placeholder="e.g., Amma"
                  />
                </div>
                <div className={styles.group}>
                  <label>Passcode</label>
                  <div className={styles.passcodeInput}>
                    <input
                      type="text"
                      value={newUserPasscode}
                      onChange={e => setNewUserPasscode(e.target.value)}
                      placeholder="e.g., 1968"
                    />
                    <button
                      type="button"
                      className={styles.generateBtn}
                      onClick={() => setNewUserPasscode(generatePasscode())}
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <div className={styles.formButtons}>
                  <button type="submit" className={styles.submitBtn}>
                    Create User
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowCreateUser(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className={styles.usersList}>
              {loading ? (
                <div className={styles.loading}>Loading users...</div>
              ) : Object.entries(users).length === 0 ? (
                <div className={styles.empty}>No users yet</div>
              ) : (
                Object.entries(users).map(([userId, user]) => (
                  <div key={userId} className={styles.userCard}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{user.displayName}</div>
                      <div className={styles.userId}>ID: {userId}</div>
                    </div>
                    <div className={styles.userEarnings}>
                      <div className={styles.earningsLabel}>{currentMonth}</div>
                      <div className={styles.earningsAmount}>
                        ₹{userEarnings[monthKey]?.[userId] || 0}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Manage Tasks</h2>
              <div className={styles.buttons}>
                <button
                  className={styles.createBtn}
                  onClick={() => setShowCreateTask(true)}
                >
                  + New Task
                </button>
                <button
                  className={styles.createBtn}
                  onClick={() => setShowAssignTask(true)}
                >
                  ✓ Assign
                </button>
              </div>
            </div>
            <div className={styles.tasksList}>
              {loading ? (
                <div className={styles.loading}>Loading tasks...</div>
              ) : Object.entries(tasks).length === 0 ? (
                <div className={styles.empty}>No tasks yet</div>
              ) : (
                Object.entries(tasks).map(([taskId, task]) => (
                  <div
                    key={taskId}
                    className={styles.taskItem}
                    onClick={() => setEditingTaskId(taskId)}
                  >
                    <div className={styles.taskLeft}>
                      <div className={styles.taskName}>{task.name}</div>
                      <div className={styles.taskDesc}>{task.description}</div>
                    </div>
                    <div className={styles.taskAmount}>₹{task.amount}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {showCreateTask && (
          <CreateTaskModal
            onClose={() => setShowCreateTask(false)}
            onSuccess={() => setShowCreateTask(false)}
          />
        )}

        {showAssignTask && (
          <AssignTaskModal
            onClose={() => setShowAssignTask(false)}
            onSuccess={() => setShowAssignTask(false)}
            users={users}
            tasks={tasks}
          />
        )}

        {editingTaskId && tasks[editingTaskId] && (
          <EditTaskModal
            task={{ ...tasks[editingTaskId], id: editingTaskId }}
            onClose={() => setEditingTaskId(null)}
            onSuccess={() => setEditingTaskId(null)}
          />
        )}
      </div>
    </div>
  )
}
