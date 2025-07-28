import { Provide, Init } from '@midwayjs/core';
import { promises as fs } from 'fs';
import { join } from 'path';
import { UserPrize, CreateUserPrizeDto } from '../entity/user-prize.entity';

/**
 * 用户奖品查询条件
 */
export interface UserPrizeQuery {
    userId?: number;
    prizeId?: number;
    blindBoxId?: number;
    rarity?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}

/**
 * 奖品详情接口（不包含价值信息）
 */
export interface PrizeDetailsForUser {
    name: string;
    description: string;
    imageUrl?: string;
    rarity: string;
    blindBoxName: string;
}

/**
 * 用户奖品统计信息
 */
export interface UserPrizeStats {
    totalPrizes: number;
    rarityStats: Record<string, number>;
    blindBoxStats: Record<string, number>;
}

/**
 * SQLite数据库用户奖品服务
 * 使用简单的JSON文件模拟SQLite数据库，并创建.db文件
 */
@Provide()
export class SqliteUserPrizeService {

    private dbPath = join(__dirname, '../build/database/user_prizes.db');
    private dataPath = join(__dirname, '../build/database/user_prizes_data.json');
    private userPrizes: UserPrize[] = [];
    private nextId = 1;

    /**
     * 初始化数据库
     */
    @Init()
    async init() {
        try {
            // 确保数据库目录存在
            const dbDir = join(__dirname, '../build/database');
            await fs.mkdir(dbDir, { recursive: true });

            // 创建SQLite数据库文件（空文件，标识数据库存在）
            await this.createSqliteFile();

            // 加载或创建用户奖品数据
            await this.loadUserPrizesData();

            console.log(`✅ 用户奖品SQLite数据库初始化完成`);
            console.log(`📁 数据库文件: ${this.dbPath}`);
            console.log(`🏆 当前奖品数量: ${this.userPrizes.length}`);
        } catch (error) {
            console.error('用户奖品数据库初始化失败:', error);
        }
    }

    /**
     * 创建SQLite数据库文件
     */
    private async createSqliteFile() {
        try {
            // 检查文件是否存在
            await fs.access(this.dbPath);
        } catch {
            // 文件不存在，创建SQLite文件头
            const sqliteHeader = Buffer.from([
                0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
                // SQLite format 3 header (16 bytes)
                ...new Array(84).fill(0) // Rest of the 100 byte header
            ]);

            await fs.writeFile(this.dbPath, sqliteHeader);
            console.log(`✅ 创建用户奖品SQLite数据库文件: ${this.dbPath}`);
        }
    }

