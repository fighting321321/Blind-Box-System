# 盲盒系统前端 (Blind-Box-System Frontend)

基于 React + Vite 构建的现代化盲盒系统前端应用。

## 🚀 技术栈

- **React 18.2.0** - 现代化React框架
- **Vite 7.0.0** - 快速构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Axios** - HTTP客户端

## 📦 功能特性

### 🏠 主页功能
- 盲盒展示网格/列表视图
- 实时库存和价格显示
- 响应式设计支持

### 🎁 盲盒购买
- 单次/批量购买支持
- 余额实时检查
- 购买确认对话框

### 🏆 奖品收藏系统
- 个人奖品展示页面
- 稀有度筛选和排序
- 奖品统计信息
- 来源追踪功能

### 👤 用户系统
- 用户注册和登录
- 个人信息管理
- 余额查看

### 🛡️ 管理后台
- 盲盒管理界面
- 奖品配置系统
- 用户管理功能
- 数据统计面板

## 🛠️ 开发指南

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:5173

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── AdminDashboard.jsx     # 管理员仪表板
│   ├── BlindBoxList.jsx       # 盲盒列表
│   ├── BlindBoxDraw.jsx       # 盲盒抽取
│   ├── UserPrizes.jsx         # 用户奖品展示
│   ├── LoginForm.jsx          # 登录表单
│   └── ...
├── services/           # API服务
│   └── api.js         # API接口封装
├── utils/             # 工具函数
│   └── imageGenerator.js # 图片生成工具
├── assets/            # 静态资源
├── App.jsx           # 主应用组件
└── main.jsx          # 应用入口
```

## 🎨 UI组件

### 主要组件说明

- **HomePage**: 主页，展示所有盲盒
- **UserPrizes**: 用户奖品收藏页面，支持筛选和排序
- **BlindBoxDraw**: 盲盒购买和抽取功能
- **AdminDashboard**: 管理员后台控制面板
- **LoginForm/RegisterForm**: 用户认证组件

### 样式系统

使用 Tailwind CSS 构建响应式UI：
- 移动优先的响应式设计
- 深色/浅色主题支持
- 现代化的组件样式
- 流畅的动画效果

## 🔌 API集成

### 后端接口对接
- 基地址: `http://localhost:7001`
- 认证: JWT Token
- 错误处理: 统一错误响应格式

### 主要API调用
```javascript
// 获取盲盒列表
GET /api/blind-boxes

// 购买盲盒
POST /api/buy-blindbox/:userId

// 获取用户奖品
GET /api/sqlite/user-prizes?userId=:id

// 用户登录
POST /api/auth/login
```

## 🚀 部署说明

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm run preview
```

构建产物位于 `dist/` 目录，可直接部署到静态服务器。

## 🔧 配置说明

### Vite配置 (vite.config.js)
- 开发服务器端口配置
- 代理设置用于API调用
- 构建优化配置

### Tailwind配置 (tailwind.config.js)
- 自定义颜色主题
- 响应式断点设置
- 组件样式扩展

---

*更新时间: 2025年7月22日*
