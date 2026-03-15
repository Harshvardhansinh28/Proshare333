import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyTier(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
    return { tier: sub?.tier ?? 'FREE', currentPeriodEnd: sub?.currentPeriodEnd ?? null }
  }

  async hasPro(userId: string): Promise<boolean> {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, tier: 'PRO' },
    })
    return !!sub && (sub.currentPeriodEnd == null || sub.currentPeriodEnd > new Date())
  }
}
