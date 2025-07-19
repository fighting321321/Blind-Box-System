import { useState, useEffect } from 'react'
import BlindBoxManagement from './BlindBoxManagement'
import BlindBoxDraw from './BlindBoxDraw'
import OrderManagement from './OrderManagement'
import BlindBoxList from './BlindBoxList'
import BlindBoxDetail from './BlindBoxDetail'
import PlayerShowcase from './PlayerShowcase'
import BlindBoxSearch from './BlindBoxSearch'
import Toast from './Toast'
import BlindBoxImage from './BlindBoxImage'
import { blindBoxAPI, userLibraryAPI } from '../services/api'

/**
 * 盲盒系统主页组件
 * 普通用户主页：展示所有盲盒，支持添加到库，库管理，订单管理
 */
function HomePage({ user, onLogout, onRefreshBalance }) {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedBlindBox, setSelectedBlindBox] = useState(null)
  const [previousTab, setPreviousTab] = useState('home') // 记录进入详情页前的页面
  const [viewMode, setViewMode] = useState('grid') // 'grid' 或 'list'
  const [userLibrary, setUserLibrary] = useState([]) // 用户盲盒库
  const [allBlindBoxes, setAllBlindBoxes] = useState([]) // 所有可用盲盒
  const [userOrders, setUserOrders] = useState([]) // 用户订单
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [userBalance, setUserBalance] = useState(0) // 用户余额状态

  // 从后端获取盲盒数据
  // 加载盲盒数据
  const loadBlindBoxes = async () => {
    try {
      setLoading(true)
      const response = await blindBoxAPI.getAllBlindBoxes()
      if (response.success) {
        // 将后端数据转换为前端格式
        const formattedBoxes = response.data.map(box => ({
          id: box.id,
          name: box.name,
          description: box.description,
          price: box.price,
          originalPrice: box.price * 1.2, // 模拟原价
          color: getRandomColor(),
          stock: box.stock,
          sales: 0, // 后端暂时没有销量数据
          rating: 4.5, // 模拟评分
          isNew: Math.random() > 0.7,
          isHot: Math.random() > 0.6,
          tags: getRandomTags(),
          category: 'general',
          items: [] // 后续可以从奖品数据中获取
        }))
        setAllBlindBoxes(formattedBoxes)
      } else {
        showToast(response.message || '获取盲盒数据失败', 'error')
      }
    } catch (error) {
      console.error('加载盲盒数据失败:', error)
      showToast('网络错误，请稍后重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载盲盒数据
  useEffect(() => {
    loadBlindBoxes()
  }, [])

  // 更新当前选中盲盒的信息
  const updateSelectedBlindBox = async () => {
    if (!selectedBlindBox?.id) return

    try {
      const response = await blindBoxAPI.getAllBlindBoxes()
      if (response.success) {
        const updatedBlindBox = response.data.find(box => box.id === selectedBlindBox.id)
        if (updatedBlindBox) {
          // 保持原有的格式化，只更新必要的信息（如库存）
          const formattedBox = {
            ...selectedBlindBox,
            stock: updatedBlindBox.stock,
            // 可以根据需要更新其他字段
          }
          setSelectedBlindBox(formattedBox)
          console.log(`📦 更新盲盒 ${updatedBlindBox.name} 库存: ${updatedBlindBox.stock}`)
        }
      }
    } catch (error) {
      console.error('更新盲盒信息失败:', error)
    }
  }

  // 获取随机颜色
  const getRandomColor = () => {
    const colors = [
      'bg-pink-300',
      'bg-blue-300',
      'bg-green-300',
      'bg-purple-300',
      'bg-yellow-300',
      'bg-red-300',
      'bg-indigo-300',
      'bg-gray-300'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // 获取随机标签
  const getRandomTags = () => {
    const tagsList = ['热门', '新品', '限量', '经典', '精选', '推荐']
    const count = Math.floor(Math.random() * 3) + 1
    const shuffled = tagsList.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // 获取用户订单
  const loadUserOrders = async () => {
    try {
      const response = await blindBoxAPI.getUserOrders(user.id)
      if (response.success) {
        setUserOrders(response.data)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
    }
  }

  // 获取用户盲盒库
  const loadUserLibrary = async () => {
    try {
      const response = await userLibraryAPI.getUserLibrary(user.id)
      if (response.success) {
        // 转换数据格式以兼容现有的前端逻辑
        const formattedLibrary = response.data.map(item => ({
          ...item.blindBox,
          quantity: item.quantity,
          addedTime: new Date(item.createdAt),
          libraryItemId: item.id, // 保存库项目ID用于后续操作
          blindBoxId: item.blindBoxId, // 保存原始盲盒ID
          // 保持原始盲盒ID，不要被覆盖
          // id 字段保持为盲盒的真实ID，用于API调用
        }))
        setUserLibrary(formattedLibrary)
      }
    } catch (error) {
      console.error('获取用户库失败:', error)
      showToast('获取用户库失败', 'error')
    }
  }

  // 获取用户余额
  const loadUserBalance = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`http://localhost:7001/api/user/${user.id}/balance`)
      const data = await response.json()
      if (data.success) {
        setUserBalance(data.data.balance)
      }
    } catch (error) {
      console.error('获取余额失败:', error)
    }
  }

  // 加载用户订单、用户库和余额
  useEffect(() => {
    if (user?.id) {
      loadUserOrders()
      loadUserLibrary()
      loadUserBalance() // 登录后立即检查余额
    }
  }, [user])

  // 监听用户余额变化，同步更新本地状态
  useEffect(() => {
    if (user?.balance !== undefined && user.balance !== userBalance) {
      console.log(`🔄 从用户对象同步余额: ${userBalance} -> ${user.balance}`)
      setUserBalance(user.balance)
    }
  }, [user?.balance])

  // 添加盲盒到用户库
  const addToLibrary = async (blindBox) => {
    try {
      const response = await userLibraryAPI.addToLibrary(user.id, blindBox.id, 1)
      if (response.success) {
        showToast(`${blindBox.name} 已添加到库中`, 'success')
        // 重新加载用户库
        loadUserLibrary()
      } else {
        showToast(response.message || '添加失败', 'error')
      }
    } catch (error) {
      console.error('添加到库失败:', error)
      showToast('添加到库失败', 'error')
    }
  }

  // 从用户库移除盲盒
  const removeFromLibrary = async (libraryItemId) => {
    try {
      const response = await userLibraryAPI.removeFromLibrary(libraryItemId, user.id)
      if (response.success) {
        showToast('已从库中移除', 'success')
        // 重新加载用户库
        loadUserLibrary()
      } else {
        showToast(response.message || '移除失败', 'error')
      }
    } catch (error) {
      console.error('从库中移除失败:', error)
      showToast('移除失败', 'error')
    }
  }

  // 抽取盲盒
  const drawBlindBox = async (blindBoxId) => {
    try {
      setLoading(true)
      const response = await blindBoxAPI.drawBlindBox(user.id, blindBoxId)
      if (response.success) {
        showToast('抽取成功！', 'success')
        // 更新用户订单
        loadUserOrders()
        // 重新加载盲盒数据（更新库存）
        const blindBoxResponse = await blindBoxAPI.getAllBlindBoxes()
        if (blindBoxResponse.success) {
          const formattedBoxes = blindBoxResponse.data.map(box => ({
            id: box.id,
            name: box.name,
            description: box.description,
            price: box.price,
            originalPrice: box.price * 1.2,
            color: getRandomColor(),
            stock: box.stock,
            sales: 0,
            rating: 4.5,
            isNew: Math.random() > 0.7,
            isHot: Math.random() > 0.6,
            tags: getRandomTags(),
            category: 'general',
            items: []
          }))
          setAllBlindBoxes(formattedBoxes)
        }
        return response.data
      } else {
        showToast(response.message || '抽取失败', 'error')
        return null
      }
    } catch (error) {
      console.error('抽取盲盒失败:', error)
      showToast('网络错误，请稍后重试', 'error')
      return null
    } finally {
      setLoading(false)
    }
  }

  // 显示提示消息
  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleBlindBoxClick = async (blindBox) => {
    try {
      setLoading(true)

      // 获取包含奖品信息的完整盲盒详情
      const response = await blindBoxAPI.getBlindBoxById(blindBox.id)

      if (response.success) {
        const mergedData = {
          ...blindBox, // 保留列表页的显示属性
          ...response.data // 使用后端的完整数据（包含奖品）
        }

        setSelectedBlindBox(mergedData)
        setPreviousTab(activeTab) // 记录当前页面作为来源页面
        setActiveTab('detail')
      } else {
        showToast(response.message || '获取盲盒详情失败', 'error')
      }
    } catch (error) {
      console.error('获取盲盒详情失败:', error)
      showToast('网络错误，请稍后重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 渲染盲盒卡片
  const renderBlindBoxCard = (blindBox, showAddButton = true) => {
    const isInLibrary = userLibrary.some(item => item.id === blindBox.id)

    return (
      <div key={blindBox.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="relative">
          <BlindBoxImage
            blindBoxId={blindBox.id}
            name={blindBox.name}
            width={300}
            height={128}
            className="rounded-t-lg cursor-pointer"
            onClick={() => handleBlindBoxClick(blindBox)}
          />
          {blindBox.isNew && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">新品</span>
          )}
          {blindBox.isHot && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">热门</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-800 mb-2 truncate">{blindBox.name}</h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-purple-600">¥{blindBox.price.toFixed(2)}</span>
              {blindBox.originalPrice > blindBox.price && (
                <span className="text-sm text-gray-400 line-through">¥{blindBox.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600">{blindBox.rating}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">剩余: {blindBox.stock}个</span>
            <span className="text-sm text-gray-500">已售: {blindBox.sales}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {blindBox.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
          {showAddButton && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                addToLibrary(blindBox)
              }}
              disabled={isInLibrary}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isInLibrary
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
            >
              {isInLibrary ? '已添加到库' : '添加到库'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // 渲染盲盒列表视图
  const renderBlindBoxList = (blindBoxes, showAddButton = true) => {
    return (
      <div className="space-y-4">
        {blindBoxes.map(blindBox => {
          const isInLibrary = userLibrary.some(item => item.id === blindBox.id)
          return (
            <div key={blindBox.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <BlindBoxImage
                    blindBoxId={blindBox.id}
                    name={blindBox.name}
                    width={80}
                    height={80}
                    className="rounded-lg cursor-pointer"
                    onClick={() => handleBlindBoxClick(blindBox)}
                  />
                  {blindBox.isNew && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">新</span>
                  )}
                  {blindBox.isHot && (
                    <span className="absolute -top-1 -left-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">热</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-800 text-lg">{blindBox.name}</h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">{blindBox.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{blindBox.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {blindBox.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-purple-600">¥{blindBox.price.toFixed(2)}</span>
                        {blindBox.originalPrice > blindBox.price && (
                          <span className="text-sm text-gray-400 line-through">¥{blindBox.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">剩余: {blindBox.stock}个</span>
                      <span className="text-sm text-gray-500">已售: {blindBox.sales}</span>
                    </div>
                    {showAddButton && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToLibrary(blindBox)
                        }}
                        disabled={isInLibrary}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isInLibrary
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                      >
                        {isInLibrary ? '已添加到库' : '添加到库'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'management':
        return <BlindBoxManagement user={user} />
      case 'draw':
        return <BlindBoxDraw user={user} selectedBlindBox={selectedBlindBox} />
      case 'orders':
        return <OrderManagement user={user} />
      case 'list':
        return <BlindBoxList onBlindBoxClick={handleBlindBoxClick} />
      case 'detail':
        return <BlindBoxDetail
          blindBox={selectedBlindBox}
          onBack={() => setActiveTab(previousTab)}
          user={user}
          showToast={showToast}
          onPurchaseSuccess={(updatedUser) => {
            if (updatedUser && updatedUser.balance !== undefined) {
              // 直接使用返回的用户信息更新余额
              setUserBalance(updatedUser.balance)
              console.log(`💰 订单生成后余额更新: ${updatedUser.balance}`)
            } else {
              // 如果没有返回用户信息，则重新加载
              loadUserBalance()
            }
            loadUserOrders() // 刷新订单列表
            loadUserLibrary() // 刷新用户库
            loadBlindBoxes() // 刷新盲盒列表（更新库存等信息）
            updateSelectedBlindBox() // 更新当前盲盒详情（库存等信息）

            // 调用App层级的余额刷新，确保全局状态同步
            if (onRefreshBalance) {
              onRefreshBalance()
            }

            // 购买成功后保留在当前页面，只刷新数据
            console.log('🔄 购买成功，数据已刷新，保留在当前页面')
          }}
        />
      case 'showcase':
        return <PlayerShowcase user={user} />
      case 'search':
        return <BlindBoxSearch onBlindBoxClick={handleBlindBoxClick} />
      case 'library':
        return (
          <div className="space-y-6">
            {/* 返回主页按钮 */}
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <span>←</span>
              <span>返回主页</span>
            </button>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">📦 我的盲盒库</h2>
                <span className="text-sm text-gray-500">共 {userLibrary.length} 种盲盒</span>
              </div>
              {userLibrary.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">库中暂无盲盒</h3>
                  <p className="text-gray-600 mb-4">快去首页添加喜欢的盲盒吧！</p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    去首页看看
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userLibrary.map(blindBox => (
                    <div key={blindBox.libraryItemId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <BlindBoxImage
                          blindBoxId={blindBox.id}
                          name={blindBox.name}
                          width={64}
                          height={64}
                          className="rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-800">{blindBox.name}</h3>
                            <button
                              onClick={() => removeFromLibrary(blindBox.libraryItemId)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              移除
                            </button>
                          </div>
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="text-sm text-gray-600">价格: ¥{blindBox.price.toFixed(2)}</span>
                            <span className="text-sm text-gray-600">剩余: {blindBox.stock}个</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBlindBoxClick(blindBox)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                            >
                              查看详情
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            {/* 欢迎横幅 */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">欢迎回来，{user.username}！</h2>
                  <p className="text-purple-100">发现更多精彩盲盒，开始你的收藏之旅</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-100">当前余额</p>
                  <p className="text-2xl font-bold">¥{userBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* 用户库快速访问 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">📦 我的盲盒库</h2>
                <button
                  onClick={() => setActiveTab('library')}
                  className="text-purple-600 text-sm hover:text-purple-700"
                >
                  查看全部 →
                </button>
              </div>
              {userLibrary.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-3xl mb-2">📦</div>
                  <p className="text-gray-600">还没有添加任何盲盒，快去下面挑选吧！</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {userLibrary.slice(0, 4).map(blindBox => (
                    <div key={blindBox.libraryItemId} className="text-center">
                      <BlindBoxImage
                        blindBoxId={blindBox.id}
                        name={blindBox.name}
                        width={64}
                        height={64}
                        className="rounded-lg mb-2 mx-auto"
                      />
                      <h3 className="text-sm font-medium text-gray-800 truncate">{blindBox.name}</h3>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 所有盲盒展示 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">🎲 所有盲盒</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <span className="text-sm">⋮⋮</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <span className="text-sm">☰</span>
                  </button>
                </div>
              </div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allBlindBoxes.map(blindBox => renderBlindBoxCard(blindBox))}
                </div>
              ) : (
                renderBlindBoxList(allBlindBoxes)
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo和标题 */}
            <div className="flex items-center space-x-4">
              <div
                className="cursor-pointer flex items-center space-x-2"
                onClick={() => setActiveTab('home')}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
                <h1 className="text-xl font-bold text-gray-800">盲盒世界</h1>
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-300 rounded-full"></div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{user.username}</p>
                  <p className="text-xs text-gray-500">余额: ¥{userBalance.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderMainContent()}
      </main>

      {/* 底部导航栏（移动端） */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 h-16">
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'home' ? 'text-purple-600' : 'text-gray-500'
              }`}
            onClick={() => setActiveTab('home')}
          >
            <span className="text-lg">🏠</span>
            <span className="text-xs">首页</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'library' ? 'text-purple-600' : 'text-gray-500'
              }`}
            onClick={() => setActiveTab('library')}
          >
            <span className="text-lg">📦</span>
            <span className="text-xs">我的库</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'draw' ? 'text-purple-600' : 'text-gray-500'
              }`}
            onClick={() => setActiveTab('draw')}
          >
            <span className="text-lg">🎲</span>
            <span className="text-xs">抽取</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'orders' ? 'text-purple-600' : 'text-gray-500'
              }`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="text-lg">📋</span>
            <span className="text-xs">订单</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'management' ? 'text-purple-600' : 'text-gray-500'
              }`}
            onClick={() => setActiveTab('management')}
          >
            <span className="text-lg">👤</span>
            <span className="text-xs">我的</span>
          </button>
        </div>
      </nav>

      {/* Toast 消息提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default HomePage
