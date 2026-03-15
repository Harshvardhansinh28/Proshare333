import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMyTier(@Req() req: any) {
    return this.subscriptionsService.getMyTier(req.user.userId)
  }
}
