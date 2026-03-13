import { Module } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { ProjectsController } from './projects.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}