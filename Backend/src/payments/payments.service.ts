import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import Stripe from 'stripe'

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY')
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
    })
  }

  async createPaymentIntentForProject(buyerId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project || !project.isPublic || !project.priceInCents) {
      throw new NotFoundException('Project not purchasable')
    }

    if (project.ownerId === buyerId) {
      throw new BadRequestException('Cannot buy your own project')
    }

    const amount = project.priceInCents
    const currency = project.currency

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        projectId,
        buyerId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    const order = await this.prisma.order.create({
      data: {
        buyerId,
        projectId,
        amountInCents: amount,
        currency,
        status: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    }
  }

  async handleStripeWebhook(sig: string | string[] | undefined, rawBody: Buffer) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured')
    }

    let event: Stripe.Event
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        Array.isArray(sig) ? sig[0] : sig || '',
        webhookSecret,
      )
    } catch (err) {
      throw new BadRequestException('Invalid Stripe signature')
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent
      const paymentIntentId = pi.id

      await this.prisma.order.updateMany({
        where: {
          stripePaymentIntentId: paymentIntentId,
          status: 'PENDING',
        },
        data: {
          status: 'COMPLETED',
        },
      })
    }

    return { received: true }
  }
}

