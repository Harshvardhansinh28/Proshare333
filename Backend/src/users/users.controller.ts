import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../auth/jwt.guard'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getProfile(@Req() req) {
    const userId = req.user.userId
    return this.usersService.getMe(userId)
  }

}
