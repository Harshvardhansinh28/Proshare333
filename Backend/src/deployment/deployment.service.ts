import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { DeploymentProvider } from '@prisma/client'

@Injectable()
export class DeploymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async triggerDeploy(
    userId: string,
    projectSlug: string,
    provider: DeploymentProvider,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
    })
    if (!project) throw new NotFoundException('Project not found')
    if (project.ownerId !== userId) throw new ForbiddenException('Not project owner')

    const log = await this.prisma.deploymentLog.create({
      data: {
        projectId: project.id,
        provider,
        status: 'pending',
        metadata: { repoUrl: project.repoUrl, triggeredBy: userId },
      },
    })

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
        })
        const data = (await res.json()) as { id?: string; url?: string }
        if (data.id) {
          await this.prisma.deploymentLog.update({
            where: { id: log.id },
            data: { status: 'building', externalId: data.id },
          })
          return { ...log, status: 'building', externalId: data.id, url: data.url }
        }
      } catch {
        await this.prisma.deploymentLog.update({
          where: { id: log.id },
          data: { status: 'failed', metadata: { ...(log.metadata as object), error: 'Vercel API error' } },
        })
      }
    }

    if (provider === 'RAILWAY' && this.config.get('RAILWAY_TOKEN')) {
      await this.prisma.deploymentLog.update({
        where: { id: log.id },
        data: { status: 'pending', metadata: { ...(log.metadata as object), note: 'Railway integration: configure project in dashboard' } },
      })
    }

    return log
  }

  async getDeployments(projectSlug: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
    })
    if (!project) throw new NotFoundException('Project not found')
    if (project.ownerId !== userId) throw new ForbiddenException('Not project owner')
    return this.prisma.deploymentLog.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  }
}
