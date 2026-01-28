# Phase 3: Subscription & Credits - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can subscribe to plans (Starter/Professional) and credit system tracks usage. This phase delivers the payment infrastructure via Stripe and credit accounting system. Users pay to access video creation, and the system tracks credit allocation, consumption, and transaction history.

</domain>

<decisions>
## Implementation Decisions

### Subscription UI/UX
- Dashboard shows prominent upgrade CTA after signup (not forced immediately)
- Plan selection page uses side-by-side cards (not table comparison)
- Manage subscription via modal from dashboard (not dedicated page)
- Modal shows full details: current plan, billing cycle, next renewal date, payment method, upgrade/downgrade/cancel buttons
- No offloading to Stripe Customer Portal — in-app management

### Subscription Lifecycle
- **Upgrade (Starter → Professional):** Claude's discretion (likely immediate with proration)
- **Downgrade (Professional → Starter):** At period end — keep Professional until current billing period ends, then downgrade
- **Cancellation:** At period end — keep access until billing period ends, then cancel
- **Payment failure:** Claude's discretion (likely Stripe retry + grace period for customer retention)

### Claude's Discretion
- Exact upgrade flow implementation (immediate proration vs scheduled)
- Payment failure handling specifics (retry logic, grace period duration)
- Credit display design on dashboard
- Credit pack purchasing flow (if implemented this phase)
- Low credit warning thresholds and presentation
- Transaction history UI

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-subscription-credits*
*Context gathered: 2026-01-28*
