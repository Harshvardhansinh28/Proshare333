import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpsertRatingDto } from './dto/upsert-rating.dto'

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(projectSlug: string, userId: string, isAdmin: boolean, dto: UpsertRatingDto) {
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
      include: { rating: true },
    })
    if (!project) throw new NotFoundException('Project not found')
    if (project.ownerId !== userId && !isAdmin) {
      throw new ForbiddenException('Only owner or admin can set rating')
    }
    return this.prisma.projectRating.upsert({
      where: { projectId: project.id },
      create: {
        projectId: project.id,
        aiScore: dto.aiScore,
        backendScore: dto.backendScore,
        frontendScore: dto.frontendScore,
        systemDesignScore: dto.systemDesignScore,
        complexityNote: dto.complexityNote,
        scalabilityNote: dto.scalabilityNote,
      },
      update: {
        aiScore: dto.aiScore,
        backendScore: dto.backendScore,
        frontendScore: dto.frontendScore,
        systemDesignScore: dto.systemDesignScore,
        complexityNote: dto.complexityNote,
        scalabilityNote: dto.scalabilityNote,
      },
    })
  }

  async getByProjectSlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: { rating: true },
    })
    if (!project) throw new NotFoundException('Project not found')
    return project.rating
  }
}
