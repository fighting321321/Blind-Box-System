import { Provide, Init } from '@midwayjs/core';
import { promises as fs } from 'fs';
import { join } from 'path';
import { BlindBox } from '../entity/blind-box.entity';
import { Prize } from '../entity/prize.entity';

/**
 * 盲盒创建/更新请求数据结构
 */
export interface BlindBoxDto {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
}

/**
 * 奖品创建/更新请求数据结构
 */
export interface PrizeDto {
  name: string;
  description?: string;
  probability: number;
  imageUrl?: string;
  value?: number;
  blindBoxId: number;
}

/**
 * 盲盒数据存储结构
 */
interface BlindBoxData {
  blindBoxes: BlindBox[];
  prizes: Prize[];
  nextBlindBoxId: number;
  nextPrizeId: number;
  lastUpdate: string;
}

/**
 * 盲盒服务类
 * 负责处理盲盒和奖品的数据存储操作
 */
@Provide()
export class BlindBoxService {
  
  private dataPath = join(__dirname, '../../database/blindbox_data.json');
  private blindBoxes: BlindBox[] = [];
  private prizes: Prize[] = [];
  private nextBlindBoxId = 1;
  private nextPrizeId = 1;

  /**
   * 初始化数据
   */
  @Init()
  async init() {
    try {
      // 确保数据库目录存在
      const dbDir = join(__dirname, '../../database');
      await fs.mkdir(dbDir, { recursive: true });

      // 加载或创建盲盒数据
      await this.loadBlindBoxData();

      console.log(`✅ 盲盒数据初始化完成`);
      console.log(`📦 当前盲盒数量: ${this.blindBoxes.length}`);
      console.log(`🎁 当前奖品数量: ${this.prizes.length}`);
    } catch (error) {
      console.error('盲盒数据初始化失败:', error);
    }
  }

  /**
   * 加载盲盒数据
   */
  private async loadBlindBoxData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsed: BlindBoxData = JSON.parse(data);
      this.blindBoxes = parsed.blindBoxes || [];
      this.prizes = parsed.prizes || [];
      this.nextBlindBoxId = parsed.nextBlindBoxId || 1;
      this.nextPrizeId = parsed.nextPrizeId || 1;
      
