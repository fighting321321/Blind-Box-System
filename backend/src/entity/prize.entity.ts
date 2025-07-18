import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max, IsIn } from 'class-validator';
import { BlindBox } from './blind-box.entity';

/**
 * 奖品稀有度枚举
 */
export enum PrizeRarity {
  COMMON = 'common',      // 普通
  RARE = 'rare',          // 稀有
  EPIC = 'epic',          // 史诗
  LEGENDARY = 'legendary' // 传说
}

/**
 * 奖品实体类 - 用于存储奖品信息
 * 对应数据库中的 prizes 表
 */
@Entity('prizes')
export class Prize {
  /**
   * 主键ID - 自动递增
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 奖品名称 - 必填字段
   */
  @Column({ length: 100 })
  @IsNotEmpty({ message: '奖品名称不能为空' })
  @IsString({ message: '奖品名称必须是字符串' })
  name: string;

  /**
   * 奖品描述 - 可选字段
   */
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: '奖品描述必须是字符串' })
  description?: string;

  /**
   * 中奖概率 - 必填字段，范围0-1
   */
  @Column({ type: 'decimal', precision: 5, scale: 4 })
  @IsNotEmpty({ message: '中奖概率不能为空' })
  @IsNumber({}, { message: '中奖概率必须是数字' })
  @Min(0, { message: '中奖概率不能为负数' })
  @Max(1, { message: '中奖概率不能超过1' })
  probability: number;

  /**
   * 奖品图片URL - 可选字段
   */
  @Column({ nullable: true, length: 500 })
  @IsOptional()
  @IsString({ message: '图片URL必须是字符串' })
  imageUrl?: string;

  /**
   * 奖品稀有度 - 必填字段
   */
  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: PrizeRarity.COMMON 
  })
  @IsNotEmpty({ message: '奖品稀有度不能为空' })
  @IsString({ message: '奖品稀有度必须是字符串' })
  @IsIn(Object.values(PrizeRarity), { message: '无效的稀有度等级' })
  rarity: PrizeRarity;

  /**
   * 奖品状态 - 1:启用 0:禁用
   */
  @Column({ type: 'integer', default: 1 })
  status: number;

  /**
   * 关联的盲盒ID - 外键
   */
  @Column({ name: 'blind_box_id' })
  blindBoxId: number;

  /**
   * 关联的盲盒 - 多对一关系
   */
  @ManyToOne(() => BlindBox, blindBox => blindBox.prizes)
  @JoinColumn({ name: 'blind_box_id' })
  blindBox: BlindBox;

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