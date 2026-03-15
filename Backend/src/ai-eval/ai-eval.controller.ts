import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common'
import { AiEvalService } from './ai-eval.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('ai-eval')
@UseGuards(JwtGuard)
export class AiEvalController {
  constructor(private readonly aiEvalService: AiEvalService) {}

  @Post('projects/:slug')
  evaluate(@Param('slug') slug: string, @Req() req: any) {
    return this.aiEvalService.evaluateProject(slug, req.user.userId)
  }
}
