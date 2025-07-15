import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Plus, Edit, Trash2, Package, Gift, BarChart3, Settings, LogOut } from 'lucide-react'

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [blindBoxes, setBlindBoxes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedBlindBox, setSelectedBlindBox] = useState(null)
  const [prizes, setPrizes] = useState([])

  // 获取授权头
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  }

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
      const response = await axios.get(`http://localhost:7001/api/admin/blindboxes?search=${searchTerm}`, getAuthHeaders())
      if (response.data.success) {
        setBlindBoxes(response.data.data)
      }
    } catch (error) {
      console.error('获取盲盒列表失败:', error)
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
        alert('盲盒创建成功！')
      }
    } catch (error) {
      console.error('创建盲盒失败:', error)
      alert('创建失败，请重试')
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
        alert('盲盒更新成功！')
      }
    } catch (error) {
      console.error('更新盲盒失败:', error)
      alert('更新失败，请重试')
    }
  }

  // 删除盲盒
  const deleteBlindBox = async (id) => {
    if (window.confirm('确定要删除这个盲盒吗？')) {
      try {
        const response = await axios.delete(`http://localhost:7001/api/admin/blindboxes/${id}`, getAuthHeaders())
        if (response.data.success) {
          fetchBlindBoxes()
          alert('盲盒删除成功！')
        }
      } catch (error) {
        console.error('删除盲盒失败:', error)
        alert('删除失败，请重试')
      }
    }
  }

  // 删除奖品
  const deletePrize = async (id) => {
    if (window.confirm('确定要删除这个奖品吗？')) {
      try {
        const response = await axios.delete(`http://localhost:7001/api/admin/prizes/${id}`, getAuthHeaders())
        if (response.data.success) {
          fetchPrizes(selectedBlindBox.id)
          alert('奖品删除成功！')
        }
      } catch (error) {
        console.error('删除奖品失败:', error)
        alert('删除失败，请重试')
      }
    }
  }

  // 创建奖品
  const createPrize = async (data) => {
    try {
      const response = await axios.post('http://localhost:7001/api/admin/prizes', data, getAuthHeaders())
      if (response.data.success) {
        setShowCreateModal(false)
        fetchPrizes(selectedBlindBox.id)
        alert('奖品创建成功！')
      }
    } catch (error) {
      console.error('创建奖品失败:', error)
      alert('创建失败，请重试')
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
        alert('奖品更新成功！')
      }
    } catch (error) {
      console.error('更新奖品失败:', error)
      alert('更新失败，请重试')
    }
  }

  // 页面初始化
  useEffect(() => {
    fetchStats()
    fetchBlindBoxes()
  }, [])

  // 搜索功能
  useEffect(() => {
    if (activeTab === 'blindboxes') {
      fetchBlindBoxes()
    }
  }, [searchTerm, activeTab])

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
            <p className="text-2xl font-bold text-orange-600">¥{stats.totalRevenue || 0}</p>
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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">库存</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">图片URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                onChange={(e) => setFormData({...formData, probability: parseFloat(e.target.value) || 0})}
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
                onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">图片URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
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

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索盲盒名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blindBoxes.map((box) => (
            <div key={box.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{box.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(box)
                      setShowEditModal(true)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBlindBox(box.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{box.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">¥{box.price}</span>
                <span className="text-sm text-gray-500">库存: {box.stock}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedBlindBox(box)
                  setActiveTab('prizes')
                  fetchPrizes(box.id)
                }}
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                管理奖品
              </button>
            </div>
          ))}
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
            onClick={() => setActiveTab('blindboxes')}
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
              <h3 className="text-lg font-semibold">{prize.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingItem(prize)
                    setShowEditModal(true)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePrize(prize.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-2">{prize.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-green-600">
                {(prize.probability * 100).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">中奖概率</span>
            </div>
          </div>
        ))}
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
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>数据统计</span>
              </button>
              <button
                onClick={() => setActiveTab('blindboxes')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'blindboxes' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>盲盒管理</span>
              </button>
              <button
                onClick={() => setActiveTab('prizes')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'prizes' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>奖品管理</span>
              </button>
            </div>
          </div>
        </nav>

        {/* 主内容区 */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && <StatsPanel />}
          {activeTab === 'blindboxes' && <BlindBoxPanel />}
          {activeTab === 'prizes' && <PrizePanel />}
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
    </div>
  )
}

export default AdminDashboard
