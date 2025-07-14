import { useState } from 'react'

/**
 * 盲盒抽取组件
 */
function BlindBoxDraw({ user }) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawResult, setDrawResult] = useState(null)
  const [selectedBox, setSelectedBox] = useState(null)

  // 可抽取的盲盒系列
  const availableBoxes = [
    { 
      id: 1, 
      name: '可爱动物系列', 
      price: 59, 
      color: 'bg-pink-300',
      description: '包含各种可爱的小动物手办',
      probability: {
        '普通': 70,
        '稀有': 25,
        '超稀有': 4,
        '传说': 1
      }
    },
    { 
      id: 2, 
      name: '动漫角色系列', 
      price: 79, 
      color: 'bg-blue-300',
      description: '热门动漫角色限定款',
      probability: {
        '普通': 60,
        '稀有': 30,
        '超稀有': 8,
        '传说': 2
      }
    },
    { 
      id: 3, 
      name: '梦幻公主系列', 
      price: 89, 
      color: 'bg-purple-300',
      description: '精美公主主题收藏品',
      probability: {
        '普通': 50,
        '稀有': 35,
        '超稀有': 12,
        '传说': 3
      }
    },
    { 
      id: 4, 
      name: '科幻机甲系列', 
      price: 99, 
      color: 'bg-gray-300',
      description: '未来科技风格机甲模型',
      probability: {
        '普通': 45,
        '稀有': 40,
        '超稀有': 12,
        '传说': 3
      }
    }
  ]

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case '普通': return 'text-gray-600'
      case '稀有': return 'text-blue-600'
      case '超稀有': return 'text-purple-600'
      case '传说': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const simulateDraw = () => {
    if (!selectedBox || user.balance < selectedBox.price) return

    setIsDrawing(true)
    setDrawResult(null)

    // 模拟抽取过程
    setTimeout(() => {
      const random = Math.random() * 100
      let rarity = '普通'
      let cumulativeProb = 0

      for (const [rarityLevel, prob] of Object.entries(selectedBox.probability)) {
        cumulativeProb += prob
        if (random <= cumulativeProb) {
          rarity = rarityLevel
          break
        }
      }

      // 生成随机奖品
      const prizes = {
        '普通': ['小熊玩偶', '猫咪摆件', '兔子手办', '小狗模型'],
        '稀有': ['限定版小熊', '发光猫咪', '彩虹兔子', '黄金小狗'],
        '超稀有': ['钻石小熊', '星空猫咪', '独角兽兔子', '机械小狗'],
        '传说': ['神话小熊', '宇宙猫咪', '时空兔子', '传说小狗']
      }

      const prizeList = prizes[rarity] || prizes['普通']
      const prizeName = prizeList[Math.floor(Math.random() * prizeList.length)]

      setDrawResult({
        name: prizeName,
        rarity: rarity,
        series: selectedBox.name,
        color: selectedBox.color
      })

      setIsDrawing(false)
    }, 3000)
  }

  const handleBoxSelect = (box) => {
    setSelectedBox(box)
    setDrawResult(null)
  }

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">盲盒抽取</h1>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">余额:</span>
          <span className="font-bold text-purple-600">¥{user.balance}</span>
        </div>
      </div>

      {/* 盲盒选择区域 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">选择盲盒系列</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableBoxes.map((box) => (
            <div
              key={box.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedBox?.id === box.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => handleBoxSelect(box)}
            >
              <div className={`${box.color} h-24 rounded-lg mb-3`}></div>
              <h3 className="font-medium text-gray-800 mb-1">{box.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{box.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-600">¥{box.price}</span>
                <button
                  className="text-xs text-purple-600 hover:text-purple-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    // 显示概率详情的逻辑可以在这里添加
                  }}
                >
                  查看概率
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 概率展示 */}
      {selectedBox && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedBox.name} - 掉落概率
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(selectedBox.probability).map(([rarity, prob]) => (
              <div key={rarity} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-lg font-bold ${getRarityColor(rarity)}`}>
                  {prob}%
                </div>
                <div className="text-sm text-gray-600">{rarity}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 抽取区域 */}
      {selectedBox && (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          {!isDrawing && !drawResult && (
            <div className="space-y-4">
              <div className={`${selectedBox.color} w-32 h-32 rounded-lg mx-auto mb-4`}></div>
              <h3 className="text-xl font-semibold text-gray-800">{selectedBox.name}</h3>
              <p className="text-gray-600">点击按钮开始抽取</p>
              <button
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  user.balance >= selectedBox.price
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={simulateDraw}
                disabled={user.balance < selectedBox.price || isDrawing}
              >
                {user.balance >= selectedBox.price
                  ? `抽取 (¥${selectedBox.price})`
                  : '余额不足'
                }
              </button>
            </div>
          )}

          {isDrawing && (
            <div className="space-y-4">
              <div className={`${selectedBox.color} w-32 h-32 rounded-lg mx-auto mb-4 animate-pulse`}></div>
              <h3 className="text-xl font-semibold text-gray-800">抽取中...</h3>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
              <p className="text-gray-600">请稍等，正在为您抽取</p>
            </div>
          )}

          {drawResult && (
            <div className="space-y-4">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800">恭喜您！</h3>
              <div className={`${drawResult.color} w-32 h-32 rounded-lg mx-auto mb-4`}></div>
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-gray-800">{drawResult.name}</h4>
                <p className="text-gray-600">{drawResult.series}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  drawResult.rarity === '普通' ? 'bg-gray-100 text-gray-600' :
                  drawResult.rarity === '稀有' ? 'bg-blue-100 text-blue-600' :
                  drawResult.rarity === '超稀有' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {drawResult.rarity}
                </span>
              </div>
              <div className="flex space-x-4 justify-center mt-6">
                <button
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => setDrawResult(null)}
                >
                  继续抽取
                </button>
                <button
                  className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => {
                    setDrawResult(null)
                    setSelectedBox(null)
                  }}
                >
                  返回选择
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 最近抽取记录 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">最近抽取记录</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-300 rounded-lg"></div>
              <div>
                <p className="font-medium text-gray-800">可爱小熊</p>
                <p className="text-sm text-gray-600">动物系列 - 普通</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">2025-07-13</p>
              <p className="text-sm text-gray-500">¥59</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-300 rounded-lg"></div>
              <div>
                <p className="font-medium text-gray-800">梦幻独角兽</p>
                <p className="text-sm text-gray-600">梦幻系列 - 超稀有</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">2025-07-12</p>
              <p className="text-sm text-gray-500">¥89</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlindBoxDraw
