import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import * as compression from 'compression'
import { json } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Stripe webhooks need the raw body, so keep this small and specific
  app.use(
    '/payments/webhook',
    json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf
      },
    }),
  )

  app.use(helmet())
  app.use(compression())
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const port = parseInt(process.env.PORT || '3000', 10)
  await app.listen(port)

  console.log(`🚀 Server running on http://localhost:${port}`)
}

bootstrap()
