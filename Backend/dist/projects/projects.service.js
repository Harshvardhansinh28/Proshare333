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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const slug_util_1 = require("../shared/slug.util");
const storage_service_1 = require("../storage/storage.service");
let ProjectsService = class ProjectsService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async createProject(ownerId, data) {
        const slugBase = (0, slug_util_1.createSlug)(data.title);
        const slug = `${slugBase}-${Date.now().toString(36)}`;
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
        });
    }
    async getProjects(params) {
        const { search, category, ownerId } = params || {};
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
        });
    }
    async getProjectBySlug(slug) {
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
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project;
    }
    async attachAssetToProject(slug, ownerId, file, meta) {
        const project = await this.prisma.project.findUnique({
            where: { slug },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('Not project owner');
        }
        const key = `projects/${project.id}/${meta.fileName}`;
        const url = await this.storage.uploadObject({
            key,
            body: file.buffer,
            contentType: meta.contentType,
        });
        return this.prisma.project.update({
            where: { id: project.id },
            data: {
                assetKey: key,
                thumbnailUrl: project.thumbnailUrl ?? url,
            },
        });
    }
    async publish(slug, ownerId) {
        const project = await this.prisma.project.findUnique({ where: { slug } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.ownerId !== ownerId)
            throw new common_1.ForbiddenException('Not project owner');
        return this.prisma.project.update({
            where: { id: project.id },
            data: { status: 'PUBLISHED' },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map