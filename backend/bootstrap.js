const { Bootstrap } = require('@midwayjs/bootstrap');

// 设置环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

// 启动应用
Bootstrap.run();
