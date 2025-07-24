import { Inject, Controller, Post, Body, Get, Del, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { addShowcase, getShowcases, deleteShowcase } from '../service/player-showcase.service';


@Controller('/api/player-showcase')
export class PlayerShowcaseController {
    /**
     * 删除玩家秀展示
     * DELETE /api/player-showcase/:id
     */
    @Del('/:id')
    async removeShowcase(@Param('id') id: string) {
        try {
            const ok = deleteShowcase(Number(id));
            if (ok) {
                return { success: true };
            } else {
                return { success: false, message: '展示不存在或删除失败' };
            }
        } catch (e) {
            return { success: false, message: e.message || '删除异常' };
        }
    }
    @Inject()
    ctx: Context;

    /**
     * 创建玩家秀展示
     * POST /api/player-showcase
     */
    @Post('/')
    async createShowcase(@Body() body: any) {
        const { userId, prizeId, title, description, imageUrl } = body;
        if (!userId || !prizeId) {
            return { success: false, message: 'userId 和 prizeId 必填' };
        }
        const showcase = addShowcase({ userId, prizeId, title, description, imageUrl });
        return { success: true, data: showcase };
    }

    /**
     * 获取所有玩家秀展示
     * GET /api/player-showcase
     */
    @Get('/')
    async getAllShowcases() {
        const showcases = getShowcases();
        return { success: true, data: showcases };
    }
}
