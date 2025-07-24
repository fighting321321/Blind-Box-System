import { Provide } from '@midwayjs/core';
import { UserPrize, CreateUserPrizeDto } from '../entity/user-prize.entity';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 用户奖品服务
 * 负责管理用户获得的奖品数据
 */
@Provide()
export class UserPrizeService {
  private userPrizes: UserPrize[] = [];
  private nextId: number = 1;
  private dataFilePath = path.join(__dirname, '../../database/user_prizes_data.json');

  async onReady() {
    await this.loadUserPrizesData();
  }

  /**
   * 加载用户奖品数据
   */
  private async loadUserPrizesData() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const data = fs.readFileSync(this.dataFilePath, 'utf8');
        const parsed = JSON.parse(data);
        this.userPrizes = parsed.userPrizes || [];
        this.nextId = parsed.nextId || 1;
        console.log(`✅ 加载用户奖品数据: ${this.userPrizes.length} 个奖品`);
      } else {
        console.log('📝 用户奖品数据文件不存在，将创建新文件');
        await this.saveUserPrizesData();
      }
    } catch (error) {
      console.error('❌ 加载用户奖品数据失败:', error);
      this.userPrizes = [];
      this.nextId = 1;
    }
  }

  /**
   * 保存用户奖品数据到文件
   */
  private async saveUserPrizesData() {
    try {
      const data = {
        userPrizes: this.userPrizes,
        nextId: this.nextId,
        lastUpdate: new Date().toISOString()
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ 保存用户奖品数据失败:', error);
    }
  }

  /**
   * 为用户添加奖品
   */
  async addUserPrize(dto: CreateUserPrizeDto, prize: any, blindBox: any): Promise<UserPrize> {
    const userPrize: UserPrize = {
      id: `PRIZE_${this.nextId++}`,
      userId: dto.userId,
      prizeId: dto.prizeId,
      prizeName: prize.name,
      prizeDescription: prize.description,
      prizeImageUrl: prize.imageUrl || '',
      rarity: prize.rarity || 'common',
      blindBoxId: dto.blindBoxId,
      blindBoxName: blindBox.name,
      orderId: dto.orderId,
      obtainedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.userPrizes.push(userPrize);
    await this.saveUserPrizesData();

    console.log(`🎁 用户 ${dto.userId} 获得奖品: ${prize.name}`);
    return userPrize;
  }

  /**
   * 获取用户的所有奖品
   */
  async getUserPrizes(userId: number): Promise<UserPrize[]> {
    // 保证每个奖品对象都带有 prizeId 字段
    return this.userPrizes
      .filter(prize => prize.userId === userId)
      .map(prize => ({
        ...prize,
        prizeId: prize.prizeId !== undefined ? prize.prizeId : (prize.id ? Number(prize.id.replace(/\D/g, '')) : undefined)
      }));
  }

  /**
   * 根据ID获取奖品
   */
  async getUserPrizeById(id: string): Promise<UserPrize | null> {
    return this.userPrizes.find(prize => prize.id === id) || null;
  }

  /**
   * 获取用户奖品统计
   */
  async getUserPrizeStats(userId: number): Promise<{
    total: number;
    byRarity: { [key: string]: number };
  }> {
    const userPrizes = await this.getUserPrizes(userId);

    const stats = {
      total: userPrizes.length,
      byRarity: {}
    };

    userPrizes.forEach(prize => {
      // 统计稀有度
      stats.byRarity[prize.rarity] = (stats.byRarity[prize.rarity] || 0) + 1;
    });

    return stats;
  }
}
