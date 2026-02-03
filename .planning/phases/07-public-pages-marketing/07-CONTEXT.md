# Phase 7: Public Pages & Marketing - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Public-facing pages that convert visitors into paying customers. Homepage showcases the product value proposition and example videos. Pricing page presents subscription tiers clearly with comparison and FAQ. Goal is driving signups through clear messaging and social proof.

</domain>

<decisions>
## Implementation Decisions

### Homepage Hero & Value Proposition
- **Headline focus**: Price + quality combination ("Professional logo animations for intro/outros at fraction of traditional cost")
- **Hero visual**: Single animated example video auto-playing in hero section
- **Primary CTA**: "Get Started" button, centered below hero, leads directly to signup page
- **Supporting elements**: Claude's discretion (trust indicators, benefit bullets as appropriate)

### Example Videos & Social Proof
- **Number of examples**: Claude's discretion (balance between variety and overwhelming)
- **Video details displayed**: Style/category label (e.g., "Modern", "Cinematic") + Industry/use case (e.g., "Tech Startup", "E-commerce")
- **Social proof types**: Customer testimonials with names/photos + Usage statistics ("X videos created", "X customers") + Customer logos/brands
- **Presentation**: Integrated throughout homepage, not isolated to one section

### Pricing Presentation
- **Layout**: Side-by-side cards with equal emphasis (Starter and Professional)
- **Card emphasis**: Per-video cost breakdown + Credits included ("10 credits/month" or "30 credits/month")
- **Credit packs visibility**: Mentioned in FAQ or fine print, not prominently featured
- **Quality guarantee**: Technical failure guarantee messaging ("If technical issues prevent video delivery, we'll refund your credit")
- **Example-driven confidence**: "See exactly what you'll get - review our extensive examples"
- **Additional content**: FAQ section addressing common concerns ("Can I cancel anytime?", "What happens to unused credits?", etc.)

### Pricing Page UI (v1 Foundation)
- **Monthly/Annual toggle**: Visual space reserved, defaults to monthly billing
- **Promo code input**: Input field included near CTAs (functionality may be placeholder)
- Design accommodates future features even if backend not fully implemented in Phase 7

### Call-to-Action Strategy
- **Primary CTA flow**: "Get Started" → Direct to signup page (choose plan after account creation)
- **Secondary CTAs**:
  - "See Examples" button/link to scroll to video gallery
  - Repeated "Get Started" at bottom of homepage for scrollers
- **Pricing page CTAs**: Each tier has "Select Plan" button → signup page
- **Navigation**: Simple, clean - no urgency/scarcity messaging
- **Tone**: Straightforward value proposition, no artificial pressure

### Claude's Discretion
- Exact number of example videos to showcase
- Supporting elements in hero section (trust badges, benefit bullets)
- Specific FAQ questions to include
- Visual design details (spacing, typography, card styling)
- Mobile responsive adaptations

</decisions>

<specifics>
## Specific Ideas

- **Guarantee approach**: Not subjective quality ("I don't like it"), only technical failures (trackable, rare)
- **Future revision system**: v2 will offer revision credits for videos that don't meet standards - sets up natural upgrade path
- **No free trials in v1**: Videos cost money to produce, can't offer unlimited free generation
- **Messaging strategy**: Extensive examples set accurate expectations, reducing refund requests

</specifics>

<deferred>
## Deferred Ideas

- **Annual billing implementation** — Stripe setup for annual price IDs, $300/year option (save $60), prorated upgrades (post-Phase 7)
- **Promo code backend integration** — Stripe coupon system, "First month 50% off" functionality (post-Phase 7)
- **Video revision system with revision credits** — v2 feature, plan-based revision allowances (future milestone)

Phase 7 will include UI space/placeholders for annual toggle and promo codes, but full backend functionality is deferred.

</deferred>

---

*Phase: 07-public-pages-marketing*
*Context gathered: 2026-02-03*
