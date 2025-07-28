const { Bootstrap } = require('@midwayjs/bootstrap');

// 设置环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

// 显式以组件方式引入用户代码，禁止依赖注入的目录扫描
Bootstrap.configure({
    imports: require('./dist/index'), // 编译后入口文件
    moduleDetector: false,
}).run();
