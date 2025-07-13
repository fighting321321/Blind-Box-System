import { useState } from 'react'
import axios from 'axios'

/**
 * 注册表单组件
 * 提供用户注册功能
 */
function RegisterForm({ onSuccess }) {
  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * 处理输入框变化
   * @param {Event} e - 输入事件
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除错误信息
    if (error) setError('')
  }

  /**
   * 验证表单数据
   * @returns {boolean} 验证结果
   */
  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('请填写所有字段')
      return false
    }

    if (formData.username.length < 3) {
      setError('用户名长度至少3个字符')
      return false
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      return false
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6个字符')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }

    return true
  }

  /**
   * 处理表单提交
   * @param {Event} e - 提交事件
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      // 发送注册请求到后端API
      const response = await axios.post('http://localhost:7001/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      
      if (response.data.success) {
        // 注册成功
        onSuccess(response.data.data)
      } else {
        // 注册失败
        setError(response.data.message || '注册失败')
      }
    } catch (error) {
      // 网络错误或服务器错误
      console.error('注册错误:', error)
      if (error.response) {
        setError(error.response.data?.message || '注册失败')
      } else if (error.request) {
        setError('无法连接到服务器，请检查网络')
      } else {
        setError('注册失败，请重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 用户名输入框 */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          用户名
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="请输入用户名（至少3个字符）"
          required
        />
      </div>

      {/* 邮箱输入框 */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          邮箱地址
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="请输入邮箱地址"
          required
        />
      </div>

      {/* 密码输入框 */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          密码
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="请输入密码（至少6个字符）"
          required
        />
      </div>

      {/* 确认密码输入框 */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          确认密码
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="请再次输入密码"
          required
        />
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
        } transition-colors`}
      >
        {loading ? '注册中...' : '注册'}
      </button>

      {/* 注册说明 */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-700">
          注册成功后，您可以使用用户名或邮箱登录系统
        </p>
      </div>
    </form>
  )
}

export default RegisterForm
