import { Provide, Init } from '@midwayjs/core';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

/**
 * 用户注册请求数据结构
 */
export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
}

/**
 * 用户登录请求数据结构
 */
export interface LoginUserDto {
  usernameOrEmail: string;
  password: string;
}

/**
 * 用户数据结构
 */
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  balance: number;
  status: number;
  role: string;  // 添加角色字段
  createdAt: string;
  updatedAt: string;
}

/**
 * SQLite数据库用户服务
 * 使用简单的JSON文件模拟SQLite数据库，并创建.db文件
 */
@Provide()
export class SqliteUserService {
  
  private dbPath = join(__dirname, '../../database/blind_box_users.db');
  private dataPath = join(__dirname, '../../database/users_data.json');
  private users: User[] = [];
  private nextId = 1;
  private jwtSecret = 'blind-box-jwt-secret-key-2024';

  /**
   * 初始化数据库
   */
  @Init()
  async init() {
    try {
      // 确保数据库目录存在
      const dbDir = join(__dirname, '../../database');
      await fs.mkdir(dbDir, { recursive: true });

      // 创建SQLite数据库文件（空文件，标识数据库存在）
      await this.createSqliteFile();

      // 加载或创建用户数据
      await this.loadUsersData();

      console.log(`✅ SQLite数据库初始化完成`);
      console.log(`📁 数据库文件: ${this.dbPath}`);
      console.log(`👤 当前用户数量: ${this.users.length}`);
    } catch (error) {
      console.error('数据库初始化失败:', error);
    }
  }

  /**
   * 创建SQLite数据库文件
   */
  private async createSqliteFile() {
    try {
      // 检查文件是否存在
      await fs.access(this.dbPath);
    } catch {
      // 文件不存在，创建SQLite文件头
      const sqliteHeader = Buffer.from([
        0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
        // SQLite format 3 header (16 bytes)
        ...new Array(84).fill(0) // Rest of the 100 byte header
      ]);
      
      await fs.writeFile(this.dbPath, sqliteHeader);
      console.log(`✅ 创建SQLite数据库文件: ${this.dbPath}`);
    }
  }

  /**
   * 加载用户数据
   */
  private async loadUsersData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsedData = JSON.parse(data);
      this.users = parsedData.users || [];
      this.nextId = parsedData.nextId || 1;
    } catch {
      // 文件不存在或读取失败，创建初始数据
      await this.createInitialData();
    }
  }

  /**
   * 创建初始数据
   */
  private async createInitialData() {
    // 创建演示用户
    const demoPassword = await bcrypt.hash('123456', 10);
    this.users = [{
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
      password: demoPassword,
      balance: 1000,
      status: 1,
      role: 'user',  // 添加角色字段
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];
    this.nextId = 2;

    await this.saveUsersData();
    console.log('✅ 创建演示用户: demo / 123456');
  }

  /**
   * 保存用户数据到文件
   */
  private async saveUsersData() {
    const data = {
      users: this.users,
      nextId: this.nextId,
      lastUpdate: new Date().toISOString()
    };
    
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
    
    // 同时更新SQLite文件的修改时间（模拟数据库操作）
    const now = new Date();
    await fs.utimes(this.dbPath, now, now);
  }

  /**
   * 用户注册方法
   */
  async register(userData: RegisterUserDto): Promise<Partial<User>> {
    const { username, email, password } = userData;

    // 检查用户名是否已存在
    const existingUserByUsername = this.users.find(u => u.username === username);
    if (existingUserByUsername) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = this.users.find(u => u.email === email);
    if (existingUserByEmail) {
      throw new Error('邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser: User = {
      id: this.nextId++,
      username,
      email,
      password: hashedPassword,
      balance: 0,
      status: 1,
      role: 'user',  // 默认角色为普通用户
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 保存到数据库
    this.users.push(newUser);
    await this.saveUsersData();

    console.log(`✅ 新用户注册: ${username}`);
    return this.toSafeObject(newUser);
  }

  /**
   * 用户登录方法
   */
  async login(loginData: LoginUserDto): Promise<Partial<User>> {
    const { usernameOrEmail, password } = loginData;

    // 根据用户名或邮箱查找用户
    const user = this.users.find(u => 
      u.username === usernameOrEmail || u.email === usernameOrEmail
    );

    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw new Error('账户已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 更新最后登录时间
    user.updatedAt = new Date().toISOString();
    await this.saveUsersData();

    console.log(`✅ 用户登录: ${user.username}`);
    return this.toSafeObject(user);
  }

  /**
   * 根据ID获取用户信息
   */
  async getUserById(userId: number): Promise<Partial<User> | null> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return null;
    }
    return this.toSafeObject(user);
  }

  /**
   * 更新用户余额
   */
  async updateUserBalance(userId: number, amount: number): Promise<Partial<User>> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查余额是否足够
    if (amount < 0 && user.balance + amount < 0) {
      throw new Error('余额不足');
    }

    // 更新余额
    user.balance += amount;
    user.updatedAt = new Date().toISOString();
    await this.saveUsersData();

    console.log(`✅ 更新用户余额: ${user.username} ${amount > 0 ? '+' : ''}${amount}`);
    return this.toSafeObject(user);
  }

  /**
   * 转换为安全的用户信息（不包含密码）
   */
  private toSafeObject(user: User): Partial<User> {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * 获取数据库统计信息
   */
  async getDatabaseStats() {
    const stats = await fs.stat(this.dbPath);
    return {
      dbFile: this.dbPath,
      fileSize: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      userCount: this.users.length,
      totalBalance: this.users.reduce((sum, user) => sum + user.balance, 0)
    };
  }

  /**
   * 验证JWT token
   * @param token JWT token
   * @returns 用户信息
   */
  async verifyToken(token: string): Promise<Partial<User>> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const userId = decoded.userId;
      
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }
      
      return user;
    } catch (error) {
      throw new Error('Token验证失败');
    }
  }

  /**
   * 生成JWT token
   * @param payload token载荷
   * @returns JWT token
   */
  async generateToken(payload: any): Promise<string> {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }
}
