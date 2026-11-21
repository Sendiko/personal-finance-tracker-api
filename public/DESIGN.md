---
name: Kinetic Ledger
colors:
  surface: '#fcf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fcf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2f6'
  surface-container: '#f0edf1'
  surface-container-high: '#ebe7eb'
  surface-container-highest: '#e5e1e5'
  on-surface: '#1c1b1e'
  on-surface-variant: '#58423a'
  inverse-surface: '#313033'
  inverse-on-surface: '#f3eff3'
  outline: '#8c7168'
  outline-variant: '#e0c0b5'
  surface-tint: '#a83905'
  primary: '#a83905'
  on-primary: '#ffffff'
  primary-container: '#fe7743'
  on-primary-container: '#651e00'
  inverse-primary: '#ffb59b'
  secondary: '#496172'
  on-secondary: '#ffffff'
  secondary-container: '#cce6fa'
  on-secondary-container: '#4f6779'
  tertiary: '#7d544e'
  on-tertiary: '#ffffff'
  tertiary-container: '#c4938c'
  on-tertiary-container: '#4f2d27'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#812800'
  secondary-fixed: '#cce6fa'
  secondary-fixed-dim: '#b1cade'
  on-secondary-fixed: '#031e2d'
  on-secondary-fixed-variant: '#32495a'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#efbab2'
  on-tertiary-fixed: '#30130f'
  on-tertiary-fixed-variant: '#623d37'
  background: '#fcf8fc'
  on-background: '#1c1b1e'
  surface-variant: '#e5e1e5'
  income-green: '#4DB441'
  expense-burgundy: '#830100'
  text-high-emphasis: '#1A1A1A'
  text-placeholder: '#C3C3C3'
  surface-pure: '#FFFFFF'
  border-neutral: '#D9D9D9'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 30px
    letterSpacing: -0.01em
  currency-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: 0em
  currency-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  button-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '800'
    lineHeight: 20px
    letterSpacing: 0.01em
  input-label:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0em
  input-hint:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  tab-label:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.02em
  chip-label:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 2.5rem
---

## Brand & Style

This design system embraces an energetic, modern consumer fintech aesthetic that bridges structured financial discipline with playful warmth. Tailored for personal financial clarity and intuitive money tracking, the visual language avoids intimidating institutional sterility. Instead, it pairs grounded slate tones with vibrant citrus warmth, reinforcing confidence, positive financial habits, and active engagement.

The aesthetic follows a **High-Contrast Flat & Tactile** philosophy:
- **Bold Color Blocking:** Surfaces and containers are differentiated through confident fills rather than delicate gradients or translucent skeuomorphism.
- **Friendly Geometry:** Substantial 16px corner radii on containers, interactive fields, and action buttons create approachable, tactile surfaces that feel responsive to touch.
- **Expressive Typography:** High-density, geometric typography utilizing bold and extrabold weights anchors currency values and navigation labels with unwavering clarity.
- **Semantic Precision:** Financial activity states (inflow vs. outflow) are declared unambiguously using high-impact chromatic indicators, avoiding low-contrast ambiguity.

## Colors

The palette balances energetic optimism with structured authority. High-contrast solid fills drive the component hierarchy, while subtle neutral tints provide relief on wide canvas surfaces.

### Color Hierarchy & Roles
- **Primary (`#FE7743` - Tangerine Coral):** Primary brand accent for prominent interactive states, active transaction controls ("ALL"), active budget highlights, and key action calls.
- **Secondary (`#273F4F` - Deep Slate Navy):** Anchoring contrast color used for authoritative interaction targets, default segment rails, persistent bottom navigation chrome, and primary container fills.
- **Tertiary (`#A87A73` - Muted Rose Taupe):** Secondary functional accents, contextual group dividers, and soft metadata tags that balance the saturation of the coral tone.
- **Neutral Background (`#FFFBFF` - Warm Off-White):** High-luminance canvas base that prevents clinical glare while preserving pure contrast for white containers (`#FFFFFF`).

