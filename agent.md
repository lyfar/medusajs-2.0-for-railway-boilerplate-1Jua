# EggShell Sticker Shop – Agent Briefing

## Purpose & Current Focus
- Build and maintain a custom sticker commerce experience using **Medusa 2.8.x** for the backend and **Next.js 14** for the storefront.
- Provide B2C ordering with bespoke sticker pricing, quantity controls, and artwork uploads that flow end-to-end through the Medusa order pipeline and Railway deployments.
- All new work must stay aligned with **Medusa v2 APIs, modules, and UI primitives**. Mixing v1 patterns (entities, legacy services, old admin widgets) will break compatibility.

## Stack Overview
- **Services**: `backend/` (Medusa 2.0 server) + `storefront/` (Next.js storefront). Each deploys independently to Railway.
- **Languages & Tooling**: TypeScript everywhere; backend uses pnpm 9 (`packageManager` in `backend/package.json`), storefront currently managed with pnpm ≥10 (lockfile in repo). Stick with pnpm to avoid mixed-node-module issues.
- **Design System**: Medusa’s `@medusajs/ui` is the canonical component library. Do not introduce Shadcn or other UI kits unless wrapped to match Medusa styles.
- **Storage / Integrations**: Cloudflare R2 for customer artwork uploads (fallback to MinIO/local file provider), Stripe payments, optional Sendgrid/Resend emails, Meilisearch search.

## Repository Layout
- `backend/` – Medusa 2 app with custom modules, workflows, API routes, and admin widgets.
- `storefront/` – Next.js 14 storefront (App Router) with sticker-specific UI, hooks, and data fetching utilities.
- `.cursor/`, `.claude/` – AI assistant context; ignore for production.
- `README.md` – Marketing/launch copy for the template (kept for now).
- `agent.md` (this file) – Living technical brief; update when architecture or workflows change.

## Backend (Medusa 2.8.x) Customizations

### Sticker Pricing Domain
- Module registered via `backend/src/modules/sticker-pricing/index.ts`, exposing `StickerPricingService` to the Medusa container.
- Business rules implemented in:
  - `service.ts`: database-backed overrides (`StickerConfig`, `StickerPricingTier`), psychological pricing logic, cart calculations.
  - `pricing-calculator.ts`: shape-aware pricing, MOQ enforcement, tier defaults, legacy compatibility, and per-shape formulas.
  - `validation.ts`: shared MOQ + quantity validators (used by workflows and frontend utilities).
  - `models/sticker-config.ts`: custom entities synced through Medusa’s module schema toolkit.
- API endpoints under `backend/src/api/store/stickers/`:
  - `calculate-pricing/route.ts` – validates quantity + delegates to service.
  - `pricing-tiers/route.ts` – exposes tier tables (variant-aware).
  - `upload-url/route.ts` – hands out R2 presigned URLs (see Cloudflare section).
- Cart integration:
  - `backend/src/api/store/carts/[id]/stickers/route.ts` – dedicated entrypoint for sticker line items.
  - `backend/src/workflows/add-sticker-to-cart.ts` – wraps the core `addToCartWorkflow`, injects custom unit pricing from metadata, and flags lines with `has_custom_price`.
  - `backend/src/workflows/steps/calculate-sticker-price.ts` + `sticker-pricing/calculate-sticker-pricing.ts` – reusable workflow steps for async pricing flows (cart, preview, etc.).

### Cloudflare R2 Artwork Pipeline
- Custom provider (`backend/src/modules/cloudflare-r2-file/service.ts`) implements S3-compatible upload/download/delete + presigned URLs tailored for R2.
- Registered in `backend/medusa-config.js`, picking between:
  - Cloudflare R2 (primary) via `R2_*` env vars,
  - MinIO (`MINIO_*`) fallback,
  - Local storage third fallback.
- Helpers & guards in `backend/src/lib/constants.ts` ensure required secrets exist at boot.
- Customer upload endpoint (`backend/src/api/store/stickers/upload-url/route.ts`) instantiates the provider per request to issue short-lived PUT URLs and bubble config errors cleanly.

### Admin Experience
- Widget `backend/src/admin/widgets/order-sticker-designs.tsx` surfaces uploaded artwork, metadata (shape, dimensions, pricing), and download links inside the order detail side panel.
- API enrichments:
  - `backend/src/api/admin/orders/[id]/with-designs/route.ts` – overlays item thumbnails with uploaded art and returns enhanced order payloads.
  - `.../[id]/sticker-designs/route.ts` – dedicated endpoint returning just the sticker design list for admin dashboards or external tooling.

### Additional Notes
- `backend/src/lib/constants.ts` centralizes environment access and guards (JWT, DB, Redis, R2, etc.).
- `backend/medusa-config.js` keeps Medusa modules constrained to v2 providers (`@medusajs/framework`, `Modules.*`), with redis, notification, payment, and search adapters toggled via env.
- `backend/src/scripts/seed.ts` (review when editing) seeds sticker products and should be updated alongside pricing changes.

