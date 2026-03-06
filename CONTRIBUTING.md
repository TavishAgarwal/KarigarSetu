# Contributing to KarigarSetu

Thank you for your interest in contributing to KarigarSetu! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### Development Setup

```bash
# Clone the repository
git clone https://github.com/TavishAgarwal/KarigarSetu.git
cd KarigarSetu

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY and JWT_SECRET

# Generate Prisma client and set up database
npx prisma generate
npx prisma db push

# Seed demo data
npm run prisma:seed

# Start development server
npm run dev
```

## 📋 Development Workflow

### Branch Naming
- `feature/<description>` — New features
- `fix/<description>` — Bug fixes
- `docs/<description>` — Documentation updates
- `refactor/<description>` — Code refactoring

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add voice input for Tamil`
- `fix: resolve cart total calculation`
- `docs: update API documentation`
- `test: add schema validation tests`

## 🧪 Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

## 🔍 Code Quality

```bash
# Run ESLint
npm run lint

# Type check
npx tsc --noEmit
```

## 📁 Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages and API routes |
| `src/components/` | Reusable React components |
| `src/lib/` | Core business logic, utilities, and services |
| `src/lib/ai/` | AI module implementations (Gemini/Vertex AI) |
| `src/types/` | TypeScript type definitions |
| `src/hooks/` | Custom React hooks |
| `prisma/` | Database schema, migrations, and seed data |
| `functions/` | Google Cloud Functions (serverless) |
| `public/` | Static assets and service worker |

## 🏗️ Architecture Decisions

- **Feature Flags**: All Google Cloud integrations are behind feature flags in `src/lib/featureFlags.ts`. When env vars are missing, the app uses built-in fallbacks.
- **AI Client Abstraction**: `src/lib/ai/client.ts` provides a unified interface that works with both Vertex AI and direct Gemini SDK.
- **Offline Support**: IndexedDB queue (`src/lib/offlineQueue.ts`) stores listings created offline and syncs when connectivity returns.
- **Rate Limiting**: All AI endpoints use `src/lib/rate-limiter.ts` to prevent abuse.

## 🛡️ Security Guidelines

- Never commit `.env.local` or API keys
- Use Zod schemas (`src/lib/schemas.ts`) for all API input validation
- Use `getAuthUser()` for authentication in API routes
- Use httpOnly cookies for token storage (not localStorage)

## 📝 Adding a New AI Feature

1. Create the AI logic in `src/lib/ai/<feature>.ts`
2. Re-export it from `src/lib/gemini.ts`
3. Create an API route in `src/app/api/ai/<feature>/route.ts`
4. Add rate limiting via `aiLimiter.check(req)`
5. Add Zod validation for inputs
6. Write tests in `src/__tests__/`
7. Update the architecture docs

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
