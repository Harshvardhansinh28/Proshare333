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
exports.RatingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RatingsService = class RatingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsert(projectSlug, userId, isAdmin, dto) {
        const project = await this.prisma.project.findUnique({
            where: { slug: projectSlug },
            include: { rating: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.ownerId !== userId && !isAdmin) {
            throw new common_1.ForbiddenException('Only owner or admin can set rating');
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
        });
    }
    async getByProjectSlug(slug) {
        const project = await this.prisma.project.findUnique({
            where: { slug },
            include: { rating: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project.rating;
    }
};
exports.RatingsService = RatingsService;
exports.RatingsService = RatingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingsService);
//# sourceMappingURL=ratings.service.js.map