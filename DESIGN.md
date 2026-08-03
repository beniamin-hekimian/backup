# Etbokhly Design System Inspired by Fooby

## 1. Visual Theme & Atmosphere

Etbokhly's design system is a warm, approachable culinary style that blends organic character with clean modern structure: earthy colors led by sage green and warm amber, photography-first layouts with generous whitespace, minimal navigation that keeps discovery simple, and a typography mix that feels expressive yet readable. The overall tone is welcoming and practical, with food imagery as the hero and accessibility-conscious contrast guiding hierarchy across the experience.

## 2. Color Palette & Roles

Keep the palette focused on these core colors:

- **Sage Green** (`#7FAA47`): Primary brand color for CTAs, links, and main interactive states.
- **Warm Amber** (`#FAA61A`): Secondary color for warnings, alerts, and important highlights.
- **Charcoal Gray** (`#444444`): Tertiary text color for paragraphs, supporting copy, and general readability.
- **Forest Dark** (`#222222`): Strong heading and high-contrast text color for titles and key surfaces.
- **Bright Blue** (`#0068B2`): Support color for link hover states and secondary interactive elements.

Use white and light neutral surfaces as needed for backgrounds, borders, and spacing, but keep the main color language centered on these core roles.

## 3. Typography Rules

Use **Open Sans** as the main UI and content font across the product. It should be used for navigation, body text, forms, labels, buttons, and all supporting interface copy because it stays clear and readable at different sizes. Keep it regular for paragraphs and metadata, and use bold weights only when you need clear emphasis such as section titles, card headings, or key actions.

Use **Amatica SC** only as the display font for brand expression. It should appear in hero titles and major page headings where you want a warmer, culinary personality, but not in body text, forms, or dense UI areas. Keep its usage limited and intentional so it feels special and does not reduce readability.

Use **Merriweather** as a readable serif accent font for selective moments such as card titles and short, high-value text snippets (for example: recipe card names, section callouts, or short descriptive labels). Keep usage light and avoid long paragraphs in serif to maintain a clean UI rhythm.

**Note:** The typography system should stay simple: Open Sans handles clarity and usability, Amatica SC adds brand personality in hero moments, and Merriweather adds refined emphasis for short text accents like card titles.

## 4. Component Stylings

### Buttons

#### Primary Button

- **Background**: `#7FAA47`
- **Text Color**: `#FFFFFF`
- **Font**: Montserrat, 12px, weight 700
- **Padding**: `16px 35px`
- **Height**: `50px`
- **Border**: `0px none`
- **Border Radius**: `0px`
- **Line Height**: `15px`
- **Hover State**: Background `#6D9A3D`, slight darkening
- **Active State**: Background `#5F8732`
- **Disabled State**: Background `#CCCCCC`, Text Color `#999999`

#### Secondary Button (Outlined)

- **Background**: `#FFFFFF`
- **Text Color**: `#7FAA47`
- **Font**: Montserrat, 12px, weight 700
- **Padding**: `16px 35px`
- **Height**: `50px`
- **Border**: `2px solid #7FAA47`
- **Border Radius**: `0px`
- **Line Height**: `15px`
- **Hover State**: Background `#ECF1E7`, Border `#7FAA47`
- **Active State**: Background `#E0E8D6`, Border `#6D9A3D`
- **Disabled State**: Border `#CCCCCC`, Text Color `#999999`

#### Ghost Button (Text Only)

- **Background**: `transparent`
- **Text Color**: `#7FAA47`
- **Font**: Montserrat, 12px, weight 700
- **Padding**: `0px`
- **Height**: `auto`
- **Border**: `0px none`
- **Border Radius**: `0px`
- **Line Height**: `15px`
- **Hover State**: Text Color `#6D9A3D`, underline decoration
- **Active State**: Text Color `#5F8732`
- **Disabled State**: Text Color `#CCCCCC`

#### Icon Button

- **Background**: `transparent`
- **Icon Color**: `#999999`
- **Padding**: `5px`
- **Height**: `34px`
- **Width**: `34px`
- **Border**: `0px none`
- **Border Radius**: `0px`
- **Hover State**: Icon Color `#7FAA47`
- **Active State**: Icon Color `#6D9A3D`

### Cards & Containers

#### Recipe Card

- **Background**: `#FFFFFF`
- **Text Color**: `#222222`
- **Border**: `1px solid #E0E0E0`
- **Border Radius**: `0px`
- **Padding**: `0px`
- **Box Shadow**: `0px 2px 8px rgba(0, 0, 0, 0.08)`
- **Hover State**: Box Shadow `0px 4px 16px rgba(0, 0, 0, 0.12)`, slight lift effect
- **Image Area**: Full-width, no padding, aspect ratio 4:3 or 16:9
- **Content Padding**: `20px`
- **Title Font**: Open Sans, 16px, weight 400
- **Meta Font**: Open Sans, 12px, weight 400, Color `#999999`

#### Modal Container

- **Background**: `#FFFFFF`
- **Text Color**: `#222222`
- **Border Radius**: `0px`
- **Padding**: `40px`
- **Box Shadow**: `0px 10px 40px rgba(0, 0, 0, 0.16)`
- **Title Font**: Open Sans, 20px, weight 700
- **Title Color**: `#222222`
- **Body Font**: Open Sans, 14px, weight 400
- **Body Color**: `#444444`
- **Close Button**: Icon button, color `#999999`, hover `#444444`

#### Section Container

- **Background**: `#FFFFFF` or `#ECF1E7` for alternating sections
- **Padding**: `60px 40px`
- **Border Radius**: `0px`
- **Border**: `none`
- **Max Width**: `1200px` centered on parent

### Inputs & Forms

#### Text Input

- **Background**: `#FFFFFF`
- **Text Color**: `#444444`
- **Font**: Open Sans, 14px, weight 400
- **Padding**: `7px 13px`
- **Height**: `40px`
- **Border**: `1px solid #CCCCCC`
- **Border Radius**: `0px`
- **Line Height**: `24px`
- **Placeholder Color**: `#999999`
- **Focus State**: Border Color `#7FAA47`, Box Shadow `0px 0px 0px 2px rgba(127, 170, 71, 0.1)`
- **Error State**: Border Color `#FAA61A`, Background `#FFFBF0`
- **Disabled State**: Background `#F0F0F0`, Text Color `#999999`, Border Color `#E0E0E0`

#### Search Input

- **Background**: `#FFFFFF`
- **Text Color**: `#444444`
- **Font**: Open Sans, 16px, weight 400
- **Padding**: `12px 18px 12px 48px` (left padding for icon)
- **Height**: `50px`
- **Border**: `1px solid #F0F0F0`
- **Border Radius**: `0px`
- **Line Height**: `24px`
- **Icon Position**: Left, 18px from edge, color `#999999`
- **Focus State**: Border Color `#7FAA47`, Icon Color `#7FAA47`
- **Placeholder**: `#999999`, 16px, Open Sans

#### Form Label

- **Font**: Open Sans, 12px, weight 400
- **Color**: `#444444`
- **Margin Bottom**: `8px`
- **Line Height**: `17px`
- **Required Indicator**: Color `#FAA61A`

#### Form Group Spacing

- **Vertical Spacing**: `16px` between fields
- **Fieldset Padding**: `20px`
- **Fieldset Border**: `1px solid #E0E0E0`
- **Fieldset Legend**: Open Sans, 14px, weight 700, Color `#222222`

### Navigation

#### Primary Navigation

- **Background**: `transparent` or `#FFFFFF` on scroll
- **Text Color**: `#444444`
- **Font**: Open Sans, 16px, weight 400
- **Padding**: `0px 20px`
- **Height**: `50px`
- **Line Height**: `22.8px`
- **Hover State**: Text Color `#7FAA47`
- **Active State**: Text Color `#7FAA47`, Bottom Border `2px solid #7FAA47`
- **Disabled State**: Text Color `#CCCCCC`

#### Breadcrumb Navigation

- **Font**: Open Sans, 12px, weight 400
- **Color**: `#999999`
- **Separator**: `/` in `#999999`
- **Last Item (Active)**: Color `#444444`, weight 700
- **Link Hover**: Color `#7FAA47`
- **Padding**: `8px 0px`

#### Footer Navigation

- **Background**: `#222222`
- **Text Color**: `#FFFFFF`
- **Font**: Open Sans, 12px, weight 400
- **Link Color**: `#FFFFFF`
- **Link Hover**: Color `#7FAA47`
- **Padding**: `40px 20px`
- **Column Spacing**: `32px`

### Links

#### Standard Link

- **Color**: `#222222`
- **Font**: Open Sans, 14px, weight 400
- **Text Decoration**: `none`
- **Hover State**: Color `#7FAA47`, Text Decoration `underline`
- **Visited State**: Color `#0068B2`
- **Active State**: Color `#7FAA47`, Font Weight 700
- **Focus State**: Outline `2px solid #7FAA47`, Outline Offset `2px`

#### Inline Link (within body text)

- **Color**: `#0068B2`
- **Font**: Inherit
- **Text Decoration**: `underline`
- **Hover State**: Color `#1A77BA`
- **Focus State**: Outline `2px solid #1A77BA`

### Badges & Tags

#### Default Badge

- **Background**: `#ECF1E7`
- **Text Color**: `#7FAA47`
- **Font**: Open Sans, 10px, weight 700
- **Padding**: `4px 8px`
- **Border Radius**: `3px`
- **Line Height**: `14px`

#### Warning Badge

- **Background**: `#FFF4E6`
- **Text Color**: `#FAA61A`
- **Font**: Open Sans, 10px, weight 700
- **Padding**: `4px 8px`
- **Border Radius**: `3px`

#### Category Tag

- **Background**: transparent
- **Text Color**: `#444444`
- **Font**: Open Sans, 12px, weight 400
- **Border**: `1px solid #CCCCCC`
- **Padding**: `6px 12px`
- **Border Radius**: `0px`
- **Hover State**: Border Color `#7FAA47`, Background `#ECF1E7`

## 5. Layout Principles

### Spacing System

**Base Unit**: `4px`

**Spacing Scale**:

- `4px` - Micro spacing (icon padding, compact UI elements)
- `8px` - Tight spacing (inline element gaps, button icon spacing)
- `12px` - Compact spacing (form label gaps, small component padding)
- `16px` - Standard spacing (default padding, field spacing)
- `20px` - Comfortable spacing (card content padding, section gaps)
- `32px` - Generous spacing (component group spacing)
- `40px` - Large spacing (container padding, major sections)
- `60px` - Extra large spacing (section separators)
- `80px` - Hero spacing (page-level section breaks)

**Usage Context**:

- **4-8px**: Icon padding, tight component variants
- **12-16px**: Form inputs, button labels, field spacing
- **20px**: Card interiors, modal content, default container padding
- **32px**: Related component grouping, feature grids
- **40-60px**: Page sections, major content breaks
- **80px**: Above the fold transitions, hero-to-content boundaries

### Grid & Container

- **Max Container Width**: `1200px`
- **Horizontal Margin**: `40px` on desktop, `20px` on tablet, `16px` on mobile
- **Column Strategy**: 12-column flexible grid with `16px` gutter
- **Feature Grid**: Cards in grid of 3 on desktop, 2 on tablet, 1 on mobile with `32px` gap
- **Recipe Grid**: 4 columns on desktop, 3 on tablet, 2 on mobile with `20px` gap
- **Sidebar Pattern**: Main content 70%, sidebar 30% with `32px` gap

### Whitespace Philosophy

FOOBY embraces generous whitespace as a design principle. Sections breathe with vertical padding of `60px` minimum between major content blocks. Food photography is given space to shine without competing visual clutter. Around images, use `20px` minimum clearance. Navigation and supporting UI are layered minimally over content rather than competing for attention. The approach creates calm, readable layouts that honor both the food content and user focus.

### Border Radius Scale

- **Sharp** (`0px`): Default for all components—buttons, inputs, cards, containers. Creates clean, professional aesthetic aligned with FOOBY's modern culinary brand.
- **Micro Rounded** (`3px`): Input focus states, small badges and accent elements. Provides subtle softness without breaking the sharp aesthetic.
- **Full Rounded** (`50%`): Icon-only buttons, circular avatars, select inputs. Establishes geometric consistency.

## 6. Depth & Elevation

| Level        | Treatment                                       | Use                                                             |
| ------------ | ----------------------------------------------- | --------------------------------------------------------------- |
| Flat (0)     | `box-shadow: none`                              | Primary UI elements (buttons, navigation, inputs)               |
| Raised (1)   | `box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08)`   | Recipe cards, default container cards, standard content blocks  |
| Floating (2) | `box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12)`  | Card hover states, lifted elements, interactive feedback        |
| Modal (3)    | `box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.16)` | Modals, dropdowns, overlays, modal dialogs                      |
| Maximum (4)  | `box-shadow: 0px 20px 60px rgba(0, 0, 0, 0.20)` | Full-screen overlays, critical alerts, premium featured content |