### Functional & Semantic Colors
- **Income (`#4DB441`):** Applied exclusively to positive cash flows, inflow toggle tabs, asset increases, and surplus budget meters.
- **Expense (`#830100`):** Applied to outflows, debt metrics, expense segment controls, and critical budget thresholds.
- **Text & Surface Contrast:** Default body labels leverage `#1A1A1A` on warm surfaces, switching to `#FFFBFF` for direct contrast over `#273F4F` and `#FE7743`. Inactive hints and bounding frames adopt `#C3C3C3` and `#D9D9D9`.

## Typography

The typography leverages **Plus Jakarta Sans** across all hierarchies, relying on dramatic weight shifts rather than multiple typefaces to establish structure.

- **Numerals & Balances:** All financial calculations, wallet totals, and card budget amounts are displayed in weights 700 (Bold) or 800 (ExtraBold). This guarantees readability during quick mobile glances.
- **Form & Interactive Labels:** Action triggers and form inputs use 700 to 800 weights to maintain high legibility even when rendered inside filled containers or against high-contrast backgrounds.
- **Body & Supportive Text:** Descriptions, transactional notes, and hint placeholders shift down to 400 (Regular) and 500 (Medium) weights to avoid competing with numerical data.
- **Caps & Badging:** Filter chips and segmented switch controls ("ALL", "EXPENSE", "INCOME") run in bold 14px typography with subtle tracking expansion for immediate recognition.

## Layout & Spacing

The layout is built on a mobile-first, 4px/8px incremental rhythm configured around an active mobile canvas width of **412px** and standard form containment of **348px**.

### Grid & Responsive Columns
- **Mobile (<600px):** 4-column fluid layout with `margin-mobile` (16px) margins and `gutter` (16px) gutters. Primary functional items, buttons, and form inputs expand to fill single-column spans or uniform `348px` centered tracks.
- **Tablet (600px - 1024px):** 8-column layout with 24px canvas margins. Budget metric cards and wallet containers shift from stacked full-width lists into balanced 2-column or 3-column modular grids.
- **Desktop (>1024px):** 12-column fixed container (max-width 1200px) with centered alignment, allowing side-by-side positioning of history feeds, budget visualizers, and analytical trend panels.

### Structural Dimensions
- **Form Controls & Action Heights:** Standardized height of `52px` for all primary inputs and major buttons to provide touch targets aligned with thumb interaction zones.
- **Segmented Rails:** Height of `34px` with a `2px` internal component track padding.
- **Persistent Bottom Navigation:** Fixed height of `82px` including bottom safe-area insets, distributing navigation items across consistent 87px cells with `21px` spacing intervals.

## Elevation & Depth

This system avoids blurred ambient drop shadows and skeuomorphic bevels, creating visual depth entirely through **Tonal Layering**, **High-Contrast Surface Stacking**, and **Shape Nesting**.

### Spatial Layering Hierarchy
1. **Base Floor (Canvas):** Rendered in `#FFFBFF`. Serves as the bottom viewport canvas for all sub-views.
2. **Surface Containers (Level 1):** Solid `#FFFFFF` or `#273F4F` panels that visually group transactions, wallet overviews, and budget cards. The sharp edge contrast between `#FFFBFF` and `#FFFFFF` provides clean boundary definition without rasterized shadow computation.
3. **Interactive Overlays & Floating Bars (Level 2):** The bottom navigation bar and active floating action sheets sit directly atop the content plane using contrasting solid white or slate fills paired with a crisp structural top separation edge (`#D9D9D9`, 1px).
4. **Pill Insets & Control Wells:** Segmented controls and filter strips use inverted dark or neutral wells (e.g., `#273F4F` rails hosting `#FE7743`, `#4DB441`, or `#830100` active pills), producing internal visual depth through solid fill transitions.

## Shapes

