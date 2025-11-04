# Project Feedback & Risk Radar

Ordered by priority—focus on **High** items first.

## High
- **Secrets shipped in repo (critical):** `backend/.medusa/server/package.json` is generated during `pnpm run build` and currently contains real R2/Stripe/Resend credentials. Because `.gitignore` does not exclude `.medusa/`, these files can leak secrets if committed.  
  _Action_: Add `.medusa/` to `.gitignore`, rotate exposed keys, and ensure builds run in environments where secrets are injected at runtime, not written to disk.
- **Environment drift between backend & storefront:** Backend enforces `node 22.x` per `package.json`, but the repo root builds are happening on Node 24. Align Node toolchains (prefer downgrading to Node 22 or validating with matrix tests) to avoid subtle runtime differences when deploying to Railway.
- ~~Sticker variant detection hardcoded~~ **(addressed)**: Frontend now infers sticker products from product type metadata instead of a single variant id.

## Medium
- **Cloudflare public URL fallback:** Multiple places default to `https://pub-4ea6ad9a9dc2413d9be2b77febd7ec0e.r2.dev`. If buckets change per environment, admin widgets and APIs will still point to the old URL. Make `R2_PUBLIC_URL` mandatory or derive the link from stored metadata to prevent broken previews.
- **Pricing consistency between tiers & cart:** Cart workflow recomputes total price vs. backend service `applyPsychologicalPricing`. Any future changes must be updated in both `StickerPricingService` and `calculateCartPricing` to stay consistent. Consider centralizing price formatting/rounding in one shared helper inside the module.
- **Storefront dependency management mixing npm/pnpm:** Historical npm installs created `.ignored` folders when switching to pnpm. Stick to pnpm scripts and delete leftover `node_modules/.ignored` artifacts to avoid accidental resolution issues.
- **Missing validation for uploaded file types/sizes backend-side:** Frontend restricts file extensions, but the R2 presign endpoint accepts any filename. Add MIME/type validation server-side to avoid unexpected uploads slipping through.

## Low
- **Tailwind screen warning:** Build logs warn that `min-*` / `max-*` variants are incompatible with mixed units in `tailwind.config.js`. Review custom breakpoints to clean up console noise and ensure responsive styles behave predictably.
- **Workflow naming & docs:** The new sticker workflows (`add-sticker-to-cart`, pricing steps) aren’t referenced in `backend/src/workflows/README.md`. Document usage so future contributors know when to reuse vs. extend them.
- **Admin widget ordering:** Widget mounts in `order.details.side.before`; confirm this zone doesn’t clash with other planned widgets. Alternative is to let merchants choose placement via config.

## Nice to Have
- **Test coverage for pricing & uploads:** No automated tests around sticker pricing or upload workflows. Add unit tests for `StickerPricingService` and integration tests for the store endpoints to catch regressions.
- **DX improvements:** `agent.md` now serves as briefing; consider linking it from `README.md` so anyone landing on the repo sees the technical guide quickly.
