import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BlindBox } from './blind-box.entity';

/**
 * 用户盲盒库实体类 - 用于存储用户收藏的盲盒
 * 对应数据库中的 user_libraries 表
 */
@Entity('user_libraries')
export class UserLibrary {
  /**
   * 主键ID - 自动递增
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户ID - 外键关联到users表
   */
  @Column()
  userId: number;

  /**
   * 盲盒ID - 外键关联到blind_boxes表
   */
  @Column()
  blindBoxId: number;

  /**
   * 收藏数量 - 用户可以收藏多个相同的盲盒
   */
  @Column({ type: 'integer', default: 1 })
  quantity: number;

  /**
   * 收藏时的价格 - 记录收藏时的盲盒价格
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtAdd: number;

  /**
   * 是否已购买 - false:仅收藏 true:已购买
   */
  @Column({ type: 'boolean', default: false })
  isPurchased: boolean;

  /**
   * 收藏备注 - 可选字段，用户可以添加收藏原因等
   */
  @Column({ type: 'text', nullable: true })
  note?: string;

  /**
   * 记录创建时间（收藏时间）
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 记录更新时间
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 关联用户实体
   */
  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  /**
   * 关联盲盒实体
   */
  @ManyToOne(() => BlindBox, { eager: true })
  @JoinColumn({ name: 'blindBoxId' })
  blindBox: BlindBox;
}
