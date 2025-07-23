import { useState, useEffect } from 'react'

/**
 * 玩家秀组件
 */
function PlayerShowcase({ user, userPrizes = [] }) {
  const [activeTab, setActiveTab] = useState('my-showcase')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // 我的展示和全部展示初始为空
  const myShowcases = [];
  const allShowcases = [];

  const [newShowcase, setNewShowcase] = useState({
    title: '',
    description: '',
    selectedItems: []
  })

  // 只允许选择自己奖品库中的奖品
  const [userCollection, setUserCollection] = useState([]);


  // 不再全局同步 userCollection，始终以 openCreateForm 时的 userPrizes 为准

  // 每次打开创建弹窗时，重置 userCollection 为属于当前用户的奖品
  const openCreateForm = () => {
    // 只保留属于当前用户的奖品（userPrizes 已经是当前用户的奖品列表）
    setUserCollection(
      Array.isArray(userPrizes)
        ? userPrizes.map(prize => ({
          id: prize.id,
          name: prize.name,
          color: prize.color || 'bg-gray-300',
          selected: false
        }))
        : []
    );
    setShowCreateForm(true);
  };

  // 关闭弹窗时清空 userCollection，避免脏数据
  const closeCreateForm = () => {
    setShowCreateForm(false);
    setUserCollection([]);
  };

  const handleCreateShowcase = () => {
    // 检查是否选择了奖品
    const selectedItems = userCollection.filter(item => item.selected);
    if (selectedItems.length === 0) {
      window.alert('请至少选择一个奖品进行展示！');
      return;
    }
    // 这里添加创建展示的逻辑
    console.log('创建展示:', { ...newShowcase, selectedItems });
    setShowCreateForm(false);
    // 清空选择状态
    setUserCollection(userCollection.map(item => ({ ...item, selected: false })));
    setNewShowcase({ title: '', description: '', selectedItems: [] });
  }

  const toggleLike = (id, isMyShowcase = false) => {
    // 这里添加点赞逻辑
    console.log('点赞/取消点赞:', id, isMyShowcase)
  }

  const renderMyShowcase = () => (
    <div className="space-y-6">
      {/* 创建按钮 */}
      <div className="bg-white rounded-lg p-6 shadow-sm text-center">
        <div className="text-gray-400 text-4xl mb-4">📸</div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">分享您的收藏</h3>
        <p className="text-gray-600 mb-4">展示您的精美盲盒收藏，获得其他玩家的点赞</p>
        <button
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          onClick={openCreateForm}
        >
          创建展示
        </button>
      </div>

      {/* 我的展示列表 */}
      <div className="space-y-4">
        {myShowcases.map((showcase) => (
          <div key={showcase.id} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{showcase.title}</h3>
                <p className="text-gray-600 text-sm">{showcase.description}</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-sm text-purple-600 hover:text-purple-700">编辑</button>
                <button className="text-sm text-red-600 hover:text-red-700">删除</button>
              </div>
            </div>

            {/* 图片展示 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {showcase.images.map((image, index) => (
                <div key={index} className={`${image} h-24 rounded-lg`}></div>
              ))}
            </div>

            {/* 统计信息 */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex space-x-4">
                <span>❤️ {showcase.likes}</span>
                <span>💬 {showcase.comments}</span>
              </div>
              <span>{showcase.createTime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 创建展示表单弹窗 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">创建展示</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closeCreateForm}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="给您的展示起个标题"
                  value={newShowcase.title}
                  onChange={(e) => setNewShowcase({ ...newShowcase, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="描述您的收藏故事"
                  value={newShowcase.description}
                  onChange={(e) => setNewShowcase({ ...newShowcase, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择展示物品</label>
                {userCollection.length === 0 ? (
                  <div className="text-gray-400 text-center py-6">暂无可用奖品，请先去抽取获得奖品后再来创建展示。</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {userCollection.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${item.selected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                          }`}
                        onClick={() => {
                          const updated = [...userCollection];
                          updated[idx].selected = !updated[idx].selected;
                          setUserCollection(updated);
                        }}
                      >
                        <div className={`${item.color} h-16 rounded-lg mb-2`}></div>
                        <p className="text-sm text-gray-800 text-center">{item.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={handleCreateShowcase}
                >
                  发布展示
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={closeCreateForm}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderAllShowcase = () => (
    <div className="space-y-6">
      {allShowcases.map((showcase) => (
        <div key={showcase.id} className="bg-white rounded-lg p-6 shadow-sm">
          {/* 用户信息 */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 ${showcase.avatar} rounded-full`}></div>
            <div>
              <h4 className="font-medium text-gray-800">{showcase.username}</h4>
              <p className="text-sm text-gray-600">{showcase.createTime}</p>
            </div>
          </div>

          {/* 展示内容 */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{showcase.title}</h3>
            <p className="text-gray-600 mb-4">{showcase.description}</p>

            {/* 图片网格 */}
            <div className={`grid gap-2 ${showcase.images.length === 1 ? 'grid-cols-1' :
              showcase.images.length === 2 ? 'grid-cols-2' :
                showcase.images.length === 3 ? 'grid-cols-3' :
                  'grid-cols-2'
              }`}>
              {showcase.images.map((image, index) => (
                <div
                  key={index}
                  className={`${image} rounded-lg ${showcase.images.length === 1 ? 'h-64' :
                    showcase.images.length <= 3 ? 'h-32' :
                      index < 2 ? 'h-32' : 'h-16'
                    }`}
                ></div>
              ))}
            </div>
          </div>

          {/* 互动按钮 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex space-x-6">
              <button
                className={`flex items-center space-x-2 text-sm transition-colors ${showcase.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                onClick={() => toggleLike(showcase.id)}
              >
                <span>{showcase.isLiked ? '❤️' : '♡'}</span>
                <span>{showcase.likes}</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-purple-600 transition-colors">
                <span>💬</span>
                <span>{showcase.comments}</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-purple-600 transition-colors">
                <span>📤</span>
                <span>分享</span>
              </button>
            </div>
            <button className="text-sm text-purple-600 hover:text-purple-700">
              查看详情
            </button>
          </div>
        </div>
      ))}

      {/* 加载更多 */}
      <div className="text-center">
        <button className="px-6 py-3 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
          加载更多
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">玩家秀</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>👤</span>
          <span>{user.username}</span>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="bg-white rounded-lg p-1 shadow-sm">
        <div className="flex space-x-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'my-showcase'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-purple-600'
              }`}
            onClick={() => setActiveTab('my-showcase')}
          >
            我的展示
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'all-showcase'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-purple-600'
              }`}
            onClick={() => setActiveTab('all-showcase')}
          >
            全部展示
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'my-showcase' && renderMyShowcase()}
      {activeTab === 'all-showcase' && renderAllShowcase()}
    </div>
  )
}

export default PlayerShowcase
