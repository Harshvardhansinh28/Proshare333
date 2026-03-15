import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async likeProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) throw new NotFoundException('Project not found')
    try {
      return await this.prisma.like.create({
        data: { userId, projectId },
        include: { project: { select: { id: true, title: true, slug: true } } },
      })
    } catch {
      throw new ConflictException('Already liked')
    }
  }

  async unlikeProject(userId: string, projectId: string) {
    await this.prisma.like.deleteMany({ where: { userId, projectId } })
    return { success: true }
  }

  async addComment(userId: string, projectId: string, body: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) throw new NotFoundException('Project not found')
    return this.prisma.comment.create({
      data: { userId, projectId, body },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    })
  }

  async getComments(projectId: string, limit = 50) {
    return this.prisma.comment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    })
  }

  async follow(userId: string, followingId: string) {
    if (userId === followingId) throw new ConflictException('Cannot follow yourself')
    const target = await this.prisma.user.findUnique({ where: { id: followingId } })
    if (!target) throw new NotFoundException('User not found')
    try {
      return await this.prisma.follow.create({
        data: { followerId: userId, followingId },
        include: { following: { select: { id: true, username: true } } },
      })
    } catch {
      throw new ConflictException('Already following')
    }
  }

  async unfollow(userId: string, followingId: string) {
    await this.prisma.follow.deleteMany({ where: { followerId: userId, followingId } })
    return { success: true }
  }

  async createPost(userId: string, content: string, mediaUrls: string[] = []) {
    return this.prisma.post.create({
      data: { userId, content, mediaUrls },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    })
  }

  async getFeed(userId: string, limit = 30) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })
    const followingIds = following.map((f) => f.followingId)
    return this.prisma.post.findMany({
      where: { userId: { in: [...followingIds, userId] } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { 
        user: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } }
      } as any,
    })
  }

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } })
    if (!post) throw new NotFoundException('Post not found')
    try {
      return await (this.prisma as any).like.create({
        data: { userId, postId } as any,
      })
    } catch {
      throw new ConflictException('Already liked')
    }
  }

  async unlikePost(userId: string, postId: string) {
    await (this.prisma as any).like.deleteMany({ where: { userId, postId } as any })
    return { success: true }
  }

  async addPostComment(userId: string, postId: string, body: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } })
    if (!post) throw new NotFoundException('Post not found')
    return (this.prisma as any).comment.create({
      data: { userId, postId, body } as any,
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    })
  }

  async getPostComments(postId: string, limit = 50) {
    return (this.prisma as any).comment.findMany({
      where: { postId } as any,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    })
  }

  async getTrendingProjects(limit = 20) {
    const projects = await this.prisma.project.findMany({
      where: { isPublic: true, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: limit * 2,
      include: {
        owner: { select: { id: true, username: true, avatarUrl: true } },
        rating: true,
        _count: { select: { likes: true, comments: true } },
      },
    })
    const sorted = projects
      .sort((a, b) => (b._count.likes + b._count.comments) - (a._count.likes + a._count.comments))
      .slice(0, limit)
    return sorted
  }

  async createReport(userId: string, targetType: string, targetId: string, reason: string) {
    return (this.prisma as any).report.create({
      data: { reporterId: userId, targetType, targetId, reason },
    })
  }
}
