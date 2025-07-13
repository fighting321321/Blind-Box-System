import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * 用户实体类 - 用于存储用户基本信息和认证数据
 * 对应数据库中的 users 表
 */
@Entity('users')
export class User {
  /**
   * 主键ID - 自动递增
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户名 - 唯一标识，用于登录
   * 长度限制：3-20个字符
   */
  @Column({ unique: true, length: 20 })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名长度至少3个字符' })
  username: string;

  /**
   * 邮箱地址 - 唯一标识，也可用于登录
   */
  @Column({ unique: true, length: 100 })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  /**
   * 密码 - 存储加密后的密码哈希值
   * 原始密码长度要求：至少6位
   */
  @Column({ length: 255 })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少6个字符' })
  password: string;

  /**
   * 用户头像URL - 可选字段
   */
  @Column({ nullable: true, length: 500 })
  avatar?: string;

  /**
   * 用户余额 - 用于盲盒购买，默认为0
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  /**
   * 用户状态 - 1:正常 0:禁用
   */
  @Column({ type: 'integer', default: 1 })
  status: number;

  /**
   * 记录创建时间
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 记录更新时间
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 转换为安全的用户信息（不包含密码）
   * 用于API响应
   */
  toSafeObject() {
    const { password, ...safeUser } = this;
    return safeUser;
  }
}