import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { CommunityService } from './community.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(JwtGuard)
  @Post('projects/:projectId/like')
  like(@Param('projectId') projectId: string, @Req() req: any) {
    return this.communityService.likeProject(req.user.userId, projectId)
  }

  @UseGuards(JwtGuard)
  @Delete('projects/:projectId/like')
  unlike(@Param('projectId') projectId: string, @Req() req: any) {
    return this.communityService.unlikeProject(req.user.userId, projectId)
  }

  @UseGuards(JwtGuard)
  @Post('projects/:projectId/comments')
  addComment(
    @Param('projectId') projectId: string,
    @Body('body') body: string,
    @Req() req: any,
  ) {
    return this.communityService.addComment(req.user.userId, projectId, body)
  }

  @Get('projects/:projectId/comments')
  getComments(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getComments(projectId, limit ? parseInt(limit, 10) : 50)
  }

  @UseGuards(JwtGuard)
  @Post('follow/:userId')
  follow(@Param('userId') userId: string, @Req() req: any) {
    return this.communityService.follow(req.user.userId, userId)
  }

  @UseGuards(JwtGuard)
  @Delete('follow/:userId')
  unfollow(@Param('userId') userId: string, @Req() req: any) {
    return this.communityService.unfollow(req.user.userId, userId)
  }

  @UseGuards(JwtGuard)
  @Post('posts')
  createPost(
    @Body('content') content: string,
    @Body('mediaUrls') mediaUrls: string[],
    @Req() req: any,
  ) {
    return this.communityService.createPost(req.user.userId, content, mediaUrls ?? [])
  }

  @UseGuards(JwtGuard)
  @Get('feed')
  getFeed(@Query('limit') limit?: string, @Req() req?: any) {
    return this.communityService.getFeed(req.user.userId, limit ? parseInt(limit, 10) : 30)
  }

  @Get('trending')
  getTrending(@Query('limit') limit?: string) {
    return this.communityService.getTrendingProjects(limit ? parseInt(limit, 10) : 20)
  }

  @UseGuards(JwtGuard)
  @Post('posts/:postId/like')
  likePost(@Param('postId') postId: string, @Req() req: any) {
    return this.communityService.likePost(req.user.userId, postId)
  }

  @UseGuards(JwtGuard)
  @Delete('posts/:postId/like')
  unlikePost(@Param('postId') postId: string, @Req() req: any) {
    return this.communityService.unlikePost(req.user.userId, postId)
  }

  @UseGuards(JwtGuard)
  @Post('posts/:postId/comments')
  addPostComment(
    @Param('postId') postId: string,
    @Body('body') body: string,
    @Req() req: any,
  ) {
    return this.communityService.addPostComment(req.user.userId, postId, body)
  }

  @Get('posts/:postId/comments')
  getPostComments(
    @Param('postId') postId: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getPostComments(postId, limit ? parseInt(limit, 10) : 50)
  }
  @UseGuards(JwtGuard)
  @Post('report')
  report(
    @Body('targetType') targetType: string,
    @Body('targetId') targetId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.communityService.createReport(req.user.userId, targetType, targetId, reason)
  }
}
