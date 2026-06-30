# Storefront Polish, Step-Based Checkout & Live QPay Banks — Design Spec

**Date:** 2026-06-30
**Repo:** `ecommerce` (storefront, localhost:7000)
**Branch base:** `main`
**Scope:** Visual polish + responsive sweep for deployment, a 3-step checkout wizard, and live QPay bank display. No backend/data-model changes.

## Goal

Make the storefront look professional, modern, and responsive enough to deploy. Convert the checkout from a single-page layout into a guided multi-step wizard (matching the proven flow on the `preview-stores` branch). Surface QPay's real offered banks/wallets inline when QPay is selected. Do a consistency + responsiveness sweep across all customer-facing pages, taking layout/density/feel cues from turbotech.mn — **without** copying its palette.

## Hard Constraints

1. **Storefront color is tenant-driven, NOT fixed.** `app/layout.tsx` injects `--color-primary` (+ `-dark`/`-light`) from the tenant's `primaryColor`. All polish MUST use the `primary` / `primary-dark` / `primary-light` Tailwind tokens. **Never hardcode `red-*`, `orange-*`, or any literal brand color.** turbotech.mn is a *layout / density / feel* reference only — not a palette to copy. Existing hardcoded `bg-red-500` in `ProductCard` is a bug to convert to `primary`.
2. **Responsive everywhere** — every touched screen works cleanly at mobile (~375px), tablet (~768px), desktop (~1440px).
3. **QPay is a real integration — do not break it.** `app/api/qpay/invoice/route.ts` and `app/api/qpay/check/route.ts` proxy to the backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). Their fetch logic, payloads, and the 3s polling loop stay functionally untouched; only presentation changes.
4. **No new backend, no data-model/API changes.** Cash-on-delivery and order creation stay as the current `/api/orders/public` flow.
5. Follow `AGENTS.md`: this Next.js may differ from training data — check `node_modules/next/dist/docs/` before using unfamiliar APIs.

## Design Language (shared foundation)

- **Surfaces:** cards `rounded-2xl`, `border-gray-100`, `shadow-sm`; consistent padding (`p-4`/`p-5`); single elevation system.
- **Typography:** page title (`text-xl/2xl font-black`) → section (`font-bold`) → label (`text-sm font-semibold`) → meta (`text-xs text-gray-400`).
- **Controls:** one button system (primary solid / secondary outline / ghost), one input style (`rounded-xl`, consistent `focus:border-primary focus:ring-1 focus:ring-primary`).
- **Spacing:** consistent vertical rhythm (`space-y-4`/`space-y-5` in forms, `gap-4` grids).
- **States:** every list/section has a designed empty, loading, and (where relevant) error state.

## Work Items

### A. Checkout — 3-step wizard (`app/checkout/CheckoutClient.tsx`)

Restructure the current single-page grid into a guided wizard driven by the existing (currently-unused) `Stepper` component.

- **Step 0 — Сагс:** cart items list, quantity +/−, remove, clear-all, empty state.
- **Step 1 — Хүргэлтийн мэдээлэл:** customer/delivery form (овог, нэр, утас, и-мэйл optional, хаяг).
- **Step 2 — Төлбөр + И-Баримт:** payment method selection + И-Баримт (Хувь хүн / Байгууллага) toggle with register-number field for org.
- **Navigation:** per-step `canAdvance` gate (step 0 needs items, step 1 needs required fields, step 2 needs a selected method); "Үргэлжлүүлэх" / "Буцах" buttons; persistent order-summary sidebar (subtotal, shipping w/ free-threshold, total).
- **Preserve existing logic intact:** QPay invoice generation + polling, the И-Баримт picker modal, the success modal (incl. ebarimt lottery/bill/QR), guest-vs-logged-in CTA, tenant shipping fee/threshold.
- Stepper labels: `['Сагс', 'Захиалгын мэдээлэл', 'Төлбөр төлөх']` (3 steps, 0-indexed).

### B. Payment methods — trim to real options

- **Keep only:** **QPay** (real) and **Бэлэн мөнгө / cash on delivery** (creates a real order via `/api/orders/public`).
- **Remove:** SocialPay, MonPay, LendMN, Pocket, and Лизинг (leasing) — these were placeholder flows that only simulated a connection. Remove their tiles, their modal branches, and the now-unused `BrandLogo` entries / `paymentMethods` array members.
- Selected-state styling via `ring-primary`; clean branded tiles (no emoji-as-icon).

### C. QPay live bank display (new)

When the user selects **QPay** in Step 2:

- Immediately call `/api/qpay/invoice` (existing route, existing payload: `tenantId`, `zakhialgiinDugaar`, `dun`, `tailbar`).
- Render the **real returned `urls` array inline** in the payment section — each entry shows its `logo`, `name`/`description`, and the working per-invoice deeplink `link`. Plus the returned `qr_image` QR.
- Show a **loading state** while the invoice is being created and an **error state** if it fails (with retry).
- Keep the existing `/api/qpay/check` 3s polling; on `paid: true` → И-Баримт picker → success modal (unchanged).
- **Technical note:** bank deeplinks are per-invoice (the `link` embeds the invoice id), so the real list only exists after invoice creation — hence fetch-on-select rather than a pre-rendered static list. The current modal-based QPay rendering can be reused/relocated inline; polling and cleanup (`stopQpayPolling`, unmount clear) must be retained.

### D. Full storefront sweep (refined fresh, turbotech-inspired)

Polish + responsive pass using tenant tokens and the shared design language:

- **`ProductCard`:** convert `bg-red-500` discount badge → `primary`; tighten price / old-price / discount-% treatment; consistent grid density; preserve compare button, NEW/out-of-stock badges, image fallback chain.
- **Home sections:** `HeroBanner`, `CategoryList`, `ProductGrid`, `GroceryBento` — consistent section rhythm, responsive grids, loading skeletons.
- **`Header` / `MegaMenu` / `MobileBottomNav`:** clean top-bar + mega-menu category structure; mobile nav behavior.
- **`Footer`:** comprehensive multi-column (company, support/policies, brands, leasing, contact) collapsing cleanly on mobile.
- **Listing** (`[...slug]`, `s/[category]`), **product detail**, **account**, **search:** spacing, alignment, token usage, designed empty/loading states, responsive grids.

## Out of Scope

- Real SocialPay/MonPay/bank API integration (those methods are removed, not implemented).
- Real ebarimt tax-API submission, real auth/session backend changes.
- The `preview-stores` multi-store preview route, mock catalog, and tenant-config preview changes (explicitly NOT ported).
- New features beyond the checkout wizard, QPay inline banks, and the polish sweep.

## Success Criteria

- Checkout is a working 3-step wizard with stepper, per-step gating, and back/forward nav; all existing QPay/ebarimt/success logic still works.
- Only QPay and cash-on-delivery remain as payment methods; placeholder methods fully removed (no dead code).
- Selecting QPay fetches and displays the real offered bank/wallet list inline (with working deeplinks) plus QR, with loading + error states; polling still completes the order.
- Storefront pages visually consistent (shared design language) and responsive at 375 / 768 / 1440.
- No hardcoded red/orange in storefront — tenant `primary` tokens throughout.
- No regressions in existing logic; dev console clean of real errors on touched pages.

## Verification

For each touched area: load via Playwright at desktop (1440) + tablet (768) + mobile (375) widths, screenshot, confirm against success criteria, check console for errors. For checkout: walk all 3 steps; select QPay and confirm the live bank list + QR render (loading → loaded), confirm cash-on-delivery places an order. Spot-check tenant theming by confirming `primary` tokens (not literal colors) are used.
