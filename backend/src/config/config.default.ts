import { MidwayConfig } from '@midwayjs/core';

export default {
  // Cookie签名密钥，生产环境请更换为更安全的密钥
  keys: '1751442916250_3542',

  // Koa服务器配置
  koa: {
    port: 7001,
  },

  // 静态资源配置，全部放到 build/public 下
  staticFile: {
    dirs: {
      default: {
        prefix: '/',
        dir: './public',
      },
      another: {
        prefix: '/assets',
        dir: './public/assets',
      },
    },
  },

  // JWT配置 - 用于用户认证token
  jwt: {
    secret: 'blind-box-jwt-secret-key-2025',
    expiresIn: '7d',
  },

  // TypeORM数据库配置，数据库文件放到 build/database 下
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: 'build/database/webdevapi.db',
        synchronize: true,
        logging: true,
        // entities: [...Object.values(entity)], // 如需自动加载实体类可加上
      }
    }
  },

} as MidwayConfig;
