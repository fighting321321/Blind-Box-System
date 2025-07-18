import { Controller, Post, Get, Put, Del, Body, Param, Query, Inject, Headers } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, IsEnum } from 'class-validator';
import { SqliteUserService } from '../service/sqlite-user.service';
import { BlindBoxService } from '../service/blindbox.service';
import { PrizeRarity } from '../entity/prize.entity';

/**
 * 盲盒创建/更新验证DTO
 */
class BlindBoxDto {
  @IsNotEmpty({ message: '盲盒名称不能为空' })
  @IsString({ message: '盲盒名称必须是字符串' })
  name: string;

  @IsOptional()
  @IsString({ message: '盲盒描述必须是字符串' })
  description?: string;

  @IsNotEmpty({ message: '价格不能为空' })
  @IsNumber({}, { message: '价格必须是数字' })
  @Min(0, { message: '价格不能为负数' })
  price: number;

  @IsOptional()
  @IsString({ message: '图片URL必须是字符串' })
  imageUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: '库存必须是数字' })
  @Min(0, { message: '库存不能为负数' })
  stock?: number;
}

/**
 * 奖品创建/更新验证DTO
 */
class PrizeDto {
  @IsNotEmpty({ message: '奖品名称不能为空' })
  @IsString({ message: '奖品名称必须是字符串' })
  name: string;

  @IsOptional()
  @IsString({ message: '奖品描述必须是字符串' })
  description?: string;

  @IsNotEmpty({ message: '中奖概率不能为空' })
  @IsNumber({}, { message: '中奖概率必须是数字' })
  @Min(0, { message: '中奖概率不能为负数' })
  probability: number;

  @IsOptional()
  @IsString({ message: '图片URL必须是字符串' })
  imageUrl?: string;

  @IsOptional()
  @IsEnum(PrizeRarity, { message: '奖品稀有度必须是有效的稀有度值' })
  rarity?: PrizeRarity;

  @IsNotEmpty({ message: '盲盒ID不能为空' })
  @IsNumber({}, { message: '盲盒ID必须是数字' })
  blindBoxId: number;
}

/**
 * 管理员控制器
 * 负责处理管理员专用的盲盒和奖品管理功能
 */
@Controller('/api/admin')
export class AdminController {

  @Inject()
  userService: SqliteUserService;

  @Inject()
  blindBoxService: BlindBoxService;

  /**
   * 验证管理员权限的中间件方法
   */
  private async verifyAdmin(authorization: string) {
    if (!authorization) {
      throw new Error('请提供访问令牌');
    }

    const token = authorization.replace('Bearer ', '');
    if (!token) {
      throw new Error('无效的访问令牌格式');
    }

    const user = await this.userService.verifyToken(token);
    if (!user) {
      throw new Error('访问令牌无效或已过期');
    }

    if (user.role !== 'admin') {
      throw new Error('权限不足，需要管理员权限');
    }

    return user;
  }

  /**
   * 获取所有盲盒列表
   * GET /api/admin/blindboxes
   */
  @Get('/blindboxes')
  async getBlindBoxes(@Headers('authorization') authorization: string, @Query('search') search?: string) {
    try {
      await this.verifyAdmin(authorization);
      
      const blindBoxes = await this.blindBoxService.getAllBlindBoxes(search);

      return {
        success: true,
        message: '获取盲盒列表成功',
        data: blindBoxes
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取盲盒列表失败',
        data: null
      };
    }
  }

  /**
   * 创建新盲盒
   * POST /api/admin/blindboxes
   */
  @Post('/blindboxes')
  @Validate()
  async createBlindBox(@Headers('authorization') authorization: string, @Body() blindBoxData: BlindBoxDto) {
    try {
      await this.verifyAdmin(authorization);
      
      const newBlindBox = await this.blindBoxService.createBlindBox(blindBoxData);

      return {
        success: true,
        message: '创建盲盒成功',
        data: newBlindBox
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '创建盲盒失败',
        data: null
      };
    }
  }

  /**
   * 更新盲盒信息
   * PUT /api/admin/blindboxes/:id
   */
  @Put('/blindboxes/:id')
  @Validate()
  async updateBlindBox(@Headers('authorization') authorization: string, @Param('id') id: string, @Body() blindBoxData: BlindBoxDto) {
    try {
      await this.verifyAdmin(authorization);
      
      const updatedBlindBox = await this.blindBoxService.updateBlindBox(parseInt(id), blindBoxData);
      
      if (!updatedBlindBox) {
        return {
          success: false,
          message: '盲盒不存在',
          data: null
        };
      }

      return {
        success: true,
        message: '更新盲盒成功',
        data: updatedBlindBox
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新盲盒失败',
        data: null
      };
    }
  }

  /**
   * 删除盲盒
   * DELETE /api/admin/blindboxes/:id
   */
  @Del('/blindboxes/:id')
  async deleteBlindBox(@Headers('authorization') authorization: string, @Param('id') id: string) {
    try {
      await this.verifyAdmin(authorization);
      
      const success = await this.blindBoxService.deleteBlindBox(parseInt(id));
      
      if (!success) {
        return {
          success: false,
          message: '盲盒不存在',
          data: null
        };
      }

      return {
        success: true,
        message: '删除盲盒成功',
        data: null
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '删除盲盒失败',
        data: null
      };
    }
  }

