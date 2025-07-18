import { Inject, Controller, Get, Query, Post, Body, Put, Del, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SqliteUserService } from '../service/sqlite-user.service';
import { BlindBoxService } from '../service/blindbox.service';
import { UserLibraryService } from '../service/user-library.service';

/**
 * API控制器
 * 提供通用的API接口
 */
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
}
