import { Module } from '@nestjs/common'
import { RecruiterService } from './recruiter.service'
import { RecruiterController } from './recruiter.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [RecruiterController],
  providers: [RecruiterService],
})
export class RecruiterModule {}
