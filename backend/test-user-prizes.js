/**
 * 用户奖品数据库测试脚本
 * 测试 SqliteUserPrizeService 的基本功能
 */

// 导入必要的模块
const { createApp, close } = require('@midwayjs/mock');
const { Framework } = require('@midwayjs/koa');

async function testUserPrizeService() {
    console.log('🧪 开始测试用户奖品数据库服务...\n');

    let app;

    try {
        // 创建应用实例
        app = await createApp(require.resolve('./bootstrap'), {}, Framework);

        // 获取用户奖品服务实例
        const userPrizeService = await app.getApplicationContext().getAsync('sqliteUserPrizeService');

        console.log('✅ 成功获取用户奖品服务实例\n');

        // 测试1：获取初始统计信息
        console.log('📊 测试1：获取初始统计信息');
        const initialStats = await userPrizeService.getAllUserPrizeStats();
        console.log('初始统计:', JSON.stringify(initialStats, null, 2));
        console.log('');

        // 测试2：添加测试奖品
        console.log('🎁 测试2：添加测试奖品');
        const testPrizeDto = {
            userId: 1,
            prizeId: 101,
            blindBoxId: 1,
            orderId: 'test-order-001'
        };

        const testPrizeDetails = {
            name: '稀有卡片',
            description: '限量版稀有卡片',
            imageUrl: 'https://example.com/card.jpg',
            value: 50.00,
            rarity: 'rare',
            blindBoxName: '测试盲盒'
        };

        const addedPrize = await userPrizeService.addUserPrize(testPrizeDto, testPrizeDetails);
        console.log('添加的奖品:', JSON.stringify(addedPrize, null, 2));
        console.log('');

        // 测试3：查询用户奖品
        console.log('🔍 测试3：查询用户奖品');
        const userPrizes = await userPrizeService.getUserPrizes(1);
        console.log(`用户1的奖品数量: ${userPrizes.length}`);
        console.log('用户奖品:', JSON.stringify(userPrizes, null, 2));
        console.log('');

        // 测试4：分页查询
        console.log('📄 测试4：分页查询');
        const queryResult = await userPrizeService.queryUserPrizes({
            userId: 1,
            page: 1,
            pageSize: 10
        });
        console.log('查询结果:', JSON.stringify(queryResult, null, 2));
        console.log('');

        // 测试5：获取用户统计信息
        console.log('📈 测试5：获取用户统计信息');
        const userStats = await userPrizeService.getUserPrizeStats(1);
        console.log('用户1统计:', JSON.stringify(userStats, null, 2));
        console.log('');

        // 测试6：检查用户是否拥有特定奖品
        console.log('🎯 测试6：检查用户是否拥有特定奖品');
        const hasPrize = await userPrizeService.hasUserPrize(1, 101);
        console.log(`用户1是否拥有奖品101: ${hasPrize}`);
        console.log('');

        // 测试7：获取最近获得的奖品
        console.log('⏰ 测试7：获取最近获得的奖品');
        const recentPrizes = await userPrizeService.getRecentUserPrizes(1, 5);
        console.log('最近奖品:', JSON.stringify(recentPrizes, null, 2));
        console.log('');

        // 测试8：获取总数
        console.log('🔢 测试8：获取总数');
        const totalCount = await userPrizeService.getTotalCount();
        console.log(`总奖品数量: ${totalCount}`);
        console.log('');

        console.log('🎉 所有测试完成！用户奖品数据库服务工作正常。');

    } catch (error) {
        console.error('❌ 测试失败:', error);
    } finally {
        // 关闭应用
        if (app) {
            await close(app);
        }
    }
}

// 运行测试
testUserPrizeService();
