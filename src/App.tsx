import { useAuth } from './context/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { DailyDashboard } from './components/DailyDashboard'
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
        <DailyDashboard />
      </TaskProvider>
    )
  }

  // TODO: Add admin dashboard
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Admin Dashboard - {currentAdmin?.displayName}</h1>
      <p>Admin dashboard coming soon...</p>
    </div>
  )
}
