import { Body, Controller, Get, Headers, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { JwtGuard } from '../auth/jwt.guard'
import { Request } from 'express'
import { IsInt, IsString, Min } from 'class-validator'

class CreatePaymentIntentDto {
  @IsString()
  projectId: string
}

class WithdrawDto {
  @IsInt()
  @Min(100)
  amountCents: number
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtGuard)
  @Get('wallet')
  getWallet(@Req() req: any) {
    return this.paymentsService.getWallet(req.user.userId)
  }

  @UseGuards(JwtGuard)
  @Get('credentials')
  getCredentials(@Req() req: any) {
    return this.paymentsService.getMyCredentials(req.user.userId)
  }

  @UseGuards(JwtGuard)
  @Post('withdraw')
  withdraw(@Body() body: WithdrawDto, @Req() req: any) {
    return this.paymentsService.requestWithdrawal(req.user.userId, body.amountCents)
  }

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

