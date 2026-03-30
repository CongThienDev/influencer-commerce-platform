# Frontend Checkout Tasks (Coupon Input + Auto Apply + Link Redirect)

Updated: 2026-03-30
Suggested branch: `codex/frontend-checkout-coupon-flow`

## Goal

Hoàn tất flow checkout dùng coupon ở frontend public/shop:
- Nhập coupon
- Auto-apply từ URL
- Link influencer dạng slug (`/anna`) dẫn tới coupon apply

## Important Scope Note

- Repo hiện tại chủ yếu là admin app.
- Nếu checkout/public nằm ở repo khác, implement checklist này tại repo đó.
- Nếu muốn demo trong repo này, cần tạo module/page checkout tối thiểu trước.

## P0 - Coupon Input in Checkout

- [ ] Add coupon input UI: `Enter discount code`
- [ ] Enforce one coupon per order in client state
- [ ] Normalize UI input (case-insensitive behavior)
- [ ] On apply, call backend: `POST /v1/coupon/validate`
- [ ] Show:
  - [ ] `discount`
  - [ ] updated total (`final_total`)
- [ ] Show validation error based on `reason_code`

## P0 - Coupon Auto-Apply via URL

- [ ] Read `coupon` query param on page load:
  - [ ] `?coupon=ANNA10`
- [ ] Auto-call validate endpoint
- [ ] Persist applied coupon in session:
  - [ ] `sessionStorage` (recommended)
- [ ] Restore coupon state on reload during same session

## P0 - Influencer Link Redirect

- [ ] Support incoming short path like `/anna`
- [ ] Resolve slug by calling backend:
  - [ ] `GET /v1/coupon/slug/:slug`
- [ ] Redirect to canonical URL:
  - [ ] `/?coupon=ANNA10`
- [ ] Handle missing slug gracefully (404/not found UX)

## P0 - Checkout Submission

- [ ] On submit checkout, send:
  - [ ] `cart_total`
  - [ ] `coupon_code` (optional)
- [ ] Call backend: `POST /v1/order/create`
- [ ] Render backend source-of-truth values:
  - [ ] `discount`
  - [ ] `final_total`
- [ ] Prevent local recompute drift from backend totals

## P1 - UX/Behavior Rules

- [ ] Max 2 clicks for primary actions
- [ ] Lightweight UI only (table/form style, no heavy logic)
- [ ] Clear loading/error state during validate and order create
- [ ] Prevent negative total display in UI

## Test Checklist

- [ ] `anna10` and `ANNA10` produce same result
- [ ] Expired coupon rejected and message shown
- [ ] usage_limit reached rejected and message shown
- [ ] fixed discount > cart total clamps to zero final total
- [ ] Auto-apply from URL works on first load
- [ ] Session persistence survives page reload
- [ ] Slug `/anna` redirects to `/?coupon=...`
- [ ] Only one coupon can be active per order

## Definition of Done

- [ ] Coupon can be entered and validated at checkout
- [ ] URL coupon auto-apply works and persists in session
- [ ] Slug link resolves and redirects correctly
- [ ] Checkout submit uses backend-calculated totals
