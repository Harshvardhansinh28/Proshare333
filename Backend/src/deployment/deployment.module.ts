import { Module } from '@nestjs/common'
import { DeploymentService } from './deployment.service'
import { DeploymentController } from './deployment.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DeploymentController],
  providers: [DeploymentService],
})
export class DeploymentModule {}
