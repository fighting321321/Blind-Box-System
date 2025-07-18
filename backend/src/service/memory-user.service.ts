import { Provide, Init, Scope, ScopeEnum } from '@midwayjs/core';
import * as bcrypt from 'bcryptjs';

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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 登录响应数据结构
 */
export interface LoginResponse {
  user: Partial<User>;
  token: string;
}

/**
 * 内存用户存储服务类
 * 临时替代数据库，用于演示前后端连接
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class MemoryUserService {
  
  private users: User[] = [];
  private nextId = 1;

  /**
   * 初始化方法，创建演示用户
   */
  @Init()
  async init() {
    // 创建演示用户
    const demoPassword = await bcrypt.hash('123456', 10);
    this.users.push({
      id: this.nextId++,
      username: 'demo',
      email: 'demo@example.com',
      password: demoPassword,
      balance: 1000,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('内存用户存储初始化完成，已创建演示用户: demo/123456');
  }

  /**
   * 用户注册方法
   * @param userData 注册用户数据
   * @returns 创建的用户信息（不包含密码）
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 保存到内存
    this.users.push(newUser);

    // 返回安全的用户信息（不包含密码）
    return this.toSafeObject(newUser);
  }

  /**
   * 用户登录方法
   * @param loginData 登录数据
   * @returns 用户信息（不包含密码）
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

    return this.toSafeObject(user);
  }

  /**
   * 根据ID获取用户信息
   * @param userId 用户ID
   * @returns 用户信息（不包含密码）
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
   * @param userId 用户ID
   * @param amount 要增加的金额（负数表示减少）
   * @returns 更新后的用户信息
   */
  async updateUserBalance(userId: number, amount: number): Promise<Partial<User>> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查余额是否足够（仅在减少余额时）
    if (amount < 0 && user.balance + amount < 0) {
      throw new Error('余额不足');
    }

    // 更新余额
    user.balance += amount;
    user.updatedAt = new Date();

    return this.toSafeObject(user);
  }

  /**
   * 转换为安全的用户信息（不包含密码）
   * @param user 用户对象
   * @returns 安全的用户信息
   */
  private toSafeObject(user: User): Partial<User> {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * 获取所有用户数量（用于演示）
   */
  async getUserCount(): Promise<number> {
    return this.users.length;
  }

  /**
   * 获取所有用户
   */
  async getAllUsers(): Promise<Partial<User>[]> {
    return this.users.map(user => this.toSafeObject(user));
  }

  /**
   * 清空所有用户（用于测试）
   */
  async clearAllUsers(): Promise<void> {
    this.users = [];
    this.nextId = 1;
  }
}
