import { useState } from 'react'
import BlindBoxManagement from './BlindBoxManagement'
import BlindBoxDraw from './BlindBoxDraw'
import OrderManagement from './OrderManagement'
import BlindBoxList from './BlindBoxList'
import BlindBoxDetail from './BlindBoxDetail'
import PlayerShowcase from './PlayerShowcase'
import BlindBoxSearch from './BlindBoxSearch'

/**
 * 盲盒系统主页组件
 * 类似小红书和淘宝的主页布局
 */
function HomePage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedBlindBox, setSelectedBlindBox] = useState(null)

  // 主页轮播图数据
  const bannerImages = [
    { id: 1, color: 'bg-gradient-to-r from-pink-400 to-purple-600', title: '限定盲盒', subtitle: '新品上市' },
    { id: 2, color: 'bg-gradient-to-r from-blue-400 to-cyan-600', title: '热门盲盒', subtitle: '火爆抢购' },
    { id: 3, color: 'bg-gradient-to-r from-orange-400 to-red-600', title: '精选盲盒', subtitle: '品质保证' }
  ]

  // 功能模块数据
  const features = [
    { id: 'management', icon: '📦', title: '盲盒管理', description: '管理您的盲盒收藏' },
    { id: 'draw', icon: '🎲', title: '盲盒抽取', description: '体验抽取的乐趣' },
    { id: 'orders', icon: '📋', title: '订单管理', description: '查看订单记录' },
    { id: 'list', icon: '📝', title: '盲盒列表', description: '浏览所有盲盒' },
    { id: 'showcase', icon: '✨', title: '玩家秀', description: '展示您的收藏' },
    { id: 'search', icon: '🔍', title: '盲盒搜索', description: '快速找到心仪盲盒' }
  ]

  // 热门盲盒数据（使用纯色图片代替）
  const hotBlindBoxes = [
    { id: 1, name: '可爱动物系列', price: 59, color: 'bg-pink-300', sales: 1234 },
    { id: 2, name: '动漫角色系列', price: 79, color: 'bg-blue-300', sales: 987 },
    { id: 3, name: '卡通宠物系列', price: 49, color: 'bg-green-300', sales: 756 },
    { id: 4, name: '梦幻公主系列', price: 89, color: 'bg-purple-300', sales: 654 },
    { id: 5, name: '科幻机甲系列', price: 99, color: 'bg-gray-300', sales: 543 },
    { id: 6, name: '古风仙侠系列', price: 69, color: 'bg-yellow-300', sales: 432 }
  ]

  const handleBlindBoxClick = (blindBox) => {
    setSelectedBlindBox(blindBox)
    setActiveTab('detail')
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'management':
        return <BlindBoxManagement user={user} />
      case 'draw':
        return <BlindBoxDraw user={user} />
      case 'orders':
        return <OrderManagement user={user} />
      case 'list':
        return <BlindBoxList onBlindBoxClick={handleBlindBoxClick} />
      case 'detail':
        return <BlindBoxDetail blindBox={selectedBlindBox} onBack={() => setActiveTab('home')} />
      case 'showcase':
        return <PlayerShowcase user={user} />
      case 'search':
        return <BlindBoxSearch onBlindBoxClick={handleBlindBoxClick} />
      default:
        return (
          <div className="space-y-6">
            {/* 轮播图区域 */}
            <div className="relative h-48 rounded-lg overflow-hidden">
              <div className={`w-full h-full ${bannerImages[0].color} flex items-center justify-center text-white`}>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{bannerImages[0].title}</h2>
                  <p className="text-lg opacity-90">{bannerImages[0].subtitle}</p>
                </div>
              </div>
            </div>

            {/* 功能模块网格 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                  onClick={() => setActiveTab(feature.id)}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <h3 className="font-medium text-gray-800 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 热门盲盒区域 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">🔥 热门盲盒</h2>
                <button 
                  className="text-purple-600 text-sm hover:text-purple-700"
                  onClick={() => setActiveTab('list')}
                >
                  查看更多 →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {hotBlindBoxes.map((box) => (
                  <div
                    key={box.id}
                    className="cursor-pointer group"
                    onClick={() => handleBlindBoxClick(box)}
                  >
                    <div className={`${box.color} h-24 rounded-lg mb-2 group-hover:scale-105 transition-transform`}></div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1 truncate">{box.name}</h3>
                    <p className="text-sm text-purple-600 font-bold">¥{box.price}</p>
                    <p className="text-xs text-gray-500">已售 {box.sales}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 最新动态区域 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📢 最新动态</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-300 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-800">用户 <span className="font-medium">小明</span> 抽到了稀有款</p>
                    <p className="text-xs text-gray-500">2分钟前</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-pink-300 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-800">新品 <span className="font-medium">梦幻独角兽</span> 系列上架</p>
                    <p className="text-xs text-gray-500">1小时前</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-300 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-800">限时活动：充值送盲盒</p>
                    <p className="text-xs text-gray-500">3小时前</p>
                  </div>
                </div>
              </div>
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
                  <p className="text-xs text-gray-500">余额: ¥{user.balance}</p>
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
        <div className="grid grid-cols-4 h-16">
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'home' ? 'text-purple-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('home')}
          >
            <span className="text-lg">🏠</span>
            <span className="text-xs">首页</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'list' ? 'text-purple-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('list')}
          >
            <span className="text-lg">📝</span>
            <span className="text-xs">盲盒</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'draw' ? 'text-purple-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('draw')}
          >
            <span className="text-lg">🎲</span>
            <span className="text-xs">抽取</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'management' ? 'text-purple-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('management')}
          >
            <span className="text-lg">👤</span>
            <span className="text-xs">我的</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default HomePage
