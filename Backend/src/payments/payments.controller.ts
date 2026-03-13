import { Body, Controller, Headers, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { JwtGuard } from '../auth/jwt.guard'
import { Request } from 'express'

class CreatePaymentIntentDto {
  projectId: string
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtGuard)
  @Post('intent')
  createIntent(@Body() body: CreatePaymentIntentDto, @Req() req: any) {
    const buyerId = req.user.userId
    return this.paymentsService.createPaymentIntentForProject(
      buyerId,
      body.projectId,
    )
  }

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    const rawBody = req.rawBody as Buffer
    return this.paymentsService.handleStripeWebhook(sig, rawBody)
  }
}