  /**
   * 获取盲盒的奖品列表
   * GET /api/admin/blindboxes/:id/prizes
   */
  @Get('/blindboxes/:id/prizes')
  async getBlindBoxPrizes(@Headers('authorization') authorization: string, @Param('id') id: string) {
    try {
      await this.verifyAdmin(authorization);
      
      const prizes = await this.blindBoxService.getBlindBoxPrizes(parseInt(id));

      return {
        success: true,
        message: '获取奖品列表成功',
        data: prizes
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取奖品列表失败',
        data: null
      };
    }
  }

  /**
   * 为盲盒添加奖品
   * POST /api/admin/prizes
   */
  @Post('/prizes')
  @Validate()
  async createPrize(@Headers('authorization') authorization: string, @Body() prizeData: PrizeDto) {
    try {
      await this.verifyAdmin(authorization);
      
      const newPrize = await this.blindBoxService.createPrize(prizeData);
      
      if (!newPrize) {
        return {
          success: false,
          message: '盲盒不存在',
          data: null
        };
      }

      return {
        success: true,
        message: '创建奖品成功',
        data: newPrize
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '创建奖品失败',
        data: null
      };
    }
  }

  /**
   * 更新奖品信息
   * PUT /api/admin/prizes/:id
   */
  @Put('/prizes/:id')
  @Validate()
  async updatePrize(@Headers('authorization') authorization: string, @Param('id') id: string, @Body() prizeData: PrizeDto) {
    try {
      await this.verifyAdmin(authorization);
      
      const updatedPrize = await this.blindBoxService.updatePrize(parseInt(id), prizeData);
      
      if (!updatedPrize) {
        return {
          success: false,
          message: '奖品不存在',
          data: null
        };
      }

      return {
        success: true,
        message: '更新奖品成功',
        data: updatedPrize
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新奖品失败',
        data: null
      };
    }
  }

  /**
   * 删除奖品
   * DELETE /api/admin/prizes/:id
   */
  @Del('/prizes/:id')
  async deletePrize(@Headers('authorization') authorization: string, @Param('id') id: string) {
    try {
      await this.verifyAdmin(authorization);
      
      const success = await this.blindBoxService.deletePrize(parseInt(id));
      
      if (!success) {
        return {
          success: false,
          message: '奖品不存在',
          data: null
        };
      }

      return {
        success: true,
        message: '删除奖品成功',
        data: null
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '删除奖品失败',
        data: null
      };
    }
  }

  /**
   * 获取系统统计信息
   * GET /api/admin/stats
   */
  @Get('/stats')
  async getStats(@Headers('authorization') authorization: string) {
    try {
      await this.verifyAdmin(authorization);
      
      const stats = await this.blindBoxService.getStats();

      return {
        success: true,
        message: '获取统计信息成功',
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取统计信息失败',
        data: null
      };
    }
  }

  /**
   * 获取用户列表
   * GET /api/admin/users
   */
  @Get('/users')
  async getUsers(@Headers('authorization') authorization: string, @Query('search') search?: string) {
    try {
      await this.verifyAdmin(authorization);
      
      const users = await this.userService.getAllUsers(search);

      return {
        success: true,
        message: '获取用户列表成功',
        data: users
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取用户列表失败',
        data: null
      };
    }
  }

  /**
   * 更新用户状态
   * PUT /api/admin/users/:id/status
   */
  @Put('/users/:id/status')
  async updateUserStatus(
    @Headers('authorization') authorization: string, 
    @Param('id') id: string, 
    @Body() body: { status: number }
  ) {
    try {
      await this.verifyAdmin(authorization);
      
      const success = await this.userService.updateUserStatus(parseInt(id), body.status);
      
      if (!success) {
        return {
          success: false,
          message: '用户不存在',
          data: null
        };
      }

      return {
        success: true,
        message: '更新用户状态成功',
        data: null
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新用户状态失败',
        data: null
      };
    }
  }

  /**
   * 获取所有订单
   */
  @Get('/orders')
  async getOrders(@Headers('authorization') token: string) {
    try {
      // 验证管理员权限
      const isAdmin = await this.userService.verifyAdmin(token);
      if (!isAdmin) {
        return { success: false, message: '无权限访问' };
      }

      const orders = await this.blindBoxService.getAllOrders();
      return { success: true, data: orders };
    } catch (error) {
      console.error('获取订单列表失败:', error);
      return { success: false, message: '获取订单列表失败' };
    }
  }

  /**
   * 根据ID获取订单详情
   */
  @Get('/orders/:id')
  async getOrderById(@Param('id') id: string, @Headers('authorization') token: string) {
    try {
      // 验证管理员权限
      const isAdmin = await this.userService.verifyAdmin(token);
      if (!isAdmin) {
        return { success: false, message: '无权限访问' };
      }

      const order = await this.blindBoxService.getOrderById(id);
      if (!order) {
        return { success: false, message: '订单不存在' };
      }

      return { success: true, data: order };
    } catch (error) {
      console.error('获取订单详情失败:', error);
      return { success: false, message: '获取订单详情失败' };
    }
  }

  /**
   * 更新订单状态
   */
  @Put('/orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Headers('authorization') token: string
  ) {
    try {
      // 验证管理员权限
      const isAdmin = await this.userService.verifyAdmin(token);
      if (!isAdmin) {
        return { success: false, message: '无权限访问' };
      }

      const result = await this.blindBoxService.updateOrderStatus(id, body.status);
      if (!result) {
        return { success: false, message: '更新订单状态失败' };
      }

      return { success: true, message: '订单状态更新成功' };
    } catch (error) {
      console.error('更新订单状态失败:', error);
      return { success: false, message: '更新订单状态失败' };
    }
  }
}
