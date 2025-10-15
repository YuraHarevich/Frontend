// components/ProtectedRoute.tsx
import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { validateToken } from '../store/slices/authSlice'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isCheckingAuth, accessToken } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Если есть токен, но статус аутентификации не проверен - проверяем
    if (accessToken && isCheckingAuth) {
      dispatch(validateToken())
    }
  }, [accessToken, isCheckingAuth, dispatch])

  // Пока проверяем аутентификацию, показываем загрузку
  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  // Если не аутентифицирован, перенаправляем на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute