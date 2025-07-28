import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class RootController {
    @Get('/')
    async redirectToIndex(ctx) {
        ctx.status = 302;
        ctx.redirect('/index.html');
    }
}
