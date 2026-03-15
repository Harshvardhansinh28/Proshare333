# ProShare Backend – API Overview

Production-grade NestJS backend implementing all 13 feature areas. Use `Authorization: Bearer <token>` for protected routes.

## 1. Authentication
- `POST /auth/register` – body: `{ email, username, password }`
- `POST /auth/login` – body: `{ email, password }` → returns `{ token }`. Token includes `userId`, `email`, `role`.

## 2. Users & Profiles
- `GET /users/me` (auth) – current user with profile
- `GET /profiles/:userId` – public profile by user id
- `PUT /profiles/me` (auth) – body: `{ headline?, resumeUrl?, githubUrl?, portfolioUrl?, linkedinUrl?, location?, skills? }`

## 3. Projects (Showcase, Monetization, Lifecycle)
- `POST /projects` (auth) – create: `{ title, description, priceInCents?, category?, tags?, monetizationType?, repoUrl?, demoUrl?, isPublic? }`
- `GET /projects` – list public published projects. Query: `?search=&category=`
- `GET /projects/:slug` – project detail with owner and rating
- `POST /projects/:slug/publish` (auth) – set status to PUBLISHED
- `POST /projects/:slug/asset` (auth) – multipart file upload for thumbnail/asset

## 4. Payments & Wallet (5% platform / 95% seller)
- `POST /payments/intent` (auth) – body: `{ projectId }` → `{ clientSecret, orderId }` for Stripe Elements
- `GET /payments/wallet` (auth) – balance and recent transactions
- `POST /payments/withdraw` (auth) – body: `{ amountCents }` – request withdrawal
- `GET /payments/credentials` (auth) – list purchased project credentials (access tokens)
- `POST /payments/webhook` – Stripe webhook (raw body); completes order, credits seller wallet, creates buyer credential

## 5. Community
- `POST /community/projects/:projectId/like` (auth)
- `DELETE /community/projects/:projectId/like` (auth)
- `POST /community/projects/:projectId/comments` (auth) – body: `{ body }`
- `GET /community/projects/:projectId/comments` – ?limit=
- `POST /community/follow/:userId` (auth)
- `DELETE /community/follow/:userId` (auth)
- `POST /community/posts` (auth) – body: `{ content, mediaUrls? }`
- `GET /community/feed` (auth) – personalized feed; ?limit=
- `GET /community/trending` – trending projects; ?limit=

## 6. Ratings (AI / Backend / Frontend / System Design)
- `GET /ratings/projects/:slug` – rating for project
- `PUT /ratings/projects/:slug` (auth) – owner or admin: body `{ aiScore?, backendScore?, frontendScore?, systemDesignScore?, complexityNote?, scalabilityNote? }`
- `PUT /ratings/admin/projects/:slug` (admin) – same body

## 7. AI Project Evaluation
- `POST /ai-eval/projects/:slug` (auth) – run AI evaluation (uses OPENAI_API_KEY if set); updates project rating

## 8. One-Click Deployment
- `POST /deployment/projects/:slug` (auth) – body: `{ provider: "VERCEL" | "RAILWAY" | "AWS" | "DOCKER" }`
- `GET /deployment/projects/:slug` (auth) – list deployments

## 9. Recruiter Search
- `GET /recruiter/search` – ?q= & tags= (comma-separated) & limit= – projects with owner profile for hiring

## 10. Subscriptions
- `GET /subscriptions/me` (auth) – `{ tier: "FREE" | "PRO", currentPeriodEnd? }`

## 11. Admin Dashboard
All under `GET /admin/*` (auth + admin role).
- `GET /admin/dashboard` – userCount, projectCount, orderCount, totalRevenueCents, platformFeeCents, recentOrders
- `GET /admin/users` – ?skip= & take=
- `GET /admin/projects` – ?skip= & take=
- `GET /admin/transactions` – ?skip= & take=

## 12. Chat
- `POST /chat/conversations` (auth) – body: `{ otherUserId }` – get or create 1:1 conversation
- `GET /chat/conversations` (auth) – list my conversations
- `POST /chat/conversations/:id/messages` (auth) – body: `{ body }`
- `GET /chat/conversations/:id/messages` (auth) – ?limit=

## Creating an admin
Set a user’s role to ADMIN in the database (e.g. `UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';`) or add a seed script.

## Env (production)
- `DATABASE_URL`, `JWT_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
- Optional: `AI_EVAL_SERVICE_URL` (Python AI/ML scoring service, e.g. `http://localhost:8000` or `https://ai-eval.example.com`), `VERCEL_TOKEN` (deploy), `CORS_ORIGIN`, `PORT`

## Python AI/ML scoring service
Project scoring (ai/backend/frontend/system-design) is delegated to a **Python service** when `AI_EVAL_SERVICE_URL` is set. Run the service in `Backend/ai-eval-python/` (see its README). It supports heuristics only, or OpenAI when `OPENAI_API_KEY` is set in the Python service env. Use `docker-compose up ai-eval` and set `AI_EVAL_SERVICE_URL=http://ai-eval:8000` for the NestJS app when both run in Docker.
