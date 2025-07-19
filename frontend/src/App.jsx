import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import UserInfo from './components/UserInfo'
import HomePage from './components/HomePage'
import AdminDashboard from './components/AdminDashboard'
import { useToast } from './components/Toast'

/**
 * 盲盒系统主应用组件
 * 包含用户认证功能（登录、注册、用户信息展示）
 */
function App() {
  const { ToastContainer } = useToast()
  // 应用状态管理
  const [currentView, setCurrentView] = useState('login') // 'login' | 'register' | 'user'
  const [user, setUser] = useState(null) // 当前登录用户
  const [token, setToken] = useState(localStorage.getItem('token')) // JWT令牌
  const [isLoading, setIsLoading] = useState(true) // 页面加载状态

  /**
   * 刷新用户余额
   * @param {number} userId - 用户ID
   */
  const refreshUserBalance = async (userId) => {
    try {
      const response = await fetch(`http://localhost:7001/api/user/${userId}/balance`)
      const data = await response.json()
      if (data.success) {
        console.log(`🔄 登录后余额检查: ${data.data.balance}`)
        // 更新用户对象中的余额信息
        setUser(prevUser => ({
          ...prevUser,
          balance: data.data.balance
        }))
      }
    } catch (error) {
      console.error('刷新余额失败:', error)
    }
  }

  /**
   * 处理用户登录成功
   * @param {Object} userData - 用户数据
   * @param {string} userToken - JWT令牌
   */
  const handleLoginSuccess = async (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('token', userToken)
    setCurrentView('home')

    // 登录成功后立即检查用户余额
    await refreshUserBalance(userData.id)
  }

  /**
   * 处理用户注册成功
   * @param {Object} userData - 用户数据
   */
  const handleRegisterSuccess = (userData) => {
    setCurrentView('login')
    // 移除 alert，让组件内部的toast处理通知
  }

  /**
   * 验证token并恢复用户状态
   */
  const validateTokenAndRestoreUser = async () => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    try {
      // 调用后端API验证token并获取用户信息
      const response = await fetch('http://localhost:7001/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // token有效，恢复用户状态
          const userData = data.data.user
          setUser(userData)
          setToken(storedToken)
          setCurrentView('home')

          // 立即获取最新的用户余额
          await refreshUserBalance(userData.id)
        } else {
          // token无效，清除存储的token
          localStorage.removeItem('token')
          setToken(null)
        }
      } else {
        // 请求失败，清除存储的token
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      // 验证失败，清除存储的token
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
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

  // 组件加载时验证token并恢复用户状态
  useEffect(() => {
    validateTokenAndRestoreUser()
  }, [])

  return (
    <>
      {/* 加载状态 */}
      {isLoading && (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在验证用户状态...</p>
          </div>
        </div>
      )}

      {/* 登录/注册界面 */}
      {!isLoading && currentView !== 'home' && (
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
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${currentView === 'login'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-purple-600'
                    }`}
                  onClick={() => setCurrentView('login')}
                >
                  登录
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${currentView === 'register'
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
      {!isLoading && currentView === 'home' && user && (
        <>
          {user.role === 'admin' ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <HomePage
              user={user}
              onLogout={handleLogout}
              onRefreshBalance={() => refreshUserBalance(user.id)}
            />
          )}
        </>
      )}

      {/* Toast通知容器 */}
      <ToastContainer />
    </>
  )
}

export default App
