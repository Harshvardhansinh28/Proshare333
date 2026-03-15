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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityController = void 0;
const common_1 = require("@nestjs/common");
const community_service_1 = require("./community.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let CommunityController = class CommunityController {
    constructor(communityService) {
        this.communityService = communityService;
    }
    like(projectId, req) {
        return this.communityService.likeProject(req.user.userId, projectId);
    }
    unlike(projectId, req) {
        return this.communityService.unlikeProject(req.user.userId, projectId);
    }
    addComment(projectId, body, req) {
        return this.communityService.addComment(req.user.userId, projectId, body);
    }
    getComments(projectId, limit) {
        return this.communityService.getComments(projectId, limit ? parseInt(limit, 10) : 50);
    }
    follow(userId, req) {
        return this.communityService.follow(req.user.userId, userId);
    }
    unfollow(userId, req) {
        return this.communityService.unfollow(req.user.userId, userId);
    }
    createPost(content, mediaUrls, req) {
        return this.communityService.createPost(req.user.userId, content, mediaUrls ?? []);
    }
    getFeed(limit, req) {
        return this.communityService.getFeed(req.user.userId, limit ? parseInt(limit, 10) : 30);
    }
    getTrending(limit) {
        return this.communityService.getTrendingProjects(limit ? parseInt(limit, 10) : 20);
    }
    likePost(postId, req) {
        return this.communityService.likePost(req.user.userId, postId);
    }
    unlikePost(postId, req) {
        return this.communityService.unlikePost(req.user.userId, postId);
    }
    addPostComment(postId, body, req) {
        return this.communityService.addPostComment(req.user.userId, postId, body);
    }
    getPostComments(postId, limit) {
        return this.communityService.getPostComments(postId, limit ? parseInt(limit, 10) : 50);
    }
    report(targetType, targetId, reason, req) {
        return this.communityService.createReport(req.user.userId, targetType, targetId, reason);
    }
};
exports.CommunityController = CommunityController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('projects/:projectId/like'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "like", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Delete)('projects/:projectId/like'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "unlike", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('projects/:projectId/comments'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)('body')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/comments'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getComments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('follow/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "follow", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Delete)('follow/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "unfollow", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('posts'),
    __param(0, (0, common_1.Body)('content')),
    __param(1, (0, common_1.Body)('mediaUrls')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "createPost", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('feed'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)('trending'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getTrending", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('posts/:postId/like'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "likePost", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Delete)('posts/:postId/like'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "unlikePost", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('posts/:postId/comments'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Body)('body')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "addPostComment", null);
__decorate([
    (0, common_1.Get)('posts/:postId/comments'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getPostComments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('report'),
    __param(0, (0, common_1.Body)('targetType')),
    __param(1, (0, common_1.Body)('targetId')),
    __param(2, (0, common_1.Body)('reason')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "report", null);
exports.CommunityController = CommunityController = __decorate([
    (0, common_1.Controller)('community'),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityController);
//# sourceMappingURL=community.controller.js.map