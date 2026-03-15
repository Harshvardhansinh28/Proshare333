import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import compression from 'compression'
import { json, urlencoded } from 'express'
import * as express from 'express'
import { join } from 'path'

async function bootstrap() {
  // Disable default body parser to handle raw body for Stripe manually
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  // Static Assets
  app.use('/public', express.static(join(__dirname, '..', 'public')))

  // Security & Optimization
  app.use(helmet())
  app.use(compression())

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  })

  // 1. Stripe Raw Body Parser (must be before standard JSON parser)
  app.use('/payments/webhook', json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf
    }
  }))

  // 2. Standard JSON Parser for all other routes
  app.use(json({ limit: '10mb' }))
  app.use(urlencoded({ extended: true, limit: '10mb' }))

  // Global Validation
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
