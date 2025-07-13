import { Inject, Controller, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';

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
}
