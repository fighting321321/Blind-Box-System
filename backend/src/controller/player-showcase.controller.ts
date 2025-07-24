import { Inject, Controller, Post, Body, Get } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { addShowcase, getShowcases } from '../service/player-showcase.service';

@Controller('/api/player-showcase')
export class PlayerShowcaseController {
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
