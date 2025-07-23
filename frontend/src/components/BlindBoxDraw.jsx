import { useState, useEffect } from 'react'
import { blindBoxAPI } from '../services/api'

/**
 * 盲盒抽取组件
 * @param {object} props
 * @param {object} props.user
 * @param {object} props.selectedBlindBox
 * @param {function} props.onDrawSuccess
 * @param {object} props.toast 全局toast方法
 */
function BlindBoxDraw({ user, selectedBlindBox, onDrawSuccess, showToast }) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawResult, setDrawResult] = useState(null)
  const [selectedBox, setSelectedBox] = useState(null)
  const [availableBoxes, setAvailableBoxes] = useState([])

  // 如果有传入选中的盲盒，则自动设置为选中状态
  useEffect(() => {
    if (selectedBlindBox) {
      setSelectedBox(selectedBlindBox)
    }
  }, [selectedBlindBox])

  // 加载可用盲盒数据
  useEffect(() => {
    const loadAvailableBoxes = async () => {
      try {
        const response = await blindBoxAPI.getAllBlindBoxes()
        if (response.success) {
          setAvailableBoxes(response.data)
        }
      } catch (error) {
        console.error('加载盲盒数据失败:', error)
      }
    }
    loadAvailableBoxes()
  }, [])

  // 处理盲盒选择
  const handleBoxSelect = (box) => {
    setSelectedBox(box);
    setDrawResult(null);
  };

  // 清除选择
  const clearSelection = () => {
    setSelectedBox(null);
    setDrawResult(null);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case '普通': return 'text-gray-600';
      case '稀有': return 'text-blue-600';
      case '超稀有': return 'text-purple-600';
      case '传说': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const simulateDraw = async () => {
    if (!selectedBox) return;
    if (user.balance < selectedBox.price) {
      showToast && showToast('余额不足，无法购买该盲盒');
      return;
    }
    if (selectedBox.stock <= 0) {
      showToast && showToast('盲盒库存不足，无法购买');
      return;
    }

    setIsDrawing(true);
    setDrawResult(null);

    try {
      // 调用后端API进行抽取
      const response = await blindBoxAPI.drawBlindBox(user.id, selectedBox.id);
      if (response.success) {
        setDrawResult({
          name: response.data.result?.name || '神秘奖品',
          rarity: response.data.result?.rarity || '普通',
          series: selectedBox.name,
          color: selectedBox.color || 'bg-gray-300',
          order: response.data
        });
        // 通知父组件抽取成功
        if (onDrawSuccess) {
          onDrawSuccess(response.data);
        }
        // 只有成功时不弹窗
      } else {
        // 只有失败时弹窗
        if (showToast) showToast(response.message || '抽取失败');
      }
    } catch (error) {
      console.error('抽取失败:', error);
      if (showToast) showToast('网络错误，请稍后重试');
    } finally {
      setIsDrawing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 盲盒选择区域 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">选择盲盒系列</h2>
          {selectedBox && (
            <button
              onClick={clearSelection}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              清除选择
            </button>
          )}
        </div>
        {/* 如果有传入的选中盲盒，优先显示 */}
        {selectedBlindBox && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 mb-2">从用户库选择的盲盒：</p>
            <div className="flex items-center space-x-3">
              <div className={`${selectedBlindBox.color} w-12 h-12 rounded-lg`}></div>
              <div>
                <h3 className="font-medium text-gray-800">{selectedBlindBox.name}</h3>
                <p className="text-sm text-gray-600">价格: ¥{selectedBlindBox.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableBoxes.map((box) => (
            <div
              key={box.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedBox?.id === box.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
                }`}
              onClick={() => handleBoxSelect(box)}
            >
              <div className="bg-gradient-to-br from-purple-400 to-blue-500 h-24 rounded-lg mb-3"></div>
              <h3 className="font-medium text-gray-800 mb-1">{box.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{box.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-600">¥{box.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500">库存: {box.stock}</span>
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
          <div className="text-center py-6">
            <div className="text-gray-400 text-4xl mb-4">🎲</div>
            <p className="text-gray-600">该盲盒的详细概率信息正在加载中...</p>
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
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${user.balance >= selectedBox.price
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={simulateDraw}
                disabled={user.balance < selectedBox.price || isDrawing}
              >
                {user.balance >= selectedBox.price
                  ? `抽取 (¥${selectedBox.price.toFixed(2)})`
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
          {/* 只有失败才显示弹窗，成功不显示 */}
          {/* 失败弹窗已由 showToast 处理，这里无需再渲染弹窗内容 */}
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