The interface utilizes a distinct shape hierarchy that combines friendly structural containers with soft utility badges and pill-shaped interactive toggles.

### Corner Radius System
- **16px Container & Control Radius (`rounded-lg` equivalent):** Applied universally to core functional blocks: Primary/Secondary Buttons, Input Text Fields, Budget Cards, and Wallet Summaries. This uniform 16px curve establishes the tactile, approachable identity of the application.
- **100px Fully-Rounded Pills:** Reserved exclusively for active segmented switches (e.g., transaction toggle states) and floating navigation highlights. The full pill shape signals immediate toggle readiness.
- **4px Micro-Radius:** Applied to categorical chips, transactional metadata indicators, and status badges. The minimal radius keeps compact metadata structured and distinct from large actionable elements.

## Components

### Buttons
- **Primary Button:** Fixed `52px` height, `16px` border radius, `#273F4F` fill, `#FFFBFF` label (`button-lg`, weight 800). Full width or `348px` base.
- **Secondary / Accent Button:** Fixed `52px` height, `16px` border radius, `#FE7743` fill with `#FFFBFF` text. Used for conversion-critical paths (e.g., "Add Transaction", "Set Budget").
- **Icon / Text Button:** Matches the `52px` baseline; uses subtle neutral fills or borderless framing with high-emphasis icons (`mdi:*` 32px or 18px).

### Input Fields
- **Primary Text Field:** Container height of `52px` with `16px` corner radius, `#FFFFFF` or `#FFFBFF` fill, no border. Label sits above input in `input-label` (`#1A1A1A`, 16px Bold, 8px bottom gap). Placeholder text rendered in `#C3C3C3`.
- **Secondary Centered Input:** Uses `#273F4F` text label styling with centered alignment for currency amounts and pin entry codes.

### Segmented Transaction Filter (ALL / EXPENSE / INCOME)
- **Track Rail:** Fixed `34px` height container filled with `#273F4F`, internal padding of `2px`, holding three segment cells (`81px` width each).
- **Active State - ALL:** Transforms the segment into a `100px` radius pill with `#FE7743` fill and `#FFFBFF` label.
- **Active State - EXPENSE:** Transforms the segment into a `100px` radius pill with `#830100` fill and `#FFFBFF` label.
- **Active State - INCOME:** Transforms the segment into a `100px` radius pill with `#4DB441` fill and `#FFFBFF` label.
- **Inactive States:** Transparent background fill on the active rail with `#FFFBFF` text at 70% opacity.

### Budget & Wallet Cards
- **Budget Card (`Card Budget`):** Sized for grid placement (`154px` width on mobile double column, or full width), `16px` radius, `#FE7743` background fill. Houses hero balance metrics (`Rp25.000`) rendered in `currency-lg` `#FFFFFF` with stacked label indicators.
- **Wallet Overview Card:** Layered `#FFFFFF` surface container with a `16px` corner radius. Contains account name, balance in `#1A1A1A`, and category icon in `#273F4F`.

### Category Chips & Badges
- **Compact Chips:** Fixed height `26px`-`28px`, `4px` corner radius.
- **Selected Chip:** `#FE7743` solid fill with `#FFFBFF` label and check indicator.
- **Unselected Chip:** `#FFFFFF` background, `#1A1A1A` text, and `#D9D9D9` container border with optional trailing action icons (`add_2`).

### Bottom Navigation Bar
- **Dimensions & Surface:** Fixed height `82px` spanning the viewport (`412px` base), pure white (`#FFFFFF`) surface fill with an unobtrusive top divider.
- **Destinations:** 4 evenly distributed slots: "Dashboard", "Wallets", "History", "Analytics" (`87px` target width each).
- **Icon Sizing & States:** `32px × 32px` bounding box for navigation icons. Inactive icons display outline variants in `#273F4F`; active states display filled variants paired with `#273F4F` bold typography labels (`tab-label`).