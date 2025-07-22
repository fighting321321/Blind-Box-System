import { Provide, Init, Inject } from '@midwayjs/core';
import { promises as fs } from 'fs';
import { join } from 'path';
import { BlindBox } from '../entity/blind-box.entity';
import { Prize, PrizeRarity } from '../entity/prize.entity';
import { Order } from '../entity/order.entity';
import { SqliteUserService } from './sqlite-user.service';
import { OrderService } from './order.service';
import { UserPrizeService } from './user-prize.service';
import { SqliteUserPrizeService } from './sqlite-user-prize.service';

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

  @Inject()
  userService: SqliteUserService;

  @Inject()
  orderService: OrderService;

  @Inject()
  userPrizeService: UserPrizeService;

  @Inject()
  sqliteUserPrizeService: SqliteUserPrizeService;

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
        sales: 0,
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
        sales: 0,
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
        sales: 0,
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
    // 重新加载最新的盲盒数据，确保数据是最新的
    await this.loadBlindBoxData();

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
      sales: 0,
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
    // 使用OrderService获取订单数据
    return await this.orderService.getAllOrders();
  }  /**
   * 根据ID获取订单
   */
  async getOrderById(id: string): Promise<Order | null> {
    // 使用OrderService获取订单数据
    return await this.orderService.getOrderById(id);
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id: string, status: string): Promise<boolean> {
    // 使用OrderService更新订单状态
    return await this.orderService.updateOrderStatus(id, status);
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
    // 重新加载最新的盲盒数据，确保统计信息是最新的
    await this.loadBlindBoxData();

    // 实时从数据库查询盲盒数量
    const totalBlindBoxes = this.blindBoxes.length;

    // 实时从数据库查询奖品数量
    const totalPrizes = this.prizes.length;

    // 使用OrderService获取订单统计信息
    const orderStats = await this.orderService.getOrderStats();

    // 实时从数据库获取用户数量（排除管理员）
    const allUsers = await this.userService.getAllUsers();
    const totalUsers = allUsers.filter(user => user.role !== 'admin').length;

    return {
      totalBlindBoxes,
      totalPrizes,
      totalUsers,
      totalOrders: orderStats.totalOrders,
      completedOrders: orderStats.completedOrders,
      pendingOrders: orderStats.pendingOrders,
      totalRevenue: orderStats.totalRevenue
    };
  }  /**
   * 购买盲盒 - 支持并发安全
   */
  async purchaseBlindBox(userId: number, blindBoxId: number, quantity: number = 1): Promise<{
    success: boolean;
    message: string;
    order?: Order;
    prizes?: any[];
  }> {
    try {
      // 获取用户信息
      const user = await this.userService.getUserById(userId);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }

      // 获取盲盒信息
      const blindBox = await this.getBlindBoxById(blindBoxId);
      if (!blindBox) {
        return { success: false, message: '盲盒不存在' };
      }

      // 检查盲盒状态
      if (blindBox.status !== 1) {
        return { success: false, message: '盲盒暂时不可购买' };
      }

      // 检查库存
      if (blindBox.stock < quantity) {
        return { success: false, message: `库存不足，仅剩 ${blindBox.stock} 个` };
      }

      // 计算总金额
      const totalAmount = blindBox.price * quantity;

      // 检查用户余额
      if (user.balance < totalAmount) {
        return {
          success: false,
          message: `余额不足，需要 ¥${totalAmount.toFixed(2)}，当前余额 ¥${user.balance.toFixed(2)}`
        };
      }

      // 原子性操作：扣减库存和余额，创建订单
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 扣减盲盒库存并增加销售数量
      blindBox.stock -= quantity;
      blindBox.sales = (blindBox.sales || 0) + quantity; // 增加销售数量
      blindBox.updatedAt = new Date();

      // 扣减用户余额
      const updatedUser = await this.userService.updateUserBalance(userId, -totalAmount);
      if (!updatedUser) {
        return { success: false, message: '余额扣减失败' };
      }

      // 创建订单
      const order: Order = {
        id: orderId,
        userId: userId,
        username: user.username,
        blindBoxId: blindBoxId,
        blindBoxName: blindBox.name,
        quantity: quantity,
        totalAmount: totalAmount,
        status: 'completed', // 立即完成订单
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 使用OrderService创建订单
      const createdOrder = await this.orderService.createOrder(order);

      // 抽取奖品
      const drawnPrizes = [];
      for (let i = 0; i < quantity; i++) {
        const prize = await this.drawPrizeFromBlindBox(blindBoxId);
        if (prize) {
          // 为用户添加奖品记录到原有服务
          const userPrize = await this.userPrizeService.addUserPrize(
            {
              userId: userId,
              prizeId: prize.id,
              blindBoxId: blindBoxId,
              orderId: orderId
            },
            prize,
            blindBox
          );

          // 同时添加到新的 SQLite 用户奖品数据库
          try {
            await this.sqliteUserPrizeService.addUserPrize(
              {
                userId: userId,
                prizeId: prize.id,
                blindBoxId: blindBoxId,
                orderId: orderId
              },
              {
                name: prize.name,
                description: prize.description,
                imageUrl: prize.imageUrl || '',
                rarity: prize.rarity || 'common', // 如果没有稀有度，默认为普通
                blindBoxName: blindBox.name
              }
            );
            console.log(`🔄 奖品已同步到 SQLite 数据库: ${prize.name} (稀有度: ${prize.rarity || 'common'})`);
          } catch (error) {
            console.error('同步奖品到 SQLite 数据库失败:', error);
          }

          drawnPrizes.push(userPrize);
        }
      }

      // 保存盲盒数据（库存更新）
      await this.saveBlindBoxData();

      return {
        success: true,
        message: '购买成功！',
        order: createdOrder,
        prizes: drawnPrizes // 返回抽到的奖品
      };

    } catch (error) {
      console.error('购买失败:', error);
      return { success: false, message: '购买失败，请重试' };
    }
  }

  /**
   * 从指定盲盒中抽取奖品
   */
  async drawPrizeFromBlindBox(blindBoxId: number): Promise<Prize | null> {
    try {
      // 获取该盲盒的所有奖品
      const blindBoxPrizes = this.prizes.filter(prize => prize.blindBoxId === blindBoxId);

      if (blindBoxPrizes.length === 0) {
        console.warn(`⚠️ 盲盒 ${blindBoxId} 没有配置奖品`);
        return null;
      }

      // 根据概率抽取奖品
      const random = Math.random();
      let cumulativeProbability = 0;

      for (const prize of blindBoxPrizes) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
          console.log(`🎁 抽中奖品: ${prize.name} (概率: ${(prize.probability * 100).toFixed(1)}%)`);
          return prize;
        }
      }

      // 如果没有抽中任何奖品，返回第一个（兜底）
      console.log(`🎁 兜底奖品: ${blindBoxPrizes[0].name}`);
      return blindBoxPrizes[0];
    } catch (error) {
      console.error('抽奖失败:', error);
      return null;
    }
  }
}
