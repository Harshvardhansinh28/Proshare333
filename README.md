# ProShare - The Ultimate Developer Marketplace & Collaboration Ecosystem

ProShare is a high-performance marketplace and social ecosystem where developers can showcase, monetize, and collaborate on technical projects. It combines automated code evaluation, secure asset transfers, and real-time administrative oversight into a single, unified platform.

## 🚀 Features

- **AI-Driven Project Valuation**: Automated scoring for code quality, backend architecture, and design aesthetics.
- **Secure Commercial Engine**: End-to-end project sales with automated credential rotation and ownership transfer.
- **Ultra Command Center**: A real-time administrative HUD featuring live telemetry, financial intelligence, and system health monitoring.
- **Moderation Sentinel**: A robust community reporting loop with a dedicated high-priority moderation queue for platform security.
- **Community Feed**: A specialized "Mini-LinkedIn" social hub for sharing deployments and developer updates.
- **One-Click Deployments**: Experimental support for rapid environment provisioning on Vercel, Railway, and AWS.

## 🏗️ Architecture

The ProShare ecosystem is built for scale and real-time responsiveness:

1. **Backend**: A modular **NestJS** application leveraging **Prisma ORM** for PostgreSQL. It includes a custom **Sentinel Engine** for moderation and telemetry simulators for platform oversight.
2. **Frontend**: A reactive **React** application powered by **Vite**. It utilizes **TanStack Query** for high-frequency data polling and **Framer Motion** for a premium, interactive user experience.
3. **Infrastructure**: Uses **PostgreSQL** for persistence and is prepared for **BullMQ/Redis** to handle asynchronous background tasks and evaluations.

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v18 or later
- **Docker**: For running PostgreSQL/Redis locally
- **Prisma**: `npx prisma` CLI

### 1. Infrastructure Setup

Navigate to the `Backend` directory and start the required services:

```bash
cd Backend
docker-compose up -d
```

### 2. Database Initialization

Sync your schema and generate the Prisma client:

```bash
npx prisma generate
npx prisma db push
```

### 3. Application Launch

Open two terminals to run the ecosystem concurrently:

**Term 1 (Backend)**:
```bash
cd Backend
npm install
npm run start:dev
```

**Term 2 (Frontend)**:
```bash
cd frontend
npm install
npm run dev
```

The platform will be available at `http://localhost:5173`. Administrative functions require an `ADMIN` role account.

## 🛡️ Moderation & Deployment

- **Sentinel Control**: Access the Ultra Command Center at `/admin/dashboard` to monitor telemetry and handle reports.
- **Flagging**: Users can report misconduct directly from post or project views.
- **Deployment**: Integrated logs track success/failure rates of external provisioning events.

---

*Secured by PS-OS v1.4.2. Built for the modern developer.*
