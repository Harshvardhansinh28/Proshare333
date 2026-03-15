import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId) throw new ForbiddenException('Cannot chat with yourself')
    const other = await this.prisma.user.findUnique({ where: { id: otherUserId } })
    if (!other) throw new NotFoundException('User not found')

    const all = await this.prisma.conversation.findMany({
      where: {
        participants: {
          every: { userId: { in: [userId, otherUserId] } },
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        },
      },
    })
    const existing = all.find((c) => {
      const ids = c.participants.map((p) => p.userId).sort()
      return ids.length === 2 && ids[0] === [userId, otherUserId].sort()[0] && ids[1] === [userId, otherUserId].sort()[1]
    })
    if (existing) return existing

    const conversation = await this.prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: otherUserId },
          ],
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        },
      },
    })
    return conversation
  }

  async getMyConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { body: true, createdAt: true, senderId: true },
        },
      },
    })
  }

  async sendMessage(conversationId: string, userId: string, body: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    })
    if (!conv) throw new NotFoundException('Conversation not found')
    const isParticipant = conv.participants.some((p) => p.userId === userId)
    if (!isParticipant) throw new ForbiddenException('Not a participant')
    const message = await this.prisma.message.create({
      data: { conversationId, senderId: userId, body },
      include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
    })
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
    return message
  }

  async getMessages(conversationId: string, userId: string, limit = 50) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    })
    if (!conv) throw new NotFoundException('Conversation not found')
    const isParticipant = conv.participants.some((p) => p.userId === userId)
    if (!isParticipant) throw new ForbiddenException('Not a participant')
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
    })
  }
}
