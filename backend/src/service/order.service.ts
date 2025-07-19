import { Provide, Init, Inject } from '@midwayjs/core';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Order } from '../entity/order.entity';
import { SqliteUserService } from './sqlite-user.service';

/**
 * 订单数据存储结构
 */
interface OrderData {
    orders: Order[];
    nextOrderId: number;
    lastUpdate: string;
}

/**
 * 订单服务类
 * 负责处理订单的数据存储操作
 */
@Provide()
export class OrderService {

    @Inject()
    userService: SqliteUserService;

    private dataPath = join(__dirname, '../../database/orders_data.json');
    private orders: Order[] = [];
    private nextOrderId = 1;

    /**
     * 初始化订单数据
     */
    @Init()
    async init() {
        try {
            // 确保数据库目录存在
            const dbDir = join(__dirname, '../../database');
            await fs.mkdir(dbDir, { recursive: true });

            // 加载或创建订单数据
            await this.loadOrderData();

            console.log(`✅ 订单数据初始化完成`);
            console.log(`📋 当前订单数量: ${this.orders.length}`);
        } catch (error) {
            console.error('订单数据初始化失败:', error);
        }
    }

    /**
     * 加载订单数据
     */
    private async loadOrderData() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf-8');
            const parsed: OrderData = JSON.parse(data);
            this.orders = parsed.orders || [];
            this.nextOrderId = parsed.nextOrderId || 1;

            console.log(`✅ 加载订单数据: ${this.orders.length} 个订单`);
        } catch (error) {
            // 文件不存在，创建初始数据
            console.log('订单数据文件不存在，创建初始数据...');
            await this.createInitialOrderData();
        }
    }

    /**
     * 创建初始订单数据
     */
    private async createInitialOrderData() {
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
        await this.saveOrderData();
        console.log('✅ 创建初始订单数据完成');
    }

    /**
     * 保存订单数据到文件
     */
    private async saveOrderData() {
        const data: OrderData = {
            orders: this.orders,
            nextOrderId: this.nextOrderId,
            lastUpdate: new Date().toISOString()
        };

        await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    /**
     * 获取所有订单
     */
    async getAllOrders(): Promise<Order[]> {
        // 重新加载最新的订单数据，确保数据是最新的
        await this.loadOrderData();

        // 构建包含用户信息的订单数据
        const enrichedOrders: Order[] = [];

        for (const order of this.orders) {
            // 获取用户信息
            const allUsers = await this.userService.getAllUsers();
            const user = allUsers.find(u => u.id === order.userId);

            enrichedOrders.push({
                ...order,
                username: user?.username || order.username || '未知用户'
            });
        }

        // 按创建时间倒序排序，最新的订单在前面
        return enrichedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

        return {
            ...order,
            username: user?.username || order.username || '未知用户'
        };
    }

    /**
     * 创建订单
     */
    async createOrder(order: Omit<Order, 'id'> & { id?: string }): Promise<Order> {
        const orderId = order.id || `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newOrder: Order = {
            ...order,
            id: orderId,
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || new Date().toISOString()
        };

        // 将新订单添加到数组开头，让最新的订单显示在前面
        this.orders.unshift(newOrder);
        await this.saveOrderData();
        return newOrder;
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

        await this.saveOrderData();
        return true;
    }

    /**
     * 删除订单
     */
    async deleteOrder(id: string): Promise<boolean> {
        const index = this.orders.findIndex(order => order.id === id);
        if (index === -1) {
            return false;
        }

        this.orders.splice(index, 1);
        await this.saveOrderData();
        return true;
    }

    /**
     * 获取订单统计信息
     */
    async getOrderStats() {
        // 重新加载最新的订单数据，确保统计信息是最新的
        await this.loadOrderData();

        // 基于订单信息计算总收入
        const totalRevenue = this.orders.reduce((sum, order) => {
            // 只计算已完成的订单
            if (order.status === 'completed') {
                return sum + order.totalAmount;
            }
            return sum;
        }, 0);

        // 计算不同状态的订单数量
        const completedOrders = this.orders.filter(order => order.status === 'completed').length;
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const cancelledOrders = this.orders.filter(order => order.status === 'cancelled').length;

        return {
            totalOrders: this.orders.length,
            completedOrders,
            pendingOrders,
            cancelledOrders,
            totalRevenue: Number(totalRevenue.toFixed(2))
        };
    }

    /**
     * 根据用户ID获取订单
     */
    async getOrdersByUserId(userId: number): Promise<Order[]> {
        await this.loadOrderData();
        return this.orders.filter(order => order.userId === userId);
    }

    /**
     * 根据盲盒ID获取订单
     */
    async getOrdersByBlindBoxId(blindBoxId: number): Promise<Order[]> {
        await this.loadOrderData();
        return this.orders.filter(order => order.blindBoxId === blindBoxId);
    }
}
