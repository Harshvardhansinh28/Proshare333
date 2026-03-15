import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ChatService } from './chat.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  getOrCreate(@Body('otherUserId') otherUserId: string, @Req() req: any) {
    return this.chatService.getOrCreateConversation(req.user.userId, otherUserId)
  }

  @Get('conversations')
  listMy(@Req() req: any) {
    return this.chatService.getMyConversations(req.user.userId)
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') conversationId: string,
    @Body('body') body: string,
    @Req() req: any,
  ) {
    return this.chatService.sendMessage(conversationId, req.user.userId, body)
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') conversationId: string,
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(
      conversationId,
      req.user.userId,
      limit ? parseInt(limit, 10) : 50,
    )
  }
}
