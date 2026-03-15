import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { PrismaModule } from './prisma/prisma.module'
import { ProjectsModule } from './projects/projects.module'
import { PaymentsModule } from './payments/payments.module'
import { StorageModule } from './storage/storage.module'
import { ProfilesModule } from './profiles/profiles.module'
import { CommunityModule } from './community/community.module'
import { RatingsModule } from './ratings/ratings.module'
import { AdminModule } from './admin/admin.module'
import { SubscriptionsModule } from './subscriptions/subscriptions.module'
import { DeploymentModule } from './deployment/deployment.module'
import { AiEvalModule } from './ai-eval/ai-eval.module'
import { RecruiterModule } from './recruiter/recruiter.module'
import { ChatModule } from './chat/chat.module'
import { UploadsModule } from './uploads/uploads.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    PaymentsModule,
    StorageModule,
    ProfilesModule,
    CommunityModule,
    RatingsModule,
    AdminModule,
    SubscriptionsModule,
    DeploymentModule,
    AiEvalModule,
    RecruiterModule,
    ChatModule,
    UploadsModule,
  ],
})
export class AppModule {}