import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../utils/firebase'
import { ref, onValue, set } from 'firebase/database'
import { Task, TaskAssignment, TaskCompletion } from '../types'
import { getTodayString, getCurrentMonth } from '../utils/auth'

interface TaskContextType {
  tasks: Record<string, Task>
  assignments: Record<string, TaskAssignment>
  completions: Record<string, TaskCompletion>
  dailyEarnings: number
  monthlyEarnings: number
  loading: boolean
  markTaskComplete: (taskId: string, userId: string) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [tasks, setTasks] = useState<Record<string, Task>>({})
  const [assignments, setAssignments] = useState<Record<string, TaskAssignment>>({})
  const [completions, setCompletions] = useState<Record<string, TaskCompletion>>({})
  const [dailyEarnings, setDailyEarnings] = useState(0)
  const [monthlyEarnings, setMonthlyEarnings] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load all tasks
  useEffect(() => {
    const tasksRef = ref(db, 'tasks')
    const unsubscribe = onValue(tasksRef, snapshot => {
      if (snapshot.exists()) {
        setTasks(snapshot.val())
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Load user's task assignments
  useEffect(() => {
    if (!userId) return

    const assignmentsRef = ref(db, `assignments/${userId}`)
    const unsubscribe = onValue(assignmentsRef, snapshot => {
      if (snapshot.exists()) {
        setAssignments(snapshot.val())
      } else {
        setAssignments({})
      }
    })
    return unsubscribe
  }, [userId])

  // Load today's completions
  useEffect(() => {
    if (!userId) return

    const today = getTodayString()
    const completionsRef = ref(db, `completions/${today}/${userId}`)
    const unsubscribe = onValue(completionsRef, snapshot => {
      if (snapshot.exists()) {
        setCompletions(snapshot.val())
      } else {
        setCompletions({})
      }
    })
    return unsubscribe
  }, [userId])

  // Calculate daily earnings
  useEffect(() => {
    const total = Object.values(completions).reduce((sum, completion) => sum + completion.amount, 0)
    setDailyEarnings(total)
  }, [completions])

  // Load monthly earnings
  useEffect(() => {
    if (!userId) return

    const month = getCurrentMonth()
    const monthlyRef = ref(db, `monthlyEarnings/${month}/${userId}`)
    const unsubscribe = onValue(monthlyRef, snapshot => {
      if (snapshot.exists()) {
        setMonthlyEarnings(snapshot.val())
      } else {
        setMonthlyEarnings(0)
      }
    })
    return unsubscribe
  }, [userId])

  const markTaskComplete = async (taskId: string, userId: string) => {
    if (!tasks[taskId]) return

    const today = getTodayString()
    const month = getCurrentMonth()
    const now = Date.now()
    const amount = assignments[taskId]?.amount || tasks[taskId].amount

    // Add completion record
    const completionRef = ref(db, `completions/${today}/${userId}/${taskId}`)
    await set(completionRef, {
      taskId,
      userId,
      completedAt: now,
      amount,
    })

    // Update daily earnings
    const dailyRef = ref(db, `dailyEarnings/${today}/${userId}`)
    const newDailyEarnings = dailyEarnings + amount
    await set(dailyRef, newDailyEarnings)

    // Update monthly earnings
    const monthlyRef = ref(db, `monthlyEarnings/${month}/${userId}`)
    const newMonthlyEarnings = monthlyEarnings + amount
    await set(monthlyRef, newMonthlyEarnings)
  }

  const value: TaskContextType = {
    tasks,
    assignments,
    completions,
    dailyEarnings,
    monthlyEarnings,
    loading,
    markTaskComplete,
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}
