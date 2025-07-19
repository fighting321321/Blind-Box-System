import { useEffect, useState } from 'react'

/**
 * 购买成功弹窗组件
 */
function PurchaseSuccessModal({ isVisible, onClose, blindBoxName, quantity, prizeInfo }) {
  const [isAnimating, setIsAnimating] = useState(false)
  
  // 控制进入动画
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  // 3秒后自动关闭弹窗
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 ${
        isAnimating 
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
          
          {/* 奖品信息 */}
          {prizeInfo && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4 transform hover:scale-105 transition-transform">
              <p className="text-sm text-yellow-800 font-bold mb-1">
                🎁 获得奖品: {prizeInfo.name}
              </p>
              {prizeInfo.rarity && (
                <p className="text-xs text-yellow-600 font-medium">
                  稀有度: {prizeInfo.rarity}
                </p>
              )}
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
