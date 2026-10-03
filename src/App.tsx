import { useAuth } from './context/AuthContext'
import { AuthScreen } from './components/AuthScreen'

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

  // TODO: Add user dashboard and admin dashboard
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {currentUser && <h1>Welcome, {currentUser.displayName}!</h1>}
      {currentAdmin && <h1>Admin Dashboard - {currentAdmin.displayName}</h1>}
      <p>Dashboard coming soon...</p>
    </div>
  )
}
