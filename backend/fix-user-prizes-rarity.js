// 修复用户奖品数据中缺少稀有度的问题
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'database', 'user_prizes_data.json');

async function fixUserPrizesRarity() {
    try {
        console.log('🔧 开始修复用户奖品稀有度数据...');

        // 读取当前数据
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        let fixedCount = 0;

        // 遍历所有奖品，为缺少稀有度的奖品添加默认稀有度
        data.userPrizes.forEach(prize => {
            if (!prize.rarity) {
                // 根据奖品名称推断稀有度
                if (prize.prizeName.includes('稀有') || prize.prizeName.includes('金卡')) {
                    prize.rarity = 'LEGENDARY';
                } else if (prize.prizeName.includes('手办') || prize.prizeName.includes('限量')) {
                    prize.rarity = 'RARE';
                } else if (prize.prizeName.includes('隐藏')) {
                    prize.rarity = 'LEGENDARY';
                } else {
                    prize.rarity = 'COMMON'; // 默认为普通
                }

                console.log(`✅ 修复奖品 "${prize.prizeName}" 稀有度: ${prize.rarity}`);
                fixedCount++;
            }
        });

        if (fixedCount > 0) {
            // 更新最后修改时间
            data.lastUpdate = new Date().toISOString();

            // 保存修复后的数据
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`🎉 修复完成！共修复 ${fixedCount} 个奖品的稀有度数据`);
        } else {
            console.log('✅ 所有奖品都已有稀有度数据，无需修复');
        }

    } catch (error) {
        console.error('❌ 修复失败:', error);
    }
}

// 运行修复
fixUserPrizesRarity();
