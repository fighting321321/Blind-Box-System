import { Provide, Init, Inject } from '@midwayjs/core';
import { promises as fs } from 'fs';
import { join } from 'path';
import { BlindBox } from '../entity/blind-box.entity';
import { Prize, PrizeRarity } from '../entity/prize.entity';
import { Order } from '../entity/order.entity';
import { SqliteUserService } from './sqlite-user.service';

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
  rarity?: PrizeRarity;
  blindBoxId: number;
}

/**
 * 盲盒数据存储结构
 */
interface BlindBoxData {
  blindBoxes: BlindBox[];
  prizes: Prize[];
  orders: Order[];
  nextBlindBoxId: number;
  nextPrizeId: number;
  nextOrderId: number;
  lastUpdate: string;
}

/**
 * 盲盒服务类
 * 负责处理盲盒和奖品的数据存储操作
 */
@Provide()
export class BlindBoxService {

  @Inject()
  userService: SqliteUserService;

  private dataPath = join(__dirname, '../../database/blindbox_data.json');
  private blindBoxes: BlindBox[] = [];
  private prizes: Prize[] = [];
  private orders: Order[] = [];
  private nextBlindBoxId = 1;
  private nextPrizeId = 1;
  private nextOrderId = 1;

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
      this.orders = parsed.orders || [];
      this.nextBlindBoxId = parsed.nextBlindBoxId || 1;
      this.nextPrizeId = parsed.nextPrizeId || 1;
      this.nextOrderId = parsed.nextOrderId || 1;

