// App.tsx
import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import store from './store'
import { useAppSelector, useAppDispatch } from './hooks/redux'
import { validateToken } from './store/slices/authSlice'
import Login from './components/Login'
import Register from './components/Register'
import { Home } from './components/Home'
import ProtectedRoute from './components/ProtectedRoute'

const AppContent: React.FC = () => {
  const { isAuthenticated, user, accessToken } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    // При загрузке приложения проверяем токен, если он есть
    if (accessToken) {
      dispatch(validateToken())
    }
  }, [dispatch, accessToken])

  const handleLogout = () => {
    // logout импортируем и используем из authSlice
    import('./store/slices/authSlice').then(({ logout }) => {
      dispatch(logout())
    })
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/home" />} 
          />
          <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home onLogout={handleLogout} currentUser={user} />
            </ProtectedRoute>
          } 
        />
          <Route 
            path="/dashboard" 
            element={<Navigate to="/home" replace />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App