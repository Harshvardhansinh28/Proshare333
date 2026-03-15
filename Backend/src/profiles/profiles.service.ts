import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    })
    if (!profile) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, bio: true, avatarUrl: true, createdAt: true },
      })
      if (!user) throw new NotFoundException('User not found')
      return { user, profile: null }
    }
    return profile
  }

  async upsert(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        headline: dto.headline,
        resumeUrl: dto.resumeUrl,
        githubUrl: dto.githubUrl,
        portfolioUrl: dto.portfolioUrl,
        linkedinUrl: dto.linkedinUrl,
        location: dto.location,
        skills: dto.skills ?? [],
      },
      update: {
        headline: dto.headline,
        resumeUrl: dto.resumeUrl,
        githubUrl: dto.githubUrl,
        portfolioUrl: dto.portfolioUrl,
        linkedinUrl: dto.linkedinUrl,
        location: dto.location,
        skills: dto.skills ?? [],
      },
    })

    if (dto.bio !== undefined || dto.avatarUrl !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          bio: dto.bio,
          avatarUrl: dto.avatarUrl,
        },
      })
    }

    return profile
  }
}
