import { Controller, Get, Query } from '@nestjs/common'
import { RecruiterService } from './recruiter.service'

@Controller('recruiter')
export class RecruiterController {
  constructor(private readonly recruiterService: RecruiterService) {}

  @Get('search')
  search(
    @Query('q') q?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit?: string,
  ) {
    const tagList = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined
    return this.recruiterService.searchProjects(
      q ?? '',
      tagList,
      limit ? parseInt(limit, 10) : 30,
    )
  }
}
