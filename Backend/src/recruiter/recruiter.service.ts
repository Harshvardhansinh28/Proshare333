import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class RecruiterService {
  constructor(private readonly prisma: PrismaService) {}

  async searchProjects(query: string, tags?: string[], limit = 30) {
    const where: any = {
      isPublic: true,
      status: 'PUBLISHED',
    }
    if (query?.trim()) {
      where.OR = [
        { title: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } },
        { category: { contains: query.trim(), mode: 'insensitive' } },
      ]
    }
    if (tags?.length) {
      where.tags = { hasSome: tags }
    }
    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
            profile: { select: { headline: true, skills: true, linkedinUrl: true, githubUrl: true } },
          },
        },
        rating: true,
        _count: { select: { likes: true, comments: true } },
      },
    })
  }
}
