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
exports.DeploymentController = void 0;
const common_1 = require("@nestjs/common");
const deployment_service_1 = require("./deployment.service");
const jwt_guard_1 = require("../auth/jwt.guard");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class TriggerDeployDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DeploymentProvider),
    __metadata("design:type", String)
], TriggerDeployDto.prototype, "provider", void 0);
let DeploymentController = class DeploymentController {
    constructor(deploymentService) {
        this.deploymentService = deploymentService;
    }
    trigger(slug, body, req) {
        return this.deploymentService.triggerDeploy(req.user.userId, slug, body.provider);
    }
    list(slug, req) {
        return this.deploymentService.getDeployments(slug, req.user.userId);
    }
};
exports.DeploymentController = DeploymentController;
__decorate([
    (0, common_1.Post)('projects/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, TriggerDeployDto, Object]),
    __metadata("design:returntype", void 0)
], DeploymentController.prototype, "trigger", null);
__decorate([
    (0, common_1.Get)('projects/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeploymentController.prototype, "list", null);
exports.DeploymentController = DeploymentController = __decorate([
    (0, common_1.Controller)('deployment'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:paramtypes", [deployment_service_1.DeploymentService])
], DeploymentController);
//# sourceMappingURL=deployment.controller.js.map