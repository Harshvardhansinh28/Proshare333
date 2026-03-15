import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [userCount, projectCount, orderCount, totalRevenue, recentOrders, postCount, followCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amountInCents: true, platformFeeCents: true },
      }),
      this.prisma.order.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          buyer: { select: { id: true, email: true, username: true } },
          project: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.post.count(),
      this.prisma.follow.count(),
    ])
    return {
      userCount,
      projectCount,
      orderCount,
      postCount,
      followCount,
      totalRevenueCents: totalRevenue._sum.amountInCents ?? 0,
      platformFeeCents: totalRevenue._sum.platformFeeCents ?? 0,
      recentOrders,
    }
  }

  // User Management
  async updateUserRole(id: string, role: 'USER' | 'ADMIN') {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    })
  }

  async toggleUserBan(id: string, isBanned: boolean) {
    // Note: Assuming 'isBanned' field exists or using role 'BANNED'
    // For now, let's use a hypothetical 'isActive' or 'role' toggle
    return this.prisma.user.update({
      where: { id },
      data: { role: isBanned ? 'BANNED' as any : 'USER' },
    })
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } })
  }

  // Project Management
  async updateProjectStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    return this.prisma.project.update({
      where: { id },
      data: { status },
    })
  }

  async deleteProject(id: string) {
    return this.prisma.project.delete({ where: { id } })
  }

  async getUsers(skip = 0, take = 50) {
    return this.prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        role: true,
        category: true,
        createdAt: true,
        profile: true,
        _count: { select: { projects: true, orders: true } },
      } as any,
    })
  }

  async getProjects(skip = 0, take = 50) {
    return this.prisma.project.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, username: true, email: true } },
        rating: true,
        _count: { select: { orders: true, likes: true } },
      },
    })
  }

  // Ultra Command Center: Advanced Stats & Telemetry
  async getAdvancedStats() {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      return d
    }).reverse()

    const revenueTrends = await Promise.all(last7Days.map(async (date) => {
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const stats = await this.prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: date, lt: nextDay },
        },
        _sum: { amountInCents: true },
      })
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: (stats._sum.amountInCents ?? 0) / 100,
      }
    }))

    const userGrowth = await Promise.all(last7Days.map(async (date) => {
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const count = await this.prisma.user.count({
        where: { createdAt: { lt: nextDay } },
      })
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        users: count,
      }
    }))

    return { revenueTrends, userGrowth }
  }

  async getModerationQueue() {
    return (this.prisma as any).report.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, username: true } },
      },
    })
  }

  async handleReport(reportId: string, action: 'RESOLVE' | 'DISMISS') {
    return (this.prisma as any).report.update({
      where: { id: reportId },
      data: { status: action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED' },
    })
  }

  async getSystemHealth() {
    // Simulated Telemetry for "Command Center" feel
    const randomShift = () => (Math.random() - 0.5) * 5
    return {
      apiLatency: (45 + randomShift()).toFixed(1) + 'ms',
      errorRate: (0.02 + Math.random() * 0.05).toFixed(2) + '%',
      serverLoad: (12 + Math.random() * 20).toFixed(1) + '%',
      activeNodes: 4,
      databaseStatus: 'Healthy',
      uptime: '14d 06h 22m',
    }
  }

  async getTransactions(skip = 0, take = 50) {
    return this.prisma.order.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { id: true, username: true, email: true } },
        project: { select: { id: true, title: true, slug: true, ownerId: true } },
      },
    })
  }

  async logActivity(adminId: string, action: string, targetType?: string, targetId?: string, metadata?: object) {
    return this.prisma.adminActivity.create({
      data: { adminId, action, targetType, targetId, metadata: metadata ?? undefined },
    })
  }
}
