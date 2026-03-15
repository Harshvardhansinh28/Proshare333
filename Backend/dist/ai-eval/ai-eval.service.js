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
exports.AiEvalService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const ratings_service_1 = require("../ratings/ratings.service");
const STUB_SCORES = {
    aiScore: 70,
    backendScore: 75,
    frontendScore: 70,
    systemDesignScore: 72,
    complexityNote: 'Analysis pending. Set AI_EVAL_SERVICE_URL to the Python AI service for ML-based scoring.',
    scalabilityNote: 'Re-run evaluation with the Python AI service for detailed notes.',
};
let AiEvalService = class AiEvalService {
    constructor(prisma, config, ratingsService) {
        this.prisma = prisma;
        this.config = config;
        this.ratingsService = ratingsService;
    }
    async evaluateProject(projectSlug, userId) {
        const project = await this.prisma.project.findUnique({
            where: { slug: projectSlug },
            include: { rating: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.ownerId !== userId)
            throw new common_1.ForbiddenException('Not project owner');
        const pythonServiceUrl = this.config.get('AI_EVAL_SERVICE_URL')?.replace(/\/$/, '');
        let aiScore;
        let backendScore;
        let frontendScore;
        let systemDesignScore;
        let complexityNote;
        let scalabilityNote;
        if (pythonServiceUrl) {
            try {
                const res = await fetch(`${pythonServiceUrl}/evaluate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: project.title,
                        description: project.description,
                        repo_url: project.repoUrl ?? undefined,
                        category: project.category ?? undefined,
                        tags: project.tags ?? [],
                    }),
                });
                if (res.ok) {
                    const data = (await res.json());
                    aiScore = data.ai_score != null ? Math.min(100, Math.max(0, data.ai_score)) : undefined;
                    backendScore = data.backend_score != null ? Math.min(100, Math.max(0, data.backend_score)) : undefined;
                    frontendScore = data.frontend_score != null ? Math.min(100, Math.max(0, data.frontend_score)) : undefined;
                    systemDesignScore = data.system_design_score != null ? Math.min(100, Math.max(0, data.system_design_score)) : undefined;
                    complexityNote = data.complexity_note ?? undefined;
                    scalabilityNote = data.scalability_note ?? undefined;
                }
            }
            catch {
            }
        }
        if (aiScore == null) {
            aiScore = STUB_SCORES.aiScore;
            backendScore = STUB_SCORES.backendScore;
            frontendScore = STUB_SCORES.frontendScore;
            systemDesignScore = STUB_SCORES.systemDesignScore;
            complexityNote = STUB_SCORES.complexityNote;
            scalabilityNote = STUB_SCORES.scalabilityNote;
        }
        return this.ratingsService.upsert(projectSlug, userId, false, {
            aiScore,
            backendScore,
            frontendScore,
            systemDesignScore,
            complexityNote,
            scalabilityNote,
        });
    }
};
exports.AiEvalService = AiEvalService;
exports.AiEvalService = AiEvalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        ratings_service_1.RatingsService])
], AiEvalService);
//# sourceMappingURL=ai-eval.service.js.map