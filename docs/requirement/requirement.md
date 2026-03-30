
# 📄 REQUIREMENT: Coupon & Influencer System (Phase 1 MVP)

## 🎯 Objective

Implement a **coupon-based influencer attribution system** with:

1. Coupon handling in shop (discount + attribution)
2. Influencer links (auto-apply coupon)
3. Backend system (data + logic)
4. Internal UI (admin panel for operations)

---

# 🧩 1. SHOP CHANGES (Frontend + Checkout)

## 1.1 Coupon Input (Checkout)

### Requirements:

- Input field: `Enter discount code`
- Case insensitive (`anna10` = `ANNA10`)
- Only **one coupon allowed per order**

### Behavior:

- On apply → call API `/coupon/validate`
- Show:
    - discount amount
    - updated total

---

## 1.2 Coupon Auto-Apply via URL

### Requirement:

Support URL parameter:

```
?coupon=ANNA10
```

### Behavior:

- On page load:
    - read `coupon` param
    - auto-apply coupon
    - persist during session

---

## 1.3 Influencer Link

### Format:

```
/anna
```

### Behavior:

- Redirect → `/?coupon=ANNA10`
- Mapping stored in backend

---

## 1.4 Order Submission

On checkout:

- Send:

```
{
  cart_total,
  coupon_code (optional)
}
```

- Receive:

```
{
  final_total,
  discount_amount
}
```

---

# 🧠 2. BACKEND SYSTEM

## 2.1 Entities

### Influencer

```
id (uuid)
name
email
handle (optional)
status (active/inactive)
created_at
```

---

### Coupon

```
id (uuid)
code (unique)
influencer_id (fk)
discount_type (percent/fixed)
discount_value
usage_limit (optional)
used_count
valid_from
valid_to
status (active/inactive)
slug (for /anna link)
```

---

### Order (extend existing)

```
id
total_amount
discount_amount
final_amount
coupon_code
influencer_id
created_at
```

---

### Commission

```
id
order_id
influencer_id
commission_rate
commission_amount
status (pending/paid)
created_at
```

---

## 2.2 Business Logic

### Coupon Validation

Check:

- exists
- active
- within validity
- usage_limit not exceeded

### Discount Calculation

```
if percent:
  discount = total * (value / 100)

if fixed:
  discount = value
```

### Attribution

- If coupon used → assign influencer_id to order

---

### Commission Calculation

Triggered after successful payment:

```
commission = (final_amount) * commission_rate
```

---

## 2.3 API Endpoints

### POST /coupon/validate

```
input:
{ code, cart_total }

output:
{
  valid,
  discount,
  final_total,
  influencer_id
}
```

---

### POST /order/create

```
input:
{ cart_total, coupon_code }

output:
{
  order_id,
  discount,
  final_total
}
```

---

### GET /influencer/:id/stats

```
{
  total_orders,
  total_revenue,
  total_commission
}
```

---

### Internal: POST /commission/create

- triggered automatically

---

# 🖥️ 3. ADMIN UI (Coupon Backend)

## 3.1 Navigation

```
Dashboard
Influencers
Coupons
Orders
Commissions
```

---

## 3.2 Dashboard

Display:

- total revenue (coupon orders)
- total orders
- total commission
- top 5 influencers

---

## 3.3 Influencers Page

### Table:

```
Name | Email | Codes | Revenue | Status
```

### Actions:

- Create
- Edit
- Deactivate

---

## 3.4 Coupons Page

### Table:

```
Code | Influencer | Discount | Used | Revenue | Status
```

### Actions:

- Create
- Edit
- Disable

---

### Create Coupon Modal:

```
Code
Influencer (dropdown)
Discount (% or fixed)
Usage limit (optional)
Valid until (optional)
Slug (optional, e.g. "anna")
```

---

## 3.5 Orders Page

### Table:

```
Order ID | Amount | Coupon | Influencer | Date
```

---

## 3.6 Commissions Page

### Table:

```
Influencer | Orders | Revenue | Commission | Status
```

### Actions:

- Mark as paid
- Export CSV

---

# ⚙️ 4. UX RULES

- Max 2 clicks for any action
- Tables over complex UI
- No dashboards with charts (numbers only)
- Fast load, no heavy frontend logic

---

# ⚠️ 5. EDGE CASES

- Coupon case insensitive
- Expired coupon → reject
- usage_limit reached → reject
- Prevent negative totals
- Only one coupon per order

---

# 🔐 6. OUT OF SCOPE (DO NOT BUILD)

- Affiliate tracking (cookies)
- Multi-level commissions
- Payment automation
- Tax handling
- Influencer login/dashboard

---

# 🚀 7. ACCEPTANCE CRITERIA

System is complete when:

- Coupon can be created in UI
- Coupon works in checkout
- Influencer link redirects correctly
- Orders are attributed to influencer
- Commission is calculated automatically
- Admin can see stats per influencer

---

# 🔥 FINAL NOTE (IMPORTANT FOR DEV TEAM)

This is a **Phase 1 revenue system**, not a full affiliate platform.

Priorities:

1. Correct attribution
2. Stability
3. Speed of execution

Not priorities:

- perfect architecture
- scalability for millions
- advanced analytics