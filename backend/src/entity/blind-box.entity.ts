import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { Prize } from './prize.entity';

/**
 * 盲盒实体类 - 用于存储盲盒基本信息
 * 对应数据库中的 blind_boxes 表
 */
@Entity('blind_boxes')
export class BlindBox {
  /**
   * 主键ID - 自动递增
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 盲盒名称 - 必填字段
   */
  @Column({ length: 100 })
  @IsNotEmpty({ message: '盲盒名称不能为空' })
  @IsString({ message: '盲盒名称必须是字符串' })
  name: string;

  /**
   * 盲盒描述 - 可选字段
   */
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: '盲盒描述必须是字符串' })
  description?: string;

  /**
   * 盲盒价格 - 必填字段
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty({ message: '价格不能为空' })
  @IsNumber({}, { message: '价格必须是数字' })
  @Min(0, { message: '价格不能为负数' })
  price: number;

  /**
   * 盲盒图片URL - 可选字段
   */
  @Column({ nullable: true, length: 500 })
  @IsOptional()
  @IsString({ message: '图片URL必须是字符串' })
  imageUrl?: string;

  /**
   * 盲盒库存 - 默认为0
   */
  @Column({ type: 'integer', default: 0 })
  @IsOptional()
  @IsNumber({}, { message: '库存必须是数字' })
  @Min(0, { message: '库存不能为负数' })
  stock: number;

  /**
   * 盲盒状态 - 1:上架 0:下架
   */
  @Column({ type: 'integer', default: 1 })
  status: number;

  /**
   * 关联的奖品列表 - 一对多关系
   */
  @OneToMany(() => Prize, prize => prize.blindBox)
  prizes: Prize[];

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
}