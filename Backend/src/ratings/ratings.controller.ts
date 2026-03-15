import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common'
import { RatingsService } from './ratings.service'
import { JwtGuard } from '../auth/jwt.guard'
import { AdminGuard } from '../auth/admin.guard'
import { UpsertRatingDto } from './dto/upsert-rating.dto'

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('projects/:slug')
  getByProject(@Param('slug') slug: string) {
    return this.ratingsService.getByProjectSlug(slug)
  }

  @UseGuards(JwtGuard)
  @Put('projects/:slug')
  upsert(
    @Param('slug') slug: string,
    @Body() body: UpsertRatingDto,
    @Req() req: any,
  ) {
    const isAdmin = req.user?.role === 'ADMIN'
    return this.ratingsService.upsert(slug, req.user.userId, isAdmin, body)
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Put('admin/projects/:slug')
  adminUpsert(@Param('slug') slug: string, @Body() body: UpsertRatingDto, @Req() req: any) {
    return this.ratingsService.upsert(slug, req.user.userId, true, body)
  }
}
