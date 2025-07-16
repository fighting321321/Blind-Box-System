import { Inject, Controller, Get, Query, Post, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { BlindBoxService } from '../service/blindbox.service';

/**
 * API控制器
 * 提供通用的API接口
 */
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  blindBoxService: BlindBoxService;

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
  async getBlindBoxById(@Query('id') id: number) {
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
}
