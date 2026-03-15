"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommunityService = class CommunityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async likeProject(userId, projectId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        try {
            return await this.prisma.like.create({
                data: { userId, projectId },
                include: { project: { select: { id: true, title: true, slug: true } } },
            });
        }
        catch {
            throw new common_1.ConflictException('Already liked');
        }
    }
    async unlikeProject(userId, projectId) {
        await this.prisma.like.deleteMany({ where: { userId, projectId } });
        return { success: true };
    }
    async addComment(userId, projectId, body) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return this.prisma.comment.create({
            data: { userId, projectId, body },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
    }
    async getComments(projectId, limit = 50) {
        return this.prisma.comment.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
    }
    async follow(userId, followingId) {
        if (userId === followingId)
            throw new common_1.ConflictException('Cannot follow yourself');
        const target = await this.prisma.user.findUnique({ where: { id: followingId } });
        if (!target)
            throw new common_1.NotFoundException('User not found');
        try {
            return await this.prisma.follow.create({
                data: { followerId: userId, followingId },
                include: { following: { select: { id: true, username: true } } },
            });
        }
        catch {
            throw new common_1.ConflictException('Already following');
        }
    }
    async unfollow(userId, followingId) {
        await this.prisma.follow.deleteMany({ where: { followerId: userId, followingId } });
        return { success: true };
    }
    async createPost(userId, content, mediaUrls = []) {
        return this.prisma.post.create({
            data: { userId, content, mediaUrls },
            include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        });
    }
    async getFeed(userId, limit = 30) {
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);
        return this.prisma.post.findMany({
            where: { userId: { in: [...followingIds, userId] } },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } }
            },
        });
    }
    async likePost(userId, postId) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        try {
            return await this.prisma.like.create({
                data: { userId, postId },
            });
        }
        catch {
            throw new common_1.ConflictException('Already liked');
        }
    }
    async unlikePost(userId, postId) {
        await this.prisma.like.deleteMany({ where: { userId, postId } });
        return { success: true };
    }
    async addPostComment(userId, postId, body) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return this.prisma.comment.create({
            data: { userId, postId, body },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
    }
    async getPostComments(postId, limit = 50) {
        return this.prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
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
        });
        const sorted = projects
            .sort((a, b) => (b._count.likes + b._count.comments) - (a._count.likes + a._count.comments))
            .slice(0, limit);
        return sorted;
    }
    async createReport(userId, targetType, targetId, reason) {
        return this.prisma.report.create({
            data: { reporterId: userId, targetType, targetId, reason },
        });
    }
};
exports.CommunityService = CommunityService;
exports.CommunityService = CommunityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommunityService);
//# sourceMappingURL=community.service.js.map