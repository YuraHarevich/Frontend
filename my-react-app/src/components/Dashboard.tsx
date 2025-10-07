import React from 'react'
import type { User } from '../types/auth'

interface DashboardProps {
  onLogout: () => void
  user: User | null
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <button onClick={onLogout}>Logout</button>
      </header>
      <div className="content">
        <h2>Welcome, {user?.firstname} {user?.lastname}!</h2>
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Full Name:</strong> {user?.firstname} {user?.lastname}</p>
        <p><strong>Birth Date:</strong> {user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'N/A'}</p>
        
        <div className="protected-content">
          <h3>Protected Content</h3>
          <p>This content is only available for authenticated users.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard