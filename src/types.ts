export interface User {
  id: string
  displayName: string
  passcodeHash: string
  isAdmin: boolean
  createdAt: number
  totalEarningsToday?: number
  totalEarningsMonth?: number
}

export interface Admin {
  id: string
  displayName: string
  passcodeHash: string
  createdAt: number
}

export interface Task {
  id: string
  name: string
  description?: string
  amount: number
  frequency: 'daily'
  createdAt: number
  createdBy: string
}

export interface TaskAssignment {
  taskId: string
  userId: string
  amount: number
  assignedAt: number
}

export interface TaskCompletion {
  taskId: string
  userId: string
  completedAt: number
  amount: number
  verifiedAt?: number
  verifiedBy?: string
}

export interface DailyEarning {
  userId: string
  date: string
  amount: number
}

export interface MonthlyEarning {
  userId: string
  month: string
  amount: number
}

export interface AuthState {
  currentUser: User | null
  currentAdmin: Admin | null
  loading: boolean
  error?: string
}
