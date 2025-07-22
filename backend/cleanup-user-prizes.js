const fs = require('fs');
const path = require('path');

/**
 * 清理用户奖品数据，移除 prizeValue 字段
 */
async function cleanupUserPrizes() {
    const dataPath = path.join(__dirname, 'database', 'user_prizes_data.json');

    try {
        console.log('📖 读取用户奖品数据...');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);

        console.log(`📦 找到 ${data.userPrizes.length} 个用户奖品条目`);

        // 移除每个奖品的 prizeValue 字段
        data.userPrizes = data.userPrizes.map(prize => {
            const { prizeValue, ...cleanPrize } = prize;
            if (prizeValue !== undefined) {
                console.log(`🧹 移除奖品 "${prize.prizeName}" 的价值字段 (¥${prizeValue})`);
            }
            return cleanPrize;
        });

        // 写回文件
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

        console.log('✅ 用户奖品数据清理完成！');
        console.log(`📝 已更新文件: ${dataPath}`);

    } catch (error) {
        console.error('❌ 清理用户奖品数据失败:', error);
    }
}

// 运行清理脚本
cleanupUserPrizes();
