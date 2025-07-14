import { useState } from 'react'

/**
 * 订单管理组件
 */
function OrderManagement({ user }) {
  const [activeTab, setActiveTab] = useState('all')

  // 模拟订单数据
  const orders = [
    {
      id: 'ORD001',
      type: '盲盒抽取',
      items: [
        { name: '可爱动物系列', quantity: 2, price: 59 }
      ],
      status: 'completed',
      total: 118,
      createTime: '2025-07-13 14:30:00',
      completeTime: '2025-07-13 14:30:05'
    },
    {
      id: 'ORD002',
      type: '盲盒抽取',
      items: [
        { name: '梦幻公主系列', quantity: 1, price: 89 }
      ],
      status: 'completed',
      total: 89,
      createTime: '2025-07-12 16:20:00',
      completeTime: '2025-07-12 16:20:03'
    },
    {
      id: 'ORD003',
      type: '余额充值',
      items: [
        { name: '账户充值', quantity: 1, price: 200 }
      ],
      status: 'completed',
      total: 200,
      createTime: '2025-07-11 10:15:00',
      completeTime: '2025-07-11 10:15:30'
    },
    {
      id: 'ORD004',
      type: '盲盒抽取',
      items: [
        { name: '科幻机甲系列', quantity: 1, price: 99 }
      ],
      status: 'pending',
      total: 99,
      createTime: '2025-07-13 18:00:00',
      completeTime: null
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'failed': return 'bg-red-100 text-red-600'
      case 'cancelled': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'pending': return '处理中'
      case 'failed': return '失败'
      case 'cancelled': return '已取消'
      default: return '未知'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case '盲盒抽取': return '🎲'
      case '余额充值': return '💰'
      case '商品购买': return '🛒'
      default: return '📋'
    }
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true
    if (activeTab === 'draw') return order.type === '盲盒抽取'
    if (activeTab === 'recharge') return order.type === '余额充值'
    if (activeTab === 'pending') return order.status === 'pending'
    return true
  })

  const getOrderStats = () => {
    const total = orders.length
    const completed = orders.filter(o => o.status === 'completed').length
    const pending = orders.filter(o => o.status === 'pending').length
    const totalAmount = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0)

    return { total, completed, pending, totalAmount }
  }

  const stats = getOrderStats()

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">订单管理</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>👤</span>
          <span>{user.username}</span>
        </div>
      </div>

      {/* 订单统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
          <div className="text-sm text-gray-600">总订单</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">已完成</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">处理中</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">¥{stats.totalAmount}</div>
          <div className="text-sm text-gray-600">总消费</div>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="bg-white rounded-lg p-1 shadow-sm">
        <div className="flex space-x-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveTab('all')}
          >
            全部订单
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'draw'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveTab('draw')}
          >
            盲盒抽取
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'recharge'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveTab('recharge')}
          >
            余额充值
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            待处理
          </button>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">暂无订单</h3>
            <p className="text-gray-600">您还没有任何订单记录</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg p-6 shadow-sm">
              {/* 订单头部 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(order.type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-800">订单号: {order.id}</h3>
                    <p className="text-sm text-gray-600">{order.createTime}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* 订单内容 */}
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-300 rounded-lg"></div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">¥{item.price}</p>
                      <p className="text-sm text-gray-600">单价</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 订单底部 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {order.completeTime && (
                    <p>完成时间: {order.completeTime}</p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">订单总额</p>
                    <p className="text-lg font-bold text-purple-600">¥{order.total}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      查看详情
                    </button>
                    {order.status === 'pending' && (
                      <button className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        取消订单
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 分页 */}
      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              显示 {filteredOrders.length} 条订单
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                上一页
              </button>
              <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                下一页
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement
