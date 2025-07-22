const fs = require('fs');
const path = require('path');

/**
 * 清空所有奖品和订单数据
 */
async function clearAllData() {
    const databaseDir = path.join(__dirname, 'database');

    try {
        console.log('🗑️ 开始清空所有奖品和订单数据...');

        // 1. 清空用户奖品数据
        const userPrizesPath = path.join(databaseDir, 'user_prizes_data.json');
        const emptyUserPrizes = {
            userPrizes: [],
            nextId: 1,
            lastUpdate: new Date().toISOString()
        };
        fs.writeFileSync(userPrizesPath, JSON.stringify(emptyUserPrizes, null, 2), 'utf8');
        console.log('✅ 清空用户奖品数据');

        // 2. 清空订单数据
        const ordersPath = path.join(databaseDir, 'orders_data.json');
        const emptyOrders = {
            orders: [],
            nextOrderId: 1,
            lastUpdate: new Date().toISOString()
        };
        fs.writeFileSync(ordersPath, JSON.stringify(emptyOrders, null, 2), 'utf8');
        console.log('✅ 清空订单数据');

        // 3. 清空用户库存数据
        const userLibraryPath = path.join(databaseDir, 'user_library_data.json');
        const emptyUserLibrary = {
            userItems: [],
            nextId: 1,
            lastUpdate: new Date().toISOString()
        };
        fs.writeFileSync(userLibraryPath, JSON.stringify(emptyUserLibrary, null, 2), 'utf8');
        console.log('✅ 清空用户库存数据');

        console.log('🎉 所有奖品和订单数据清空完成！');
        console.log('📊 数据重置状态:');
        console.log('   - 用户奖品: 0 条记录');
        console.log('   - 订单记录: 0 条记录');
        console.log('   - 用户库存: 0 条记录');

    } catch (error) {
        console.error('❌ 清空数据失败:', error);
    }
}

// 运行清空脚本
clearAllData();