**Shadow Philosophy**: Shadows in FOOBY are soft and subtle, designed to create gentle depth without drawing attention away from content. The shadow system uses low opacity black (`rgba(0, 0, 0, ...)`) with carefully calibrated blur and spread values. Shadows increase gradually with elevation to communicate interaction hierarchy. Most UI remains flat (`0px` shadow) to maintain the clean, modern aesthetic, with shadows introduced only where depth creates meaningful user guidance—particularly on interactive cards and modal overlays.

## 7. Do's and Don'ts

### Do

- **Do use Sage Green (`#7FAA47`)** as the primary accent for all primary CTAs and interactive highlights. It anchors the brand across all interactive moments.
- **Do pair Amatica SC with Open Sans** for headline + body combinations. The contrast between organic and geometric reads as accessible and approachable.
- **Do maintain sharp corners** (`0px` radius) on buttons, inputs, and cards. This is the FOOBY aesthetic—modern, clean, and professional.
- **Do give food photography generous whitespace**. Avoid cluttering hero images with overlapping UI elements.
- **Do use `50px` minimum height** for all clickable/tappable elements to meet accessibility touch-target standards.
- **Do apply subtle shadows** (Level 1-2) only when you need to communicate elevation. Flat design is the default.
- **Do use Open Sans for all UI copy**—navigation, labels, buttons. It's the workhorse font and ensures consistency.
- **Do layer warning states with `#FAA61A`** Warm Amber to flag alerts, disabled states, and important secondary information.
- **Do maintain consistent `16px` padding** inside cards and containers as the baseline; adjust only for density requirements.
- **Do test color contrast** against `#FFFFFF` backgrounds to ensure WCAG AA compliance (minimum 4.5:1 for text).

### Don't

- **Don't overuse Amatica SC.** It's reserved for hero sections and major headings. Using it for body or small text breaks readability and dilutes brand impact.
- **Don't apply corner radius larger than `3px`** on functional components. FOOBY's identity is sharp and modern, not rounded.
- **Don't use multiple accent colors interchangeably.** Sage Green is the primary; use Deep Orange and Electric Amber only for secondary CTAs or special promotions, not as alternatives.
- **Don't add shadows to flat elements** (buttons, inputs, navigation). Shadows are reserved for cards and overlays.
- **Don't set button heights below `50px`.** Touch targets smaller than this fail accessibility requirements and frustrate mobile users.
- **Don't use font sizes below `12px` for body text or labels.** Anything smaller becomes hard to read and fails accessibility standards.
- **Don't apply multiple box shadows** to a single element. Use a single, appropriately-sized shadow from the elevation scale.
- **Don't place important content below the fold without clear "scroll" affordance.** FOOBY's hero-driven layout requires immediate visual hierarchy.
- **Don't mix navigation font styles.** Navigation should always be Open Sans 16px, weight 400. Consistency builds trust.
- **Don't use `#000000` (pure black) for text.** Use `#222222` (Forest Dark) for primary text and `#444444` (Charcoal) for secondary text instead—it's softer and more refined.

## 8. Responsive Behavior

### Breakpoints

| Name               | Width         | Key Changes                                                                         |
| ------------------ | ------------- | ----------------------------------------------------------------------------------- |
| Mobile (XS)        | 320px–479px   | Single-column layout, 16px horizontal padding, stacked navigation, full-width cards |
| Mobile (SM)        | 480px–767px   | Single-column, 20px padding, stacked components, mobile-first forms                 |
| Tablet (MD)        | 768px–1023px  | 2-column grid, 32px padding, collapsible nav, optimized card dimensions             |
| Desktop (LG)       | 1024px–1439px | 3-4 column grid, 40px padding, full navigation visible, sidebar layouts             |
| Large Desktop (XL) | 1440px+       | 4-column grid, max-width `1200px` container, generous margins, expanded sidebar     |

### Touch Targets