      console.log(`✅ 加载盲盒数据: ${this.blindBoxes.length} 个盲盒, ${this.prizes.length} 个奖品, ${this.orders.length} 个订单`);
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
        rarity: PrizeRarity.COMMON,
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
        rarity: PrizeRarity.COMMON,
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
        rarity: PrizeRarity.LEGENDARY,
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
        rarity: PrizeRarity.RARE,
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
        rarity: PrizeRarity.COMMON,
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
        rarity: PrizeRarity.LEGENDARY,
        status: 1,
        blindBoxId: 2,
        blindBox: this.blindBoxes[1],
        createdAt: new Date(now),
        updatedAt: new Date(now)
      }
    ];

    this.nextBlindBoxId = 4;
    this.nextPrizeId = 7;

    // 创建初始订单数据
    await this.createMockOrders();

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
      orders: this.orders,
      nextBlindBoxId: this.nextBlindBoxId,
      nextPrizeId: this.nextPrizeId,
      nextOrderId: this.nextOrderId,
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
   * 创建盲盒
   */
  async createBlindBox(dto: BlindBoxDto): Promise<BlindBox> {
    const now = new Date().toISOString();
    const newBlindBox: BlindBox = {
      id: this.nextBlindBoxId++,
      name: dto.name,
      description: dto.description || '',
      price: dto.price,
      imageUrl: dto.imageUrl || '',
      stock: dto.stock || 0,
      status: 1,
      prizes: [],
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };

    this.blindBoxes.push(newBlindBox);
    await this.saveBlindBoxData();
    return newBlindBox;
  }

  /**
   * 更新盲盒
   */
  async updateBlindBox(id: number, dto: Partial<BlindBoxDto>): Promise<BlindBox | null> {
    const blindBox = await this.getBlindBoxById(id);
    if (!blindBox) {
      return null;
    }

    Object.assign(blindBox, dto);
    blindBox.updatedAt = new Date();

    await this.saveBlindBoxData();
    return blindBox;
  }

  /**
   * 删除盲盒
   */
  async deleteBlindBox(id: number): Promise<boolean> {
    const index = this.blindBoxes.findIndex(box => box.id === id);
    if (index === -1) {
      return false;
    }

    this.blindBoxes.splice(index, 1);
    await this.saveBlindBoxData();
    return true;
  }

  /**
   * 获取所有奖品
   */
  async getAllPrizes(): Promise<Prize[]> {
    return this.prizes;
  }

  /**
   * 根据ID获取奖品
   */
  async getPrizeById(id: number): Promise<Prize | null> {
    return this.prizes.find(prize => prize.id === id) || null;
  }

  /**
   * 创建奖品
   */
  async createPrize(dto: PrizeDto): Promise<Prize> {
    const blindBox = await this.getBlindBoxById(dto.blindBoxId);
    if (!blindBox) {
      throw new Error('盲盒不存在');
    }

    const now = new Date().toISOString();
    const newPrize: Prize = {
      id: this.nextPrizeId++,
      name: dto.name,
      description: dto.description || '',
      probability: dto.probability,
      imageUrl: dto.imageUrl || '',
      rarity: dto.rarity || PrizeRarity.COMMON,
      status: 1,
      blindBoxId: dto.blindBoxId,
      blindBox: blindBox,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };

    this.prizes.push(newPrize);
    await this.saveBlindBoxData();
    return newPrize;
  }

  /**
   * 更新奖品
   */
  async updatePrize(id: number, dto: Partial<PrizeDto>): Promise<Prize | null> {
    const prize = await this.getPrizeById(id);
    if (!prize) {
      return null;
    }

    Object.assign(prize, dto);
    prize.updatedAt = new Date();

    await this.saveBlindBoxData();
    return prize;
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
    return true;
  }

  /**
   * 获取所有订单
   */
  async getAllOrders(): Promise<Order[]> {
    // 构建包含用户信息的订单数据
    const enrichedOrders: Order[] = [];

    for (const order of this.orders) {
      // 获取用户信息
      const allUsers = await this.userService.getAllUsers();
      const user = allUsers.find(u => u.id === order.userId);

      // 获取盲盒信息
      const blindBox = this.blindBoxes.find(b => b.id === order.blindBoxId);

      enrichedOrders.push({
        ...order,
        username: user?.username || '未知用户',
        blindBoxName: blindBox?.name || '未知盲盒'
      });
    }

    return enrichedOrders;
  }

  /**
   * 根据ID获取订单
   */
  async getOrderById(id: string): Promise<Order | null> {
    const order = this.orders.find(order => order.id === id);
    if (!order) {
      return null;
    }

    // 获取用户信息
    const allUsers = await this.userService.getAllUsers();
    const user = allUsers.find(u => u.id === order.userId);

    // 获取盲盒信息
    const blindBox = this.blindBoxes.find(b => b.id === order.blindBoxId);

    return {
      ...order,
      username: user?.username || '未知用户',
      blindBoxName: blindBox?.name || '未知盲盒'
    };
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id: string, status: string): Promise<boolean> {
    const order = this.orders.find(order => order.id === id);
    if (!order) {
      return false;
    }

    order.status = status as 'pending' | 'completed' | 'cancelled';
    order.updatedAt = new Date().toISOString();

    await this.saveBlindBoxData();
    return true;
  }

  /**
   * 创建模拟订单数据
   */
  private async createMockOrders() {
    // 创建一些模拟订单数据
    const mockOrders: Order[] = [
      {
        id: '1',
        userId: 1,
        username: '用户1',
        blindBoxId: 1,
        blindBoxName: '经典盲盒',
        quantity: 1,
        totalAmount: 29.99,
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        userId: 2,
        username: '用户2',
        blindBoxId: 2,
        blindBoxName: '限定盲盒',
        quantity: 2,
        totalAmount: 119.98,
        status: 'pending',
        createdAt: '2024-01-16T14:20:00Z',
        updatedAt: '2024-01-16T14:20:00Z'
      },
      {
        id: '3',
        userId: 3,
        username: '用户3',
        blindBoxId: 1,
        blindBoxName: '经典盲盒',
        quantity: 1,
        totalAmount: 29.99,
        status: 'completed',
        createdAt: '2024-01-17T09:15:00Z',
        updatedAt: '2024-01-17T09:15:00Z'
      }
    ];

    this.orders = mockOrders;
    this.nextOrderId = 4;
    await this.saveBlindBoxData();
  }

  /**
   * 获取盲盒的所有奖品
   */
  async getBlindBoxPrizes(blindBoxId: number): Promise<Prize[]> {
    return this.prizes.filter(prize => prize.blindBoxId === blindBoxId);
  }

  /**
   * 获取统计数据
   */
  async getStats() {
    const totalBlindBoxes = this.blindBoxes.length;
    const totalPrizes = this.prizes.length;

    // 基于订单信息计算总收入
    const totalRevenue = this.orders.reduce((sum, order) => {
      // 只计算已完成的订单
      if (order.status === 'completed') {
        return sum + order.totalAmount;
      }
      return sum;
    }, 0);

    // 获取用户数量（排除管理员）
    const allUsers = await this.userService.getAllUsers();
    const totalUsers = allUsers.filter(user => user.role !== 'admin').length;

    return {
      totalBlindBoxes,
      totalPrizes,
      totalUsers,
      totalOrders: this.orders.length, // 使用实际订单数量
      totalRevenue: Number(totalRevenue.toFixed(2))
    };
  }
}
