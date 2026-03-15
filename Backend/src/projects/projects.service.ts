import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { createSlug } from '../shared/slug.util'
import { StorageService } from '../storage/storage.service'
import { UploadAssetDto } from './dto/upload-asset.dto'

@Injectable()
export class ProjectsService {

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async createProject(ownerId: string, data: CreateProjectDto) {
    const slugBase = createSlug(data.title)
    // naive slug; for production you may want to ensure uniqueness with retries
    const slug = `${slugBase}-${Date.now().toString(36)}`

    return this.prisma.project.create({
      data: {
        slug,
        title: data.title,
        description: data.description,
        priceInCents: data.priceInCents ?? null,
        category: data.category,
        tags: data.tags ?? [],
        monetizationType: data.monetizationType ?? null,
        repoUrl: data.repoUrl,
        demoUrl: data.demoUrl,
        isPublic: data.isPublic ?? true,
        isProduct: data.isProduct ?? false,
        opportunities: data.opportunities ?? [],
        status: 'DRAFT',
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })
  }

  async getProjects(params?: { search?: string; category?: string; ownerId?: string }) {
    const { search, category, ownerId } = params || {}
    return this.prisma.project.findMany({
      where: {
        isPublic: true,
        status: 'PUBLISHED',
        ...(category && { category }),
        ...(ownerId && { ownerId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        rating: true,
      },
    })
  }

  async getProjectBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        rating: true,
      },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return project
  }

  async attachAssetToProject(
    slug: string,
    ownerId: string,
    file: { buffer: Buffer; mimetype: string },
    meta: UploadAssetDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    if (project.ownerId !== ownerId) {
      throw new ForbiddenException('Not project owner')
    }

    const key = `projects/${project.id}/${meta.fileName}`
    const url = await this.storage.uploadObject({
      key,
      body: file.buffer,
      contentType: meta.contentType,
    })

    return this.prisma.project.update({
      where: { id: project.id },
      data: {
        assetKey: key,
        thumbnailUrl: project.thumbnailUrl ?? url,
      },
    })
  }

  async publish(slug: string, ownerId: string) {
    const project = await this.prisma.project.findUnique({ where: { slug } })
    if (!project) throw new NotFoundException('Project not found')
    if (project.ownerId !== ownerId) throw new ForbiddenException('Not project owner')
    return this.prisma.project.update({
      where: { id: project.id },
      data: { status: 'PUBLISHED' },
    })
  }
}
