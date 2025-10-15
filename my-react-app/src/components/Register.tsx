// components/Register.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { registerUser, clearError } from '../store/slices/authSlice'
import type { RegisterCredentials } from '../types/auth'
import '../../styles/registration.css'

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    birthDate: '',
    confirmPassword: '',
  })

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home') // Изменено с /dashboard на /home
    }
    dispatch(clearError())
  }, [dispatch, isAuthenticated, navigate])

  // Добавляем функцию handleChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match")
      return
    }

    const formattedData = {
      ...formData,
      birthDate: formData.birthDate ? `${formData.birthDate}T00:00:00` : ''
    }

    const { confirmPassword, ...registerData } = formattedData
    const result = await dispatch(registerUser(registerData))
    
    if (registerUser.fulfilled.match(result)) {
      navigate('/home') // Изменено с /dashboard на /home
    }
  }

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-card">
          {/* Logo */}
          <div className="logo-container">
            <h1 className="logo-text">Join Instantgram</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange} 
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstname" className="form-label">
                  First Name
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  placeholder="John"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastname" className="form-label">
                  Last Name
                </label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastname}
                  onChange={handleChange} 
                  className="form-input"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birthDate" className="form-label">
                Date of Birth
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange} 
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange} 
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="register-button"
            >
              {isLoading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>

          {/* Login Link */}
          <div className="login-link-container">
            <p className="login-text">
              Already have an account?{' '}
              <Link
                to="/login"
                className="login-link"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register