
import { Inject, Controller, Get, Query, Post, Body, Put, Del, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SqliteUserService } from '../service/sqlite-user.service';
import { BlindBoxService } from '../service/blindbox.service';
import { UserLibraryService } from '../service/user-library.service';
import { UserPrizeService } from '../service/user-prize.service';
import { SqliteUserPrizeService } from '../service/sqlite-user-prize.service';


@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: SqliteUserService;

  @Inject()
  blindBoxService: BlindBoxService;

  @Inject()
  userLibraryService: UserLibraryService;

  @Inject()
  userPrizeService: UserPrizeService;

  @Inject()
  sqliteUserPrizeService: SqliteUserPrizeService;

  /**
   * 用户余额充值
   * POST /api/user/:id/recharge
   * body: { amount: number }
   */
  @Post('/user/:id/recharge')
  async rechargeUserBalance(@Param('id') userId: number, @Body() body: { amount: number }) {
    try {
      const amount = Number(body.amount);
      if (!userId || isNaN(amount) || amount <= 0) {
        return { success: false, message: '充值金额无效' };
      }
      // 充值，直接增加余额
      const updatedUser = await this.userService.updateUserBalance(userId, amount);

      // 创建充值订单
      const orderService = this.blindBoxService.orderService;
      const orderId = `RECHARGE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const rechargeOrder = {
        id: orderId,
        userId: userId,
        username: updatedUser.username,
        blindBoxId: 0,
        blindBoxName: '余额充值',
        quantity: 1,
        totalAmount: amount,
        status: 'completed' as 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        Type: 'Recharge'
      };
      if (orderService && typeof orderService.createOrder === 'function') {
        await orderService.createOrder(rechargeOrder);
      }

      return { success: true, message: '充值成功', data: { balance: updatedUser.balance } };
    } catch (error) {
      return { success: false, message: error.message || '充值失败' };
    }
  }

  /**
   * 获取用户信息接口（向后兼容）
   * GET /api/get_user?uid=1
   */
  @Get('/get_user')
  async getUser(@Query('uid') uid: number) {
    try {
      const user = await this.userService.getUserById(uid);
      if (!user) {
        return { success: false, message: '用户不存在', data: null };
      }
      return { success: true, message: 'OK', data: user };
    } catch (error) {
      return { success: false, message: error.message || '获取用户失败', data: null };
    }
  }

  /**
   * 获取所有盲盒列表
   * GET /api/blind-boxes
   */
  @Get('/blind-boxes')
  async getAllBlindBoxes() {
    try {
      const blindBoxes = await this.blindBoxService.getAllBlindBoxes();
      return { success: true, message: 'OK', data: blindBoxes };
    } catch (error) {
      return { success: false, message: error.message || '获取盲盒列表失败', data: null };
    }
  }

  /**
   * 获取指定盲盒的详细信息（包含奖品信息）
   * GET /api/blind-boxes/:id
   */
  @Get('/blind-boxes/:id')
  async getBlindBoxById(@Param('id') id: number) {
    try {
      const blindBox = await this.blindBoxService.getBlindBoxById(id);
      if (!blindBox) {
        return { success: false, message: '盲盒不存在', data: null };
      }
      const prizes = await this.blindBoxService.getBlindBoxPrizes(id);
      return {
        success: true,
        message: 'OK',
        data: { ...blindBox, prizes }
      };
    } catch (error) {
      return { success: false, message: error.message || '获取盲盒详情失败', data: null };
    }
  }

  /**
   * 抽取盲盒
   * POST /api/draw-blind-box
   */
  @Post('/draw-blind-box')
  async drawBlindBox(@Body() body: { userId: number; blindBoxId: number }) {
    try {
      const { userId, blindBoxId } = body;

      // 检查用户是否存在
      const user = await this.userService.getUserById(userId);
      if (!user) {
        return { success: false, message: '用户不存在', data: null };
      }

      // 检查盲盒是否存在
      const blindBox = await this.blindBoxService.getBlindBoxById(blindBoxId);
      if (!blindBox) {
        return { success: false, message: '盲盒不存在', data: null };
      }

      // 检查用户余额
      if (user.balance < blindBox.price) {
        return { success: false, message: '余额不足', data: null };
      }

      // 检查库存
      if (blindBox.stock <= 0) {
        return { success: false, message: '盲盒库存不足', data: null };
      }

      // 获取奖品列表进行抽奖
      const prizes = await this.blindBoxService.getBlindBoxPrizes(blindBoxId);
      if (prizes.length === 0) {
        return { success: false, message: '该盲盒暂无奖品', data: null };
      }

      // 模拟抽奖逻辑
      const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
      const random = Math.random() * totalProbability;
      let cumulativeProbability = 0;
      let selectedPrize = null;

      for (const prize of prizes) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
          selectedPrize = prize;
          break;
        }
      }

      if (!selectedPrize) {
        selectedPrize = prizes[0]; // 保底奖品
      }

      // 扣除用户余额
      await this.userService.updateUserBalance(userId, user.balance - blindBox.price);

      // 减少盲盒库存
      await this.blindBoxService.updateBlindBox(blindBoxId, { stock: blindBox.stock - 1 });

      // 创建订单记录
      const order = {
        userId,
        blindBoxId,
        prizeId: selectedPrize.id,
        price: blindBox.price,
        status: 'completed',
        createTime: new Date().toISOString(),
        result: selectedPrize
      };

      return { success: true, message: '抽取成功', data: order };
    } catch (error) {
      return { success: false, message: error.message || '抽取失败', data: null };
    }
  }

  /**
   * 获取用户订单列表
   * GET /api/orders?userId=1
   */
  @Get('/orders')
  async getUserOrders(@Query('userId') userId: number) {
    try {
      const orders = await this.blindBoxService.getAllOrders();
      // 过滤出该用户的订单
      const userOrders = orders.filter(order => order.userId === userId);
      return { success: true, message: 'OK', data: userOrders };
    } catch (error) {
      return { success: false, message: error.message || '获取订单失败', data: null };
    }
  }

  /**
   * 购买盲盒
   * POST /api/purchase
   */
  @Post('/purchase')
  async purchaseBlindBox(@Body() body: { userId: number; blindBoxId: number; quantity?: number }) {
    try {
      if (!body.userId || !body.blindBoxId) {
        return { success: false, message: '参数不完整' };
      }

      const quantity = body.quantity || 1;
      if (quantity < 1 || quantity > 10) {
        return { success: false, message: '购买数量必须在1-10之间' };
      }

      const result = await this.blindBoxService.purchaseBlindBox(body.userId, body.blindBoxId, quantity);

      // 如果购买成功，获取更新后的用户信息
      if (result.success) {
        const updatedUser = await this.userService.getUserById(body.userId);
        return {
          ...result,
          user: updatedUser // 包含更新后的用户信息（包括余额）
        };
      }

      return result;
    } catch (error) {
      console.error('购买接口错误:', error);
      return { success: false, message: error.message || '购买失败，请重试' };
    }
  }

  /**
   * 获取用户余额
   * GET /api/user/:id/balance
   */
  @Get('/user/:id/balance')
  async getUserBalance(@Param('id') userId: number) {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      return { success: true, data: { balance: user.balance } };
    } catch (error) {
      return { success: false, message: error.message || '获取余额失败' };
    }
  }

  /**
   * 添加盲盒到用户库
   * POST /api/library
   */
  @Post('/library')
  async addToLibrary(@Body() body: { userId: number; blindBoxId: number; quantity?: number; note?: string }) {
    try {
      // 获取盲盒信息以获取当前价格
      const blindBox = await this.blindBoxService.getBlindBoxById(body.blindBoxId);
      if (!blindBox) {
        return { success: false, message: '盲盒不存在', data: null };
      }

      const libraryItem = await this.userLibraryService.addToLibrary(body, blindBox.price);
      return { success: true, message: '添加到盲盒库成功', data: libraryItem };
    } catch (error) {
      return { success: false, message: error.message || '添加到盲盒库失败', data: null };
    }
  }

  /**
   * 获取用户的盲盒库
   * GET /api/library?userId=1
   */
  @Get('/library')
  async getUserLibrary(@Query('userId') userId: number) {
    try {
      if (!userId) {
        return { success: false, message: '用户ID不能为空', data: null };
      }

      const libraryItems = await this.userLibraryService.getUserLibrary(userId);

      // 获取盲盒详细信息
      const libraryWithDetails = await Promise.all(
        libraryItems.map(async (item) => {
          const blindBox = await this.blindBoxService.getBlindBoxById(item.blindBoxId);
          return {
            ...item,
            blindBox: blindBox
          };
        })
      );

      return { success: true, message: 'OK', data: libraryWithDetails };
    } catch (error) {
      return { success: false, message: error.message || '获取盲盒库失败', data: null };
    }
  }

  /**
   * 更新盲盒库项目
   * PUT /api/library/:itemId
   */
  @Put('/library/:itemId')
  async updateLibraryItem(@Param('itemId') itemId: number, @Body() body: { quantity?: number; note?: string; isPurchased?: boolean }) {
    try {
      const updatedItem = await this.userLibraryService.updateLibraryItem(itemId, body);
      if (!updatedItem) {
        return { success: false, message: '库项目不存在', data: null };
      }
      return { success: true, message: '更新成功', data: updatedItem };
    } catch (error) {
      return { success: false, message: error.message || '更新失败', data: null };
    }
  }

  /**
   * 从用户库中移除盲盒
   * DELETE /api/library/:itemId
   */
  @Del('/library/:itemId')
  async removeFromLibrary(@Param('itemId') itemId: number, @Query('userId') userId: number) {
    try {
      if (!userId) {
        return { success: false, message: '用户ID不能为空', data: null };
      }

      const success = await this.userLibraryService.removeFromLibrary(itemId, userId);
      if (!success) {
        return { success: false, message: '移除失败，项目不存在', data: null };
      }
      return { success: true, message: '移除成功', data: null };
    } catch (error) {
      return { success: false, message: error.message || '移除失败', data: null };
    }
  }

  /**
   * 获取用户库统计信息
   * GET /api/library/stats?userId=1
   */
  @Get('/library/stats')
  async getUserLibraryStats(@Query('userId') userId: number) {
    try {
      if (!userId) {
        return { success: false, message: '用户ID不能为空', data: null };
      }

      const stats = await this.userLibraryService.getUserLibraryStats(userId);
      return { success: true, message: 'OK', data: stats };
    } catch (error) {
      return { success: false, message: error.message || '获取统计信息失败', data: null };
    }
  }

  /**
   * 获取用户奖品列表
   * GET /api/user/:userId/prizes
   */
  @Get('/user/:userId/prizes')
  async getUserPrizes(@Param('userId') userId: number) {
    try {
      if (!userId) {
        return { success: false, message: '用户ID不能为空', data: null };
      }

      const prizes = await this.userPrizeService.getUserPrizes(userId);
      return { success: true, message: 'OK', data: prizes };
    } catch (error) {
      return { success: false, message: error.message || '获取用户奖品失败', data: null };
    }
  }

  /**
   * 获取用户奖品统计
   * GET /api/user/:userId/prize-stats
   */
  @Get('/user/:userId/prize-stats')
  async getUserPrizeStats(@Param('userId') userId: number) {
    try {
      if (!userId) {
        return { success: false, message: '用户ID不能为空', data: null };
      }

      const stats = await this.userPrizeService.getUserPrizeStats(userId);
      return { success: true, message: 'OK', data: stats };
    } catch (error) {
      return { success: false, message: error.message || '获取奖品统计失败', data: null };
    }
  }

  // ==================== SQLite 用户奖品数据库测试接口 ====================

  /**
   * 获取SQLite用户奖品数据库统计信息
   * GET /api/sqlite/user-prizes/stats
   */
  @Get('/sqlite/user-prizes/stats')
  async getSqliteUserPrizeStats() {
    try {
      const stats = await this.sqliteUserPrizeService.getAllUserPrizeStats();
      return { success: true, message: 'OK', data: stats };
    } catch (error) {
      return { success: false, message: error.message || '获取SQLite用户奖品统计失败', data: null };
    }
  }

  /**
   * 获取SQLite用户奖品列表
   * GET /api/sqlite/user-prizes?userId=1&page=1&pageSize=10
   */
  @Get('/sqlite/user-prizes')
  async getSqliteUserPrizes(
    @Query('userId') userId?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('rarity') rarity?: string
  ) {
    try {
      const query = {
        userId,
        page: page || 1,
        pageSize: pageSize || 20,
        rarity
      };
      const result = await this.sqliteUserPrizeService.queryUserPrizes(query);
      return { success: true, message: 'OK', data: result };
    } catch (error) {
      return { success: false, message: error.message || '获取SQLite用户奖品失败', data: null };
    }
  }

  /**
   * 获取所有奖品列表
   * GET /api/prizes
   */
  @Get('/prizes')
  async getAllPrizes() {
    try {
      // 直接从 blindBoxService 获取所有奖品
      const prizes = await this.blindBoxService.getAllPrizes();
      return { success: true, message: 'OK', data: prizes };
    } catch (error) {
      return { success: false, message: error.message || '获取奖品列表失败', data: null };
    }
  }

  /**
   * 添加测试奖品到SQLite数据库
   * POST /api/sqlite/user-prizes/test
   */
  @Post('/sqlite/user-prizes/test')
  async addTestSqliteUserPrize(@Body() body: any) {
    try {
      const { userId = 1, prizeId = 101, blindBoxId = 1 } = body;

      const createDto = {
        userId,
        prizeId,
        blindBoxId,
        orderId: `test-order-${Date.now()}`
      };

      const prizeDetails = {
        name: '测试奖品',
        description: '这是一个测试奖品',
        imageUrl: 'https://example.com/test-prize.jpg',
        value: 25.50,
        rarity: 'common',
        blindBoxName: '测试盲盒'
      };

      const addedPrize = await this.sqliteUserPrizeService.addUserPrize(createDto, prizeDetails);
      return { success: true, message: '测试奖品添加成功', data: addedPrize };
    } catch (error) {
      return { success: false, message: error.message || '添加测试奖品失败', data: null };
    }
  }

  /**
   * 获取指定用户的SQLite奖品统计
   * GET /api/sqlite/user/:userId/prize-stats
   */
  @Get('/sqlite/user/:userId/prize-stats')
  async getSqliteUserPrizeStatsByUserId(@Param('userId') userId: number) {
    try {
      if (!userId) {
        return { success: false, message: '用户ID不能为空', data: null };
      }

      const stats = await this.sqliteUserPrizeService.getUserPrizeStats(userId);
      return { success: true, message: 'OK', data: stats };
    } catch (error) {
      return { success: false, message: error.message || '获取SQLite用户奖品统计失败', data: null };
    }
  }

  /**
   * 获取最近的SQLite用户奖品
   * GET /api/sqlite/user-prizes/recent?limit=10
   */
  @Get('/sqlite/user-prizes/recent')
  async getRecentSqliteUserPrizes(@Query('limit') limit?: number) {
    try {
      const recentPrizes = await this.sqliteUserPrizeService.getGlobalRecentUserPrizes(limit || 20);
      return { success: true, message: 'OK', data: recentPrizes };
    } catch (error) {
      return { success: false, message: error.message || '获取最近SQLite用户奖品失败', data: null };
    }
  }
}
