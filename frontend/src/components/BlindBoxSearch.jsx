import { useState } from 'react'

/**      sales: 867,      sales: 456,
      isNew: false,     isNew: true, 盲盒搜索组件
 */
function BlindBoxSearch({ onBlindBoxClick }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState(['可爱动物', '动漫角色', '梦幻公主'])
  const [filterOptions, setFilterOptions] = useState({
    category: 'all',
    priceRange: 'all',
    rarity: 'all',
    inStock: false
  })
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false)

  // 模拟搜索结果数据
  const searchResults = [
    {
      id: 1,
      name: '可爱动物系列',
      category: 'animal',
      price: 59,
      originalPrice: 69,
      color: 'bg-pink-300',
      sales: 1234,
      isNew: false,
      isHot: true,
      inStock: true,
      tags: ['限量版', '热门'],
      description: '包含12种不同的可爱动物手办',
      matchReason: '匹配关键词: 可爱, 动物'
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
      inStock: true,
      tags: ['新品', '联名'],
      description: '热门动漫角色限定款，稀有度更高',
      matchReason: '匹配关键词: 动漫, 角色'
    },
    {
      id: 3,
      name: '梦幻公主系列',
      category: 'princess',
      price: 89,
      originalPrice: 99,
      color: 'bg-purple-300',
      sales: 654,
      rating: 4.7,
      isNew: false,
      isHot: true,
      inStock: false,
      tags: ['精品', '限量'],
      description: '精美公主主题，工艺精湛',
      matchReason: '匹配关键词: 梦幻, 公主'
    }
  ]

  // 热门搜索词
  const hotSearchTerms = [
    '限定版', '稀有款', '动漫联名', '可爱动物', '梦幻系列',
    '机甲模型', '公主主题', '传说级', '新品上市', '特价促销'
  ]

  // 搜索建议
  const searchSuggestions = [
    '可爱动物系列盲盒',
    '动漫角色限定款',
    '梦幻公主收藏版',
    '科幻机甲可动款',
    '复古音乐主题'
  ]

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // 添加到搜索历史
      if (!searchHistory.includes(searchQuery.trim())) {
        setSearchHistory([searchQuery.trim(), ...searchHistory.slice(0, 4)])
      }

      // 执行搜索逻辑
      console.log('搜索:', searchQuery, filterOptions)
    }
  }

  const handleQuickSearch = (term) => {
    setSearchQuery(term)
    handleSearch()
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
  }

  const applyFilters = () => {
    console.log('应用筛选条件:', filterOptions)
  }

  const resetFilters = () => {
    setFilterOptions({
      category: 'all',
      priceRange: 'all',
      rarity: 'all',
      inStock: false
    })
  }

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">盲盒搜索</h1>
        <button
          className="text-sm text-purple-600 hover:text-purple-700"
          onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
        >
          {isAdvancedSearch ? '简单搜索' : '高级搜索'}
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
              placeholder="搜索盲盒名称、系列、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600">
              🔍
            </button>
          </div>
          <button
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            onClick={handleSearch}
          >
            搜索
          </button>
        </div>

        {/* 搜索建议 */}
        {searchQuery && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">搜索建议</h4>
            <div className="space-y-2">
              {searchSuggestions
                .filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 3)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                    onClick={() => setSearchQuery(suggestion)}
                  >
                    🔍 {suggestion}
                  </button>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* 高级搜索选项 */}
      {isAdvancedSearch && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">筛选条件</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 分类筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filterOptions.category}
                onChange={(e) => setFilterOptions({ ...filterOptions, category: e.target.value })}
              >
                <option value="all">全部分类</option>
                <option value="animal">动物系列</option>
                <option value="anime">动漫系列</option>
                <option value="princess">公主系列</option>
                <option value="mecha">机甲系列</option>
                <option value="fantasy">梦幻系列</option>
              </select>
            </div>

            {/* 价格范围 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">价格范围</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filterOptions.priceRange}
                onChange={(e) => setFilterOptions({ ...filterOptions, priceRange: e.target.value })}
              >
                <option value="all">全部价格</option>
                <option value="0-50">¥0-50</option>
                <option value="50-100">¥50-100</option>
                <option value="100-200">¥100-200</option>
                <option value="200+">¥200以上</option>
              </select>
            </div>

            {/* 稀有度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">稀有度</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filterOptions.rarity}
                onChange={(e) => setFilterOptions({ ...filterOptions, rarity: e.target.value })}
              >
                <option value="all">全部稀有度</option>
                <option value="common">普通</option>
                <option value="rare">稀有</option>
                <option value="super-rare">超稀有</option>
                <option value="legendary">传说</option>
              </select>
            </div>

            {/* 库存状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">库存状态</label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  checked={filterOptions.inStock}
                  onChange={(e) => setFilterOptions({ ...filterOptions, inStock: e.target.checked })}
                />
                <span className="text-sm text-gray-700">仅显示有库存</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              onClick={applyFilters}
            >
              应用筛选
            </button>
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={resetFilters}
            >
              重置筛选
            </button>
          </div>
        </div>
      )}

      {/* 热门搜索 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">热门搜索</h3>
        <div className="flex flex-wrap gap-2">
          {hotSearchTerms.map((term, index) => (
            <button
              key={index}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-100 hover:text-purple-600 transition-colors text-sm"
              onClick={() => handleQuickSearch(term)}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* 搜索历史 */}
      {searchHistory.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">搜索历史</h3>
            <button
              className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              onClick={clearSearchHistory}
            >
              清除历史
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <button
                key={index}
                className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm flex items-center space-x-2"
                onClick={() => handleQuickSearch(term)}
              >
                <span>🕐</span>
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              搜索结果 "{searchQuery}" ({searchResults.length} 个结果)
            </h3>
            <div className="flex space-x-2 text-sm">
              <button className="text-purple-600 hover:text-purple-700">按相关度</button>
              <span className="text-gray-400">|</span>
              <button className="text-gray-600 hover:text-purple-600">按价格</button>
              <span className="text-gray-400">|</span>
              <button className="text-gray-600 hover:text-purple-600">按销量</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((box) => (
              <div
                key={box.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onBlindBoxClick(box)}
              >
                {/* 盲盒图片和标签 */}
                <div className="relative">
                  <div className={`${box.color} h-48 rounded-t-lg group-hover:scale-105 transition-transform`}></div>

                  {/* 标签 */}
                  <div className="absolute top-2 left-2 flex space-x-1">
                    {box.isNew && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">新品</span>
                    )}
                    {box.isHot && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">热门</span>
                    )}
                    {!box.inStock && (
                      <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">缺货</span>
                    )}
                  </div>

                  {/* 匹配原因 */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {box.matchReason}
                    </div>
                  </div>
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

                  {/* 销量 */}
                  <div className="flex items-center justify-between mb-3">
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
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${box.inStock
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (box.inStock) {
                          // 直接抽取的逻辑
                        }
                      }}
                      disabled={!box.inStock}
                    >
                      {box.inStock ? '立即抽取' : '暂时缺货'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                显示 {searchResults.length} 个结果
              </p>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  上一页
                </button>
                <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  2
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 空搜索状态 */}
      {!searchQuery && (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">开始搜索盲盒</h3>
          <p className="text-gray-600">输入关键词，找到您心仪的盲盒</p>
        </div>
      )}
    </div>
  )
}

export default BlindBoxSearch
