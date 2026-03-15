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
exports.RecruiterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RecruiterService = class RecruiterService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchProjects(query, tags, limit = 30) {
        const where = {
            isPublic: true,
            status: 'PUBLISHED',
        };
        if (query?.trim()) {
            where.OR = [
                { title: { contains: query.trim(), mode: 'insensitive' } },
                { description: { contains: query.trim(), mode: 'insensitive' } },
                { category: { contains: query.trim(), mode: 'insensitive' } },
            ];
        }
        if (tags?.length) {
            where.tags = { hasSome: tags };
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
        });
    }
};
exports.RecruiterService = RecruiterService;
exports.RecruiterService = RecruiterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecruiterService);
//# sourceMappingURL=recruiter.service.js.map