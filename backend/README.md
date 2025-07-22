# 盲盒系统后端 (Blind-Box-System Backend)

基于 Midway.js 框架构建的现代化盲盒系统后端API服务。

## 🚀 技术栈

- **Midway.js 3.12.0** - 企业级Node.js框架
- **TypeScript** - 类型安全的JavaScript
- **SQLite** - 轻量级数据库
- **JWT** - 用户认证
- **bcryptjs** - 密码加密

## 📦 核心功能

### 🔐 用户认证系统
- JWT Token认证
- 密码bcrypt加密
- 角色权限控制 (admin/user)
- 用户注册和登录

### 📦 盲盒管理
- 盲盒CRUD操作
- 库存管理
- 价格设置
- 销量统计

### 🎲 抽奖系统
- 基于概率的抽奖算法
- 稀有度系统 (COMMON/RARE/EPIC/LEGENDARY)
- 实时库存检查
- 订单记录

### 🏆 用户奖品系统
- 双数据库存储 (原始+SQLite)
- 奖品收藏管理
- 统计和查询功能
- 稀有度筛选

### 📊 管理后台API
- 用户管理接口
- 盲盒配置接口
- 奖品管理接口
- 数据统计接口

## 🛠️ 开发指南

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问服务
# API: http://localhost:7001
```

### 项目脚本

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 生产启动
npm start

# 代码检查
npm run lint

# 运行测试
npm test
```

## 📁 项目结构

```
src/
├── controller/         # 控制器层
│   ├── api.controller.ts      # 用户API控制器
│   ├── admin.controller.ts    # 管理员API控制器
│   ├── auth.controller.ts     # 认证控制器
│   └── home.controller.ts     # 首页控制器
├── service/           # 服务层
│   ├── blindbox.service.ts           # 盲盒业务逻辑
│   ├── sqlite-user-prize.service.ts  # SQLite用户奖品服务
│   ├── user-prize.service.ts         # 用户奖品服务
│   ├── order.service.ts              # 订单服务
│   └── sqlite-user.service.ts        # 用户服务
├── entity/            # 实体定义
│   ├── user.entity.ts         # 用户实体
│   ├── prize.entity.ts        # 奖品实体
│   ├── blind-box.entity.ts    # 盲盒实体
│   └── user-prize.entity.ts   # 用户奖品实体
├── middleware/        # 中间件
│   └── report.middleware.ts   # 请求日志中间件
├── filter/           # 异常过滤器
│   ├── default.filter.ts      # 默认异常处理
│   └── notfound.filter.ts     # 404处理
└── config/           # 配置文件
    ├── config.default.ts      # 默认配置
    └── config.unittest.ts     # 测试配置
```

## 🗄️ 数据存储

### SQLite数据库
```
database/
├── blind_box_users.db      # 用户主数据库
├── user_prizes.db          # 用户奖品数据库
└── user_library.db         # 用户库存数据库
```

### JSON数据文件
```
database/
├── users_data.json         # 用户数据
├── blindbox_data.json      # 盲盒和奖品数据
├── orders_data.json        # 订单数据
├── user_prizes_data.json   # 用户奖品数据
└── user_library_data.json  # 用户库存数据
```

## 🔌 API接口

### 认证接口
```typescript
POST   /api/auth/register     // 用户注册
POST   /api/auth/login        // 用户登录
POST   /api/auth/validate     // Token验证
GET    /api/auth/me           // 获取当前用户
```

### 用户接口
```typescript
GET    /api/blind-boxes               // 获取盲盒列表
GET    /api/blind-boxes/:id           // 获取盲盒详情
POST   /api/buy-blindbox/:userId      // 购买盲盒
GET    /api/orders                    // 获取订单列表
GET    /api/get_user                  // 获取用户信息
```

### 用户奖品接口
```typescript
GET    /api/sqlite/user-prizes                    // 获取用户奖品
GET    /api/sqlite/user-prizes/stats              // 获取奖品统计
GET    /api/sqlite/user-prizes/recent             // 获取最近奖品
GET    /api/sqlite/user-prizes/by-blindbox       // 按盲盒筛选
```

### 管理员接口
```typescript
GET    /api/admin/stats               // 系统统计
GET    /api/admin/users               // 用户管理
GET    /api/admin/blindboxes          // 盲盒管理
GET    /api/admin/orders              // 订单管理
```

## 🔧 核心服务

### BlindBoxService
- 盲盒业务逻辑处理
- 抽奖算法实现
- 库存管理
- 双数据库同步

### SqliteUserPrizeService
- 用户奖品数据管理
- 统计查询功能
- 分页和筛选
- 数据持久化

### 认证服务
- JWT Token生成和验证
- 密码加密和验证
- 用户权限检查

## 🏃‍♂️ 部署说明

### 开发环境
```bash
npm run dev
# 服务运行在 http://localhost:7001
```

### 生产环境
```bash
# 构建项目
npm run build

# 启动生产服务
npm start
```

### Docker部署
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 7001
CMD ["npm", "start"]
```

## 🔍 测试

### 单元测试
```bash
npm test
```

### API测试
使用工具测试API接口：
```bash
# 测试用户注册
curl -X POST http://localhost:7001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'

# 测试获取盲盒列表
curl http://localhost:7001/api/blind-boxes
```

## 📊 监控和日志

### 日志文件
```
logs/my-midway-project/
├── midway-app.log          # 应用日志
├── midway-core.log         # 核心日志
└── common-error.log        # 错误日志
```

### 系统监控
- API响应时间监控
- 数据库操作监控  
- 用户活跃度统计
- 错误率统计

## 🛡️ 安全特性

- **密码加密**: 使用bcrypt加密存储
- **JWT认证**: 安全的Token机制
- **权限控制**: 基于角色的访问控制
- **输入验证**: 严格的参数验证
- **错误处理**: 统一的异常处理机制

---

基于 [Midway.js](https://midwayjs.org) 框架开发

*更新时间: 2025年7月22日*
