# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HELLGATER (헬게이터)** is a gamified fitness tracking application that transforms workout routines into an RPG-style experience. Users level up their characters and body parts, unlock skills through a skill tree, and explore maps as they progress through a 25-week fitness curriculum.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + Redux Toolkit + React Query + Tailwind CSS
- Backend: Node.js 20 + Express + Prisma ORM + PostgreSQL
- Shared: TypeScript workspace for shared types and constants
- Infrastructure: Docker-based development environment

**Monorepo Structure:**
- `client/` - React frontend application
- `server/` - Express backend API server
- `shared/` - Shared TypeScript types and constants
- `docs/` - Architecture and design documentation

---

## Development Commands

### Docker Development (Primary Method)

**Docker is the primary development method.** The project uses Docker Compose to orchestrate three services: PostgreSQL database, backend server, and frontend client.

```bash
# Start all services (postgres, server, client)
npm run docker:dev

# Rebuild and start (use after Dockerfile changes or dependency updates)
npm run docker:dev:build

# Stop all services
npm run docker:dev:down

# View real-time logs from all containers
npm run docker:logs

# Clean everything (containers, volumes, images)
npm run docker:clean
```

**Container Management:**
```bash
# Restart a specific service
docker-compose restart client
docker-compose restart server

# Completely stop and restart all services
docker-compose down && docker-compose up -d

# Execute commands inside containers
docker-compose exec client npm install
docker-compose exec server npx prisma migrate dev

# View logs for specific service
docker-compose logs client --tail=50
docker-compose logs server -f
```

### Local Development (Alternative)

```bash
# Install all workspace dependencies
npm install

# Run both client and server concurrently
npm run dev

# Run only frontend (localhost:3000)
npm run dev:client

# Run only backend (localhost:4000)
npm run dev:server

# Build everything
npm run build
```

### Database Management

```bash
# Inside server container or locally in server/ directory:
npx prisma migrate dev --name <migration_name>  # Create and apply migration
npx prisma generate                              # Generate Prisma Client
npx prisma studio                                # Open Prisma Studio GUI
npx prisma migrate deploy                        # Apply migrations in production
```

---

## Critical Docker HMR (Hot Module Replacement) Issues

**⚠️ KNOWN ISSUE: Hot Module Replacement does not always work reliably in Docker containers on Windows.**

### Symptoms:
- Code changes in `client/src/` don't reflect in browser without container restart
- Changes to `useAuth.ts` and other hooks require manual intervention
- Vite HMR shows no errors but serves stale code

### Root Causes:
1. **Volume mounting on Windows** - Docker Desktop for Windows has known issues with file watching and volume mounts
2. **Vite's file watcher** - May not detect changes through Docker's volume layer
3. **Node modules caching** - Anonymous volumes for `node_modules` can cause staleness

### Required Actions After Code Changes:

**For frontend code changes that don't hot-reload:**
```bash
# Option 1: Restart client container (faster)
docker-compose restart client

# Option 2: If restart doesn't work, rebuild
docker-compose up -d --build client

# Option 3: Nuclear option - full rebuild
docker-compose down && docker-compose up -d --build
```

**For backend code changes:**
```bash
# Server uses tsx watch mode, usually auto-reloads
# If not working:
docker-compose restart server
```

**After installing new npm packages:**
```bash
# CRITICAL: Install inside container, not just locally
docker-compose exec client npm install
docker-compose exec server npm install

# Then restart the service
docker-compose restart client
docker-compose restart server
```

**Browser-side debugging:**
- Always use **hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) after container restarts
- Clear browser cache and Local Storage if login/auth issues persist
- For persistent issues, test in **Incognito/Private mode**

### Verifying Code Deployment:

```bash
# Check if file changes are in container
docker-compose exec client cat /app/client/src/hooks/useAuth.ts | head -40

# Check Vite server status
docker-compose logs client --tail=20
```

---

## Architecture Patterns

### Frontend State Management

**Two-tier state management:**
1. **Redux Toolkit** (via `redux-persist`) - Authentication state, user profile
   - Located in `client/src/store/`
   - Persisted to localStorage for auth persistence
   - **IMPORTANT**: Use `persistor.flush()` before page navigation to ensure localStorage write completes

2. **React Query** - Server state, API calls
   - Located in `client/src/services/api.ts`
   - Automatic caching and refetching
   - Used for character data, workout records, etc.

**Authentication Flow:**
```typescript
// Login mutation (client/src/hooks/useAuth.ts)
dispatch(setCredentials({ user, accessToken, refreshToken }))
await persistor.flush() // CRITICAL: Wait for localStorage save
window.location.href = '/character/create' // Safe to navigate
```

**⚠️ Common Pitfall:** Never navigate immediately after Redux state updates without waiting for `persistor.flush()`. This causes race conditions where the new page loads before localStorage is written, resulting in `accessToken: 'NULL'`.

### Backend Architecture

**Layered structure:**
```
routes/*.ts          → Define endpoints
  ↓
controllers/*.ts     → Handle HTTP req/res, validation
  ↓
services/*.ts        → Business logic (game engine, RM analysis)
  ↓
Prisma Client        → Database queries
```

**Authentication middleware:**
- All protected routes use `authMiddleware` (server/src/middleware/auth.middleware.ts)
- JWT tokens: Access token (15min) + Refresh token (7d)
- Refresh tokens stored in database with device info

**Critical transaction pattern:**
```typescript
// ALWAYS use transactions for multi-model operations
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ /* ... */ });
  await tx.refreshToken.create({ /* ... */ });
  return { user, tokens };
});
```

**⚠️ Common Error:** Partial saves occur when multiple database operations are not wrapped in `$transaction`, leaving orphaned records (e.g., User created but RefreshToken fails).

### Shared Types

**Import pattern:**
```typescript
// Client and Server both import from shared workspace
import type { LoginRequest, RegisterRequest } from '@shared/types/api.types';
```

**Path aliases configured in:**
- `client/tsconfig.json`: `"@shared/*": ["../shared/*"]`
- `server/tsconfig.json`: `"@shared/*": ["../shared/*"]`
- `client/vite.config.ts`: Alias resolution for bundler

---

## Database Schema Highlights

**Core entities:**
- `User` - Authentication and profile
- `Character` - RPG character with total level, 9 stats, 5 element progress
- `UserBodyPart` - Individual body part levels and 1RM records
- `WorkoutRecord` - Exercise logs with RM analysis and exp calculation
- `Skill` / `UserSkill` - Skill tree system
- `MapStage` / `UserMapProgress` - Map exploration (25-week curriculum)
- `Achievement` / `DailyQuest` - Quests and achievements
- `RefreshToken` - JWT refresh token storage

**Field length fixes applied:**
- `RefreshToken.tokenHash`: Changed to `@db.Text` (JWT tokens > 255 chars)
- `RefreshToken.deviceType`: Changed to `@db.Text` (User-Agent strings can be very long)
- `RefreshToken.deviceId`: Changed to `@db.Text`

**Migration workflow:**
```bash
# 1. Edit server/prisma/schema.prisma
# 2. Generate migration
docker-compose exec server npx prisma migrate dev --name describe_change
# 3. Prisma Client auto-regenerates
```

---

## Environment Variables

**Frontend** (`client/`):
- `VITE_API_URL` - Backend API base URL (default: `http://localhost:4000/api/v1`)

