# Repository Guidelines

## Project Structure & Module Organization
This repo splits work into `backend/` (Medusa 2.8.4 services) and `storefront/` (Next.js 14). Backend logic lives in `backend/src`, with domain modules inside `src/modules/*`, workflows in `src/workflows`, and scripts in `src/scripts`. The storefront keeps routes in `storefront/src/app`, feature slices under `storefront/src/modules`, config inside `storefront/tailwind.config.js` and `next.config.js`, static assets in `storefront/public`, and Playwright specs in `storefront/e2e`.

## Build, Test, and Development Commands
- `cd backend && pnpm ib` – applies migrations and seeds baseline data.  
- `cd backend && pnpm dev` – runs the Medusa API + admin on `http://localhost:9000`.  
- `cd backend && pnpm build && pnpm start` – compiles then serves the production bundle.  
- `cd storefront && pnpm dev` – boots the Next.js dev server on `localhost:8000` (waits for backend).  
- `cd storefront && pnpm build && pnpm start` – builds then serves the storefront.  
- `cd storefront && pnpm test-e2e` – runs Playwright specs in `e2e/` against a seeded backend.

## Coding Style & Naming Conventions
Use TypeScript everywhere with ECMAScript modules, 2-space indentation, and Prettier defaults. React components and Medusa services stay PascalCase (`StickerCalculator`), hooks/interfaces stay camelCase, and environment variables remain UPPER_SNAKE. Keep files short by colocating UI state inside `storefront/src/modules/<domain>/components/*` and backend logic inside `src/modules/<domain>/services.ts`. Run `pnpm lint` inside `storefront/`; Medusa linting relies on the CLI’s bundled `eslint`.

## Testing Guidelines
Author backend unit tests with Jest (`cd backend && npx jest path/to/module.spec.ts`) and store specs beside the module they cover. Prefer fixture data from `backend/src/scripts/seed.ts` so e2e flows match production assumptions. Frontend behavior belongs in Playwright specs under `storefront/e2e` using names such as `cart.checkout.spec.ts`. Target ≥80 % coverage on new modules and run suites against a backend on port 9000.

## Commit & Pull Request Guidelines
Git history mixes descriptive messages (“Update pnpm-lock.yaml”) with noise (“df”), so tighten discipline: use imperative, scoped subjects (`backend: add sticker price guard`) and mention the ticket or issue ID. Each PR should include a short summary, verification notes (commands run, screenshots for visual tweaks), and any environment variables that changed. Link related Railway deployments when relevant.

## Security & Configuration Tips
Secrets live in `.env`/`.env.local`; never commit them—use the provided templates as checklists. Keep storage credentials (MinIO, Resend, Stripe) in Railway variables and load them via `medusa-config.js`. Sticker pricing parameters belong in `backend/src/modules/sticker-pricing/pricing-calculator.ts`; avoid duplicating them on the frontend. Document required ports and callbacks in the relevant module README before merging.