- **Minimum Tappable Area**: `50px × 50px` for all buttons and interactive elements
- **Spacing Between Targets**: `8px` minimum clearance between adjacent clickable areas
- **Icon Button Sizing**: `34px × 34px` minimum, preferably `44px × 44px` on mobile
- **Form Input Height**: `40px` on mobile, `50px` on desktop
- **Link Padding**: `8px` vertical clearance around inline links for finger-friendly targeting

### Collapsing Strategy

- **Navigation**: Primary navigation collapses to hamburger menu at `< 768px`. Submenu items stack vertically in slide-out drawer.
- **Grid Layouts**: Feature grids collapse from 4→3→2→1 column as viewport shrinks. Gap reduces from `32px` (desktop) to `20px` (tablet) to `16px` (mobile).
- **Cards**: Recipe cards maintain aspect ratio but scale width responsively. Title and metadata remain visible; image area prioritized.
- **Modals**: Modal padding reduces from `40px` to `20px` on mobile. Modal max-width capped at `90vw`.
- **Typography**: Display type (`Amatica SC 55px`) reduces to `36px` on tablet, `28px` on mobile. Body text remains `14px` minimum for readability.
- **Spacing**: Vertical sections reduce from `60px` to `40px` (tablet) to `32px` (mobile). Horizontal padding follows breakpoint adjustments.
- **Sidebar**: Sidebar pattern collapses to single-column stacked layout at `< 1024px`. Main content takes full width.

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA**: Sage Green (`#7FAA47`)
- **Secondary CTA**: Deep Blue (`#0068B2`)
- **Background (Default)**: True White (`#FFFFFF`)
- **Background (Subtle)**: Cream Neutral (`#ECF1E7`)
- **Heading Text**: Forest Dark (`#222222`)
- **Body Text**: Charcoal (`#444444`)
- **Supporting Text**: Medium Gray (`#999999`)
- **Borders**: Border Gray (`#E0E0E0`) or Input Border (`#CCCCCC`)
- **Warning / Alert**: Warm Amber (`#FAA61A`)
- **Disabled State**: Light Gray (`#F0F0F0`) background with Medium Gray text

### Iteration Guide

1. **Start with Sage Green** (`#7FAA47`) for all primary interactive elements—buttons, links, and active states. This is the brand's core identity.

2. **Use Open Sans exclusively** for UI copy, navigation, forms, and body text. Reserve `Amatica SC` only for hero headings and major section titles. Never use display fonts for small text.

3. **Keep all component corners sharp** (`0px` radius) except for small badges (`3px`) and circular icons (`50%`). This is the FOOBY aesthetic.

4. **Apply shadows conservatively**: No shadow for flat elements; Level 1 (`0px 2px 8px`) for cards; Level 2 (`0px 4px 16px`) on hover; Level 3 (`0px 10px 40px`) for modals only.

5. **Set button height to `50px` minimum** and padding to `16px 35px` for primary buttons. All tappable targets must be at least `50px × 50px`.

6. **Typography Hierarchy is strict**: Display `55px` → Heading 1 `44px` → Heading 2 `20px` → Body `14px-16px` → Label `12px`. Do not deviate from these sizes.

7. **Use `60px` vertical padding** between major sections on desktop, reducing to `40px` on tablet and `32px` on mobile. This is non-negotiable for FOOBY's breathing, calm aesthetic.

8. **Form inputs follow these rules**: `14px` font, `40px` height on standard inputs, `50px` on search inputs. Border always `1px solid #CCCCCC` until focus (change to `#7FAA47`).

9. **Neutral colors carry the load**: Use `#444444` (Charcoal) for body text and `#222222` (Forest Dark) for headings. Never use pure `#000000`; it's too harsh. Medium Gray (`#999999`) for disabled / placeholder states.

10. **Color contrast is mandatory**: All text must meet WCAG AA compliance (4.5:1 minimum for body text). Test Sage Green (`#7FAA47`) against white—it passes at 4.5:1. Test all custom color combinations before implementation.

11. **Grid system**: 12-column layout at desktop with `16px` gutter. Max container width `1200px`. Recipe cards in responsive 4-column (desktop) → 3-column (tablet) → 2-column (mobile) → 1-column (XS mobile).

12. **Food imagery is king**: Never place UI elements directly over recipe photos unless absolutely necessary. Use semi-transparent overlays (`rgba(0, 0, 0, 0.2)` maximum) if text must layer. Photography should dominate cards.
