import { useState, useEffect } from 'react'
import BlindBoxManagement from './BlindBoxManagement'
import BlindBoxDraw from './BlindBoxDraw'
import OrderManagement from './OrderManagement'
import BlindBoxList from './BlindBoxList'
import BlindBoxDetail from './BlindBoxDetail'
import PlayerShowcase from './PlayerShowcase'
import BlindBoxSearch from './BlindBoxSearch'
import UserPrizes from './UserPrizes'
// import Toast from './Toast'
import BlindBoxImage from './BlindBoxImage'
import { blindBoxAPI, userLibraryAPI } from '../services/api'

/**
 * 盲盒系统主页组件
 * 普通用户主页：展示所有盲盒，支持添加到库，库管理，订单管理
 */
function HomePage({ user, onLogout, onRefreshBalance, showToast }) {
  // 用户奖品数据
  const [userPrizes, setUserPrizes] = useState([]);
  // 拉取用户奖品数据
  const loadUserPrizes = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`http://localhost:7001/api/sqlite/user-prizes?userId=${user.id}&pageSize=1000`);
      const data = await response.json();
      if (data.success) {
        // 保留 prizeId 字段，确保 PlayerShowcase 选中 prizeId 正确
        const formatted = data.data.prizes.map(prize => ({
          id: prize.id,
          prizeId: prize.prizeId, // 关键字段
          name: prize.prizeName,
          color: prize.color || 'bg-gray-300',
        }));
        setUserPrizes(formatted);
      } else {
        setUserPrizes([]);
      }
    } catch (e) {
      setUserPrizes([]);
    }
  };
  const [activeTab, setActiveTab] = useState('home')
  const [selectedBlindBox, setSelectedBlindBox] = useState(null)
  const [previousTab, setPreviousTab] = useState('home') // 记录进入详情页前的页面
  const [viewMode, setViewMode] = useState('grid') // 'grid' 或 'list'
  const [userLibrary, setUserLibrary] = useState([]) // 用户盲盒库
  const [allBlindBoxes, setAllBlindBoxes] = useState([]) // 所有可用盲盒
  const [searchBox, setSearchBox] = useState(''); // 盲盒搜索关键词
  const [userOrders, setUserOrders] = useState([]) // 用户订单
  const [loading, setLoading] = useState(false)
  // const [toast, setToast] = useState(null)
  const [userBalance, setUserBalance] = useState(0) // 用户余额状态

  // 从后端获取盲盒数据
  // 加载盲盒数据
  const loadBlindBoxes = async () => {
    try {
      setLoading(true)
      const response = await blindBoxAPI.getAllBlindBoxes()
      if (response.success) {
        // 将后端数据转换为前端格式
        const formattedBoxes = response.data.map((box, index) => ({
          id: box.id,
          name: box.name,
          description: box.description,
          price: box.price,
          originalPrice: box.price * 1.2, // 模拟原价
          color: getRandomColor(),
          stock: box.stock,
          sales: box.sales || 0, // 使用后端返回的真实销量数据
          isNew: Math.random() > 0.7,
          isHot: Math.random() > 0.6,
          tags: getRandomTags(),
          category: 'general',
          items: [], // 后续可以从奖品数据中获取
          releaseDate: box.createdAt ? new Date(box.createdAt).toISOString().split('T')[0] : '2025-07-21'
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
          // 保持原有的格式化，更新库存和销量信息
          const formattedBox = {
            ...selectedBlindBox,
            stock: updatedBlindBox.stock,
            sales: updatedBlindBox.sales || 0, // 更新销量信息
            // 可以根据需要更新其他字段
          }
          setSelectedBlindBox(formattedBox)
          console.log(`📦 更新盲盒 ${updatedBlindBox.name} 库存: ${updatedBlindBox.stock}, 销量: ${updatedBlindBox.sales || 0}`)
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
        const formattedLibrary = response.data.map((item, index) => ({
          ...item.blindBox,
          quantity: item.quantity,
          addedTime: new Date(item.createdAt),
          libraryItemId: item.id, // 保存库项目ID用于后续操作
          blindBoxId: item.blindBoxId, // 保存原始盲盒ID
          // 保持原始盲盒ID，不要被覆盖
          // id 字段保持为盲盒的真实ID，用于API调用
          // 添加格式化字段以保持一致性
          originalPrice: item.blindBox.price * 1.2, // 模拟原价
          color: getRandomColor(),
          sales: item.blindBox.sales || 0, // 使用后端返回的真实销量数据
          isNew: Math.random() > 0.7,
          isHot: Math.random() > 0.6,
          tags: getRandomTags(),
          category: 'general',
          releaseDate: item.blindBox.createdAt ? new Date(item.blindBox.createdAt).toISOString().split('T')[0] : '2025-07-21'
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

  // 加载用户订单、用户库、余额和奖品
  useEffect(() => {
    if (user?.id) {
      loadUserOrders();
      loadUserLibrary();
      loadUserBalance();
      loadUserPrizes();
    }
  }, [user]);

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
          const formattedBoxes = blindBoxResponse.data.map((box, index) => ({
            id: box.id,
            name: box.name,
            description: box.description,
            price: box.price,
            originalPrice: box.price * 1.2,
            color: getRandomColor(),
            stock: box.stock,
            sales: box.sales || 0, // 使用后端返回的真实销量数据
            isNew: Math.random() > 0.7,
            isHot: Math.random() > 0.6,
            tags: getRandomTags(),
            category: 'general',
            items: [],
            releaseDate: box.createdAt ? new Date(box.createdAt).toISOString().split('T')[0] : '2025-07-21'
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

  // 显示提示消息由 props 提供

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
            <span className="text-sm text-gray-500">剩余: {blindBox.stock}个</span>
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
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${isInLibrary
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md transform hover:scale-105 border border-purple-600 hover:border-purple-700'
                }`}
            >
              {isInLibrary ? '✓ 已添加到库' : '+ 添加到库'}
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
        {/* 搜索框，仅主页盲盒列表顶部显示 */}
        {showAddButton && (
          <div className="mb-4 flex justify-end">
            <input
              type="text"
              className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="搜索盲盒名称..."
              value={searchBox}
              onChange={e => setSearchBox(e.target.value)}
            />
          </div>
        )}
        {blindBoxes
          .filter(box => box.name.includes(searchBox))
          .map(blindBox => {
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
                    </div>
                    {showAddButton && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToLibrary(blindBox)
                        }}
                        disabled={isInLibrary}
                        className={`py-2.5 px-6 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${isInLibrary
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md transform hover:scale-105 border border-purple-600 hover:border-purple-700'
                          }`}
                      >
                        {isInLibrary ? '✓ 已添加到库' : '+ 添加到库'}
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
        return <BlindBoxDraw user={user} selectedBlindBox={selectedBlindBox} showToast={showToast} />
      case 'orders':
        return <OrderManagement user={user} />
      case 'prizes':
        return <UserPrizes user={user} />
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
        // 传递默认标题和描述逻辑给PlayerShowcase
        const getDefaultShowcaseFields = (fields) => ({
          ...fields,
          title: fields.title && fields.title.trim() ? fields.title : '该用户没有填写标题',
          description: fields.description && fields.description.trim() ? fields.description : '该用户没有填写描述',
        });
        return <PlayerShowcase user={user} userPrizes={userPrizes} getDefaultShowcaseFields={getDefaultShowcaseFields} />
      case 'search':
        return <BlindBoxSearch onBlindBoxClick={handleBlindBoxClick} />
      case 'library':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">📦 我的盲盒库</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">共 {userLibrary.length} 种盲盒</span>

                  {/* 显示方式切换 */}
                  <div className="flex border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-[60px] ${viewMode === 'grid'
                        ? 'bg-purple-600 text-white shadow-md transform scale-105 border-purple-600'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-200'
                        }`}
                    >
                      <span className="mr-1">⊞</span>
                      网格
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-[60px] ml-1 ${viewMode === 'list'
                        ? 'bg-purple-600 text-white shadow-md transform scale-105 border-purple-600'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-200'
                        }`}
                    >
                      <span className="mr-1">☰</span>
                      列表
                    </button>
                  </div>
                </div>
              </div>

              {userLibrary.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">库中暂无盲盒</h3>
                  <p className="text-gray-600 mb-4">快去首页添加喜欢的盲盒吧！</p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 border border-purple-600"
                  >
                    🏠 去首页看看
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
                }>
                  {userLibrary.map(blindBox => (
                    <div
                      key={blindBox.libraryItemId}
                      className={viewMode === 'grid'
                        ? "bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                        : "bg-gray-50 rounded-lg p-4"
                      }
                    >
                      <div className={viewMode === 'grid'
                        ? "text-center space-y-3"
                        : "flex items-center space-x-4"
                      }>
                        <BlindBoxImage
                          blindBoxId={blindBox.id}
                          name={blindBox.name}
                          width={viewMode === 'grid' ? 80 : 64}
                          height={viewMode === 'grid' ? 80 : 64}
                          className={viewMode === 'grid'
                            ? "rounded-lg mx-auto"
                            : "rounded-lg flex-shrink-0"
                          }
                        />
                        <div className={viewMode === 'grid' ? "space-y-2" : "flex-1"}>
                          <div className={viewMode === 'grid'
                            ? "space-y-1"
                            : "flex items-start justify-between mb-2"
                          }>
                            <h3 className="font-medium text-gray-800">{blindBox.name}</h3>
                            {viewMode === 'list' && (
                              <button
                                onClick={() => removeFromLibrary(blindBox.libraryItemId)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-200"
                              >
                                移除
                              </button>
                            )}
                          </div>
                          <div className={viewMode === 'grid'
                            ? "space-y-1 text-sm text-gray-600"
                            : "flex items-center space-x-4 mb-3"
                          }>
                            <span className="text-sm text-gray-600">价格: ¥{blindBox.price.toFixed(2)}</span>
                            <span className="text-sm text-gray-600">剩余: {blindBox.stock}个</span>
                          </div>
                          <div className={viewMode === 'grid'
                            ? "flex flex-col space-y-2"
                            : "flex space-x-2"
                          }>
                            <button
                              onClick={() => handleBlindBoxClick(blindBox)}
                              className="bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 border border-purple-600"
                            >
                              查看详情
                            </button>
                            {viewMode === 'grid' && (
                              <button
                                onClick={() => removeFromLibrary(blindBox.libraryItemId)}
                                className="text-red-500 hover:text-red-700 text-sm py-2 font-medium hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
                              >
                                移除
                              </button>
                            )}
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
                  className="text-purple-600 text-sm hover:text-purple-700 font-medium px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-all duration-200 border border-transparent hover:border-purple-200"
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
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">发现精彩盲盒</span>

                  {/* 显示方式切换 */}
                  <div className="flex border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-[60px] ${viewMode === 'grid'
                        ? 'bg-purple-600 text-white shadow-md transform scale-105 border-purple-600'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-200'
                        }`}
                    >
                      <span className="mr-1">⊞</span>
                      网格
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-[60px] ml-1 ${viewMode === 'list'
                        ? 'bg-purple-600 text-white shadow-md transform scale-105 border-purple-600'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-200'
                        }`}
                    >
                      <span className="mr-1">☰</span>
                      列表
                    </button>
                  </div>
                </div>
              </div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allBlindBoxes
                    .filter(box => box.name.includes(searchBox))
                    .map(blindBox => renderBlindBoxCard(blindBox))}
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

            {/* 主导航菜单 */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('home')}
                className={`text-sm font-medium transition-colors ${activeTab === 'home'
                  ? 'text-purple-600 border-b-2 border-purple-600 pb-2'
                  : 'text-gray-600 hover:text-purple-600'
                  }`}
              >
                主页
              </button>

              <button
                onClick={() => setActiveTab('library')}
                className={`text-sm font-medium transition-colors ${activeTab === 'library'
                  ? 'text-purple-600 border-b-2 border-purple-600 pb-2'
                  : 'text-gray-600 hover:text-purple-600'
                  }`}
              >
                盲盒
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`text-sm font-medium transition-colors ${activeTab === 'orders'
                  ? 'text-purple-600 border-b-2 border-purple-600 pb-2'
                  : 'text-gray-600 hover:text-purple-600'
                  }`}
              >
                订单
              </button>

              <button
                onClick={() => setActiveTab('prizes')}
                className={`text-sm font-medium transition-colors ${activeTab === 'prizes'
                  ? 'text-purple-600 border-b-2 border-purple-600 pb-2'
                  : 'text-gray-600 hover:text-purple-600'
                  }`}
              >
                奖品
              </button>

              <button
                onClick={() => setActiveTab('showcase')}
                className={`text-sm font-medium transition-colors ${activeTab === 'showcase'
                  ? 'text-purple-600 border-b-2 border-purple-600 pb-2'
                  : 'text-gray-600 hover:text-purple-600'
                  }`}
              >
                玩家秀
              </button>
            </nav>

            {/* 用户信息 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-300 rounded-full"></div>
                <div className="hidden lg:block">
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
            <span className="text-xs">盲盒</span>
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
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'prizes' ? 'text-purple-600' : 'text-gray-500'
              }`}
            onClick={() => setActiveTab('prizes')}
          >
            <span className="text-lg">🎁</span>
            <span className="text-xs">奖品</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'showcase' ? 'text-purple-600' : 'text-gray-500'
              }`}
            onClick={() => setActiveTab('showcase')}
          >
            <span className="text-lg">�</span>
            <span className="text-xs">玩家秀</span>
          </button>
        </div>
      </nav>

      {/* Toast 消息提示已全局处理 */}
    </div>
  )
}

export default HomePage
