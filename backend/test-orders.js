const fs = require('fs').promises;
const path = require('path');

async function testOrderData() {
    try {
        const dataPath = path.join(__dirname, 'database', 'orders_data.json');
        const data = await fs.readFile(dataPath, 'utf-8');
        const parsed = JSON.parse(data);

        console.log('📋 订单数据加载测试:');
        console.log(`总订单数: ${parsed.orders.length}`);
        console.log(`下一个订单ID: ${parsed.nextOrderId}`);

        // 计算统计信息
        const completedOrders = parsed.orders.filter(order => order.status === 'completed').length;
        const pendingOrders = parsed.orders.filter(order => order.status === 'pending').length;
        const totalRevenue = parsed.orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.totalAmount, 0);

        console.log(`已完成订单: ${completedOrders}`);
        console.log(`待处理订单: ${pendingOrders}`);
        console.log(`总收入: ¥${totalRevenue.toFixed(2)}`);

        // 显示前3个订单
        console.log('\n前3个订单:');
        parsed.orders.slice(0, 3).forEach((order, index) => {
            console.log(`${index + 1}. ${order.id} - ${order.username} - ${order.blindBoxName} - ¥${order.totalAmount}`);
        });

    } catch (error) {
        console.error('测试失败:', error);
    }
}

testOrderData();
