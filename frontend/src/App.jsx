import { useState } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import UserInfo from './components/UserInfo'
import HomePage from './components/HomePage'
import AdminDashboard from './components/AdminDashboard'

/**
 * 盲盒系统主应用组件
 * 包含用户认证功能（登录、注册、用户信息展示）
 */
function App() {
  // 应用状态管理
  const [currentView, setCurrentView] = useState('login') // 'login' | 'register' | 'user'
  const [user, setUser] = useState(null) // 当前登录用户
  const [token, setToken] = useState(localStorage.getItem('token')) // JWT令牌

  /**
   * 处理用户登录成功
   * @param {Object} userData - 用户数据
   * @param {string} userToken - JWT令牌
   */
  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('token', userToken)
    setCurrentView('home')
  }

  /**
   * 处理用户注册成功
   * @param {Object} userData - 用户数据
   */
  const handleRegisterSuccess = (userData) => {
    setCurrentView('login')
    alert('注册成功，请登录')
  }

  /**
   * 处理用户登出
   */
  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    setCurrentView('login')
  }

  return (
    <>
      {/* 登录/注册界面 */}
      {currentView !== 'home' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">盲盒系统</h1>
              <p className="text-gray-600">用户认证系统</p>
            </div>

            {/* 导航按钮 */}
            {!user && (
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    currentView === 'login'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                  onClick={() => setCurrentView('login')}
                >
                  登录
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    currentView === 'register'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                  onClick={() => setCurrentView('register')}
                >
                  注册
                </button>
              </div>
            )}

            {/* 内容区域 */}
            {currentView === 'login' && (
              <LoginForm onSuccess={handleLoginSuccess} />
            )}
            
            {currentView === 'register' && (
              <RegisterForm onSuccess={handleRegisterSuccess} />
            )}
            
            {currentView === 'user' && user && (
              <UserInfo user={user} onLogout={handleLogout} />
            )}
          </div>
        </div>
      )}

      {/* 主页界面 */}
      {currentView === 'home' && user && (
        <>
          {user.role === 'admin' ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <HomePage user={user} onLogout={handleLogout} />
          )}
        </>
      )}
    </>
  )
}

export default App
