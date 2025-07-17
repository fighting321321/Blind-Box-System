import { useState } from 'react'
import BlindBoxImage from './BlindBoxImage'

/**
 * 盲盒列表组件
 */
function BlindBoxList({ onBlindBoxClick }) {
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')

  // 盲盒分类
  const categories = [
    { id: 'all', name: '全部', icon: '🎲' },
    { id: 'animal', name: '动物系列', icon: '🐱' },
    { id: 'anime', name: '动漫系列', icon: '🎭' },
    { id: 'princess', name: '公主系列', icon: '👸' },
    { id: 'mecha', name: '机甲系列', icon: '🤖' },
    { id: 'fantasy', name: '梦幻系列', icon: '🦄' },
    { id: 'retro', name: '复古系列', icon: '📻' }
  ]

  // 排序选项
  const sortOptions = [
    { id: 'popularity', name: '人气最高' },
    { id: 'newest', name: '最新上架' },
    { id: 'price_low', name: '价格从低到高' },
    { id: 'price_high', name: '价格从高到低' },
    { id: 'sales', name: '销量最高' }
  ]

  // 盲盒数据
  const blindBoxes = [
    {
      id: 1,
      name: '可爱动物系列',
      category: 'animal',
      price: 59,
      originalPrice: 69,
      color: 'bg-pink-300',
      sales: 1234,
      rating: 4.8,
      isNew: false,
      isHot: true,
      tags: ['限量版', '热门'],
      description: '包含12种不同的可爱动物手办',
      releaseDate: '2025-06-15'
    },
    {
      id: 2,
      name: '动漫角色系列',
      category: 'anime',
      price: 79,
      originalPrice: 89,
      color: 'bg-blue-300',
      sales: 987,
      rating: 4.9,
      isNew: true,
      isHot: true,
      tags: ['新品', '联名'],
      description: '热门动漫角色限定款，稀有度更高',
      releaseDate: '2025-07-01'
    },
    {
      id: 3,
      name: '卡通宠物系列',
      category: 'animal',
      price: 49,
      originalPrice: 49,
      color: 'bg-green-300',
      sales: 756,
      rating: 4.6,
      isNew: false,
      isHot: false,
      tags: ['经典'],
      description: '经典卡通宠物造型，适合收藏',
      releaseDate: '2025-05-20'
    },
    {
      id: 4,
      name: '梦幻公主系列',
      category: 'princess',
      price: 89,
      originalPrice: 99,
      color: 'bg-purple-300',
      sales: 654,
      rating: 4.7,
      isNew: false,
      isHot: true,
      tags: ['精品', '限量'],
      description: '精美公主主题，工艺精湛',
      releaseDate: '2025-06-01'
    },
    {
      id: 5,
      name: '科幻机甲系列',
      category: 'mecha',
      price: 99,
      originalPrice: 119,
      color: 'bg-gray-300',
      sales: 543,
      rating: 4.5,
      isNew: true,
      isHot: false,
      tags: ['新品', '可动'],
      description: '未来科技风格，可动关节设计',
      releaseDate: '2025-07-05'
    },
    {
      id: 6,
      name: '古风仙侠系列',
      category: 'fantasy',
      price: 69,
      originalPrice: 79,
      color: 'bg-yellow-300',
      sales: 432,
      rating: 4.4,
      isNew: false,
      isHot: false,
      tags: ['古风', '仙侠'],
      description: '传统文化元素，古韵悠长',
      releaseDate: '2025-05-10'
    },
    {
      id: 7,
      name: '梦幻独角兽系列',
      category: 'fantasy',
      price: 79,
      originalPrice: 89,
      color: 'bg-rainbow',
      sales: 321,
      rating: 4.9,
      isNew: true,
      isHot: true,
      tags: ['新品', '梦幻', '稀有'],
      description: '彩虹独角兽主题，梦幻色彩',
      releaseDate: '2025-07-10'
    },
    {
      id: 8,
      name: '复古音乐系列',
      category: 'retro',
      price: 59,
      originalPrice: 69,
      color: 'bg-orange-300',
      sales: 234,
      rating: 4.3,
      isNew: false,
      isHot: false,
      tags: ['复古', '音乐'],
      description: '怀旧音乐元素，复古风格',
      releaseDate: '2025-04-25'
    }
  ]

  // 筛选和排序逻辑
  const getFilteredAndSortedBoxes = () => {
    let filtered = blindBoxes

    // 分类筛选
    if (category !== 'all') {
      filtered = filtered.filter(box => box.category === category)
    }

    // 排序
    switch (sortBy) {
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        break
      case 'price_low':
        filtered = filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        filtered = filtered.sort((a, b) => b.price - a.price)
        break
      case 'sales':
        filtered = filtered.sort((a, b) => b.sales - a.sales)
        break
      case 'popularity':
      default:
        filtered = filtered.sort((a, b) => b.rating * b.sales - a.rating * a.sales)
        break
    }

    return filtered
  }

  const filteredBoxes = getFilteredAndSortedBoxes()

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">盲盒列表</h1>
        <p className="text-sm text-gray-600">共 {filteredBoxes.length} 个盲盒</p>
      </div>

      {/* 分类筛选 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">分类筛选</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                category === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
              }`}
              onClick={() => setCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 排序选项 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">排序方式</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 盲盒网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBoxes.map((box) => (
          <div
            key={box.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onBlindBoxClick(box)}
          >
            {/* 盲盒图片和标签 */}
            <div className="relative">
              <BlindBoxImage
                blindBoxId={box.id}
                name={box.name}
                width={300}
                height={192}
                className="rounded-t-lg group-hover:scale-105 transition-transform"
              />
              
              {/* 标签 */}
              <div className="absolute top-2 left-2 flex space-x-1">
                {box.isNew && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">新品</span>
                )}
                {box.isHot && (
                  <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">热门</span>
                )}
              </div>

              {/* 收藏按钮 */}
              <button className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                <span className="text-gray-600 hover:text-red-500">♡</span>
              </button>
            </div>

            {/* 盲盒信息 */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                {box.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {box.description}
              </p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-1 mb-3">
                {box.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 评分和销量 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm text-gray-600">{box.rating}</span>
                </div>
                <span className="text-sm text-gray-500">已售 {box.sales}</span>
              </div>

              {/* 价格 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-purple-600">¥{box.price.toFixed(2)}</span>
                  {box.originalPrice > box.price && (
                    <span className="text-sm text-gray-500 line-through">¥{box.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <button
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    // 直接抽取的逻辑
                  }}
                >
                  立即抽取
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 加载更多 */}
      {filteredBoxes.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
            加载更多
          </button>
        </div>
      )}

      {/* 空状态 */}
      {filteredBoxes.length === 0 && (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="text-gray-400 text-4xl mb-4">🎲</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无盲盒</h3>
          <p className="text-gray-600">该分类下暂时没有盲盒商品</p>
        </div>
      )}
    </div>
  )
}

export default BlindBoxList
