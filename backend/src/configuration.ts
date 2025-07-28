import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as jwt from '@midwayjs/jwt';
import * as cors from '@koa/cors';
import * as info from '@midwayjs/info';
import * as staticFile from '@midwayjs/static-file';
// import { join } from 'path';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';

/**
 * 盲盒系统主配置类
 * 负责配置和初始化所有必要的中间件、组件和过滤器
 */
const DefaultConfig = require('./config/config.default');

@Configuration({
  imports: [
    koa,           // Koa Web框架
    validate,      // 数据验证组件
    jwt,           // JWT认证组件
    staticFile,    // 静态资源托管组件
    {
      component: info,
      enabledEnvironment: ['local'], // 仅在开发环境启用info组件
    },
  ],
  importConfigs: [
    {
      default: DefaultConfig
    }
  ], // 对象模式导入配置文件，符合单文件构建要求
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  /**
   * 应用准备就绪时的回调函数
   * 在这里配置中间件和过滤器
   */
  async onReady() {
    // 配置CORS跨域中间件
    this.app.use(cors({
      origin: '*', // 开发环境允许所有域名访问
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }));

    // 添加报告中间件用于请求日志记录
    this.app.useMiddleware([ReportMiddleware]);

    // 添加异常过滤器（暂时注释，后续可根据需要启用）
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
