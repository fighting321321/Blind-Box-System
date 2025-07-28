import { Provide, Init } from '@midwayjs/core';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * 用户盲盒库项目数据结构
 */
export interface UserLibraryItem {
  id: number;
  userId: number;
  blindBoxId: number;
  quantity: number;
  priceAtAdd: number;
  isPurchased: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 添加到库的请求数据结构
 */
export interface AddToLibraryDto {
  userId: number;
  blindBoxId: number;
  quantity?: number;
  note?: string;
}

/**
 * 更新库项目的请求数据结构
 */
export interface UpdateLibraryItemDto {
  quantity?: number;
  note?: string;
  isPurchased?: boolean;
}

/**
 * 用户盲盒库服务
 * 管理用户收藏的盲盒数据
 */
@Provide()
export class UserLibraryService {

  private dbPath = join(__dirname, '../build/database/user_library.db');
  private dataPath = join(__dirname, '../build/database/user_library_data.json');
  private libraryItems: UserLibraryItem[] = [];
  private nextId = 1;

  /**
   * 初始化方法：加载数据并创建数据库文件
   */
  @Init()
  async init() {
    try {
      await this.loadData();
      await this.createDbFile();
      console.log('用户盲盒库数据库初始化完成');
    } catch (error) {
      console.error('用户盲盒库数据库初始化失败:', error);
    }
  }

  /**
   * 加载数据：从JSON文件读取或创建初始数据
   */
  private async loadData() {
    try {
      // 确保目录存在
      const databaseDir = join(__dirname, '../build/database');
      await fs.mkdir(databaseDir, { recursive: true });

      // 尝试读取现有数据
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsed = JSON.parse(data);
      this.libraryItems = parsed.libraryItems || [];
      this.nextId = parsed.nextId || 1;
    } catch (error) {
      // 文件不存在时创建初始数据
      this.libraryItems = [];
      this.nextId = 1;
      await this.saveData();
    }
  }

  /**
   * 保存数据到JSON文件
   */
  private async saveData() {
    const data = {
      libraryItems: this.libraryItems,
      nextId: this.nextId,
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }

  /**
   * 创建.db文件（模拟SQLite数据库）
   */
  private async createDbFile() {
    try {
      await fs.access(this.dbPath);
    } catch {
      // 文件不存在，创建空的.db文件
      await fs.writeFile(this.dbPath, '');
    }
  }

  /**
   * 添加盲盒到用户库
   */
  async addToLibrary(dto: AddToLibraryDto, blindBoxPrice: number): Promise<UserLibraryItem> {
    // 检查是否已经存在相同的库项目
    const existingItem = this.libraryItems.find(
      item => item.userId === dto.userId && item.blindBoxId === dto.blindBoxId
    );

    if (existingItem) {
      // 如果已存在，增加数量
      existingItem.quantity += dto.quantity || 1;
      existingItem.updatedAt = new Date().toISOString();
      await this.saveData();
      return existingItem;
    } else {
      // 创建新的库项目
      const newItem: UserLibraryItem = {
        id: this.nextId++,
        userId: dto.userId,
        blindBoxId: dto.blindBoxId,
        quantity: dto.quantity || 1,
        priceAtAdd: blindBoxPrice,
        isPurchased: false,
        note: dto.note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.libraryItems.push(newItem);
      await this.saveData();
      return newItem;
    }
  }

  /**
   * 获取用户的盲盒库
   */
  async getUserLibrary(userId: number): Promise<UserLibraryItem[]> {
    return this.libraryItems.filter(item => item.userId === userId);
  }

  /**
   * 更新库项目
   */
  async updateLibraryItem(itemId: number, dto: UpdateLibraryItemDto): Promise<UserLibraryItem | null> {
    const item = this.libraryItems.find(item => item.id === itemId);
    if (!item) {
      return null;
    }

    if (dto.quantity !== undefined) {
      item.quantity = dto.quantity;
    }
    if (dto.note !== undefined) {
      item.note = dto.note;
    }
    if (dto.isPurchased !== undefined) {
      item.isPurchased = dto.isPurchased;
    }

    item.updatedAt = new Date().toISOString();
    await this.saveData();
    return item;
  }

  /**
   * 从用户库中移除盲盒
   */
  async removeFromLibrary(itemId: number, userId: number): Promise<boolean> {
    const index = this.libraryItems.findIndex(
      item => item.id === itemId && item.userId === userId
    );

    if (index === -1) {
      return false;
    }

    this.libraryItems.splice(index, 1);
    await this.saveData();
    return true;
  }

  /**
   * 根据盲盒ID和用户ID查找库项目
   */
  async findLibraryItem(userId: number, blindBoxId: number): Promise<UserLibraryItem | null> {
    return this.libraryItems.find(
      item => item.userId === userId && item.blindBoxId === blindBoxId
    ) || null;
  }

  /**
   * 获取用户库统计信息
   */
  async getUserLibraryStats(userId: number): Promise<{
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    purchasedItems: number;
  }> {
    const userItems = this.libraryItems.filter(item => item.userId === userId);

    return {
      totalItems: userItems.length,
      totalQuantity: userItems.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: userItems.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0),
      purchasedItems: userItems.filter(item => item.isPurchased).length
    };
  }

  /**
   * 清空用户的盲盒库
   */
  async clearUserLibrary(userId: number): Promise<boolean> {
    const initialLength = this.libraryItems.length;
    this.libraryItems = this.libraryItems.filter(item => item.userId !== userId);

    if (this.libraryItems.length < initialLength) {
      await this.saveData();
      return true;
    }
    return false;
  }
}
