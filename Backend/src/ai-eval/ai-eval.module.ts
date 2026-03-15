import { Module } from '@nestjs/common'
import { AiEvalService } from './ai-eval.service'
import { AiEvalController } from './ai-eval.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { RatingsModule } from '../ratings/ratings.module'

@Module({
  imports: [PrismaModule, AuthModule, RatingsModule],
  controllers: [AiEvalController],
  providers: [AiEvalService],
})
export class AiEvalModule {}
