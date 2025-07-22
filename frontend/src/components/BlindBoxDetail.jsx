import { useState } from 'react'
import BlindBoxImage from './BlindBoxImage'
import PurchaseSuccessModal from './PurchaseSuccessModal'
import axios from 'axios'

/**
 * 盲盒详情组件
 */
function BlindBoxDetail({ blindBox, onBack, user, showToast, onPurchaseSuccess }) {
  const [activeTab, setActiveTab] = useState('detail')
  const [quantity, setQuantity] = useState(1)
  const [purchasing, setPurchasing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState(null)

  // 购买盲盒的处理函数
  const handlePurchase = async () => {
    if (!user) {
      showToast('请先登录', 'error')
      return
    }

    if (purchasing) return

    setPurchasing(true)
    try {
      const response = await axios.post('http://localhost:7001/api/purchase', {
        userId: user.id,
        blindBoxId: blindBox.id,
        quantity: quantity
      })

      if (response.data.success) {
        // 保存购买结果用于弹窗显示
        setPurchaseResult({
          blindBoxName: blindBox.name,
          quantity: quantity,
          prizeInfo: response.data.order?.prize || null
        })

        // 显示购买成功弹窗
        setShowSuccessModal(true)

        // 仍然显示Toast通知（作为备选）
        showToast(`🎉 购买成功！获得 ${quantity} 个 ${blindBox.name}`, 'success')

        // 调用成功回调，传递更新后的用户信息
        if (onPurchaseSuccess) {
          onPurchaseSuccess(response.data.user) // 传递用户信息
        }
        if (response.data.order) {
          console.log('订单信息:', response.data.order)
        }
      } else {
        showToast(response.data.message || '购买失败', 'error')
      }
    } catch (error) {
      console.error('购买失败:', error)
      showToast(error.response?.data?.message || '购买失败，请重试', 'error')
    } finally {
      setPurchasing(false)
    }
  }

  if (!blindBox) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm text-center">
        <div className="text-gray-400 text-4xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">盲盒不存在</h3>
        <p className="text-gray-600">请选择其他盲盒查看详情</p>
      </div>
    )
  }

  // 稀有度映射函数 - 将英文稀有度转换为中文显示
  const getRarityDisplayName = (rarity) => {
    const rarityMap = {
      'COMMON': '普通',
      'RARE': '稀有',
      'EPIC': '超稀有',
      'LEGENDARY': '传说'
    }
    return rarityMap[rarity] || '普通'
  }

  // 获取稀有度对应的颜色
  const getRarityColor = (rarity) => {
    const displayRarity = getRarityDisplayName(rarity)
    switch (displayRarity) {
      case '普通': return 'bg-gray-200'
      case '稀有': return 'bg-blue-200'
      case '超稀有': return 'bg-purple-200'
      case '传说': return 'bg-orange-200'
      default: return 'bg-gray-200'
    }
  }

  // 处理奖品数据，使用后端返回的稀有度信息
  const items = (blindBox.prizes || []).map(prize => ({
    ...prize,
    rarity: getRarityDisplayName(prize.rarity), // 使用后端返回的稀有度
    probabilityPercent: Math.round(prize.probability * 100),
    color: getRarityColor(prize.rarity) // 根据稀有度获取颜色
  }))

  const getRarityTextColor = (rarity) => {
    switch (rarity) {
      case '普通': return 'text-gray-600 bg-gray-100'
      case '稀有': return 'text-blue-600 bg-blue-100'
      case '超稀有': return 'text-purple-600 bg-purple-100'
      case '传说': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
            <p className="font-medium text-purple-600">¥{blindBox.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">销售数量</p>
            <p className="font-medium text-gray-800">{blindBox.sales} 件</p>
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

  const renderItems = () => {
    // 计算总概率
    const totalProbability = items.reduce((sum, item) => sum + item.probabilityPercent, 0)

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">内容物列表</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className={`${item.color} w-16 h-16 rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl">🎁</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityTextColor(item.rarity)}`}>
                      {item.rarity}
                    </span>
                    <span className="text-sm text-gray-500">概率: {item.probabilityPercent}%</span>
                    {item.rarity && (
                      <span className="text-sm text-purple-600">稀有度: {item.rarity}</span>
                    )}
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
                .reduce((sum, item) => sum + item.probabilityPercent, 0)

              if (totalProb === 0) return null;

              return (
                <div key={rarity} className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium w-20 text-center ${getRarityTextColor(rarity)}`}>
                    {rarity}
                  </span>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${rarity === '普通' ? 'bg-gray-500' :
                        rarity === '稀有' ? 'bg-blue-500' :
                          rarity === '超稀有' ? 'bg-purple-500' : 'bg-orange-500'
                        }`}
                      style={{ width: `${totalProb}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{totalProb}%</span>
                </div>
              )
            })}

            {/* 如果总概率不足100%，显示"无"选项 */}
            {totalProbability < 100 && (
              <div className="flex items-center">
                <span className="px-3 py-1 rounded-full text-sm font-medium w-20 text-center text-gray-600 bg-gray-100">
                  无
                </span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gray-400"
                    style={{ width: `${100 - totalProbability}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{100 - totalProbability}%</span>
              </div>
            )}
          </div>

          {/* 总概率显示 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">总概率:</span>
              <span className="text-sm font-medium text-gray-800">{totalProbability}%</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
      >
        <span>←</span>
        <span>返回</span>
      </button>

      {/* 商品主要信息 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：商品图片 */}
          <div>
            <BlindBoxImage
              blindBoxId={blindBox.id}
              name={blindBox.name}
              width={320}
              height={320}
              className="rounded-lg mb-4 w-full"
              showName={true}
            />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <BlindBoxImage
                  key={i}
                  blindBoxId={blindBox.id}
                  name={blindBox.name}
                  width={64}
                  height={64}
                  className="rounded-lg opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
                />
              ))}
            </div>
          </div>

          {/* 右侧：商品信息 */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{blindBox.name}</h1>
              <div className="flex items-center space-x-4 mb-2">
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
                <span className="text-3xl font-bold text-purple-600">¥{blindBox.price.toFixed(2)}</span>
                {blindBox.originalPrice > blindBox.price && (
                  <span className="text-lg text-gray-500 line-through">¥{blindBox.originalPrice.toFixed(2)}</span>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-600">剩余库存:</span>
                <span className="text-sm font-medium text-orange-600">{blindBox.stock} 个</span>
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

              <div className="w-full">
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !user}
                  className={`w-full px-6 py-3 text-white rounded-lg font-medium transition-colors ${purchasing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : !user
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                >
                  {purchasing
                    ? '购买中...'
                    : !user
                      ? '请先登录'
                      : `立即购买 (¥${(blindBox.price * quantity).toFixed(2)})`
                  }
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
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${activeTab === 'detail'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-purple-600'
              }`}
            onClick={() => setActiveTab('detail')}
          >
            商品详情
          </button>
          <button
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${activeTab === 'items'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-purple-600'
              }`}
            onClick={() => setActiveTab('items')}
          >
            内容物
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'detail' && renderDetail()}
          {activeTab === 'items' && renderItems()}
        </div>
      </div>

      {/* 购买成功弹窗 */}
      <PurchaseSuccessModal
        isVisible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        blindBoxName={purchaseResult?.blindBoxName}
        quantity={purchaseResult?.quantity}
        prizeInfo={purchaseResult?.prizeInfo}
      />
    </div>
  )
}

export default BlindBoxDetail
