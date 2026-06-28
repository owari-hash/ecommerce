# Design Polish & Deploy-Readiness — Design Spec

**Date:** 2026-06-28
**Repos:** `ecommerce` (storefront, localhost:7000) · `ecommerce-client` (admin, localhost:7002)
**Scope:** Visual polish only — no real payment/tax API integration. Keep red brand for the admin; storefront stays theme-driven.

## Goal

Make both apps look professional, modern, and consistent enough to deploy. Fix the specific weak spots the owner flagged (admin login, checkout/QPay, ebarimt) and do a consistency + responsiveness sweep across both apps.

## Hard Constraints

1. **Storefront color is tenant-driven, NOT fixed red.** `app/layout.tsx` injects `--color-primary` (+ `-dark`/`-light`) from the tenant's `primaryColor` setting. All storefront polish MUST use the `primary` / `primary-dark` / `primary-light` Tailwind tokens. **Never hardcode `red-*` or literal red in the storefront.** Existing hardcoded reds in checkout (`bg-red-50`, `text-red-500`, `border-red-500`, etc.) are bugs to convert to `primary` tokens.
2. **Admin (`ecommerce-client`) keeps its red chrome** (`#D32F2F` / `#B71C1C`) — that is the product's own brand, independent of any tenant.
3. **Responsive everywhere** — every touched screen must work cleanly at mobile (~375px), tablet (~768px), and desktop (~1440px).
4. **No new backend, no real API calls.** Payment/QR/ebarimt remain front-end flows that look professional. Leave clean structure where real APIs would later plug in.
5. Follow `AGENTS.md`: this Next.js may differ from training data — check `node_modules/next/dist/docs/` before using unfamiliar APIs.

## Design Language (shared foundation)

Applied consistently across both apps (admin in red, storefront in tenant token):

- **Surfaces:** cards `rounded-2xl`, `border-slate-100`, `shadow-sm`; consistent padding (`p-5`/`p-6`); single elevation system.
- **Typography:** scale = page title (`text-xl/2xl font-bold`) → section (`font-bold`/`font-semibold`) → label (`text-sm font-semibold`) → meta (`text-xs text-slate-400`). Inter base.
- **Controls:** one button system (primary solid / secondary outline / ghost), one input style (`rounded-xl`, consistent focus ring), one toggle component. Unify the slightly varied versions currently scattered across pages.
- **Spacing:** consistent vertical rhythm (`space-y-4`/`space-y-5` in forms, `gap-4` grids).
- **States:** every list/section has a designed empty state, loading state, and (where relevant) error state.

## Work Items

### A. Admin login — rebuild (`ecommerce-client/app/login/page.tsx`)
- Modern **split-screen**: left branded panel (store name — fix the empty `<h1>` slot at lines 46–47 — logo, subtle red gradient + soft pattern, one value line); right clean login card.
- Collapses to a centered card on mobile (panel hidden < `lg`).
- Polish: input focus states, password toggle alignment, error styling, demo-credential treatment (de-emphasized but legible).
- Keep existing mock-auth logic untouched (`useTenantAdmin().login`).

### B. Checkout payments — "QPay" problem (`ecommerce/app/checkout/CheckoutClient.tsx`)
- Replace emoji payment icons (lines 18–26) with **professional branded tiles**: each method gets an inline SVG logo/wordmark + brand color chip, selected state via `ring-primary`. Methods: QPay, SocialPay, MonPay, LendMN, Pocket, Бэлэн мөнгө, Лизинг.
- QPay modal (lines 425–453): **bank deeplink tiles** (ХААН, Голомт, ХХБ, Төрийн) with clean logo treatment instead of 🏦; replace the 📱 grey box with a **crisp styled QR placeholder** (SVG QR-pattern look).
- Polish the other method modals (SocialPay/MonPay/Cash/Leasing/LendMN/Pocket) to a consistent card style; drop the giant emoji blocks for clean iconography.
- Convert all hardcoded `red-*` to `primary` tokens.
- Keep `processPayment` / state logic intact.

### C. Ebarimt
- **Admin** (`ecommerce-client/app/(dashboard)/settings/page.tsx`): tighten the И-Баримт card (lines 750–828) — clearer hierarchy, consistent icon/heading style, better grouping of the auto-send toggle.
- **Checkout** (storefront): add a clean optional **И-Баримт block** — Хувь хүн / Байгууллага toggle + register-number field — styled with `primary` tokens. Stored in component state only (no API). Net-new but small; approved by owner.

### D. Consistency + responsiveness sweep
- **Admin pages:** dashboard, products, categories, brands, orders, customers, renters, homepage, settings, plus `Sidebar`, `TopBar`, `ClientLayout`. Align spacing, card style, typography, empty/loading states; verify mobile sidebar behavior.
- **Storefront pages:** home, listing (`s/[category]`, `[...slug]`), product detail, cart/checkout, account. Spacing, alignment, token usage, empty states, responsive grids.
- Resolve the Next.js dev `1 Issue` overlay — confirm whether it's a real runtime error (console showed errors on load) and fix or document.

## Out of Scope

- Real QPay/SocialPay/bank API integration, real ebarimt tax-API submission, real auth/session backend.
- New features beyond the small checkout ebarimt block.
- Data-model / API changes.

## Success Criteria

- Admin login looks like a finished professional product (no empty brand slot, no dead void), responsive.
- Checkout payment UI has zero emoji-as-icon; branded tiles + clean QR; responsive.
- Ebarimt is clearly presented in admin and available in checkout.
- Both apps visually consistent (shared design language) and responsive at 375 / 768 / 1440.
- No hardcoded red in storefront; admin red intact.
- No regressions in existing logic; dev console clean of real errors on the touched pages.

## Verification

For each touched area: load it via Playwright at desktop + mobile widths, screenshot, confirm against success criteria. Check console for errors. Spot-check tenant-color theming on storefront by confirming `primary` tokens (not literal red) are used.
