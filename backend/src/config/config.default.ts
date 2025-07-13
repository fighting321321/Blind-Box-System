import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';

export default {
  // Cookie签名密钥，生产环境请更换为更安全的密钥
  keys: '1751442916250_3542',
  
  // Koa服务器配置
  koa: {
    port: 7001,
  },

  // TypeORM数据库配置 - 使用SQLite数据库
  typeorm: {
    dataSource: {
      default: {
        /**
         * 数据库类型：SQLite (使用sql.js驱动)
         * sql.js是纯JavaScript实现的SQLite，无需编译，适合Windows环境
         */
        type: 'sqljs',
        
        /**
         * 使用内存数据库进行开发测试
         * 生产环境可以配置为文件数据库
         */
        database: new Uint8Array(),
        
        /**
         * sql.js特定配置
         */
        autoSave: true,
        autoSaveInterval: 1000,
        location: join(__dirname, '../../database/blind_box_users.db'),
        
        /**
         * 实体类路径配置
         * 指定TypeORM要管理的实体类位置
         */
        entities: [join(__dirname, '../entity/*.entity{.ts,.js}')],
        
        /**
         * 自动同步数据库结构
         * 开发环境设为true，生产环境建议设为false并使用迁移
         */
        synchronize: true,
        
        /**
         * 开启SQL日志记录
         * 开发阶段便于调试，可以看到执行的SQL语句
         */
        logging: ['query', 'error'],
      }
    }
  },

  // JWT配置 - 用于用户认证token
  jwt: {
    secret: 'blind-box-jwt-secret-key-2025', // JWT签名密钥，生产环境请使用更复杂的密钥
    expiresIn: '7d', // Token过期时间：7天
  },

  // CORS跨域配置
  cors: {
    origin: '*', // 开发环境允许所有域名，生产环境请指定具体前端域名
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  },

} as MidwayConfig;
