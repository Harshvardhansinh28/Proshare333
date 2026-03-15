"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateConversation(userId, otherUserId) {
        if (userId === otherUserId)
            throw new common_1.ForbiddenException('Cannot chat with yourself');
        const other = await this.prisma.user.findUnique({ where: { id: otherUserId } });
        if (!other)
            throw new common_1.NotFoundException('User not found');
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
        });
        const existing = all.find((c) => {
            const ids = c.participants.map((p) => p.userId).sort();
            return ids.length === 2 && ids[0] === [userId, otherUserId].sort()[0] && ids[1] === [userId, otherUserId].sort()[1];
        });
        if (existing)
            return existing;
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
        });
        return conversation;
    }
    async getMyConversations(userId) {
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
        });
    }
    async sendMessage(conversationId, userId, body) {
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        const isParticipant = conv.participants.some((p) => p.userId === userId);
        if (!isParticipant)
            throw new common_1.ForbiddenException('Not a participant');
        const message = await this.prisma.message.create({
            data: { conversationId, senderId: userId, body },
            include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
    async getMessages(conversationId, userId, limit = 50) {
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        const isParticipant = conv.participants.some((p) => p.userId === userId);
        if (!isParticipant)
            throw new common_1.ForbiddenException('Not a participant');
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: limit,
            include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map