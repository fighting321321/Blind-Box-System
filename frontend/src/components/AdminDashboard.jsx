import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Package, Gift, BarChart3, Settings, LogOut, Users, Ban, CheckCircle, FileText } from 'lucide-react'
import { useToast } from './Toast'
import ConfirmDialog from './ConfirmDialog'

const AdminDashboard = ({ user, onLogout }) => {
  const { toasts, toast, removeToast, ToastContainer } = useToast()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [blindBoxes, setBlindBoxes] = useState([])

  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedBlindBox, setSelectedBlindBox] = useState(null)
  const [prizes, setPrizes] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  })

  // 获取授权头
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  }, [])

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:7001/api/admin/stats', getAuthHeaders())
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 获取盲盒列表
  const fetchBlindBoxes = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:7001/api/admin/blindboxes', getAuthHeaders())
      if (response.data.success) {
        setBlindBoxes(response.data.data)
      }
    } catch (error) {
      console.error('获取盲盒列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:7001/api/admin/users', getAuthHeaders())
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取订单列表
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:7001/api/admin/orders', getAuthHeaders())
      if (response.data.success) {
        setOrders(response.data.data)
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取奖品列表
  const fetchPrizes = async (blindBoxId) => {
    try {
      const response = await axios.get(`http://localhost:7001/api/admin/blindboxes/${blindBoxId}/prizes`, getAuthHeaders())
      if (response.data.success) {
        setPrizes(response.data.data)
      }
    } catch (error) {
      console.error('获取奖品列表失败:', error)
    }
  }

  // 创建盲盒
  const createBlindBox = async (data) => {
    try {
      const response = await axios.post('http://localhost:7001/api/admin/blindboxes', data, getAuthHeaders())
      if (response.data.success) {
        setShowCreateModal(false)
        fetchBlindBoxes()
        toast.success('盲盒创建成功！')
      } else {
        toast.error(response.data.message || '创建失败')
      }
    } catch (error) {
      console.error('创建盲盒失败:', error)
      toast.error('创建失败，请重试')
    }
  }

  // 更新盲盒
  const updateBlindBox = async (id, data) => {
    try {
      const response = await axios.put(`http://localhost:7001/api/admin/blindboxes/${id}`, data, getAuthHeaders())
      if (response.data.success) {
        setShowEditModal(false)
        setEditingItem(null)
        fetchBlindBoxes()
        toast.success('盲盒更新成功！')
      } else {
        toast.error(response.data.message || '更新失败')
      }
    } catch (error) {
      console.error('更新盲盒失败:', error)
      toast.error('更新失败，请重试')
    }
  }

  // 删除盲盒
  const deleteBlindBox = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: '确定要删除这个盲盒吗？此操作不可恢复。',
      onConfirm: async () => {
        try {
          const response = await axios.delete(`http://localhost:7001/api/admin/blindboxes/${id}`, getAuthHeaders())
          if (response.data.success) {
            fetchBlindBoxes()
            toast.success('盲盒删除成功！')
          } else {
            toast.error(response.data.message || '删除失败')
          }
        } catch (error) {
          console.error('删除盲盒失败:', error)
          toast.error('删除失败，请重试')
        }
      }
    })
  }

  // 删除奖品
  const deletePrize = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: '确定要删除这个奖品吗？此操作不可恢复。',
      onConfirm: async () => {
        try {
          const response = await axios.delete(`http://localhost:7001/api/admin/prizes/${id}`, getAuthHeaders())
          if (response.data.success) {
            fetchPrizes(selectedBlindBox.id)
            toast.success('奖品删除成功！')
          } else {
            toast.error(response.data.message || '删除失败')
          }
        } catch (error) {
          console.error('删除奖品失败:', error)
          toast.error('删除失败，请重试')
        }
      }
    })
  }

  // 创建奖品
  const createPrize = async (data) => {
    try {
      const response = await axios.post('http://localhost:7001/api/admin/prizes', data, getAuthHeaders())
      if (response.data.success) {
        setShowCreateModal(false)
        fetchPrizes(selectedBlindBox.id)
        toast.success('奖品创建成功！')
      } else {
        toast.error(response.data.message || '创建失败')
      }
    } catch (error) {
      console.error('创建奖品失败:', error)
      toast.error('创建失败，请重试')
    }
  }

  // 更新奖品
  const updatePrize = async (id, data) => {
    try {
      const response = await axios.put(`http://localhost:7001/api/admin/prizes/${id}`, data, getAuthHeaders())
      if (response.data.success) {
        setShowEditModal(false)
        setEditingItem(null)
        fetchPrizes(selectedBlindBox.id)
        toast.success('奖品更新成功！')
      } else {
        toast.error(response.data.message || '更新失败')
      }
    } catch (error) {
      console.error('更新奖品失败:', error)
      toast.error('更新失败，请重试')
    }
  }

  // 更新用户状态
  const updateUserStatus = async (id, status) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认操作',
      message: `确定要${status === 0 ? '禁用' : '启用'}这个用户吗？`,
      onConfirm: async () => {
        try {
          const response = await axios.put(`http://localhost:7001/api/admin/users/${id}/status`, { status }, getAuthHeaders())
          if (response.data.success) {
            fetchUsers()
            toast.success(`用户状态更新成功！`)
          } else {
            toast.error(response.data.message || '更新失败')
          }
        } catch (error) {
          console.error('更新用户状态失败:', error)
          toast.error('更新失败，请重试')
        }
      }
    })
  }

  // 页面初始化
  useEffect(() => {
    fetchStats()
    fetchBlindBoxes()
    fetchUsers()
    fetchOrders()
  }, [])

  // 统计面板组件
  const StatsPanel = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">总盲盒数</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalBlindBoxes || 0}</p>
          </div>
          <Package className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">总奖品数</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalPrizes || 0}</p>
          </div>
          <Gift className="w-8 h-8 text-green-500" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">总用户数</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalUsers || 0}</p>
          </div>
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">U</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">总收入</p>
            <p className="text-2xl font-bold text-orange-600">¥{(stats.totalRevenue || 0).toFixed(2)}</p>
          </div>
          <BarChart3 className="w-8 h-8 text-orange-500" />
        </div>
      </div>
    </div>
  )

  // 盲盒表单组件
  const BlindBoxForm = ({ item, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      stock: item?.stock || 0,
      imageUrl: item?.imageUrl || ''
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      onSubmit(formData)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {item ? '编辑盲盒' : '创建盲盒'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">库存</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">图片URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                {item ? '更新' : '创建'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // 奖品表单组件
  const PrizeForm = ({ item, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      description: item?.description || '',
      probability: item?.probability || 0,
      imageUrl: item?.imageUrl || '',
      value: item?.value || 0,
      blindBoxId: item?.blindBoxId || selectedBlindBox?.id || 0
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      onSubmit(formData)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {item ? '编辑奖品' : '创建奖品'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">中奖概率 (0-1)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">奖品价值</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">图片URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                {item ? '更新' : '创建'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // 盲盒管理面板
  const BlindBoxPanel = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">盲盒管理</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>创建盲盒</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blindBoxes.map((box) => (
            <div key={box.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{box.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{box.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>价格: ¥{box.price.toFixed(2)}</span>
                    <span>库存: {box.stock}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(box)
                      setShowEditModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBlindBox(box.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedBlindBox(box)
                    setActiveTab('prizes')
                    fetchPrizes(box.id)
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  管理奖品
                </button>
                <span className="text-xs text-gray-400">
                  创建时间: {new Date(box.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {blindBoxes.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无盲盒</h3>
          <p className="text-gray-600 mb-4">开始创建您的第一个盲盒吧！</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            创建盲盒
          </button>
        </div>
      )}
    </div>
  )

  // 奖品管理面板
  const PrizePanel = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">奖品管理</h2>
          {selectedBlindBox && (
            <p className="text-gray-600">盲盒：{selectedBlindBox.name}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setActiveTab('blindboxes')
              setSelectedBlindBox(null)
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            返回盲盒列表
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>添加奖品</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prizes.map((prize) => (
          <div key={prize.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{prize.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{prize.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>价值: ¥{(prize.value || 0).toFixed(2)}</span>
                  <span>概率: {(prize.probability * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingItem(prize)
                    setShowEditModal(true)
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePrize(prize.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-green-600">
                {(prize.probability * 100).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">中奖概率</span>
            </div>
          </div>
        ))}
      </div>

      {prizes.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">🎁</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无奖品</h3>
          <p className="text-gray-600 mb-4">为这个盲盒添加一些奖品吧！</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            添加奖品
          </button>
        </div>
      )}
    </div>
  )

  // 用户管理面板
  const UserPanel = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">用户管理</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邮箱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                余额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                注册时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  暂无用户数据
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">¥{user.balance.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 1 ? '正常' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => updateUserStatus(user.id, user.status === 1 ? 0 : 1)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                          user.status === 1
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.status === 1 ? (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            禁用
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            启用
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  // 订单详情面板
  const OrderPanel = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">订单详情</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                订单编号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                购买盲盒
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                数量
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                总金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                订单状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                购买时间
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  暂无订单数据
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {order.username ? order.username.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{order.username || '未知用户'}</div>
                        <div className="text-sm text-gray-500">ID: {order.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.blindBoxName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">¥{order.totalAmount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'completed' ? '已完成' : 
                       order.status === 'pending' ? '进行中' : '已取消'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">盲盒管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎，{user.username}</span>
              <button
                onClick={onLogout}
                className="text-red-600 hover:text-red-800 flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 侧边栏导航 */}
      <div className="flex">
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>数据统计</span>
              </button>
              <button
                onClick={() => setActiveTab('blindboxes')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'blindboxes' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Package className="w-4 h-4" />
                <span>盲盒管理</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'users' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Users className="w-4 h-4" />
                <span>用户管理</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <FileText className="w-4 h-4" />
                <span>订单详情</span>
              </button>
            </div>
          </div>
        </nav>

        {/* 主内容区 */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && <StatsPanel />}
          {activeTab === 'blindboxes' && <BlindBoxPanel />}
          {activeTab === 'prizes' && selectedBlindBox && <PrizePanel />}
          {activeTab === 'users' && <UserPanel />}
          {activeTab === 'orders' && <OrderPanel />}
        </main>
      </div>

      {/* 模态框 */}
      {showCreateModal && (
        <>
          {activeTab === 'blindboxes' ? (
            <BlindBoxForm
              onSubmit={(data) => createBlindBox(data)}
              onCancel={() => setShowCreateModal(false)}
            />
          ) : (
            <PrizeForm
              onSubmit={(data) => createPrize(data)}
              onCancel={() => setShowCreateModal(false)}
            />
          )}
        </>
      )}

      {showEditModal && editingItem && (
        <>
          {activeTab === 'blindboxes' ? (
            <BlindBoxForm
              item={editingItem}
              onSubmit={(data) => updateBlindBox(editingItem.id, data)}
              onCancel={() => {
                setShowEditModal(false)
                setEditingItem(null)
              }}
            />
          ) : (
            <PrizeForm
              item={editingItem}
              onSubmit={(data) => updatePrize(editingItem.id, data)}
              onCancel={() => {
                setShowEditModal(false)
                setEditingItem(null)
              }}
            />
          )}
        </>
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  )
}

export default AdminDashboard
