import { MidwayConfig } from '@midwayjs/core';

export default {
  // Cookie签名密钥，生产环境请更换为更安全的密钥
  keys: '1751442916250_3542',
  
  // Koa服务器配置
  koa: {
    port: 7001,
  },

  // JWT配置 - 用于用户认证token
  jwt: {
    secret: 'blind-box-jwt-secret-key-2025',
    expiresIn: '7d',
  },

} as MidwayConfig;
