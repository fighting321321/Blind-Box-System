# 盲盒系统 (Blind-Box-System)

一个基于现代Web技术栈的完整盲盒抽取系统，提供用户端和管理员端的完整功能。

## 📋 目录
- [系统概述](#系统概述)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [用户功能](#用户功能)
- [管理员功能](#管理员功能)
- [API接口](#api接口)
- [数据库设计](#数据库设计)
- [部署指南](#部署指南)
- [维护说明](#维护说明)

## 🎯 系统概述

本系统是一个完整的盲盒抽取平台，支持用户注册登录、盲盒浏览、个人库管理、抽奖功能和订单管理。管理员可以通过后台管理系统管理盲盒、奖品和用户数据。

### 核心功能
- 🔐 **用户认证系统**: JWT Token认证，安全的密码加密存储
- 📦 **盲盒管理**: 完整的盲盒浏览、库存管理和抽取功能
- 🎲 **抽奖系统**: 基于概率的真实抽奖机制，支持多种奖品配置
- 📱 **响应式设计**: 支持桌面端和移动端访问
- 🛡️ **权限控制**: 完整的角色权限管理和数据安全保护
- 📊 **管理后台**: 功能完整的管理员控制面板

## 🛠️ 技术栈

### 后端技术
- **框架**: Midway.js 3.12.0 (基于Koa)
- **数据库**: SQLite + JSON数据持久化
- **认证**: JWT Token + bcryptjs
- **类型安全**: TypeScript
- **API风格**: RESTful API

### 前端技术
- **框架**: React 18.2.0
- **构建工具**: Vite 7.0.0
- **样式框架**: Tailwind CSS
- **HTTP客户端**: Axios
- **状态管理**: React Hooks

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装和启动

1. **克隆项目**
```bash
git clone https://github.com/fighting321321/Blind-Box-System.git
cd Blind-Box-System
```

2. **启动后端服务**
```bash
cd backend
npm install
npm run dev
# 服务启动在 http://localhost:7001
```

3. **启动前端服务**
```bash
cd frontend
npm install
npm run dev
# 服务启动在 http://localhost:5173
```

4. **访问系统**
- 前端地址: http://localhost:5173
- 后端API: http://localhost:7001

### 默认账号
- **管理员**: `admin` / `123456`
- **演示用户**: `demo` / `123456` (余额: 1000)

## 👤 用户功能

### 1. 主页功能
- **盲盒展示**: 显示所有管理员已添加的盲盒
- **双视图模式**: 支持网格视图和列表视图切换
- **添加到库**: 每个盲盒都有"添加到库"按钮，点击即可添加到用户的个人库中
- **盲盒信息**: 显示盲盒的价格、剩余库存、销量、评分等信息

### 2. 用户库功能
- **库管理**: 显示用户已添加的所有盲盒
- **数量统计**: 显示每种盲盒的数量
- **直接抽取**: 可以直接从库中选择盲盒进行抽取
- **移除功能**: 可以从库中移除不需要的盲盒

### 3. 抽取功能
- **选择盲盒**: 可以选择要抽取的盲盒系列
- **余额检查**: 自动检查用户余额是否足够
- **库存检查**: 自动检查盲盒库存是否充足
- **实时抽取**: 调用后端API进行真实的抽取操作
- **结果展示**: 显示抽取结果和获得的奖品

### 4. 订单管理
- **订单历史**: 显示用户的所有抽取订单
- **订单详情**: 包含抽取时间、盲盒信息、获得奖品等
- **状态跟踪**: 显示订单状态（已完成/待处理等）

### 5. 用户界面
- **响应式设计**: 支持桌面端和移动端访问
- **直观导航**: 清晰的页面导航和功能分区
- **实时反馈**: 操作结果的即时反馈和状态更新

## 🔧 管理员功能

### 访问方式
使用管理员账号 `admin` / `123456` 登录系统后，可访问管理员控制面板。

### 核心功能

#### 1. 数据统计
- 系统总览：盲盒、奖品、用户数量统计
- 收入统计：总收入和销售数据分析
- 实时监控：用户活跃度和系统状态

#### 2. 盲盒管理
- 盲盒列表：查看和搜索所有盲盒
- 盲盒编辑：创建、修改、删除盲盒
- 库存管理：设置价格、库存数量等参数

#### 3. 奖品管理
- 奖品配置：为盲盒添加和管理奖品
- 概率设置：设置各奖品的中奖概率
- 奖品编辑：修改奖品信息和价值

#### 4. 用户管理
- 用户列表：查看所有注册用户
- 状态管理：启用或禁用用户账号
- 用户信息：查看用户详细信息和操作历史

## 🔌 API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/validate` - 验证Token
- `GET /api/auth/me` - 获取当前用户信息

### 用户接口
- `GET /api/blind-boxes` - 获取所有盲盒
- `GET /api/blind-boxes/:id` - 获取盲盒详情
- `POST /api/draw-blind-box` - 抽取盲盒
- `GET /api/orders?userId=:id` - 获取用户订单
- `GET /api/get_user?uid=:id` - 获取用户信息

### 管理员接口
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/:id/status` - 更新用户状态
- `GET /api/admin/blindboxes` - 获取盲盒列表
- `POST /api/admin/blindboxes` - 创建盲盒
- `PUT /api/admin/blindboxes/:id` - 更新盲盒
- `DELETE /api/admin/blindboxes/:id` - 删除盲盒
- `GET /api/admin/blindboxes/:id/prizes` - 获取奖品列表
- `POST /api/admin/prizes` - 创建奖品
- `PUT /api/admin/prizes/:id` - 更新奖品
- `DELETE /api/admin/prizes/:id` - 删除奖品
- `GET /api/admin/orders` - 获取订单列表

### 权限说明
- 所有管理员接口需要JWT Token验证
- 普通用户无法访问管理员接口
- 系统自动验证用户角色和权限

## 🗄️ 数据库设计

### 存储方式
- **SQLite数据库**: `backend/database/blind_box_users.db`
- **JSON数据文件**: 
  - 用户数据: `backend/database/users_data.json`
  - 盲盒数据: `backend/database/blindbox_data.json`

### 数据结构

#### 用户数据模型
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  password: string; // bcryptjs加密
  balance: number;
  role: 'user' | 'admin';
  status: number; // 1-激活, 0-禁用
  createdAt: string;
  updatedAt: string;
}
```

#### 盲盒数据模型
```typescript
interface BlindBox {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 奖品数据模型
```typescript
interface Prize {
  id: number;
  name: string;
  description: string;
  probability: number;
  blindBoxId: number;
  imageUrl?: string;
  value?: number;
  createdAt: string;
  updatedAt: string;
}
```

## 🚀 部署指南

### 开发环境
- 前端: http://localhost:5173
- 后端: http://localhost:7001

### 生产环境部署

1. **构建前端**
```bash
cd frontend
npm run build
```

2. **配置环境变量**
```bash
# 后端环境配置
NODE_ENV=production
PORT=7001
JWT_SECRET=your-secret-key
```

3. **启动生产服务**
```bash
cd backend
npm run build
npm start
```

### Docker部署（可选）
```dockerfile
# 提供Docker配置示例
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 7001
CMD ["npm", "start"]
```

## 🔧 维护说明

### 日志管理
- **位置**: `backend/logs/my-midway-project/`
- **类型**: 应用日志、错误日志、核心日志
- **功能**: 系统监控、问题排查、性能分析

### 系统监控
- 用户活跃度统计
- 抽取成功率监控
- 盲盒库存状态跟踪
- API响应时间监控

### 数据维护
- 定期备份用户数据和盲盒配置
- 日志文件定期清理和归档
- 数据库文件备份和恢复

## 🔮 功能扩展

系统架构支持以下扩展功能：
- 盲盒收藏和分享功能
- 用户等级和积分系统
- 实时通知和消息推送
- 多语言国际化支持
- 移动端应用开发
- 支付系统集成

## 🆘 常见问题

### 启动问题
1. 确保Node.js版本 >= 16.0.0
2. 检查端口7001和5173是否被占用
3. 确认数据库文件权限正常

### 功能问题
1. 登录失败：检查用户名密码是否正确
2. 抽取失败：检查用户余额和盲盒库存
3. 管理员功能：确认使用admin账号登录

### 技术支持
- 项目地址: https://github.com/fighting321321/Blind-Box-System
- 问题反馈: 通过GitHub Issues提交

---

## � 许可证
本项目仅用于学习和演示目的。

*最后更新: 2025年7月17日*
