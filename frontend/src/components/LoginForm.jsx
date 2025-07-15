import { useState } from 'react'
import axios from 'axios'
import { useToast } from './Toast'

/**
 * 登录表单组件
 * 提供用户登录功能
 */
function LoginForm({ onSuccess }) {
  const { toast } = useToast()
  // 表单状态
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
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
   * 处理表单提交
   * @param {Event} e - 提交事件
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 基本验证
    if (!formData.usernameOrEmail || !formData.password) {
      toast.error('请填写所有字段')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 发送登录请求到后端API
      const response = await axios.post('http://localhost:7001/api/auth/login', formData)
      
      if (response.data.success) {
        // 登录成功
        toast.success('登录成功！')
        onSuccess(response.data.data.user, response.data.data.token)
      } else {
        // 登录失败
        toast.error(response.data.message || '登录失败')
      }
    } catch (error) {
      // 网络错误或服务器错误
      console.error('登录错误:', error)
      if (error.response) {
        toast.error(error.response.data?.message || '登录失败')
      } else if (error.request) {
        toast.error('无法连接到服务器，请检查网络')
      } else {
        toast.error('登录失败，请重试')
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

      {/* 用户名或邮箱输入框 */}
      <div>
        <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1">
          用户名或邮箱
        </label>
        <input
          type="text"
          id="usernameOrEmail"
          name="usernameOrEmail"
          value={formData.usernameOrEmail}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="请输入用户名或邮箱"
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
          placeholder="请输入密码"
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
        {loading ? '登录中...' : '登录'}
      </button>

      {/* 演示用户信息 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700 font-medium mb-1">演示账号:</p>
        <p className="text-xs text-blue-600">
          用户名: demo<br />
          密码: 123456
        </p>
        <p className="text-xs text-blue-500 mt-1">
          注：后端服务启动后可使用
        </p>
      </div>
    </form>
  )
}

export default LoginForm
