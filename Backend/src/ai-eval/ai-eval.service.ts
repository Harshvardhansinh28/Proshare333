import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { RatingsService } from '../ratings/ratings.service'

const STUB_SCORES = {
  aiScore: 70,
  backendScore: 75,
  frontendScore: 70,
  systemDesignScore: 72,
  complexityNote: 'Analysis pending. Set AI_EVAL_SERVICE_URL to the Python AI service for ML-based scoring.',
  scalabilityNote: 'Re-run evaluation with the Python AI service for detailed notes.',
}

@Injectable()
export class AiEvalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly ratingsService: RatingsService,
  ) {}

  async evaluateProject(projectSlug: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
      include: { rating: true },
    })
    if (!project) throw new NotFoundException('Project not found')
    if (project.ownerId !== userId) throw new ForbiddenException('Not project owner')

    const pythonServiceUrl = this.config.get<string>('AI_EVAL_SERVICE_URL')?.replace(/\/$/, '')
    let aiScore: number | undefined
    let backendScore: number | undefined
    let frontendScore: number | undefined
    let systemDesignScore: number | undefined
    let complexityNote: string | undefined
    let scalabilityNote: string | undefined

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
        })
        if (res.ok) {
          const data = (await res.json()) as {
            ai_score?: number
            backend_score?: number
            frontend_score?: number
            system_design_score?: number
            complexity_note?: string
            scalability_note?: string
          }
          aiScore = data.ai_score != null ? Math.min(100, Math.max(0, data.ai_score)) : undefined
          backendScore = data.backend_score != null ? Math.min(100, Math.max(0, data.backend_score)) : undefined
          frontendScore = data.frontend_score != null ? Math.min(100, Math.max(0, data.frontend_score)) : undefined
          systemDesignScore = data.system_design_score != null ? Math.min(100, Math.max(0, data.system_design_score)) : undefined
          complexityNote = data.complexity_note ?? undefined
          scalabilityNote = data.scalability_note ?? undefined
        }
      } catch {
        // fallback to stub
      }
    }

    if (aiScore == null) {
      aiScore = STUB_SCORES.aiScore
      backendScore = STUB_SCORES.backendScore
      frontendScore = STUB_SCORES.frontendScore
      systemDesignScore = STUB_SCORES.systemDesignScore
      complexityNote = STUB_SCORES.complexityNote
      scalabilityNote = STUB_SCORES.scalabilityNote
    }

    return this.ratingsService.upsert(projectSlug, userId, false, {
      aiScore,
      backendScore,
      frontendScore,
      systemDesignScore,
      complexityNote,
      scalabilityNote,
    })
  }
}