**Backend** (`server/.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Secret for access token signing
- `JWT_REFRESH_SECRET` - Secret for refresh token signing
- `JWT_ACCESS_EXPIRES_IN` - Access token lifetime (default: `15m`)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token lifetime (default: `7d`)
- `PORT` - Server port (default: `4000`)
- `CLIENT_URL` - CORS origin (default: `http://localhost:3000`)

**Docker Compose** automatically sets these in `docker-compose.yml`. For local development, copy `server/.env.example` to `server/.env`.

---

## Debugging Guidelines

### Common Issues & Solutions

**Issue: "Login doesn't redirect after success"**
- **Symptom:** Console shows `accessToken: 'NULL'` in ProtectedRoute after login
- **Cause:** Redux Persist hasn't completed writing to localStorage before page navigation
- **Solution:** Ensure `await persistor.flush()` is called before `window.location.href` or `navigate()`

**Issue: "Database field too long" errors**
- **Symptom:** Prisma query fails with "value too long for column type"
- **Cause:** Schema defines `@db.VarChar(N)` but actual data exceeds N characters
- **Solution:** Change to `@db.Text` in schema, then run `prisma migrate dev`

**Issue: "Partial user created but registration failed"**
- **Symptom:** User exists in DB but API returns error; subsequent registration fails with "email already exists"
- **Cause:** Multi-model operations not wrapped in transaction
- **Solution:** Wrap in `prisma.$transaction(async (tx) => { /* operations */ })`

**Issue: "Code changes not reflecting in browser"**
- **Symptom:** Modified code doesn't appear after save
- **Cause:** Docker volume mounting + Vite HMR issue on Windows
- **Solution:** Restart client container: `docker-compose restart client`, then hard refresh browser

**Issue: "npm package not found in container"**
- **Symptom:** Import error for recently installed package
- **Cause:** Package installed locally but not in Docker container
- **Solution:** `docker-compose exec client npm install && docker-compose restart client`

### Logging

**Frontend debugging:**
- Console logs prefixed with emojis for visibility (e.g., `console.log('✅ Login success:')`)
- React Query DevTools available in development mode
- Redux DevTools for state inspection

**Backend logging:**
- Winston logger configured in `server/src/config/logger.ts`
- Morgan HTTP request logging
- Log levels: `error`, `warn`, `info`, `debug`

---

## Testing Strategy

**Current status:** Tests not yet implemented (MVP phase)

**Planned approach:**
- Frontend: Vitest + React Testing Library
- Backend: Jest + Supertest for API tests
- E2E: Playwright for critical user flows

---

## Code Style Conventions

**TypeScript:**
- Strict mode enabled in all `tsconfig.json` files
- Use `import type` for type-only imports
- Prefer `interface` over `type` for object shapes
- Use Zod schemas for runtime validation (shared types in `@shared`)

**React:**
- Functional components with hooks only
- Custom hooks in `client/src/hooks/`
- Use React Query for all API calls
- Prefer controlled components

**File naming:**
- Components: PascalCase (e.g., `Login.tsx`, `ProtectedRoute.tsx`)
- Utilities/services: camelCase (e.g., `authService.ts`)
- Constants: UPPER_SNAKE_CASE files, exported as named exports

**Imports:**
- Use path aliases: `@/components/...` (client), `@shared/types/...` (both)
- Group imports: external libs → internal modules → types

---

## Game Logic Notes

**Experience calculation** (server/src/services/gameEngine/):
- Base EXP = `sets × reps × weight × difficulty_multiplier`
- Different formulas for strength vs. cardio exercises
- Level-up thresholds increase exponentially

**1RM Analysis** (server/src/services/rmAnalysis/):
- Uses Epley formula: `1RM = weight × (1 + reps / 30)`
- Grades: Bronze → Silver → Gold → Platinum → Diamond → Master → Challenger
- Grade thresholds based on bodyweight ratios (different for each body part)

**Skill Tree:**
- Skills unlock based on body part level and prerequisite skills
- Each skill linked to an exercise
- Tree positions stored as x,y coordinates for visual rendering

---

## Deployment Notes

**Production considerations:**
- Change all JWT secrets in `.env`
- Enable HTTPS and set secure cookie flags
- Set `NODE_ENV=production`
- Use managed PostgreSQL (not Docker container)
- Enable Redis for session caching
- Configure CDN for static assets

**Docker production:**
```bash
npm run docker:prod        # Start with docker-compose.prod.yml
npm run docker:prod:down   # Stop production containers
```

---

## Resources

- **Design docs:** See `docs/` folder for detailed architecture, database schema, game logic, API design
- **Prisma schema:** `server/prisma/schema.prisma` - Single source of truth for database structure
- **API routes:** `server/src/routes/` - RESTful endpoint definitions
- **Shared types:** `shared/types/` - Type definitions used by both client and server