## Storefront (Next.js 14) Customizations

### Sticker Ordering UX
- `src/modules/products/components/product-actions/index.tsx`: primary product CTA - detects sticker variants, enforces MOQ, renders custom upload + pricing widgets, and calls `addStickerToCart`.
- `file-upload/index.tsx`: requests presigned URLs from `/store/stickers/upload-url`, uploads directly to R2, renders previews, and returns the file key + public URL.
- `sticker-pricing/index.tsx` & `quantity-selector.tsx`: display dynamic pricing, savings, and tier metadata; quantity dropdown constrained to MOQ-friendly increments.
- `@lib/hooks/use-sticker-pricing.tsx`: client hook that orchestrates pricing fetches (`calculate-pricing` + `pricing-tiers`), manages loading/error state, and only runs when the variant is a sticker.
- `@lib/data/stickers.ts` & `@lib/data/uploads.ts`: SDK wrappers for the custom backend endpoints with consistent JSON payloads and no caching.
- `@lib/util/sticker-utils.ts`: mirrors backend quantity rules (variant guard, MOQ, price formatting) to keep client validation in sync.
- Cart helpers (`@lib/data/cart.ts`, `addStickerToCart`) inject metadata (`file_key`, `design_url`, pricing totals) so backend workflows can persist the custom price + artwork reference.

### Layout & Components
- All new UI sticks to `@medusajs/ui` primitives (see usage across `src/modules/...` via `rg "@medusajs/ui"`), ensuring consistency with Medusa’s admin/site design language.
- Remote image domains configured in `storefront/next.config.js` include R2/public buckets and Medusa demo assets—update when infra domains change.

### Deployment & Runtime
- `.env.local` expects `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_BASE_URL`, and `NEXT_PUBLIC_R2_PUBLIC_URL` (for surfacing uploaded art); align with backend `BACKEND_PUBLIC_URL` + R2 settings.
- Build currently targets Node 18+/pnpm; keep dependency resolution via pnpm to avoid the npm/pnpm rename issues we hit earlier.

## Integrations & Environment Contracts
- **Cloudflare R2** (preferred): `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, optional `R2_PUBLIC_URL`.
- **MinIO fallback**: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`.
- **Email**: choose Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`) or SendGrid (`SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`)—do not enable both simultaneously.
- **Payments**: Stripe via `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Search**: Meilisearch via `MEILISEARCH_HOST`, `MEILISEARCH_ADMIN_KEY`.
- **Core security**: `DATABASE_URL`, `JWT_SECRET`, `COOKIE_SECRET`, and CORS envs (`ADMIN_CORS`, `AUTH_CORS`, `STORE_CORS`) must be set before prod deploys.

## Operational Workflow
- **Backend dev**: `cd backend && pnpm install && pnpm dev` (Node 22.x per `package.json` engines). Use `pnpm ib` for first-run migrations/seed.
- **Storefront dev**: `cd storefront && pnpm install && pnpm dev`. Avoid mixing npm/yarn to keep node_modules clean.
- **Testing / Builds**: `pnpm run build` (backend) & `pnpm run build:next` (storefront) before deploys; Next build currently warns about unmanaged SWC binaries but completes once routing is intact.
- **Git hygiene**: `.gitignore` updated to exclude node_modules, env files, and local lockfiles at repo root. Keep service-specific lockfiles inside `backend/` and `storefront/`.

## Guardrails & Future Work
- Always consult [Medusa v2 docs](https://docs.medusajs.com) before touching modules, workflows, or admin components; v1 guides (entity repositories, old REST APIs) are incompatible.
- When extending pricing or uploads, update both backend (`sticker-pricing` service/workflows) and matching frontend utilities to stay in sync.
- Cloudflare integration currently hardcodes a fallback public URL in admin endpoints/widgets—swap to environment-driven URLs when production bucket is finalized.
- Root-level Node artifacts (legacy `portace` experiment) were removed; keep the repo as a dual-service setup only.

## Quick Reference of Key Custom Files
- Backend pricing: `backend/src/modules/sticker-pricing/**`, `backend/src/api/store/stickers/**`, `backend/src/workflows/**`.
- Backend storage: `backend/src/modules/cloudflare-r2-file/**`, `backend/medusa-config.js`, `backend/src/lib/constants.ts`.
- Admin UI: `backend/src/admin/widgets/order-sticker-designs.tsx`, `backend/src/api/admin/orders/[id]/**/*`.
- Storefront pricing/upload UX: `storefront/src/modules/products/components/{product-actions,sticker-pricing,file-upload}/**`, `storefront/src/lib/{data,util}/sticker*.ts`, `storefront/src/lib/hooks/use-sticker-pricing.tsx`.

Keep this document updated whenever workflows, modules, or deployment assumptions change. It is the onboarding map for future contributors and the guardrail reminding us: **Medusa v2 everywhere, no regressions to v1 patterns.**
