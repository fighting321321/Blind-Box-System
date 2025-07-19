const jwt = require('jsonwebtoken');

// 创建demo用户token
const demoToken = jwt.sign(
    {
        userId: 1,
        username: 'demo'
    },
    'blind-box-jwt-secret-key-2025',
    { expiresIn: '24h' }
);

console.log('Demo用户Token:');
console.log(demoToken);
