const jwt = require('jsonwebtoken');

// 创建一个测试管理员token (使用正确的管理员用户ID: 0)
const testToken = jwt.sign(
    {
        userId: 0,  // 管理员的用户ID是0
        username: 'admin',
        isAdmin: true
    },
    'blind-box-jwt-secret-key-2025', // 使用实际的JWT密钥
    { expiresIn: '24h' }
);

console.log('测试管理员Token:');
console.log(testToken);
