import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtGuard } from '../auth/jwt.guard'
import { AdminGuard } from '../auth/admin.guard'

@Controller('admin')
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard()
  }

  @Get('users')
  getUsers(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.adminService.getUsers(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 50,
    )
  }

  @Get('projects')
  getProjects(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.adminService.getProjects(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 50,
    )
  }

  @Get('transactions')
  getTransactions(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.adminService.getTransactions(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 50,
    )
  }

  @Post('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: 'USER' | 'ADMIN') {
    return this.adminService.updateUserRole(id, role)
  }

  @Post('users/:id/ban')
  toggleUserBan(@Param('id') id: string, @Body('isBanned') isBanned: boolean) {
    return this.adminService.toggleUserBan(id, isBanned)
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id)
  }

  @Post('projects/:id/status')
  updateProjectStatus(@Param('id') id: string, @Body('status') status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    return this.adminService.updateProjectStatus(id, status)
  }

  @Delete('projects/:id')
  deleteProject(@Param('id') id: string) {
    return this.adminService.deleteProject(id)
  }

  @Get('advanced-stats')
  getAdvancedStats() {
    return this.adminService.getAdvancedStats()
  }

  @Get('moderation-queue')
  getModerationQueue() {
    return this.adminService.getModerationQueue()
  }

  @Post('moderation/:id')
  handleReport(@Param('id') id: string, @Body('action') action: 'RESOLVE' | 'DISMISS') {
    return this.adminService.handleReport(id, action)
  }

  @Get('system-health')
  getSystemHealth() {
    return this.adminService.getSystemHealth()
  }
}
