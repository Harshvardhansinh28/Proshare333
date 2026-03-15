import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import Stripe from 'stripe'

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe | null

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY')
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
      })
    } else {
      this.stripe = null
    }
  }

  private requireStripe(): Stripe {
    if (!this.stripe) throw new Error('STRIPE_SECRET_KEY is not configured')
    return this.stripe
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
    const platformFeeCents = Math.floor(amount * 0.05)
    const sellerAmountCents = amount - platformFeeCents

    const stripe = this.requireStripe()
    const paymentIntent = await stripe.paymentIntents.create({
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
        platformFeeCents,
        sellerAmountCents,
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

    const stripe = this.requireStripe()
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
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

      const order = await this.prisma.order.findFirst({
        where: { stripePaymentIntentId: paymentIntentId, status: 'PENDING' },
        include: { project: true },
      })
      if (order) {
        const sellerId = order.project.ownerId
        let wallet = await this.prisma.wallet.findUnique({
          where: { userId: sellerId },
        })
        if (!wallet) {
          wallet = await this.prisma.wallet.create({
            data: { userId: sellerId, balanceCents: 0, currency: order.currency },
          })
        }
        const tx = await this.prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amountCents: order.sellerAmountCents,
            type: 'SALE_CREDIT',
            orderId: order.id,
            metadata: { projectId: order.projectId, buyerId: order.buyerId },
          },
        })
        await this.prisma.wallet.update({
          where: { id: wallet.id },
          data: { balanceCents: { increment: order.sellerAmountCents } },
        })
        await this.prisma.projectCredential.create({
          data: {
            projectId: order.projectId,
            userId: order.buyerId,
            orderId: order.id,
            accessToken: `ps_${order.id}_${Date.now()}`,
          },
        })
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED', walletCreditId: tx.id },
        })
      }
    }

    return { received: true }
  }

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId, balanceCents: 0, currency: 'usd' },
        include: { transactions: true },
      })
    }
    return wallet
  }

  async getMyCredentials(userId: string) {
    return this.prisma.projectCredential.findMany({
      where: { userId },
      include: {
        project: { select: { id: true, title: true, slug: true } },
      },
    })
  }

  async requestWithdrawal(userId: string, amountCents: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    })
    if (!wallet || wallet.balanceCents < amountCents) {
      throw new BadRequestException('Insufficient balance')
    }
    const w = await this.prisma.withdrawal.create({
      data: { userId, amountCents, status: 'PENDING' },
    })
    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balanceCents: { decrement: amountCents } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amountCents: -amountCents,
          type: 'WITHDRAWAL',
          withdrawalId: w.id,
        },
      }),
    ])
    return w
  }
}

