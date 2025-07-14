import { useState } from 'react'

/**
 * 盲盒详情组件
 */
function BlindBoxDetail({ blindBox, onBack }) {
  const [activeTab, setActiveTab] = useState('detail')
  const [quantity, setQuantity] = useState(1)

  if (!blindBox) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm text-center">
        <div className="text-gray-400 text-4xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">盲盒不存在</h3>
        <p className="text-gray-600">请选择其他盲盒查看详情</p>
      </div>
    )
  }

  // 模拟盲盒内容物数据
  const items = [
    { 
      id: 1, 
      name: '可爱小熊 - 普通款', 
      rarity: '普通', 
      probability: 40, 
      color: 'bg-pink-200',
      description: '经典可爱造型，适合日常摆放'
    },
    { 
      id: 2, 
      name: '可爱小熊 - 彩色款', 
      rarity: '普通', 
      probability: 30, 
      color: 'bg-pink-300',
      description: '多彩涂装版本，更加亮眼'
    },
    { 
      id: 3, 
      name: '可爱小熊 - 闪亮款', 
      rarity: '稀有', 
      probability: 20, 
      color: 'bg-blue-300',
      description: '带有闪亮效果的特殊版本'
    },
    { 
      id: 4, 
      name: '可爱小熊 - 黄金款', 
      rarity: '超稀有', 
      probability: 8, 
      color: 'bg-yellow-400',
      description: '黄金涂装，收藏价值极高'
    },
    { 
      id: 5, 
      name: '可爱小熊 - 钻石款', 
      rarity: '传说', 
      probability: 2, 
      color: 'bg-purple-500',
      description: '最稀有的钻石版本，万中挑一'
    }
  ]

  // 用户评价数据
  const reviews = [
    {
      id: 1,
      username: '盲盒达人',
      rating: 5,
      content: '质量很好，造型可爱，孩子很喜欢！',
      date: '2025-07-12',
      avatar: 'bg-pink-300'
    },
    {
      id: 2,
      username: '收藏家小王',
      rating: 4,
      content: '包装精美，不过希望稀有款概率能高一点。',
      date: '2025-07-11',
      avatar: 'bg-blue-300'
    },
    {
      id: 3,
      username: '萌妹子',
      rating: 5,
      content: '抽到了超稀有款！太开心了！💕',
      date: '2025-07-10',
      avatar: 'bg-purple-300'
    }
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'text-yellow-500' : 'text-gray-300'}>
        ⭐
      </span>
    ))
  }

  const renderDetail = () => (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">商品详情</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">商品名称</p>
            <p className="font-medium text-gray-800">{blindBox.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">商品价格</p>
            <p className="font-medium text-purple-600">¥{blindBox.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">销售数量</p>
            <p className="font-medium text-gray-800">{blindBox.sales} 件</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">商品评分</p>
            <p className="font-medium text-gray-800">{blindBox.rating} 分</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">发布时间</p>
            <p className="font-medium text-gray-800">{blindBox.releaseDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">商品标签</p>
            <div className="flex flex-wrap gap-1">
              {blindBox.tags?.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">商品描述</p>
          <p className="text-gray-800">{blindBox.description}</p>
        </div>
      </div>

      {/* 抽取说明 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">抽取说明</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• 每个盲盒包含一个随机手办</p>
          <p>• 不同稀有度的手办具有不同的抽取概率</p>
          <p>• 抽取结果完全随机，无法预知</p>
          <p>• 支持批量抽取，提高获得稀有款的机会</p>
          <p>• 所有手办均为正品，质量保证</p>
        </div>
      </div>
    </div>
  )

  const renderItems = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">内容物列表</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className={`${item.color} w-16 h-16 rounded-lg`}></div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">{item.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </span>
                  <span className="text-sm text-gray-500">概率: {item.probability}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 概率统计 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">概率统计</h3>
        <div className="space-y-3">
          {['普通', '稀有', '超稀有', '传说'].map((rarity) => {
            const totalProb = items
              .filter(item => item.rarity === rarity)
              .reduce((sum, item) => sum + item.probability, 0)
            
            return (
              <div key={rarity} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(rarity)}`}>
                  {rarity}
                </span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      rarity === '普通' ? 'bg-gray-500' :
                      rarity === '稀有' ? 'bg-blue-500' :
                      rarity === '超稀有' ? 'bg-purple-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${totalProb}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{totalProb}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderReviews = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">用户评价</h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⭐</span>
            <span className="text-lg font-bold text-gray-800">{blindBox.rating}</span>
            <span className="text-sm text-gray-600">({reviews.length} 条评价)</span>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-10 h-10 ${review.avatar} rounded-full`}></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{review.username}</span>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
              </div>
              <p className="text-gray-700 ml-13">{review.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
            查看更多评价
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
      >
        <span>←</span>
        <span>返回列表</span>
      </button>

      {/* 商品主要信息 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：商品图片 */}
          <div>
            <div className={`${blindBox.color} h-64 lg:h-80 rounded-lg mb-4`}></div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`${blindBox.color} h-16 rounded-lg opacity-60 hover:opacity-100 cursor-pointer transition-opacity`}></div>
              ))}
            </div>
          </div>

          {/* 右侧：商品信息 */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{blindBox.name}</h1>
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex">{renderStars(Math.floor(blindBox.rating))}</div>
                <span className="text-sm text-gray-600">{blindBox.rating} 分</span>
                <span className="text-sm text-gray-600">已售 {blindBox.sales}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blindBox.tags?.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-purple-600">¥{blindBox.price}</span>
                {blindBox.originalPrice > blindBox.price && (
                  <span className="text-lg text-gray-500 line-through">¥{blindBox.originalPrice}</span>
                )}
              </div>
              <p className="text-gray-600">{blindBox.description}</p>
            </div>

            {/* 数量选择和购买 */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">数量:</span>
                <div className="flex items-center space-x-2">
                  <button
                    className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  立即抽取 (¥{blindBox.price * quantity})
                </button>
                <button className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                  ♡ 收藏
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 详情标签页 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
              activeTab === 'detail'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveTab('detail')}
          >
            商品详情
          </button>
          <button
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
              activeTab === 'items'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveTab('items')}
          >
            内容物
          </button>
          <button
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            用户评价
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'detail' && renderDetail()}
          {activeTab === 'items' && renderItems()}
          {activeTab === 'reviews' && renderReviews()}
        </div>
      </div>
    </div>
  )
}

export default BlindBoxDetail