      console.log(`✅ 加载盲盒数据: ${this.blindBoxes.length} 个盲盒, ${this.prizes.length} 个奖品`);
    } catch (error) {
      // 文件不存在，创建初始数据
      console.log('盲盒数据文件不存在，创建初始数据...');
      await this.createInitialBlindBoxData();
    }
  }

  /**
   * 创建初始盲盒数据
   */
  private async createInitialBlindBoxData() {
    const now = new Date().toISOString();
    
    // 创建初始盲盒
    this.blindBoxes = [
      {
        id: 1,
        name: '可爱动物盲盒',
        description: '超萌动物系列，每个都是惊喜',
        price: 29.9,
        imageUrl: '',
        stock: 100,
        status: 1,
        prizes: [],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      },
      {
        id: 2,
        name: '潮流玩具盲盒',
        description: '时尚潮流系列，收藏价值极高',
        price: 49.9,
        imageUrl: '',
        stock: 50,
        status: 1,
        prizes: [],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      },
      {
        id: 3,
        name: '经典卡通盲盒',
        description: '经典卡通角色，童年回忆',
        price: 39.9,
        imageUrl: '',
        stock: 75,
        status: 1,
        prizes: [],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      }
    ];

    // 创建初始奖品
    this.prizes = [
      // 可爱动物盲盒的奖品
      {
        id: 1,
        name: '小熊公仔',
        description: '可爱的小熊玩偶',
        probability: 0.3,
        imageUrl: '',
        value: 15.0,
        status: 1,
        blindBoxId: 1,
        blindBox: this.blindBoxes[0],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      },
      {
        id: 2,
        name: '小兔玩偶',
        description: '萌萌的小兔子',
        probability: 0.25,
        imageUrl: '',
        value: 18.0,
        status: 1,
        blindBoxId: 1,
        blindBox: this.blindBoxes[0],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      },
      {
        id: 3,
        name: '稀有金卡',
        description: '超稀有收藏卡片',
        probability: 0.05,
        imageUrl: '',
        value: 100.0,
        status: 1,
        blindBoxId: 1,
        blindBox: this.blindBoxes[0],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      },
      // 潮流玩具盲盒的奖品
      {
        id: 4,
        name: '潮流手办',
        description: '限量版潮流手办',
        probability: 0.2,
        imageUrl: '',
        value: 35.0,
        status: 1,
        blindBoxId: 2,
        blindBox: this.blindBoxes[1],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      },
      {
        id: 5,
        name: '炫彩徽章',
        description: '个性化炫彩徽章',
        probability: 0.4,
        imageUrl: '',
        value: 12.0,
        status: 1,
        blindBoxId: 2,
        blindBox: this.blindBoxes[1],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      },
      {
        id: 6,
        name: '隐藏款玩偶',
        description: '神秘隐藏款，价值连城',
        probability: 0.02,
        imageUrl: '',
        value: 200.0,
        status: 1,
        blindBoxId: 2,
        blindBox: this.blindBoxes[1],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      }
    ];

    this.nextBlindBoxId = 4;
    this.nextPrizeId = 7;

    await this.saveBlindBoxData();
    console.log('✅ 创建初始盲盒数据完成');
  }

  /**
   * 保存盲盒数据到文件
   */
  private async saveBlindBoxData() {
    const data: BlindBoxData = {
      blindBoxes: this.blindBoxes,
      prizes: this.prizes,
      nextBlindBoxId: this.nextBlindBoxId,
      nextPrizeId: this.nextPrizeId,
      lastUpdate: new Date().toISOString()
    };
    
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * 获取所有盲盒
   */
  async getAllBlindBoxes(search?: string): Promise<BlindBox[]> {
    let result = [...this.blindBoxes];
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(box => 
        box.name.toLowerCase().includes(searchLower) ||
        (box.description && box.description.toLowerCase().includes(searchLower))
      );
    }
    
    return result;
  }

  /**
   * 根据ID获取盲盒
   */
  async getBlindBoxById(id: number): Promise<BlindBox | null> {
    return this.blindBoxes.find(box => box.id === id) || null;
  }

  /**
   * 创建新盲盒
   */
  async createBlindBox(blindBoxData: BlindBoxDto): Promise<BlindBox> {
    const now = new Date();
    const newBlindBox: BlindBox = {
      id: this.nextBlindBoxId++,
      name: blindBoxData.name,
      description: blindBoxData.description,
      price: blindBoxData.price,
      imageUrl: blindBoxData.imageUrl,
      stock: blindBoxData.stock || 0,
      status: 1,
      prizes: [],
      createdAt: now,
      updatedAt: now
    };

    this.blindBoxes.push(newBlindBox);
    await this.saveBlindBoxData();
    
    console.log(`✅ 创建新盲盒: ${newBlindBox.name} (ID: ${newBlindBox.id})`);
    return newBlindBox;
  }

  /**
   * 更新盲盒
   */
  async updateBlindBox(id: number, blindBoxData: BlindBoxDto): Promise<BlindBox | null> {
    const index = this.blindBoxes.findIndex(box => box.id === id);
    if (index === -1) {
      return null;
    }

    const updatedBlindBox: BlindBox = {
      ...this.blindBoxes[index],
      name: blindBoxData.name,
      description: blindBoxData.description,
      price: blindBoxData.price,
      imageUrl: blindBoxData.imageUrl,
      stock: blindBoxData.stock || 0,
      updatedAt: new Date()
    };

    this.blindBoxes[index] = updatedBlindBox;
    await this.saveBlindBoxData();
    
    console.log(`✅ 更新盲盒: ${updatedBlindBox.name} (ID: ${id})`);
    return updatedBlindBox;
  }

  /**
   * 删除盲盒
   */
  async deleteBlindBox(id: number): Promise<boolean> {
    const index = this.blindBoxes.findIndex(box => box.id === id);
    if (index === -1) {
      return false;
    }

    // 删除相关奖品
    this.prizes = this.prizes.filter(prize => prize.blindBoxId !== id);
    
    // 删除盲盒
    this.blindBoxes.splice(index, 1);
    await this.saveBlindBoxData();
    
    console.log(`✅ 删除盲盒: ID ${id}`);
    return true;
  }

  /**
   * 获取盲盒的奖品列表
   */
  async getBlindBoxPrizes(blindBoxId: number): Promise<Prize[]> {
    return this.prizes.filter(prize => prize.blindBoxId === blindBoxId);
  }

  /**
   * 创建新奖品
   */
  async createPrize(prizeData: PrizeDto): Promise<Prize | null> {
    // 检查盲盒是否存在
    const blindBox = await this.getBlindBoxById(prizeData.blindBoxId);
    if (!blindBox) {
      return null;
    }

    const now = new Date();
    const newPrize: Prize = {
      id: this.nextPrizeId++,
      name: prizeData.name,
      description: prizeData.description,
      probability: prizeData.probability,
      imageUrl: prizeData.imageUrl,
      value: prizeData.value,
      status: 1,
      blindBoxId: prizeData.blindBoxId,
      blindBox: blindBox,
      createdAt: now,
      updatedAt: now
    };

    this.prizes.push(newPrize);
    await this.saveBlindBoxData();
    
    console.log(`✅ 创建新奖品: ${newPrize.name} (ID: ${newPrize.id})`);
    return newPrize;
  }

  /**
   * 更新奖品
   */
  async updatePrize(id: number, prizeData: PrizeDto): Promise<Prize | null> {
    const index = this.prizes.findIndex(prize => prize.id === id);
    if (index === -1) {
      return null;
    }

    // 检查盲盒是否存在
    const blindBox = await this.getBlindBoxById(prizeData.blindBoxId);
    if (!blindBox) {
      return null;
    }

    const updatedPrize: Prize = {
      ...this.prizes[index],
      name: prizeData.name,
      description: prizeData.description,
      probability: prizeData.probability,
      imageUrl: prizeData.imageUrl,
      value: prizeData.value,
      blindBoxId: prizeData.blindBoxId,
      blindBox: blindBox,
      updatedAt: new Date()
    };

    this.prizes[index] = updatedPrize;
    await this.saveBlindBoxData();
    
    console.log(`✅ 更新奖品: ${updatedPrize.name} (ID: ${id})`);
    return updatedPrize;
  }

  /**
   * 删除奖品
   */
  async deletePrize(id: number): Promise<boolean> {
    const index = this.prizes.findIndex(prize => prize.id === id);
    if (index === -1) {
      return false;
    }

    this.prizes.splice(index, 1);
    await this.saveBlindBoxData();
    
    console.log(`✅ 删除奖品: ID ${id}`);
    return true;
  }

  /**
   * 获取统计数据
   */
  async getStats() {
    const totalBlindBoxes = this.blindBoxes.length;
    const totalPrizes = this.prizes.length;
    const totalRevenue = this.blindBoxes.reduce((sum, box) => sum + (box.price * (100 - box.stock)), 0);
    
    return {
      totalBlindBoxes,
      totalPrizes,
      totalUsers: 3, // 这里可以从用户服务获取
      totalOrders: Math.floor(totalRevenue / 30), // 估算订单数
      totalRevenue: Number(totalRevenue.toFixed(2))
    };
  }
}
