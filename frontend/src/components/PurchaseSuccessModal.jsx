import { useEffect, useState } from 'react'

/**
 * 购买成功弹窗组件
 */
function PurchaseSuccessModal({ isVisible, onClose, blindBoxName, quantity, prizes = [] }) {
  const [isAnimating, setIsAnimating] = useState(false)

  // 控制进入动画
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  // 获取稀有度对应的颜色和样式
  const getRarityStyle = (rarity) => {
    switch (rarity) {
      case 'COMMON':
        return {
          bg: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-700',
          emoji: '🎁'
        }
      case 'RARE':
        return {
          bg: 'from-blue-50 to-blue-100',
          border: 'border-blue-200',
          text: 'text-blue-700',
          emoji: '🏆'
        }
      case 'EPIC':
        return {
          bg: 'from-purple-50 to-purple-100',
          border: 'border-purple-200',
          text: 'text-purple-700',
          emoji: '💎'
        }
      case 'LEGENDARY':
        return {
          bg: 'from-yellow-50 to-orange-100',
          border: 'border-yellow-200',
          text: 'text-orange-700',
          emoji: '👑'
        }
      default:
        return {
          bg: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-700',
          emoji: '🎁'
        }
    }
  }

  // 获取稀有度中文名
  const getRarityName = (rarity) => {
    switch (rarity) {
      case 'COMMON': return '普通'
      case 'RARE': return '稀有'
      case 'EPIC': return '史诗'
      case 'LEGENDARY': return '传说'
      default: return '普通'
    }
  }
  // 5秒后自动关闭弹窗（增加时间以便用户查看奖品）
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 ${isAnimating
          ? 'scale-100 opacity-100 translate-y-0'
          : 'scale-75 opacity-0 translate-y-8'
        }`}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 庆祝效果背景 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-4 left-4 text-2xl animate-bounce">🎉</div>
          <div className="absolute top-8 right-8 text-xl animate-bounce delay-200">✨</div>
          <div className="absolute bottom-8 left-8 text-xl animate-bounce delay-500">🎁</div>
          <div className="absolute bottom-4 right-12 text-2xl animate-bounce delay-700">🎊</div>
        </div>

        {/* 成功图标 */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full mb-4 shadow-lg animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* 购买成功标题 */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 animate-bounce">
            🎉 购买成功！
          </h2>

          {/* 购买信息 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 mb-4 border border-purple-100 transform hover:scale-105 transition-transform">
            <p className="text-lg font-semibold text-gray-700 mb-2">
              恭喜获得 <span className="text-2xl font-bold text-purple-600 animate-pulse">{quantity}</span> 个
            </p>
            <p className="text-xl font-bold text-purple-700 mb-2">
              {blindBoxName}
            </p>
            <div className="flex justify-center space-x-1">
              <span className="text-2xl animate-bounce">🎁</span>
              <span className="text-2xl animate-bounce delay-100">📦</span>
              <span className="text-2xl animate-bounce delay-200">✨</span>
            </div>
          </div>

          {/* 获得的奖品列表 */}
          {prizes && prizes.length > 0 && (
            <div className="space-y-3 mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center">
                <span className="mr-2">🎁</span>
                获得的奖品
                <span className="ml-2">🎁</span>
              </h3>

              {prizes.map((prize, index) => {
                const rarityStyle = getRarityStyle(prize.rarity)
                return (
                  <div
                    key={`${prize.prizeId}-${index}`}
                    className={`bg-gradient-to-r ${rarityStyle.bg} border ${rarityStyle.border} rounded-xl p-4 transform hover:scale-105 transition-all duration-300 shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{rarityStyle.emoji}</span>
                        <div>
                          <p className={`font-bold ${rarityStyle.text} text-base`}>
                            {prize.prizeName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {prize.prizeDescription}
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${rarityStyle.text} bg-white/50 border ${rarityStyle.border}`}>
                          {getRarityName(prize.rarity)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* 奖品数量总结 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-sm font-medium text-green-700">
                  🌟 总共获得 <span className="font-bold text-lg text-green-800">{prizes.length}</span> 个奖品！
                </p>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          <p className="text-sm text-gray-500 mb-4">
            已添加到您的收藏库中 ✨
          </p>

          {/* 自动关闭提示 */}
          <p className="text-xs text-gray-400">
            弹窗将在3秒后自动关闭
          </p>
        </div>

        {/* 底部按钮 */}
        <div className="flex space-x-3 relative z-10">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium hover:scale-105"
          >
            关闭
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:scale-105"
          >
            继续购买
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseSuccessModal
