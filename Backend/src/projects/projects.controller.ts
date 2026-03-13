import { Controller, Post, Body, Req, UseGuards, Get, Query, Param, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateProjectDto } from './dto/create-project.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadAssetDto } from './dto/upload-asset.dto'

@Controller('projects')
export class ProjectsController {

  constructor(private projectsService: ProjectsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() body: CreateProjectDto, @Req() req: any) {
    const userId = req.user.userId
    return this.projectsService.createProject(userId, body)
  }

  @Get()
  getPublicProjects(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.projectsService.getProjects({ search, category })
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.projectsService.getProjectBySlug(slug)
  }

  @UseGuards(JwtGuard)
  @Post(':slug/asset')
  @UseInterceptors(FileInterceptor('file'))
  uploadAsset(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadAssetDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId
    return this.projectsService.attachAssetToProject(slug, userId, file, body)
  }

}