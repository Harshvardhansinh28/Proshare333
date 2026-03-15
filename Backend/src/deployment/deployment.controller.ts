import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { DeploymentService } from './deployment.service'
import { JwtGuard } from '../auth/jwt.guard'
import { IsEnum } from 'class-validator'
import { DeploymentProvider } from '@prisma/client'

class TriggerDeployDto {
  @IsEnum(DeploymentProvider)
  provider: DeploymentProvider
}

@Controller('deployment')
@UseGuards(JwtGuard)
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post('projects/:slug')
  trigger(
    @Param('slug') slug: string,
    @Body() body: TriggerDeployDto,
    @Req() req: any,
  ) {
    return this.deploymentService.triggerDeploy(req.user.userId, slug, body.provider)
  }

  @Get('projects/:slug')
  list(@Param('slug') slug: string, @Req() req: any) {
    return this.deploymentService.getDeployments(slug, req.user.userId)
  }
}
