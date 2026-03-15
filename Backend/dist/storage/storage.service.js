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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
let StorageService = class StorageService {
    constructor(config) {
        this.config = config;
        this.region = this.config.get('AWS_REGION') || 'us-east-1';
        this.bucket = this.config.get('AWS_S3_BUCKET') || '';
        aws_sdk_1.default.config.update({
            region: this.region,
            accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
        });
        this.s3 = new aws_sdk_1.default.S3();
    }
    async uploadObject(params) {
        if (!this.bucket) {
            throw new Error('AWS_S3_BUCKET is not configured');
        }
        await this.s3
            .putObject({
            Bucket: this.bucket,
            Key: params.key,
            Body: params.body,
            ContentType: params.contentType,
            ACL: 'public-read',
        })
            .promise();
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${params.key}`;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map