import { useAuth } from './context/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { UserDashboard } from './components/UserDashboard'
import { AdminDashboard } from './components/AdminDashboard'
import { TaskProvider } from './context/TaskContext'

export function App() {
  const { currentUser, currentAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  if (!currentUser && !currentAdmin) {
    return <AuthScreen />
  }

  if (currentUser) {
    return (
      <TaskProvider userId={currentUser.id}>
        <UserDashboard />
      </TaskProvider>
    )
  }

  if (currentAdmin) {
    return <AdminDashboard />
  }

  return null
}
