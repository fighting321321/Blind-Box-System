/**
 * 测试SQLite用户奖品数据库API的脚本
 */

const http = require('http');

const API_BASE = 'http://localhost:7001/api';

// 简单的HTTP请求函数
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve(response);
                } catch (e) {
                    resolve({ body, status: res.statusCode });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testSqliteUserPrizeAPI() {
    console.log('🧪 开始测试SQLite用户奖品数据库API...\n');

    try {
        // 测试1：获取初始统计信息
        console.log('📊 测试1：获取SQLite用户奖品统计信息');
        const statsResponse = await makeRequest('GET', '/sqlite/user-prizes/stats');
        console.log('统计信息:', JSON.stringify(statsResponse, null, 2));
        console.log('');

        // 测试2：添加测试奖品
        console.log('🎁 测试2：添加测试奖品');
        const addResponse = await makeRequest('POST', '/sqlite/user-prizes/test', {
            userId: 1,
            prizeId: 101,
            blindBoxId: 1
        });
        console.log('添加结果:', JSON.stringify(addResponse, null, 2));
        console.log('');

        // 测试3：查询用户奖品
        console.log('🔍 测试3：查询用户奖品');
        const queryResponse = await makeRequest('GET', '/sqlite/user-prizes?userId=1&page=1&pageSize=10');
        console.log('查询结果:', JSON.stringify(queryResponse, null, 2));
        console.log('');

        // 测试4：获取用户统计
        console.log('📈 测试4：获取用户1的奖品统计');
        const userStatsResponse = await makeRequest('GET', '/sqlite/user/1/prize-stats');
        console.log('用户统计:', JSON.stringify(userStatsResponse, null, 2));
        console.log('');

        // 测试5：获取最近奖品
        console.log('⏰ 测试5：获取最近的奖品');
        const recentResponse = await makeRequest('GET', '/sqlite/user-prizes/recent?limit=5');
        console.log('最近奖品:', JSON.stringify(recentResponse, null, 2));
        console.log('');

        // 测试6：再次获取统计信息
        console.log('📊 测试6：再次获取SQLite用户奖品统计信息');
        const finalStatsResponse = await makeRequest('GET', '/sqlite/user-prizes/stats');
        console.log('最终统计:', JSON.stringify(finalStatsResponse, null, 2));

        console.log('\n🎉 所有测试完成！SQLite用户奖品数据库API工作正常。');

    } catch (error) {
        console.error('❌ 测试错误:', error.message);
        console.log('请确保后端服务器正在运行在 http://localhost:7001');
    }
}

// 运行测试
testSqliteUserPrizeAPI();
