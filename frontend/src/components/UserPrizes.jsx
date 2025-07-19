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
            // TODO: 调用后端API获取用户奖品
            // const response = await fetch(`http://localhost:7001/api/user/${user.id}/prizes`)
            // const data = await response.json()

            // 模拟数据
            const mockPrizes = [
                {
                    id: 1,
                    name: '限定版手办',
                    rarity: 'legendary',
                    image: '🎯',
                    blindBoxName: '动漫系列盲盒',
                    obtainedAt: new Date('2025-01-15'),
                    description: '超稀有限定版手办，收藏价值极高'
                },
                {
                    id: 2,
                    name: '可爱徽章',
                    rarity: 'common',
                    image: '🏅',
                    blindBoxName: '徽章系列盲盒',
                    obtainedAt: new Date('2025-01-10'),
                    description: '精美可爱的徽章，适合收藏'
                },
                {
                    id: 3,
                    name: '稀有卡片',
                    rarity: 'rare',
                    image: '🃏',
                    blindBoxName: '卡片系列盲盒',
                    obtainedAt: new Date('2025-01-08'),
                    description: '稀有度较高的收藏卡片'
                }
            ]

            setPrizes(mockPrizes)
        } catch (error) {
            console.error('获取奖品失败:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUserPrizes()
    }, [user.id])

    // 根据稀有度获取颜色
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'legendary':
                return 'from-yellow-400 to-orange-500'
            case 'rare':
                return 'from-purple-400 to-pink-500'
            case 'common':
                return 'from-blue-400 to-indigo-500'
            default:
                return 'from-gray-400 to-gray-500'
        }
    }

    // 根据稀有度获取文字
    const getRarityText = (rarity) => {
        switch (rarity) {
            case 'legendary':
                return '传说'
            case 'rare':
                return '稀有'
            case 'common':
                return '普通'
            default:
                return '未知'
        }
    }

    // 过滤和排序奖品
    const getFilteredAndSortedPrizes = () => {
        let filtered = prizes

        // 按稀有度过滤
        if (filter !== 'all') {
            filtered = filtered.filter(prize => prize.rarity === filter)
        }

        // 排序
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.obtainedAt) - new Date(a.obtainedAt))
                break
            case 'oldest':
                filtered.sort((a, b) => new Date(a.obtainedAt) - new Date(b.obtainedAt))
                break
            case 'rarity':
                const rarityOrder = { legendary: 3, rare: 2, common: 1 }
                filtered.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])
                break
        }

        return filtered
    }

    const filteredPrizes = getFilteredAndSortedPrizes()

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🎁 我的奖品</h2>
                <p className="text-gray-600">查看您从盲盒中获得的所有奖品</p>
            </div>

            {/* 过滤和排序控件 */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    {/* 稀有度过滤 */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">稀有度:</span>
                        <div className="flex space-x-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
                            {[
                                { value: 'all', label: '全部' },
                                { value: 'legendary', label: '传说' },
                                { value: 'rare', label: '稀有' },
                                { value: 'common', label: '普通' }
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setFilter(value)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 min-w-[50px] ${filter === value
                                            ? 'bg-purple-600 text-white shadow-md transform scale-105'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-purple-200'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 排序 */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">排序:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white shadow-sm hover:border-purple-300 transition-all duration-200"
                        >
                            <option value="newest">最新获得</option>
                            <option value="oldest">最早获得</option>
                            <option value="rarity">按稀有度</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 奖品列表 */}
            {filteredPrizes.length === 0 ? (
                <div className="bg-white rounded-lg p-12 shadow-sm text-center">
                    <div className="text-gray-400 text-6xl mb-4">🎁</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">还没有奖品</h3>
                    <p className="text-gray-600">
                        {filter === 'all'
                            ? '快去购买盲盒抽取您的第一个奖品吧！'
                            : `没有找到${getRarityText(filter)}稀有度的奖品`
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrizes.map((prize) => (
                        <div
                            key={prize.id}
                            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* 奖品图片和稀有度标识 */}
                            <div className={`h-32 bg-gradient-to-br ${getRarityColor(prize.rarity)} flex items-center justify-center relative`}>
                                <span className="text-6xl">{prize.image}</span>
                                <div className="absolute top-2 right-2">
                                    <span className="bg-white bg-opacity-90 text-xs font-medium px-2 py-1 rounded-full">
                                        {getRarityText(prize.rarity)}
                                    </span>
                                </div>
                            </div>

                            {/* 奖品信息 */}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-1">{prize.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{prize.description}</p>

                                <div className="space-y-1 text-xs text-gray-500">
                                    <p>来源: {prize.blindBoxName}</p>
                                    <p>获得时间: {prize.obtainedAt.toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 统计信息 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">奖品统计</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{prizes.length}</div>
                        <div className="text-sm text-gray-600">总奖品数</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {prizes.filter(p => p.rarity === 'legendary').length}
                        </div>
                        <div className="text-sm text-gray-600">传说奖品</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {prizes.filter(p => p.rarity === 'rare').length}
                        </div>
                        <div className="text-sm text-gray-600">稀有奖品</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {prizes.filter(p => p.rarity === 'common').length}
                        </div>
                        <div className="text-sm text-gray-600">普通奖品</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserPrizes
