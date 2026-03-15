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
exports.DeploymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let DeploymentService = class DeploymentService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async triggerDeploy(userId, projectSlug, provider) {
        const project = await this.prisma.project.findUnique({
            where: { slug: projectSlug },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.ownerId !== userId)
            throw new common_1.ForbiddenException('Not project owner');
        const log = await this.prisma.deploymentLog.create({
            data: {
                projectId: project.id,
                provider,
                status: 'pending',
                metadata: { repoUrl: project.repoUrl, triggeredBy: userId },
            },
        });
        if (provider === 'VERCEL' && this.config.get('VERCEL_TOKEN') && project.repoUrl) {
            try {
                const res = await fetch('https://api.vercel.com/v1/deployments', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.config.get('VERCEL_TOKEN')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: project.slug,
                        project: project.slug,
                        gitSource: { type: 'github', ref: 'main', repoId: project.repoUrl },
                    }),
                });
                const data = (await res.json());
                if (data.id) {
                    await this.prisma.deploymentLog.update({
                        where: { id: log.id },
                        data: { status: 'building', externalId: data.id },
                    });
                    return { ...log, status: 'building', externalId: data.id, url: data.url };
                }
            }
            catch {
                await this.prisma.deploymentLog.update({
                    where: { id: log.id },
                    data: { status: 'failed', metadata: { ...log.metadata, error: 'Vercel API error' } },
                });
            }
        }
        if (provider === 'RAILWAY' && this.config.get('RAILWAY_TOKEN')) {
            await this.prisma.deploymentLog.update({
                where: { id: log.id },
                data: { status: 'pending', metadata: { ...log.metadata, note: 'Railway integration: configure project in dashboard' } },
            });
        }
        return log;
    }
    async getDeployments(projectSlug, userId) {
        const project = await this.prisma.project.findUnique({
            where: { slug: projectSlug },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.ownerId !== userId)
            throw new common_1.ForbiddenException('Not project owner');
        return this.prisma.deploymentLog.findMany({
            where: { projectId: project.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
};
exports.DeploymentService = DeploymentService;
exports.DeploymentService = DeploymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], DeploymentService);
//# sourceMappingURL=deployment.service.js.map