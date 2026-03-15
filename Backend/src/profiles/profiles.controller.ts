import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common'
import { ProfilesService } from './profiles.service'
import { JwtGuard } from '../auth/jwt.guard'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':userId')
  getProfile(@Param('userId') userId: string) {
    return this.profilesService.getByUserId(userId)
  }

  @UseGuards(JwtGuard)
  @Put('me')
  updateMyProfile(@Body() body: UpdateProfileDto, @Req() req: any) {
    const userId = req.user.userId
    return this.profilesService.upsert(userId, body)
  }
}
