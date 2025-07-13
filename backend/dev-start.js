/**
 * 盲盒系统开发启动脚本
 * 用于在开发环境中启动应用程序
 */

const { Bootstrap } = require('@midwayjs/bootstrap');
const { join } = require('path');

// 设置环境变量
process.env.NODE_ENV = 'local';

// 设置配置文件路径
process.env.MIDWAY_CONFIG_FILE = join(__dirname, './dist/config');

// 启动应用程序
Bootstrap.run({
  appDir: join(__dirname, './dist'),
  configDir: join(__dirname, './dist/config'),
  logger: {
    dir: join(__dirname, './logs'),
    level: 'info'
  }
});
