import { useState, useEffect } from 'react'

/**
 * 用户奖品组件
 * 显示用户从抽盲盒获得的所有奖品
 */
function UserPrizes({ user }) {
    const [prizes, setPrizes] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('all') // 'all', 'common', 'rare', 'legendary'
    const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'rarity'

    // 获取用户奖品数据
    const loadUserPrizes = async () => {
        try {
            setLoading(true)
            // 调用 SQLite 用户奖品数据库 API
            const response = await fetch(`http://localhost:7001/api/sqlite/user-prizes?userId=${user.id}&pageSize=1000`)
            const data = await response.json()

            if (data.success) {
                const formattedPrizes = data.data.prizes.map(prize => ({
                    id: prize.id,
                    name: prize.prizeName,
                    rarity: prize.rarity.toLowerCase(), // 转换为小写以匹配前端格式
                    image: getRarityEmoji(prize.rarity.toLowerCase()),
                    blindBoxName: prize.blindBoxName,
                    obtainedAt: new Date(prize.obtainedAt),
                    description: prize.prizeDescription
                }))

                setPrizes(formattedPrizes)
                console.log('📦 从SQLite数据库获取到用户奖品:', formattedPrizes)
            } else {
                console.error('获取用户奖品失败:', data.message)
                setPrizes([])
            }
        } catch (error) {
            console.error('获取用户奖品失败:', error)
            setPrizes([])
        } finally {
            setLoading(false)
        }
    }

    // 根据稀有度获取对应的emoji
    const getRarityEmoji = (rarity) => {
        const rarityLower = rarity ? rarity.toLowerCase() : 'common'
        switch (rarityLower) {
            case 'common': return '🎁'
            case 'rare': return '🏆'
            case 'epic': return '💎'
            case 'legendary': return '👑'
            default: return '🎁'
        }
    }

    useEffect(() => {
        if (user?.id) {
            loadUserPrizes()
        }
    }, [user?.id])

    // 根据稀有度获取颜色
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'legendary':
                return 'from-yellow-400 to-orange-500'
            case 'epic':
                return 'from-red-400 to-pink-500'
            case 'rare':
                return 'from-purple-400 to-pink-500'
            case 'common':
                return 'from-blue-400 to-indigo-500'
            default:
                return 'from-gray-400 to-gray-500'
        }
    }

    // 获取稀有度中文名
    const getRarityName = (rarity) => {
        switch (rarity) {
            case 'legendary':
                return '传说'
            case 'epic':
                return '超稀有'
            case 'rare':
                return '稀有'
            case 'common':
                return '普通'
            default:
                return '未知'
        }
    }

    // 过滤奖品
    const getFilteredPrizes = () => {
        let filtered = prizes

        // 按稀有度过滤
        if (filter !== 'all') {
            filtered = filtered.filter(prize => prize.rarity === filter)
        }

        // 排序
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.obtainedAt) - new Date(a.obtainedAt)
                case 'oldest':
                    return new Date(a.obtainedAt) - new Date(b.obtainedAt)
                case 'rarity':
                    const rarityOrder = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 }
                    return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0)
                default:
                    return 0
            }
        })

        return filtered
    }

    const filteredPrizes = getFilteredPrizes()

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 页面标题和统计 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">🎁 我的奖品</h1>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">总奖品数</p>
                        <p className="text-2xl font-bold text-purple-600">{prizes.length}</p>
                    </div>
                </div>

                {/* 奖品统计 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['legendary', 'epic', 'rare', 'common'].map(rarity => {
                        const count = prizes.filter(p => p.rarity === rarity).length
                        return (
                            <div key={rarity} className={`bg-gradient-to-r ${getRarityColor(rarity)} p-4 rounded-lg text-white`}>
                                <div className="text-sm opacity-90">{getRarityName(rarity)}</div>
                                <div className="text-xl font-bold">{count}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 筛选和排序 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    {/* 稀有度筛选 */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">稀有度:</span>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                        >
                            <option value="all">全部</option>
                            <option value="legendary">传说</option>
                            <option value="epic">超稀有</option>
                            <option value="rare">稀有</option>
                            <option value="common">普通</option>
                        </select>
                    </div>

                    {/* 排序 */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">排序:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                        >
                            <option value="newest">最新获得</option>
                            <option value="oldest">最早获得</option>
                            <option value="rarity">稀有度</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 奖品列表 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        当前显示 {filteredPrizes.length} 个奖品
                        {filter !== 'all' && ` (${getRarityName(filter)})`}
                        {prizes.length === 0 && ' (暂无奖品数据)'}
                    </p>
                </div>

                {filteredPrizes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🎁</div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            {prizes.length === 0
                                ? '还没有获得任何奖品'
                                : `没有找到${getRarityName(filter)}奖品`
                            }
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {prizes.length === 0
                                ? '快去购买盲盒获取奖品吧！'
                                : '尝试调整筛选条件'
                            }
                        </p>
                        {filter !== 'all' && prizes.length > 0 && (
                            <button
                                onClick={() => setFilter('all')}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                查看全部奖品
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPrizes.map((prize) => (
                            <div key={prize.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="text-4xl">{prize.image}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h3 className="font-medium text-gray-800">{prize.name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded text-white bg-gradient-to-r ${getRarityColor(prize.rarity)}`}>
                                                {getRarityName(prize.rarity)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{prize.description}</p>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div>来源: {prize.blindBoxName}</div>
                                            <div>获得时间: {prize.obtainedAt.toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserPrizes
