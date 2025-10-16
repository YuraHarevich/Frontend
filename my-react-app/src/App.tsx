// App.tsx
import React, { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import store from './store'
import { useAppSelector, useAppDispatch } from './hooks/redux'
import { validateToken, logout } from './store/slices/authSlice'
import { IconProvider } from './context/IconContext' // Добавляем импорт
import Login from './components/Login'
import Register from './components/Register'
import { Home } from './components/Home'
import ProtectedRoute from './components/ProtectedRoute'

const AppContent: React.FC = () => {
  const { isAuthenticated, user, accessToken, isCheckingAuth } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const validateCalledRef = useRef(false)

  useEffect(() => {
    if (accessToken && !validateCalledRef.current) {
      validateCalledRef.current = true
      console.log('Calling validateToken...')
      dispatch(validateToken()).finally(() => {
        validateCalledRef.current = false
      })
    } else if (!accessToken && isCheckingAuth) {
      // Если токена нет, устанавливаем isCheckingAuth в false
      dispatch({ type: 'auth/setCheckingAuth', payload: false })
    }
  }, [dispatch, accessToken, isCheckingAuth])

  const handleLogout = () => {
    dispatch(logout())
  }

  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  return (
    <IconProvider> {/* Оборачиваем в IconProvider */}
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
              path="/" 
              element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} 
            />
          </Routes>
        </div>
      </Router>
    </IconProvider>
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