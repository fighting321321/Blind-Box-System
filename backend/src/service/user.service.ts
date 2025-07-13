import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@midwayjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entity/user.entity';

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
  usernameOrEmail: string; // 用户名或邮箱
  password: string;
}

/**
 * 登录响应数据结构
 */
export interface LoginResponse {
  user: Partial<User>;
  token: string;
}

/**
 * 用户服务类
 * 负责处理用户认证相关的业务逻辑
 */
@Provide()
export class UserService {
  
  /**
   * 注入用户数据仓库，用于数据库操作
   */
  @InjectEntityModel(User)
  userRepository: Repository<User>;

  /**
   * 注入JWT服务，用于生成和验证token
   */
  @Inject()
  jwtService: JwtService;

  /**
   * 用户注册方法
   * @param userData 注册用户数据
   * @returns 创建的用户信息（不包含密码）
   */
  async register(userData: RegisterUserDto): Promise<Partial<User>> {
    const { username, email, password } = userData;

    // 检查用户名是否已存在
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username }
    });
    if (existingUserByUsername) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email }
    });
    if (existingUserByEmail) {
      throw new Error('邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      balance: 0, // 初始余额为0
      status: 1,  // 默认状态为启用
    });

    // 保存到数据库
    const savedUser = await this.userRepository.save(newUser);

    // 返回安全的用户信息（不包含密码）
    return savedUser.toSafeObject();
  }

  /**
   * 用户登录方法
   * @param loginData 登录数据
   * @returns 用户信息和JWT token
   */
  async login(loginData: LoginUserDto): Promise<LoginResponse> {
    const { usernameOrEmail, password } = loginData;

    // 根据用户名或邮箱查找用户
    const user = await this.userRepository.findOne({
      where: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });

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

    // 生成JWT token
    const token = await this.jwtService.sign({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    return {
      user: user.toSafeObject(),
      token,
    };
  }

  /**
   * 根据ID获取用户信息
   * @param userId 用户ID
   * @returns 用户信息（不包含密码）
   */
  async getUserById(userId: number): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    return user.toSafeObject();
  }

  /**
   * 更新用户余额
   * @param userId 用户ID
   * @param amount 要增加的金额（负数表示减少）
   * @returns 更新后的用户信息
   */
  async updateUserBalance(userId: number, amount: number): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查余额是否足够（仅在减少余额时）
    if (amount < 0 && user.balance + amount < 0) {
      throw new Error('余额不足');
    }

    // 更新余额
    user.balance += amount;
    const updatedUser = await this.userRepository.save(user);

    return updatedUser.toSafeObject();
  }

  /**
   * 验证JWT token并获取用户信息
   * @param token JWT token
   * @returns 用户信息
   */
  async verifyToken(token: string): Promise<Partial<User> | null> {
    try {
      const payload = await this.jwtService.verify(token) as any;
      return await this.getUserById(payload.userId);
    } catch (error) {
      return null;
    }
  }
}
