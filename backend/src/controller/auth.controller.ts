import { Controller, Post, Body, Inject, Get, Headers } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';
import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { SqliteUserService, RegisterUserDto, LoginUserDto } from '../service/sqlite-user.service';

/**
 * 用户注册验证DTO
 */
class RegisterDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名长度至少3个字符' })
  username: string;

  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少6个字符' })
  password: string;
}

/**
 * 用户登录验证DTO
 */
class LoginDto {
  @IsNotEmpty({ message: '用户名或邮箱不能为空' })
  usernameOrEmail: string;

  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

/**
 * 用户认证控制器
 * 负责处理用户注册、登录、获取用户信息等API接口
 * 遵循RESTful API设计规范
 */
@Controller('/api/auth')
export class AuthController {

  /**
   * 注入SQLite用户服务
   */
  @Inject()
  userService: SqliteUserService;

  /**
   * 用户注册接口
   * POST /api/auth/register
   * @param registerData 注册数据
   * @returns 注册成功的用户信息
   */
  @Post('/register')
  @Validate()
  async register(@Body() registerData: RegisterDto) {
    try {
      const user = await this.userService.register(registerData as RegisterUserDto);
      
      return {
        success: true,
        message: '注册成功',
        data: user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '注册失败',
        data: null
      };
    }
  }

  /**
   * 用户登录接口
   * POST /api/auth/login
   * @param loginData 登录数据
   * @returns 登录成功的用户信息和token
   */
  @Post('/login')
  @Validate()
  async login(@Body() loginData: LoginDto) {
    try {
      const user = await this.userService.login(loginData as LoginUserDto);
      
      // 生成JWT token
      const token = await this.userService.generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });
      
      return {
        success: true,
        message: '登录成功',
        data: {
          user,
          token
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败',
        data: null
      };
    }
  }

  /**
   * 获取当前用户信息接口
   * GET /api/auth/me
   * 需要在请求头中携带Authorization: Bearer <token>
   * @param authorization 请求头中的Authorization字段
   * @returns 当前用户信息
   */
  @Get('/me')
  async getCurrentUser(@Headers('authorization') authorization: string) {
    try {
      // 检查authorization头是否存在
      if (!authorization) {
        return {
          success: false,
          message: '请提供访问令牌',
          data: null
        };
      }

      // 提取token（去掉"Bearer "前缀）
      const token = authorization.replace('Bearer ', '');
      if (!token) {
        return {
          success: false,
          message: '无效的访问令牌格式',
          data: null
        };
      }

      // 验证token并获取用户信息
      const user = await this.userService.verifyToken(token);
      if (!user) {
        return {
          success: false,
          message: '访问令牌无效或已过期',
          data: null
        };
      }

      return {
        success: true,
        message: '获取用户信息成功',
        data: user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取用户信息失败',
        data: null
      };
    }
  }

  /**
   * 用户登出接口（可选实现）
   * POST /api/auth/logout
   * 注意：JWT token是无状态的，真正的登出需要前端删除token
   * 这里只是返回成功状态
   */
  @Post('/logout')
  async logout() {
    return {
      success: true,
      message: '登出成功',
      data: null
    };
  }
}