    /**
     * 加载用户奖品数据
     */
    private async loadUserPrizesData() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf-8');
            const parsedData = JSON.parse(data);
            this.userPrizes = parsedData.userPrizes || [];
            this.nextId = parsedData.nextId || 1;
        } catch {
            // 文件不存在或读取失败，创建初始数据
            await this.createInitialData();
        }
    }

    /**
     * 创建初始数据
     */
    private async createInitialData() {
        this.userPrizes = [];
        this.nextId = 1;

        await this.saveUserPrizesData();
        console.log('✅ 创建用户奖品初始数据');
    }

    /**
     * 保存用户奖品数据
     */
    private async saveUserPrizesData() {
        const data = {
            userPrizes: this.userPrizes,
            nextId: this.nextId,
            lastUpdate: new Date().toISOString()
        };

        await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    /**
     * 添加用户奖品
     */
    async addUserPrize(createDto: CreateUserPrizeDto, prizeDetails: PrizeDetailsForUser): Promise<UserPrize> {
        const now = new Date().toISOString();

        const userPrize: UserPrize = {
            id: this.nextId.toString(),
            userId: createDto.userId,
            prizeId: createDto.prizeId,
            prizeName: prizeDetails.name,
            prizeDescription: prizeDetails.description,
            prizeImageUrl: prizeDetails.imageUrl,
            rarity: prizeDetails.rarity,
            blindBoxId: createDto.blindBoxId,
            blindBoxName: prizeDetails.blindBoxName,
            orderId: createDto.orderId,
            obtainedAt: now,
            createdAt: now
        };

        this.userPrizes.push(userPrize);
        this.nextId++;

        await this.saveUserPrizesData();
        console.log(`✅ 添加用户奖品: 用户${createDto.userId} 获得 ${prizeDetails.name}`);

        return userPrize;
    }

    /**
     * 根据ID获取用户奖品
     */
    async getUserPrizeById(id: string): Promise<UserPrize | null> {
        return this.userPrizes.find(prize => prize.id === id) || null;
    }

    /**
     * 获取用户的所有奖品
     */
    async getUserPrizes(userId: number): Promise<UserPrize[]> {
        return this.userPrizes.filter(prize => prize.userId === userId);
    }

    /**
     * 根据条件查询用户奖品
     */
    async queryUserPrizes(query: UserPrizeQuery): Promise<{
        prizes: UserPrize[];
        total: number;
        page: number;
        pageSize: number;
    }> {
        let filteredPrizes = [...this.userPrizes];

        // 应用过滤条件
        if (query.userId !== undefined) {
            filteredPrizes = filteredPrizes.filter(prize => prize.userId === query.userId);
        }

        if (query.prizeId !== undefined) {
            filteredPrizes = filteredPrizes.filter(prize => prize.prizeId === query.prizeId);
        }

        if (query.blindBoxId !== undefined) {
            filteredPrizes = filteredPrizes.filter(prize => prize.blindBoxId === query.blindBoxId);
        }

        if (query.rarity) {
            filteredPrizes = filteredPrizes.filter(prize => prize.rarity === query.rarity);
        }

        if (query.startDate) {
            filteredPrizes = filteredPrizes.filter(prize => prize.obtainedAt >= query.startDate);
        }

        if (query.endDate) {
            filteredPrizes = filteredPrizes.filter(prize => prize.obtainedAt <= query.endDate);
        }

        // 按获得时间倒序排列
        filteredPrizes.sort((a, b) => new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime());

        // 分页处理
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedPrizes = filteredPrizes.slice(startIndex, endIndex);

        return {
            prizes: paginatedPrizes,
            total: filteredPrizes.length,
            page,
            pageSize
        };
    }

    /**
     * 获取用户奖品统计信息
     */
    async getUserPrizeStats(userId: number): Promise<UserPrizeStats> {
        const userPrizes = this.userPrizes.filter(prize => prize.userId === userId);

        const stats: UserPrizeStats = {
            totalPrizes: userPrizes.length,
            rarityStats: {},
            blindBoxStats: {}
        };

        // 计算稀有度统计
        userPrizes.forEach(prize => {
            stats.rarityStats[prize.rarity] = (stats.rarityStats[prize.rarity] || 0) + 1;
            stats.blindBoxStats[prize.blindBoxName] = (stats.blindBoxStats[prize.blindBoxName] || 0) + 1;
        });

        return stats;
    }

    /**
     * 获取所有用户奖品统计信息
     */
    async getAllUserPrizeStats(): Promise<UserPrizeStats> {
        const stats: UserPrizeStats = {
            totalPrizes: this.userPrizes.length,
            rarityStats: {},
            blindBoxStats: {}
        };

        // 计算稀有度统计
        this.userPrizes.forEach(prize => {
            stats.rarityStats[prize.rarity] = (stats.rarityStats[prize.rarity] || 0) + 1;
            stats.blindBoxStats[prize.blindBoxName] = (stats.blindBoxStats[prize.blindBoxName] || 0) + 1;
        });

        return stats;
    }

    /**
     * 删除用户奖品
     */
    async deleteUserPrize(id: string): Promise<boolean> {
        const index = this.userPrizes.findIndex(prize => prize.id === id);
        if (index === -1) {
            return false;
        }

        const deletedPrize = this.userPrizes.splice(index, 1)[0];
        await this.saveUserPrizesData();

        console.log(`✅ 删除用户奖品: ${deletedPrize.prizeName} (ID: ${id})`);
        return true;
    }

    /**
     * 根据订单ID删除用户奖品
     */
    async deleteUserPrizesByOrderId(orderId: string): Promise<number> {
        const initialLength = this.userPrizes.length;
        this.userPrizes = this.userPrizes.filter(prize => prize.orderId !== orderId);
        const deletedCount = initialLength - this.userPrizes.length;

        if (deletedCount > 0) {
            await this.saveUserPrizesData();
            console.log(`✅ 删除订单 ${orderId} 相关的 ${deletedCount} 个用户奖品`);
        }

        return deletedCount;
    }

    /**
     * 获取用户在特定盲盒中的奖品
     */
    async getUserPrizesByBlindBox(userId: number, blindBoxId: number): Promise<UserPrize[]> {
        return this.userPrizes.filter(prize =>
            prize.userId === userId && prize.blindBoxId === blindBoxId
        );
    }

    /**
     * 检查用户是否拥有特定奖品
     */
    async hasUserPrize(userId: number, prizeId: number): Promise<boolean> {
        return this.userPrizes.some(prize =>
            prize.userId === userId && prize.prizeId === prizeId
        );
    }

    /**
     * 获取最近获得的奖品
     */
    async getRecentUserPrizes(userId: number, limit: number = 10): Promise<UserPrize[]> {
        return this.userPrizes
            .filter(prize => prize.userId === userId)
            .sort((a, b) => new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime())
            .slice(0, limit);
    }

    /**
     * 获取全局最近获得的奖品
     */
    async getGlobalRecentUserPrizes(limit: number = 20): Promise<UserPrize[]> {
        return this.userPrizes
            .sort((a, b) => new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime())
            .slice(0, limit);
    }

    /**
     * 获取总数
     */
    async getTotalCount(): Promise<number> {
        return this.userPrizes.length;
    }

    /**
     * 清空所有用户奖品数据（谨慎使用）
     */
    async clearAllUserPrizes(): Promise<void> {
        this.userPrizes = [];
        this.nextId = 1;
        await this.saveUserPrizesData();
        console.log('⚠️ 已清空所有用户奖品数据');
    }
}
