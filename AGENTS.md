# Repository Guidelines

The repository contains a NestJS-based backend focused on a platform with users and projects.

## Project Structure & Module Organization
The core logic resides in the [./Backend](./Backend) directory.
- [./Backend/src](./Backend/src): Contains the main application source code.
- [./Backend/prisma](./Backend/prisma): Prisma ORM schema and database migrations.
- [./Backend/src/auth](./Backend/src/auth): Authentication logic (JWT, Passport).
- [./Backend/src/users](./Backend/src/users): User management and profile services.
- [./Backend/src/prisma](./Backend/src/prisma): Global Prisma client integration.

## Build, Test, and Development Commands
Commands should be executed within the [./Backend](./Backend) directory.
- **Build**: `npm run build`
- **Start (Development)**: `npm run start:dev`
- **Start (Production)**: `npm run start:prod`
- **Prisma Generate**: `npx prisma generate`
- **Prisma Migrate**: `npx prisma migrate dev`
- **Infrastructure**: Use `docker-compose up -d` in the [./Backend](./Backend) directory to start required services (PostgreSQL, Redis).

## Coding Style & Naming Conventions
- Enforced by NestJS architectural patterns.
- Controllers, Services, and Modules should be separated and named using the `*.controller.ts`, `*.service.ts`, and `*.module.ts` patterns.
- **TypeScript** is configured with strictness suited for the framework, utilizing decorators for DI.

## Architecture Overview
- **Database**: PostgreSQL managed via Prisma.
- **Authentication**: JWT-based auth integrated with Passport.
- **Background Jobs**: BullMQ and ioredis are available for handling asynchronous tasks and queueing.
