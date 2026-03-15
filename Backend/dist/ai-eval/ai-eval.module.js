"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiEvalModule = void 0;
const common_1 = require("@nestjs/common");
const ai_eval_service_1 = require("./ai-eval.service");
const ai_eval_controller_1 = require("./ai-eval.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
const ratings_module_1 = require("../ratings/ratings.module");
let AiEvalModule = class AiEvalModule {
};
exports.AiEvalModule = AiEvalModule;
exports.AiEvalModule = AiEvalModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule, ratings_module_1.RatingsModule],
        controllers: [ai_eval_controller_1.AiEvalController],
        providers: [ai_eval_service_1.AiEvalService],
    })
], AiEvalModule);
//# sourceMappingURL=ai-eval.module.js.map