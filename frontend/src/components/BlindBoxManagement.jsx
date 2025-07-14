import { useState } from 'react'

/**
 * 盲盒管理组件
 */
function BlindBoxManagement({ user }) {
  const [activeSection, setActiveSection] = useState('collection')

  // 模拟用户收藏的盲盒数据
  const myCollection = [
    { id: 1, name: '可爱小熊', series: '动物系列', rarity: '普通', color: 'bg-pink-300', obtainedAt: '2025-07-10' },
    { id: 2, name: '神秘猫咪', series: '动物系列', rarity: '稀有', color: 'bg-purple-300', obtainedAt: '2025-07-11' },
    { id: 3, name: '梦幻独角兽', series: '梦幻系列', rarity: '超稀有', color: 'bg-rainbow', obtainedAt: '2025-07-12' },
    { id: 4, name: '机械战士', series: '科幻系列', rarity: '普通', color: 'bg-gray-300', obtainedAt: '2025-07-13' }
  ]

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case '普通': return 'text-gray-600 bg-gray-100'
      case '稀有': return 'text-blue-600 bg-blue-100'
      case '超稀有': return 'text-purple-600 bg-purple-100'
      case '传说': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderCollection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">我的收藏</h2>
        <span className="text-sm text-gray-500">共 {myCollection.length} 件</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myCollection.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className={`${item.color} h-32 rounded-lg mb-3`}></div>
            <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.series}</p>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </span>
              <span className="text-xs text-gray-500">{item.obtainedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderStats = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">收藏统计</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-purple-600">{myCollection.length}</div>
          <div className="text-sm text-gray-600">总收藏</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">2</div>
          <div className="text-sm text-gray-600">稀有品</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-600">3</div>
          <div className="text-sm text-gray-600">系列数</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">75%</div>
          <div className="text-sm text-gray-600">完成度</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-4">稀有度分布</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">普通</span>
            <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
              <div className="bg-gray-500 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <span className="text-sm text-gray-600">2件</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">稀有</span>
            <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
            <span className="text-sm text-gray-600">1件</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">超稀有</span>
            <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
            <span className="text-sm text-gray-600">1件</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderWishlist = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">愿望清单</h2>
      
      <div className="bg-white rounded-lg p-6 shadow-sm text-center">
        <div className="text-gray-400 text-4xl mb-4">💫</div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">暂无愿望清单</h3>
        <p className="text-gray-600 mb-4">添加您想要的盲盒到愿望清单</p>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          去逛逛
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">盲盒管理</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>👤</span>
          <span>{user.username}</span>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="bg-white rounded-lg p-1 shadow-sm">
        <div className="flex space-x-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'collection'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveSection('collection')}
          >
            我的收藏
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'stats'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveSection('stats')}
          >
            收藏统计
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'wishlist'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveSection('wishlist')}
          >
            愿望清单
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeSection === 'collection' && renderCollection()}
      {activeSection === 'stats' && renderStats()}
      {activeSection === 'wishlist' && renderWishlist()}
    </div>
  )
}

export default BlindBoxManagement
