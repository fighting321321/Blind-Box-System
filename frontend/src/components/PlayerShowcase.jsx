
import { useState, useEffect } from 'react';
import api, { userAPI } from '../services/api';


/**
 * 玩家秀组件
 */
function PlayerShowcase({ user, userPrizes = [] }) {
  const [activeTab, setActiveTab] = useState('my-showcase');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [allShowcases, setAllShowcases] = useState([]);
  const [userMap, setUserMap] = useState({}); // userId -> username
  const [prizeMap, setPrizeMap] = useState({}); // prizeId -> prizeName
  const [myShowcases, setMyShowcases] = useState([]);
  const [newShowcase, setNewShowcase] = useState({
    title: '',
    description: '',
    selectedItems: []
  });
  const [userCollection, setUserCollection] = useState([]);

  // 拉取全部展示，并补充用户名和奖品名映射
  const fetchAllShowcases = async () => {
    try {
      const res = await api.get('/player-showcase');
      console.log('fetchAllShowcases 返回：', res);
      let showcases = [];
      if (res.success) {
        if (Array.isArray(res.data)) {
          showcases = res.data;
        } else if (res.data && typeof res.data === 'object' && Array.isArray(res.data.showcases)) {
          showcases = res.data.showcases;
        }
      }
      setAllShowcases(showcases);
      // 用户名映射
      const userIds = Array.from(new Set(showcases.map(s => s.userId)));
      const prizeIds = Array.from(new Set(showcases.map(s => s.prizeId)));
      // 用户名
      const userMapTemp = { ...userMap };
      await Promise.all(userIds.map(async (uid) => {
        if (!userMapTemp[uid]) {
          try {
            const res = await userAPI.getUserInfo(uid);
            if (res.success && res.data && res.data.username) {
              userMapTemp[uid] = res.data.username;
            } else {
              userMapTemp[uid] = `用户${uid}`;
            }
          } catch {
            userMapTemp[uid] = `用户${uid}`;
          }
        }
      }));
      setUserMap(userMapTemp);
      // 奖品名（通过API获取）
      const prizeMapTemp = { ...prizeMap };
      let dbPrizes = [];
      try {
        const prizeRes = await api.get('/prizes');
        if (prizeRes && Array.isArray(prizeRes.data)) {
          dbPrizes = prizeRes.data;
        }
      } catch { }
      prizeIds.forEach(pid => {
        if (!prizeMapTemp[pid]) {
          // 1. API返回的prizes
          const dbPrize = dbPrizes.find(p => String(p.id) === String(pid));
          if (dbPrize && dbPrize.name) {
            prizeMapTemp[pid] = dbPrize.name;
          } else {
            // 2. userPrizes
            const found = Array.isArray(userPrizes) ? userPrizes.find(p => String(p.id) === String(pid) || String(p.prizeId) === String(pid)) : null;
            if (found && found.name) {
              prizeMapTemp[pid] = found.name;
            } else if (found && found.prizeName) {
              prizeMapTemp[pid] = found.prizeName;
            } else {
              prizeMapTemp[pid] = `奖品${pid}`;
            }
          }
        }
      });
      setPrizeMap(prizeMapTemp);
    } catch (e) {
      console.error('fetchAllShowcases error', e);
    }
  };

  // 拉取我的展示
  const fetchMyShowcases = async () => {
    try {
      const res = await api.get('/player-showcase');
      if (res.success) {
        let showcases = [];
        if (Array.isArray(res.data)) {
          showcases = res.data;
        } else if (res.data && Array.isArray(res.data.showcases)) {
          showcases = res.data.showcases;
        }
        setMyShowcases(showcases.filter(item => item.userId != null && String(item.userId) === String(user.id)));
      }
    } catch (e) { }
  };

  useEffect(() => {
    if (activeTab === 'all-showcase') {
      fetchAllShowcases();
    } else if (activeTab === 'my-showcase') {
      fetchMyShowcases();
    }
    // eslint-disable-next-line
  }, [activeTab, showCreateForm, user.id]);

  // 保证首次挂载时也能拉取全部和我的展示
  useEffect(() => {
    fetchAllShowcases();
    fetchMyShowcases();
  }, [user.id]);

  const openCreateForm = () => {
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

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setUserCollection([]);
  };

  const handleCreateShowcase = async () => {
    const selectedItems = userCollection.filter(item => item.selected);
    if (selectedItems.length === 0) {
      window.alert('请至少选择一个奖品进行展示！');
      return;
    }
    const prizeId = selectedItems[0].id;
    try {
      const res = await api.post('/player-showcase', {
        userId: user.id,
        prizeId,
        title: newShowcase.title,
        description: newShowcase.description
      });
      if (res.success) {
        window.alert('展示创建成功！');
        setShowCreateForm(false);
        setUserCollection(userCollection.map(item => ({ ...item, selected: false })));
        setNewShowcase({ title: '', description: '', selectedItems: [] });
      } else {
        window.alert(res.message || '创建失败');
      }
    } catch (e) {
      window.alert('网络错误，创建失败');
    }
  };

  // 我的展示渲染函数
  const renderMyShowcase = () => (
    <div className="space-y-6">
      {myShowcases.length === 0 ? (
        <div className="text-center text-gray-400 py-12">暂无展示</div>
      ) : (
        myShowcases.map((showcase) => (
          <div key={showcase.id} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{showcase.title}</h3>
              <p className="text-gray-600 mb-4">{showcase.description}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-400">展示ID: {showcase.id}</span>
              <span className="text-xs text-gray-400">用户ID: {showcase.userId}</span>
              <span className="text-xs text-gray-400">{showcase.createdAt?.slice(0, 19).replace('T', ' ')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // 全部展示渲染函数（顶部用户名，右上奖品名）
  const renderAllShowcase = () => (
    <div className="space-y-6">
      {allShowcases.length === 0 ? (
        <div className="text-center text-gray-400 py-12">暂无展示</div>
      ) : (
        allShowcases.map((showcase) => (
          <div key={showcase.id} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-purple-700">{userMap[showcase.userId] || `用户${showcase.userId}`}</span>
              <span className="text-sm text-gray-500">{'奖品：' + (prizeMap[showcase.prizeId] || `奖品${showcase.prizeId}`)}</span>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{showcase.title}</h3>
              <p className="text-gray-600 mb-4">{showcase.description}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-400">{showcase.createdAt?.slice(0, 19).replace('T', ' ')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

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
  );
}

export default PlayerShowcase;
