import { useState, useEffect } from 'react'
import axios from 'axios'

/**
 * 用户信息展示组件
 * 显示登录用户的详细信息
 */
function UserInfo({ user, onLogout }) {
  const [userDetails, setUserDetails] = useState(user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * 获取最新的用户信息
   */
  const fetchUserInfo = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:7001/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setUserDetails(response.data.data)
      } else {
        setError(response.data.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息错误:', error)
      if (error.response?.status === 401) {
        // Token过期或无效
        onLogout()
      } else {
        setError('获取用户信息失败')
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * 格式化日期显示
   * @param {string} dateString - 日期字符串
   * @returns {string} 格式化后的日期
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 组件挂载时获取用户信息
  useEffect(() => {
    fetchUserInfo()
  }, [])

  if (loading && !userDetails) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600">加载用户信息中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 用户头像和基本信息 */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {userDetails?.username?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          欢迎，{userDetails?.username}
        </h2>
        <p className="text-gray-600">{userDetails?.email}</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={fetchUserInfo}
            className="ml-2 text-red-800 underline hover:no-underline"
          >
            重试
          </button>
        </div>
      )}

      {/* 用户详细信息 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-800 mb-3">账户信息</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">用户ID:</span>
            <p className="font-medium text-gray-800">{userDetails?.id}</p>
          </div>
          <div>
            <span className="text-gray-600">账户余额:</span>
            <p className="font-medium text-green-600">
              ¥ {userDetails?.balance || '0.00'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">注册时间:</span>
            <p className="font-medium text-gray-800">
              {userDetails?.createdAt ? formatDate(userDetails.createdAt) : '暂无'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">最后更新:</span>
            <p className="font-medium text-gray-800">
              {userDetails?.updatedAt ? formatDate(userDetails.updatedAt) : '暂无'}
            </p>
          </div>
        </div>
      </div>

      {/* 功能按钮区域 */}
      <div className="space-y-3">
        <button
          onClick={fetchUserInfo}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-purple-600 border border-purple-600 font-medium ${loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
            } transition-colors`}
        >
          {loading ? '刷新中...' : '刷新信息'}
        </button>

        <button
          onClick={onLogout}
          className="w-full py-2 px-4 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium transition-colors"
        >
          退出登录
        </button>
      </div>

      {/* 系统状态提示 */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-700">
          <strong>开发提示:</strong> 这是盲盒系统的用户认证模块演示。
          后续将集成盲盒购买、抽取等功能。
        </p>
      </div>
    </div>
  )
}

export default UserInfo
