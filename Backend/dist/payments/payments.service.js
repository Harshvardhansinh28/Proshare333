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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_1 = __importDefault(require("stripe"));
let PaymentsService = class PaymentsService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const secretKey = this.config.get('STRIPE_SECRET_KEY');
        if (secretKey) {
            this.stripe = new stripe_1.default(secretKey, {
                apiVersion: '2024-06-20',
            });
        }
        else {
            this.stripe = null;
        }
    }
    requireStripe() {
        if (!this.stripe)
            throw new Error('STRIPE_SECRET_KEY is not configured');
        return this.stripe;
    }
    async createPaymentIntentForProject(buyerId, projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project || !project.isPublic || !project.priceInCents) {
            throw new common_1.NotFoundException('Project not purchasable');
        }
        if (project.ownerId === buyerId) {
            throw new common_1.BadRequestException('Cannot buy your own project');
        }
        const amount = project.priceInCents;
        const currency = project.currency;
        const platformFeeCents = Math.floor(amount * 0.05);
        const sellerAmountCents = amount - platformFeeCents;
        const stripe = this.requireStripe();
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                projectId,
                buyerId,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        const order = await this.prisma.order.create({
            data: {
                buyerId,
                projectId,
                amountInCents: amount,
                platformFeeCents,
                sellerAmountCents,
                currency,
                status: 'PENDING',
                stripePaymentIntentId: paymentIntent.id,
            },
        });
        return {
            clientSecret: paymentIntent.client_secret,
            orderId: order.id,
        };
    }
    async handleStripeWebhook(sig, rawBody) {
        const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET not configured');
        }
        const stripe = this.requireStripe();
        let event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, Array.isArray(sig) ? sig[0] : sig || '', webhookSecret);
        }
        catch (err) {
            throw new common_1.BadRequestException('Invalid Stripe signature');
        }
        if (event.type === 'payment_intent.succeeded') {
            const pi = event.data.object;
            const paymentIntentId = pi.id;
            const order = await this.prisma.order.findFirst({
                where: { stripePaymentIntentId: paymentIntentId, status: 'PENDING' },
                include: { project: true },
            });
            if (order) {
                const sellerId = order.project.ownerId;
                let wallet = await this.prisma.wallet.findUnique({
                    where: { userId: sellerId },
                });
                if (!wallet) {
                    wallet = await this.prisma.wallet.create({
                        data: { userId: sellerId, balanceCents: 0, currency: order.currency },
                    });
                }
                const tx = await this.prisma.walletTransaction.create({
                    data: {
                        walletId: wallet.id,
                        amountCents: order.sellerAmountCents,
                        type: 'SALE_CREDIT',
                        orderId: order.id,
                        metadata: { projectId: order.projectId, buyerId: order.buyerId },
                    },
                });
                await this.prisma.wallet.update({
                    where: { id: wallet.id },
                    data: { balanceCents: { increment: order.sellerAmountCents } },
                });
                await this.prisma.projectCredential.create({
                    data: {
                        projectId: order.projectId,
                        userId: order.buyerId,
                        orderId: order.id,
                        accessToken: `ps_${order.id}_${Date.now()}`,
                    },
                });
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: { status: 'COMPLETED', walletCreditId: tx.id },
                });
            }
        }
        return { received: true };
    }
    async getWallet(userId) {
        let wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!wallet) {
            wallet = await this.prisma.wallet.create({
                data: { userId, balanceCents: 0, currency: 'usd' },
                include: { transactions: true },
            });
        }
        return wallet;
    }
    async getMyCredentials(userId) {
        return this.prisma.projectCredential.findMany({
            where: { userId },
            include: {
                project: { select: { id: true, title: true, slug: true } },
            },
        });
    }
    async requestWithdrawal(userId, amountCents) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet || wallet.balanceCents < amountCents) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        const w = await this.prisma.withdrawal.create({
            data: { userId, amountCents, status: 'PENDING' },
        });
        await this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { id: wallet.id },
                data: { balanceCents: { decrement: amountCents } },
            }),
            this.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amountCents: -amountCents,
                    type: 'WITHDRAWAL',
                    withdrawalId: w.id,
                },
            }),
        ]);
        return w;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map