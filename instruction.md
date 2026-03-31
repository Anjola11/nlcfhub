# NLCFHUB — Frontend Design & Implementation Specification
**Version 1.0 · For AI Agent Development**
*React + Vite · Tailwind CSS · GSAP · Plus Jakarta Sans / Satoshi / Inter / JetBrains Mono*

---

## 0. GLOBAL DESIGN SYSTEM

### 0.1 Color Tokens (CSS Custom Properties)

```css
:root {
  /* Backgrounds */
  --bg-canvas:        #FDFBF7;   /* Off-white/cream — app canvas */
  --bg-canvas-dim:    #F5F2EC;   /* Slightly darker cream for hover zones */

  /* Surfaces */
  --surface-navy:     #1A1C3B;   /* NLCF Deep Navy — primary dark cards, sidebar */
  --surface-gold:     #EBB736;   /* NLCF Gold — hero highlight card, CTAs */
  --surface-white:    #FFFFFF;   /* Pure white — nested bento cards */
  --surface-overlay:  rgba(26, 28, 59, 0.6); /* Navy at 60% — modal backdrop */

  /* Text */
  --text-primary:     #1A1C3B;   /* Navy — headlines and body on light bg */
  --text-inverse:     #FDFBF7;   /* Cream — text on navy and gold surfaces */
  --text-secondary:   #64748B;   /* Cool slate — subtext, metadata */
  --text-muted:       #94A3B8;   /* Lighter slate — placeholders, disabled */

  /* Borders */
  --border-subtle:    #E2E0D9;   /* 1px border on white cards on cream bg */
  --border-focus:     #EBB736;   /* Gold ring on focused inputs */

  /* Status */
  --status-success:   #22C55E;
  --status-error:     #EF4444;
  --status-warning:   #F59E0B;

  /* Radius */
  --radius-card:      22px;
  --radius-button:    9999px;    /* Pill */
  --radius-input:     14px;
  --radius-badge:     9999px;
  --radius-modal:     24px;
  --radius-avatar:    9999px;    /* Always fully round */
}
```

### 0.2 Typography

**Font Loading (index.html `<head>`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

**Type Scale:**

| Role | Font | Weight | Size (rem) | Line Height | Letter Spacing |
|------|------|--------|------------|-------------|----------------|
| `display` | Plus Jakarta Sans | 800 | 2.25rem (36px) | 1.2 | -0.02em |
| `heading-1` | Plus Jakarta Sans | 700 | 1.75rem (28px) | 1.25 | -0.01em |
| `heading-2` | Plus Jakarta Sans | 700 | 1.25rem (20px) | 1.3 | -0.01em |
| `heading-3` | Plus Jakarta Sans | 600 | 1rem (16px) | 1.4 | 0 |
| `body-lg` | Inter | 500 | 1rem (16px) | 1.6 | 0 |
| `body` | Inter | 400 | 0.875rem (14px) | 1.6 | 0 |
| `caption` | Inter | 500 | 0.75rem (12px) | 1.4 | 0.02em |
| `mono-data` | JetBrains Mono | 500 | 0.875rem (14px) | 1.5 | 0 |
| `mono-sm` | JetBrains Mono | 400 | 0.75rem (12px) | 1.4 | 0 |

### 0.3 Spacing System (Tailwind 4-unit base)
Use Tailwind's default spacing scale. Key values:
- `4px` (`p-1`) — tight internal padding for badges
- `8px` (`p-2`) — badge padding horizontal
- `12px` (`p-3`) — compact element padding
- `16px` (`p-4`) — standard content padding
- `20px` (`p-5`) — card internal padding
- `24px` (`p-6`) — generous card padding
- `32px` (`p-8`) — section separation
- `48px` (`p-12`) — large layout gap
- `64px` (`p-16`) — hero spacing

### 0.4 GSAP Setup

Install: `npm install gsap`

**GlobalAnimations.js** — import in `main.jsx`:
```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Page-enter default: fade + translate Y
export const pageEnter = (el) =>
  gsap.from(el, { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out' });

// Stagger children on mount
export const staggerReveal = (parent, selector = ':scope > *') =>
  gsap.from(parent.querySelectorAll(selector), {
    opacity: 0, y: 20, duration: 0.4, stagger: 0.07, ease: 'power2.out',
  });

// Card hover lift — attach to onMouseEnter/onMouseLeave
export const cardLift = (el) => gsap.to(el, { y: -6, duration: 0.25, ease: 'power2.out' });
export const cardDrop = (el) => gsap.to(el, { y: 0, duration: 0.25, ease: 'power2.out' });

// Button gold flash (copy success)
export const flashGold = (el, originalLabel, cb) => {
  gsap.to(el, { backgroundColor: '#EBB736', duration: 0.15, ease: 'power1.out',
    onComplete: () => setTimeout(() => { gsap.to(el, { backgroundColor: '', duration: 0.3 }); cb(); }, 1400)
  });
};
```

### 0.5 Reusable Components Inventory

Before page specs, these atoms are used everywhere:

#### Badge
```
<Badge variant="subgroup" | "member-type" | "status" | "days">
```
- **subgroup**: bg `--surface-navy` text `--text-inverse`, font `caption`, padding `4px 10px`, radius `9999px`
- **member-type** Active: bg `#EBB7361A` (gold 10%) text `#B8860B`, border `1px solid #EBB736`
- **member-type** Alumni: bg `#1A1C3B1A` (navy 10%) text `#1A1C3B`, border `1px solid #1A1C3B`
- **status** Active: green dot + "Active" text
- **days** ("In 3 days" / "Today"): bg `--surface-gold` text `--text-primary` font `mono-sm` bold

#### Button
```
<Button variant="primary" | "secondary" | "ghost" | "danger" | "gold-icon">
```
- **primary**: bg `--surface-navy`, text `--text-inverse`, padding `12px 24px`, radius `9999px`, font `body-lg` weight 600. Hover: bg lightens to `#2D3060`. Active: scale 0.97.
- **secondary**: border `1.5px solid --surface-navy`, bg transparent, text `--text-primary`. Hover: bg `--surface-navy` text `--text-inverse`.
- **ghost**: no border, no bg, text `--text-secondary`. Hover: bg `--bg-canvas-dim`.
- **danger**: bg `--status-error`, text white.
- **gold-icon**: bg `--surface-gold`, text `--text-primary`, square `40×40px`, radius `12px`, for icon-only actions.
- All buttons: `transition-all duration-200`. Loading state: spinner SVG (18px, navy or cream) replaces label, button disabled opacity 0.7.
- GSAP on copy-success: `flashGold(buttonRef.current, label, resetLabel)`.

#### Input Field
```
<Input label="Full Name" hint="Optional hint" error="Error message" />
```
- Container: `flex flex-col gap-1.5`
- Label: font `caption`, color `--text-primary`, weight 600, uppercase, letter-spacing 0.05em
- Input element: bg `--surface-white`, border `1px solid --border-subtle`, radius `--radius-input` (14px), padding `14px 16px`, font `body-lg`, color `--text-primary`, height `52px`
- Focus: border `2px solid --border-focus`, outline none, shadow `0 0 0 3px rgba(235,183,54,0.2)`
- Error: border `1.5px solid --status-error`, hint text `--status-error`
- Placeholder color: `--text-muted`

#### Avatar
- **Sizes**: `sm` 32px, `md` 48px, `lg` 80px, `xl` 120px, `2xl` 160px
- Shape: always circle (`radius: 9999px`)
- Photo: `object-fit: cover`, `object-position: center`
- Fallback (no photo): bg `--surface-navy`, text `--text-inverse`, initials in Plus Jakarta Sans weight 700, font-size 40% of avatar diameter
- Border: `3px solid --surface-white` on dark backgrounds

#### Skeleton Loader
- bg `--border-subtle`, animated shimmer left-to-right using GSAP `gsap.to` on a pseudo-overlay going from `opacity:0` to `opacity:1` to `opacity:0` on a 1.4s repeat loop, or using `animate-pulse` in Tailwind with a custom shimmer gradient.
- Shapes match destination content exactly (e.g. card skeleton has same 22px radius, same proportions as the birthday card).

#### Toast Notification
- Fixed position: `bottom-24px right-24px` (on desktop); `bottom-16px left-16px right-16px` (mobile, full width)
- Stacks vertically with `8px` gap between toasts
- bg: success=`#F0FDF4` border-left `4px solid --status-success`; error=`#FEF2F2` border `4px solid --status-error`; default=`--surface-white` border `4px solid --surface-navy`
- Radius `16px`, padding `14px 18px`, shadow `0 4px 20px rgba(0,0,0,0.08)`
- Contains: icon left (20px), message `body` font, close button `ghost` 20px right
- GSAP enter: `gsap.from(el, { x: 80, opacity: 0, duration: 0.35, ease: 'back.out(1.4)' })`
- GSAP exit: `gsap.to(el, { x: 80, opacity: 0, duration: 0.25, ease: 'power2.in' })` then remove from DOM
- Auto-dismiss: 4000ms

#### Modal Shell
- Backdrop: `fixed inset-0 z-50 bg-[--surface-overlay]`, GSAP `gsap.from(backdropRef, { opacity: 0, duration: 0.2 })`
- Panel: centered, max-width `560px` on desktop, full-width on mobile, radius `--radius-modal` (24px), bg `--surface-white`
- GSAP panel enter: `gsap.from(panelRef, { scale: 0.94, opacity: 0, y: 20, duration: 0.35, ease: 'back.out(1.5)' })`
- Header: padding `24px 24px 0`, heading-2 font, close button `gold-icon` variant top-right
- Body: padding `24px`
- Footer: padding `0 24px 24px`, `flex gap-3 justify-end`
- Mobile: slides up from bottom with `gsap.from(panelRef, { y: '100%', duration: 0.4, ease: 'power3.out' })`

---

## 1. APP SHELL & ROUTING

### 1.1 Route Structure
```
/                        → redirect to /register
/register                → MemberRegistrationPage
/me/:memberId            → MemberSelfEditPage (requires ?token= param)
/admin/login             → AdminLoginPage
/admin                   → AdminDashboardPage (protected)
/admin/members           → AdminMembersPage (protected)
/admin/settings          → AdminSettingsPage (protected)
/admin/log               → AdminNotificationLogPage (protected)
```

Protected routes: if no valid access token in memory, redirect to `/admin/login`.

### 1.2 App Layout: Admin Shell

Applied to all `/admin/*` pages (except `/admin/login`).

**Structure:**
```
<div class="flex h-screen overflow-hidden bg-[--bg-canvas]">
  <Sidebar />                           /* Fixed left, 240px wide on lg+ */
  <div class="flex flex-col flex-1 overflow-hidden">
    <TopBar />                          /* Fixed top, 64px tall */
    <main class="flex-1 overflow-y-auto p-8"> /* Scrollable content area */
      <Outlet />
    </main>
  </div>
</div>
```

On mobile (`< 1024px`): Sidebar collapses. TopBar shows a hamburger icon (`☰`) that triggers a GSAP slide-in drawer from the left (`gsap.from(drawerRef, { x: -280, duration: 0.35, ease: 'power3.out' })`).

### 1.3 Sidebar Component

**Dimensions:** `240px` wide × full viewport height. `position: fixed` left 0 top 0 on `lg+`.

**Background:** `--surface-navy`

**Top section — Brand:**
- Height `72px`, `flex items-center px-6`
- NLCF logo image (32×32px circle, white border 2px) + text "NLCFHUB" in Plus Jakarta Sans weight 800, size `18px`, color `--text-inverse`, letter-spacing -0.01em
- Subtle separator: `1px solid rgba(255,255,255,0.08)` below

**Navigation Links** (vertical stack, `mt-4`):
Each nav item:
- Padding: `12px 20px`, radius `12px`, margin `0 12px 2px`
- Icon: 20px SVG Lucide icon, color `rgba(253,251,247,0.5)` by default
- Label: font `body`, weight 500, color `rgba(253,251,247,0.5)` by default
- Active state: bg `rgba(235,183,54,0.15)`, icon + label color `--surface-gold`, left border `3px solid --surface-gold`
- Hover (non-active): bg `rgba(253,251,247,0.06)`, icon + label color `rgba(253,251,247,0.8)`
- GSAP hover: `gsap.to(iconEl, { scale: 1.1, duration: 0.2 })` on enter, reverse on leave

Nav items (in order):
1. `LayoutDashboard` icon — "Dashboard" — `/admin`
2. `Users` icon — "Members" — `/admin/members`
3. `Bell` icon — "Notifications" — `/admin/settings`
4. `ScrollText` icon — "Log" — `/admin/log`

**Bottom section:**
- Separator `1px solid rgba(255,255,255,0.08)` above
- Admin email address in `caption` font, color `rgba(253,251,247,0.4)`, truncated with ellipsis
- Logout button: ghost variant, full width, `LogOut` icon 16px + "Sign out", color `rgba(253,251,247,0.5)`, hover `--status-error` color

### 1.4 TopBar Component

**Height:** `64px`. `position: sticky top-0 z-10`. bg `--bg-canvas`. `border-bottom: 1px solid --border-subtle`.

**Layout:** `flex items-center justify-between px-8`

**Left:** Page title — dynamically set per page. Plus Jakarta Sans weight 700, size `20px`, color `--text-primary`.

**Right side (flex gap-3):**
1. Search icon button (on members page, auto-focuses the filter search)
2. Avatar circle `md` size (40px) with admin initials, bg `--surface-navy`, tooltip "Admin"

---

## 2. PAGE: MEMBER REGISTRATION (`/register`)

### 2.1 Purpose
Public page — anyone with the link can access. Members self-register. Mobile-first, must complete in under 2 minutes.

### 2.2 Overall Layout

**Background:** `--bg-canvas` (#FDFBF7) full viewport.

**Page structure (no sidebar, no topbar):**
```
<div class="min-h-screen flex flex-col items-center justify-start px-4 py-12">
  <RegistrationCard />
</div>
```

**Background decoration:** Subtle radial gradient behind the card:
```css
background: radial-gradient(ellipse 800px 600px at 50% -100px, rgba(235,183,54,0.08), transparent);
```

### 2.3 Registration Card

**Card container:**
- Width: `100%` max-width `480px`
- bg `--surface-white`
- Border `1px solid --border-subtle`
- Radius `--radius-card` (22px)
- Padding `40px 36px` on desktop, `28px 20px` on mobile
- Shadow: none (relies on border contrast against cream bg)

**GSAP mount animation:** `gsap.from(cardRef, { opacity: 0, y: 24, duration: 0.5, ease: 'power3.out' })`

### 2.4 Card Header

- NLCF logo (48×48px circle with `object-fit: cover`) — centered horizontally
- `margin-bottom: 8px`
- Heading: "Register for NLCFHUB" — `heading-1` font (Plus Jakarta Sans 700 28px), color `--text-primary`, `text-align: center`
- Subheading: "Join the NLCF birthday registry. Takes less than 2 minutes." — `body` font Inter, color `--text-secondary`, `text-align: center`, `margin-top: 4px`
- `margin-bottom: 32px`

### 2.5 Photo Upload Section (rendered first, above form fields)

**Container:** centered, width `160px`, height `160px`, `position: relative`, `margin: 0 auto 28px`

**States:**

**(A) No photo selected (default):**
- Circle `160px` diameter
- Border: `2px dashed #CBD5E1` (slate-300)
- bg: `#F8FAFC`
- Center content: `Camera` Lucide icon (32px, color `--text-muted`) + text "Add photo" `caption` font color `--text-muted` below
- Hover: border color `--surface-gold`, bg `rgba(235,183,54,0.04)`, cursor `pointer`
- GSAP hover: `gsap.to(iconEl, { scale: 1.15, duration: 0.2 })`

**(B) Photo selected (preview):**
- Circle `160px`, `overflow: hidden`
- Shows selected image with `object-fit: cover`
- Overlay on hover: semi-transparent navy `rgba(26,28,59,0.5)` with `Edit` icon (24px white) centered — GSAP `gsap.to(overlayEl, { opacity: 1, duration: 0.2 })`
- Remove button: `×` icon, 24px circle, bg `--status-error`, white ×, `position: absolute top-2 right-2`

**(C) Uploading:**
- Photo preview dimmed to 50%
- Circular progress ring (SVG, 160px) animated via GSAP `gsap.to(progressRing, { strokeDashoffset: calculated, duration: progressDuration })`
- Center: percentage text `mono-data` font

**Hidden `<input type="file" accept="image/jpeg,image/png,image/webp">` triggered on click.**

**Helper text below photo:** `caption` color `--text-muted`, centered: "Optional · JPEG, PNG or WEBP · Max 5 MB"

### 2.6 Form Fields (stacked, gap-5)

Fields render with GSAP stagger on mount: `staggerReveal(formRef, '.field-wrapper')` — each field fades in with `y: 12` delay offset.

**Field 1: Full Name**
- Label: "FULL NAME"
- Input: type `text`, placeholder "e.g. Adewale Johnson", autocomplete `name`
- Validation: required, min 2 chars

**Field 2: Phone Number**
- Label: "PHONE NUMBER"
- Layout: `flex gap-2`
  - Left pill: `+234` — bg `--bg-canvas-dim`, border `1px solid --border-subtle`, padding `14px 14px`, radius `14px`, font `mono-data`, color `--text-secondary`, not editable, width `74px`
  - Right input: type `tel`, placeholder "080 1234 5678", flex-1
- Validation: required, digits only after +234, 10 digits

**Field 3: Birthday (two-field)**
- Label: "BIRTHDAY"
- Layout: `flex gap-3`
  - Day selector: custom `<select>` styled to match input. Options 1–31. Placeholder "Day". Flex-basis `40%`.
  - Month selector: custom `<select>`. Options: January, February … December. Placeholder "Month". Flex-1.
- Custom select styling: same as Input style. On focus same gold border. Arrow replaced with custom chevron SVG (navy).
- No year field — deliberately omitted.

**Field 4: Subgroup**
- Label: "SUBGROUP"
- Custom `<select>` full width, populated from `GET /subgroups`
- Options: Choir, Ushers, Media, Welfare, Workers, Exco, General
- While loading: input shows "Loading..." disabled, subtle pulse

### 2.7 Submit Button

- Full width
- Label: "Complete Registration"
- variant: `primary` (navy bg, cream text, pill radius)
- Height: `56px`
- Font: Plus Jakarta Sans weight 700, size `16px`
- Loading state: spinner 18px cream + "Registering…" label
- `margin-top: 32px`

### 2.8 Success Screen (replaces form after successful POST)

GSAP transition: current card content `gsap.to(formContentRef, { opacity: 0, y: -16, duration: 0.3 })`, then success content `gsap.from(successContentRef, { opacity: 0, y: 16, duration: 0.4, delay: 0.2 })`.

**Success card content:**

- Animated checkmark: SVG circle (80px, stroke `--surface-gold`, `stroke-dasharray`/`stroke-dashoffset` GSAP draw animation over 0.6s) with checkmark path inside
- Heading: "You're registered, {first_name}! 🎉" — `display` font, centered
- Subtext: "Your birthday has been added to the NLCFHUB registry." — `body` color `--text-secondary`, centered

**Edit link box:**
- Label: "YOUR EDIT LINK" — `caption` uppercase, color `--text-secondary`
- Box: bg `--bg-canvas-dim`, border `1px solid --border-subtle`, radius `14px`, padding `12px 16px`
- URL text: `mono-sm` font, color `--text-secondary`, truncated with ellipsis, `user-select: all`
- Copy button to the right: `gold-icon` variant with `Copy` icon (16px)
- On copy: GSAP `flashGold`, button text swaps to "Copied!"

- Instruction text: "Save this link — it's how you update your profile later. We'll never ask for a password." — `caption` color `--text-muted`, centered, `margin-top: 16px`

---

## 3. PAGE: MEMBER SELF-EDIT (`/me/:memberId?token=`)

### 3.1 Purpose
Pre-populated edit form for a member who has their edit link. Token validated on mount via `GET /members/self/{memberId}/{token}`. If token invalid: show full-screen error state.

### 3.2 Layout
Same outer structure as `/register` (no sidebar, centered card). Max-width `480px`.

### 3.3 Card Header

- NLCF logo (40px, centered)
- Heading: "Edit your profile" — `heading-1`, centered
- Subtext: "Changes save immediately to NLCFHUB." — `body`, `--text-secondary`, centered

### 3.4 Loading State (while validating token)

Full card replaced with:
- Skeleton: circle `160px` centered (for avatar), below it two skeleton bars (name width ~60%, subgroup width ~40%), below 4 skeleton input blocks (each `52px` height, `radius: 14px`)
- GSAP shimmer on each skeleton using `gsap.to(shimmerOverlay, { x: '100%', duration: 1.2, repeat: -1, ease: 'none' })`

### 3.5 Invalid Token State

- `AlertCircle` Lucide icon (48px, `--status-error`) centered
- Heading: "Link not valid" — `heading-2`, centered, `--text-primary`
- Body: "This edit link has expired or is incorrect. Ask an admin to share your link again." — `body`, `--text-secondary`, centered
- No action button (no login option for members)

### 3.6 Form (pre-populated)

Same fields as registration form. All fields pre-filled with member's current data.

**Photo section:** If member has photo:
- Shows current photo in `160px` circle
- Below photo: two actions side-by-side:
  - "Change photo" — `secondary` button, small (height `38px`)
  - "Remove photo" — `ghost` button, small, danger color on hover

**Changed field indicator:** When a field value changes from original, a small gold dot `6px` appears to the right of the label (GSAP `gsap.from(dotEl, { scale: 0, duration: 0.2 })`).

### 3.7 Submit Button

- Label: "Save changes"
- Same style as registration submit
- Only enabled if at least one field has changed
- Loading: "Saving…" + spinner
- On success: brief green success banner slides down from top (`gsap.from(bannerRef, { y: -48, duration: 0.35, ease: 'power3.out' })`) reading "✓ Profile updated" then auto-dismisses after 2.5s

---

## 4. PAGE: ADMIN LOGIN (`/admin/login`)

### 4.1 Layout

**Full viewport:** `min-h-screen flex`

**Left half (desktop only, `lg+`):** `width: 50%`, bg `--surface-navy`
- NLCF logo centered at `1/3` height from top (80×80px, white border 3px)
- Below logo: "NLCFHUB" in Plus Jakarta Sans 800, size `40px`, color `--text-inverse`
- Below name: tagline "Manage birthdays. Celebrate people." — Inter 400, size `18px`, color `rgba(253,251,247,0.55)`, `margin-top: 8px`
- Bottom decoration: subtle gold arc/wave SVG (decorative, not interactive), `position: absolute bottom-0 left-0 right-0`, height `120px`, `opacity: 0.12`
- GSAP mount: logo and text stagger in with `gsap.from([logoEl, titleEl, taglineEl], { opacity: 0, y: 20, stagger: 0.12, duration: 0.6 })`

**Right half:** `width: 50%` on desktop, full width on mobile. bg `--bg-canvas`. `flex items-center justify-center`. Padding `48px 40px`.

### 4.2 Login Card (inside right half)

Max-width: `400px`, width `100%`.

**Header:**
- On mobile only: show NLCF logo (40px) centered above heading
- Heading: "Admin Sign In" — `heading-1`, `--text-primary`
- Subtext: "NLCF Media Team only." — `body`, `--text-secondary`, `margin-top: 4px`
- `margin-bottom: 36px`

**Fields:**
- Email input: `type="email"`, label "EMAIL ADDRESS", placeholder "admin@nlcf.org", autocomplete `email`
- Password input: `type="password"`, label "PASSWORD", placeholder "••••••••••", autocomplete `current-password`
  - Trailing eye icon button: toggles password visibility, `ghost` 20px icon

**Submit button:**
- Full width, height `56px`, label "Sign In", `primary` variant
- On error: form shakes horizontally — GSAP `gsap.to(formRef, { x: [-8, 8, -6, 6, 0], duration: 0.4, ease: 'power2.out' })`
- Error message below button: `caption` color `--status-error`, centered: "Incorrect email or password."

---

## 5. PAGE: ADMIN DASHBOARD (`/admin`)

### 5.1 Page Title
"Dashboard" — rendered in TopBar.

### 5.2 Page-Enter Animation
`gsap.from(pageRef, { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out' })`
Then `staggerReveal(bentoGridRef, ':scope > .bento-cell')` with `stagger: 0.06`.

### 5.3 Bento Grid Architecture

The dashboard uses a CSS Grid bento layout:

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto;
  gap: 16px;
}
```

**Grid areas (desktop, lg+):**
```
[ NEXT-BIRTHDAY: cols 1-5 ] [ STATS-TOTAL: cols 6-8 ] [ STATS-ALUMNI: cols 9-12 ]
[ UPCOMING BIRTHDAYS LIST: cols 1-8         ] [ QUICK ACTIONS: cols 9-12 ]
[ SCHEDULER LOG PREVIEW: cols 1-12                                        ]
```

**Grid areas (tablet, 768px–1023px):**
```
[ NEXT-BIRTHDAY: cols 1-6 ] [ STATS STACK: cols 7-12 ]
[ UPCOMING BIRTHDAYS: cols 1-12                       ]
[ QUICK ACTIONS: cols 1-12                            ]
```

**Grid areas (mobile, < 768px):**
All cells stack vertically, full width.

### 5.4 CELL: Next Birthday (Gold Hero Card)

**Grid placement:** `grid-column: span 5` (lg), `span 6` (md), `span 12` (sm)

**Dimensions:** Min-height `220px`. Radius `22px`.

**Background:** `--surface-gold` (#EBB736).
No border. No shadow. Pure color contrast against canvas.

**Layout (padding `28px 28px`):**

**Top row (`flex justify-between items-start`):**
- Left: Label "NEXT BIRTHDAY" — `mono-sm` font JetBrains Mono, weight 500, color `rgba(26,28,59,0.6)`, uppercase, letter-spacing 0.08em
- Right: Days remaining pill — `mono-data` font, bg `rgba(26,28,59,0.12)`, color `--text-primary`, padding `4px 12px`, radius `9999px`
  - Text: "In 3 days" or "TODAY 🎂" if birthday is today
  - If "TODAY": bg `--surface-navy`, color `--surface-gold`, text "TODAY 🎂"

**Middle section (`margin-top: 20px`, `flex gap-4 items-center`):**
- Avatar `xl` size (80px circle), border `3px solid rgba(26,28,59,0.2)`. If no photo: initials on navy bg.
- Right of avatar:
  - Name: `heading-1` (Plus Jakarta Sans 700), color `--text-primary`
  - Subgroup badge below name: `caption` font, bg `rgba(26,28,59,0.12)`, color `--text-primary`, padding `3px 10px`, radius `9999px`
  - Member type below badge: `caption` color `rgba(26,28,59,0.55)` (e.g. "Active Member")

**Bottom row (`margin-top: auto`, `flex gap-2`, `flex-wrap`):**
- "Open profile" button: bg `--surface-navy`, color `--text-inverse`, padding `9px 18px`, radius `9999px`, `caption` weight 600 — opens Birthday Profile Modal
- "Copy caption" button: bg `rgba(26,28,59,0.1)` border `1px solid rgba(26,28,59,0.2)`, padding `9px 18px`, radius `9999px`, `caption` weight 600, color `--text-primary`. GSAP flash on copy.

**Empty state (no upcoming birthdays):**
- bg `--surface-white`, border `2px dashed --border-subtle`
- Center: `Gift` Lucide icon (40px, `--border-subtle`) + "No upcoming birthdays" `body` `--text-muted`

### 5.5 CELL: Stats — Total Members

**Grid:** `span 3` (lg), part of stack (md), `span 12` (sm)

**bg:** `--surface-navy`. Radius `22px`. Padding `24px`.

**Content:**
- Label: "TOTAL MEMBERS" — `mono-sm` JetBrains Mono, color `rgba(253,251,247,0.5)`, uppercase
- Number: fetched from members count. `display` font (Plus Jakarta Sans 800, 36px), color `--text-inverse`
- Sub: "Active members" — `caption`, color `rgba(253,251,247,0.4)`
- Icon: `Users` Lucide (24px), color `rgba(235,183,54,0.5)`, `position: absolute top-24px right-24px`

**GSAP:** number counts up from 0 on mount using `gsap.to(counterObj, { value: total, duration: 1.2, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(counterObj.value) })`

### 5.6 CELL: Stats — Alumni Count

Same structure as 5.5. Label "ALUMNI". bg `--surface-white`, border `1px solid --border-subtle`. Number color `--text-primary`. Icon `GraduationCap`.

### 5.7 CELL: Upcoming Birthdays (horizontal scroll row)

**Grid:** `span 8` (lg), `span 12` (md/sm)

**Container:** bg `--surface-white`, border `1px solid --border-subtle`, radius `22px`, padding `24px`

**Header row (`flex justify-between items-center mb-5`):**
- Left: "Upcoming Birthdays" — `heading-2` Plus Jakarta Sans 700
- Right: "Next 7 days" badge — `caption`, bg `--bg-canvas-dim`, border `1px solid --border-subtle`, padding `4px 12px`, radius `9999px`

**Scroll container:** `overflow-x: auto`, `display: flex`, `gap: 12px`, `padding-bottom: 8px` (for scrollbar clearance), hide scrollbar (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`)

**Mini Birthday Card (inside scroll row):**
- Width: `160px`, flex-shrink `0`
- bg: `--bg-canvas`, border `1px solid --border-subtle`, radius `16px`, padding `16px`
- Avatar: `lg` size (56px, centered, `mx-auto mb-3`)
- Name: `caption` weight 600, `--text-primary`, centered, 2-line max with `line-clamp-2`
- Subgroup: `caption`, `--text-secondary`, centered
- Days pill: centered, `margin-top: 6px`, bg `--surface-gold` if ≤1 day, else bg `--bg-canvas-dim` border `--border-subtle`
  - Text: "Today", "Tomorrow", "In N days" — `mono-sm`
- GSAP hover: `cardLift(cardRef)` / `cardDrop(cardRef)` on mouseenter/mouseleave
- Cursor: `pointer`. onClick: open Birthday Profile Modal for this member.

**Empty state:** centered inside scroll area, `Gift` icon + "No birthdays this week." `body` `--text-secondary`

**Skeleton state (loading):** 4 skeleton mini cards with shimmer, same dimensions.

### 5.8 CELL: Quick Actions

**Grid:** `span 4` (lg), `span 12` (md/sm)

**bg:** `--surface-white`, border `1px solid --border-subtle`, radius `22px`, padding `24px`

**Header:** "Quick Actions" — `heading-2`

**Actions list (vertical, gap-3):**
Each action item: `flex items-center gap-3`, padding `12px 14px`, radius `14px`, bg `--bg-canvas`, border `1px solid --border-subtle`, cursor `pointer`
- Icon: `gold-icon` button variant (40×40px, radius `12px`, bg `--surface-gold`) with relevant Lucide icon (navy, 18px)
- Right: label `body` weight 600 `--text-primary` + `caption` `--text-secondary` sublabel

Action items:
1. `UserPlus` icon — "Add Member" / "Register manually" → `/admin/members` with `?openAdd=true`
2. `Upload` icon — "Import CSV" / "Bulk add alumni" → opens CSV import modal
3. `Bell` icon — "Notification Settings" / "Configure alerts" → `/admin/settings`
4. `RefreshCw` icon — "Run Scheduler" / "Manual trigger" → calls `POST /scheduler/run` with cron secret, shows result toast

**GSAP:** each item has hover: `gsap.to(itemEl, { x: 4, duration: 0.2, ease: 'power2.out' })` on mouseenter, reverse on mouseleave.

### 5.9 CELL: Scheduler Log Preview

**Grid:** `span 12`

**bg:** `--surface-white`, border `1px solid --border-subtle`, radius `22px`, padding `24px`

**Header row (`flex justify-between items-center mb-4`):**
- Left: "Recent Scheduler Activity" — `heading-2`
- Right: Link "View full log →" — `caption` weight 600, color `--surface-navy`, underline on hover → navigates to `/admin/log`

**Table (last 5 log entries):**
```
Columns: Time | Member | Trigger | Channel | Status
```
- Table header: `caption` uppercase letter-spacing, color `--text-secondary`, bg `--bg-canvas`, padding `10px 16px`
- Table row: `body` font, padding `12px 16px`, border-bottom `1px solid --border-subtle`, hover bg `--bg-canvas`
- Time: `mono-sm` JetBrains Mono, `--text-secondary`
- Member: `body` weight 600, `--text-primary`
- Trigger: badge-style pill, "7-day"/"3-day"/"1-day"/"On Day" with respective colors (gold, navy 60%, navy 30%, navy)
- Channel: icon + label — WhatsApp (green icon `MessageCircle`) or Email (`Mail` icon)
- Status: "Sent" — green dot + text; "Failed" — red dot + text
- Error message (failed row only): `caption` `--status-error` in a second sub-row

**Empty state:** `ScrollText` icon + "No notifications sent yet." centered.

---

## 6. PAGE: ADMIN MEMBERS (`/admin/members`)

### 6.1 Layout

Standard admin shell. TopBar shows "Members".

Page content (inside scrollable main):
```
<FilterBar />
<BulkActionBar />   /* Only visible when rows selected */
<MembersTable />
<Pagination />
```

### 6.2 Filter Bar

**Container:** `flex flex-wrap gap-3 items-center mb-6`. On mobile: stacks to column.

**1. Search Input:**
- Width: `280px` (lg), `100%` (mobile)
- Prepended `Search` icon (16px, `--text-muted`) inside input, `pl-40px`
- Input: same styling as global Input but height `44px` (compact)
- Live debounced (300ms) → updates query param `?search=`
- GSAP: on focus, input width expands to `320px` with `gsap.to(inputEl, { width: 320, duration: 0.3, ease: 'power2.out' })` (desktop only)

**2. Member Type Filter (segmented control):**
- Three options: "All", "Members", "Alumni"
- Container: `flex bg-[--bg-canvas-dim] border border-[--border-subtle] rounded-full p-1`
- Each option: `body` weight 500, padding `6px 16px`, radius `9999px`
- Active: bg `--surface-navy`, color `--text-inverse`
- Inactive: bg transparent, color `--text-secondary`, hover: bg `rgba(26,28,59,0.06)`
- GSAP: active pill position `gsap.to(activeIndicatorEl, { x: targetX, duration: 0.25, ease: 'power2.out' })` (sliding pill animation)

**3. Subgroup Filter (dropdown):**
- Custom styled `<select>` or a Radix/Headless popover
- Trigger: `body` weight 500, padding `9px 16px`, radius `9999px`, border `1px solid --border-subtle`, bg `--surface-white`, `ChevronDown` icon right
- Options: "All Subgroups", Choir, Ushers, Media, Welfare, Workers, Exco, General

**4. Right side (ml-auto):**
- "Import CSV" button: `secondary` variant, `Upload` icon left, "Import CSV"
- "Add Member" button: `primary` variant, `UserPlus` icon left, "Add Member"

### 6.3 Bulk Action Bar

**Visible only when `selectedRows.length > 0`.**
**GSAP:** `gsap.from(barRef, { y: -32, opacity: 0, duration: 0.3, ease: 'power3.out' })` on appear.

**Container:** sticky `top-64px` (below topbar), bg `--surface-navy`, padding `12px 32px`, `flex items-center gap-4`, `border-radius 0` (full width bleed)

- Left: `{count} member(s) selected` — `body` weight 600, `--text-inverse`
- Actions: "Deactivate selected" — `danger` button variant (small); "Clear selection" — `ghost` light color
- Right: close/dismiss selection: `×` icon button

### 6.4 Members Table

**Container:** bg `--surface-white`, border `1px solid --border-subtle`, radius `22px`, overflow `hidden`

**Table header row:**
- bg `--bg-canvas`, padding `12px 20px`
- Font `caption` uppercase weight 600, color `--text-secondary`, letter-spacing 0.05em
- Columns (widths approximate):
  - `☐` checkbox: `40px`
  - Photo: `56px`
  - Name: `flex-1 min-width 180px`
  - Phone: `140px`
  - Birthday: `100px`
  - Subgroup: `120px`
  - Type: `100px`
  - Status: `80px`
  - Actions: `120px`
- Column header: hover shows sort arrow `ChevronUp`/`ChevronDown` (name and birthday sortable)

**Table body rows:**
- Height: `72px`
- Border-bottom `1px solid --border-subtle`
- Selected row: bg `rgba(235,183,54,0.08)`, left border `3px solid --surface-gold`
- Hover: bg `--bg-canvas`
- GSAP: on row mount (when new rows load), `gsap.from(rowEls, { opacity: 0, x: -8, stagger: 0.03, duration: 0.25 })`

**Row cell contents:**

- **Checkbox cell:** Standard Tailwind checkbox, custom styled: `16px`, accent color `--surface-gold`, rounded `4px`

- **Photo cell:** Avatar `sm` (40px circle). If no photo: initials `mono-sm` weight 700 on navy bg.

- **Name cell:** `body` weight 600 `--text-primary` on first line. `caption` `--text-secondary` on second line (phone — on mobile collapsed view).

- **Phone cell:** `mono-data` JetBrains Mono, `--text-secondary`

- **Birthday cell:** `mono-data`, `--text-primary`, format "14 Mar"

- **Subgroup cell:** Badge (`caption`, navy bg, cream text)

- **Type cell:** Badge (`member-type` variant, see Badge spec)

- **Status cell:** Active = green dot 8px + "Active" `caption`; Inactive = grey dot + "Inactive"

- **Actions cell:** Three icon buttons (ghost variant, 32×32px each):
  - `Pencil` (Edit) — opens Edit Member Modal
  - `Link` (Copy edit link) — copies link, GSAP flash on icon
  - `UserX` (Deactivate) — confirmation popover appears inline before action
  Each icon: color `--text-muted`, hover: `--text-primary`. GSAP: `gsap.to(iconEl, { scale: 1.2, duration: 0.15 })` on hover.

**Mobile (< 768px): Card list instead of table.**
Each member renders as a card:
- `flex gap-3 p-4`, bg `--surface-white`, border `1px solid --border-subtle`, radius `16px`
- Left: Avatar `md` (48px)
- Right: Name (`body` 600) + Subgroup badge + Birthday `mono-sm` + action icons row

### 6.5 Pagination

**Container:** `flex items-center justify-between px-4 py-4`, border-top `1px solid --border-subtle` (inside table container)

- Left: `caption` `--text-secondary`: "Showing 1–20 of 47 members"
- Right: pagination controls:
  - Previous `ChevronLeft` button: `ghost`, disabled when page=1
  - Page numbers (show current ±2 pages, with `...` ellipsis for gaps): each page is a `32px × 32px` button, radius `8px`, active: bg `--surface-navy` text `--text-inverse`
  - Next `ChevronRight` button

### 6.6 Add / Edit Member Modal

Extends global **Modal Shell** (24px radius, max-width `560px`).

**Header:** "Add Member" / "Edit: {Full Name}"

**Form fields:** Same set as registration form. Photo upload section included. "Member type" select field added: Active Member / Alumni. "Status" toggle (Active / Inactive) on edit-only.

**Footer:**
- Cancel (secondary variant)
- Save (primary, "Add Member" / "Save Changes")

### 6.7 CSV Import Modal

**Header:** "Import Alumni via CSV"

**Step 1 — Upload:**
- Drop zone: `280px` height, dashed border, bg `--bg-canvas`, radius `16px`, center `UploadCloud` icon (40px gold) + "Drop CSV here or click to browse"
- Accepted: `.csv` only
- Download template link: "Download CSV template" `caption` gold, underlined

**Step 2 — Preview (after file selected):**
- File name + size shown
- Preview table: first 3 rows of parsed CSV, `mono-sm` font
- "Looks wrong? Replace file" link

**Step 3 — Importing (progress):**
- Progress bar: GSAP `gsap.to(progressBar, { width: `${pct}%`, duration: 0.3 })`, bg `--surface-gold`, height `6px`, radius `9999px`
- Status text: "Importing row 12 of 45…" `mono-sm`

**Step 4 — Result:**
Stats summary: Created (green), Skipped (gold), Errors (red) — each in a `mono-data` bold counter.
If errors: expandable list of error rows.

---

## 7. PAGE: ADMIN NOTIFICATION SETTINGS (`/admin/settings`)

### 7.1 Layout

Standard admin shell. TopBar: "Notification Settings".

**Content max-width:** `680px`, centered in main content area.

**GSAP mount:** `staggerReveal(pageRef, '.settings-section')` — sections fade + slide up with 0.1s stagger.

### 7.2 Section: Alert Timing

**Card:** bg `--surface-white`, border `1px solid --border-subtle`, radius `22px`, padding `28px`, `margin-bottom: 16px`

**Section heading:** "Alert Timing" — `heading-2`, `margin-bottom: 4px`
**Section subtext:** "Choose when to notify the media team before a birthday." — `body`, `--text-secondary`, `margin-bottom: 24px`

**Toggle rows (4 total):** `flex items-center justify-between`, padding `14px 0`, border-bottom `1px solid --border-subtle` (except last)

Left side:
- Toggle label: `body` weight 600, `--text-primary` (e.g. "7 days before")
- Sub-label: `caption` `--text-secondary` (e.g. "Notification sent one week in advance")

Right side:
Custom Toggle Switch:
- Track: `44px × 24px`, radius `9999px`
- OFF: bg `#CBD5E1`; ON: bg `--surface-navy`
- Thumb: `20px × 20px` circle, bg white, shadow `0 1px 4px rgba(0,0,0,0.15)`
- GSAP toggle: `gsap.to(thumbEl, { x: isOn ? 20 : 0, duration: 0.2, ease: 'power2.out' })`; `gsap.to(trackEl, { backgroundColor: isOn ? '#1A1C3B' : '#CBD5E1', duration: 0.2 })`

### 7.3 Section: Delivery Channels

Same card style as 7.2.

**Section heading:** "Delivery Channels"
**Section subtext:** "Configure how and where notifications are delivered."

**WhatsApp sub-section:**
- Header row: `MessageCircle` icon (20px green `#25D366`) + "WhatsApp" `body` 600 + toggle switch (same as above)
- When ON: slides down a textarea input:
  - Label: "RECIPIENT NUMBERS"
  - Textarea: `mono-data` font, height `96px`, placeholder "+2348012345678, +2348087654321"
  - Helper: `caption` `--text-muted`: "Comma-separated E.164 format numbers. Maximum 5 numbers for the free tier."
  - GSAP slide-down: `gsap.from(recipientFieldEl, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.out' })`

**Email sub-section:**
- Same structure. Icon: `Mail` (20px `--surface-navy`). Textarea for email addresses.
- Helper: "Comma-separated email addresses. 300 emails/day on free tier."

### 7.4 Save Button

**Container:** `flex justify-end mt-8`

- "Save Settings" — `primary` button, width `180px`
- Loading: "Saving…" + spinner
- On success: button briefly becomes `bg-[--status-success]` text "Saved ✓" via GSAP color tween, reverts after 2s

---

## 8. PAGE: ADMIN NOTIFICATION LOG (`/admin/log`)

### 8.1 Layout

Standard admin shell. TopBar: "Notification Log".

### 8.2 Filter Bar

`flex gap-3 flex-wrap items-center mb-6`

**Filters:**
1. Status: segmented control — "All", "Sent", "Failed"
2. Channel: segmented control — "All", "WhatsApp", "Email"
3. Date range: from/to date inputs (type `date`, custom styled). Compact, `height: 44px`.

### 8.3 Log Table

Same table shell as members table (white bg, navy header bg, 22px radius).

**Columns:**
- Timestamp: `mono-sm` JetBrains Mono, `--text-secondary`, format "31 Mar 2025 · 08:00 WAT"
- Member: `body` weight 600 `--text-primary`
- Trigger: pill badge
  - 7-day: bg `rgba(235,183,54,0.15)` border `1px solid --surface-gold` color `#92610A`
  - 3-day: bg `rgba(26,28,59,0.1)` border navy color navy
  - 1-day: bg `rgba(26,28,59,0.15)` color navy
  - On Day: bg `--surface-navy` color `--text-inverse`
- Channel: icon + label row (`MessageCircle` green for WhatsApp, `Mail` navy for Email)
- Status: "Sent" — green dot + "Sent"; "Failed" — red dot + "Failed"
- Error: `caption` `--status-error` in a `<details>` collapsible (only on failed rows)

**Row expansion (failed row):**
- Clicking the error row or a `ChevronDown` icon expands a detail sub-row
- Sub-row bg `#FEF2F2`, padding `10px 20px 10px 76px`
- Error message: `mono-sm` `--status-error`
- GSAP: `gsap.from(subRowEl, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.out' })`

**Pagination:** same component as members table pagination.

---

## 9. MODAL: BIRTHDAY PROFILE (Admin)

This is the most important UI component — the designer workflow hub. It opens from any birthday card click.

### 9.1 Modal Dimensions & Shell

**Override global modal shell:**
- Max-width: `480px`
- bg: `--surface-white`
- Radius: `24px`
- No header section — photo bleeds to top edge
- Padding: `0` (photo section handles top, content below handles padding)

### 9.2 Photo Zone (top half of modal)

**Height:** `280px`. `position: relative`. `overflow: hidden`. `border-radius: 24px 24px 0 0`.

**Background (always):** `--surface-navy`

**If member has photo:**
- `<img>` covers full zone: `object-fit: cover`, `object-position: center top` (favor face)
- Gradient overlay bottom: `linear-gradient(to bottom, transparent 40%, rgba(26,28,59,0.7) 100%)`

**If no photo:**
- bg `--surface-navy`
- Large initials centered: Plus Jakarta Sans 800, `80px` font size, color `--surface-gold`, `opacity: 0.4`
- `Users` icon (48px, rgba cream 0.15) layered behind initials

**Close button:** `position: absolute top-16px right-16px`, `gold-icon` variant (40×40px, radius `12px`), `×` icon 20px navy

**Days remaining pill:** `position: absolute top-16px left-16px`, bg `--surface-gold`, `mono-sm` bold, padding `5px 14px`, radius `9999px`. Text: "In 3 days" or "TODAY 🎂"

**Member name (bottom of photo zone):**
- `position: absolute bottom-16px left-20px right-20px`
- Name: Plus Jakarta Sans 800, `26px`, color `--text-inverse`, line-clamp `2`, text-shadow `0 2px 8px rgba(0,0,0,0.5)`

### 9.3 Info Row (below photo, padding `20px 24px 0`)

`flex items-center gap-3 flex-wrap`

- Subgroup badge: navy bg, cream text, `caption` weight 600, padding `5px 14px`, radius `9999px`
- Member type badge (see Badge spec)
- Birthday text: `Calendar` Lucide icon (14px, `--text-secondary`) + `body` weight 500 `--text-primary`, format "14 March"
- Phone: `Phone` icon + `mono-data` `--text-secondary`

### 9.4 Action Buttons Grid (padding `16px 24px 24px`)

**Layout:** `2×2` grid on desktop, stacked on narrow:
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: 10px;
```

**Button style (all 4 buttons):** height `48px`, radius `9999px`, `body` weight 600, `flex items-center justify-center gap-2`

**Button 1: Download Photo**
- bg `--surface-navy`, color `--text-inverse`
- Icon: `Download` (18px)
- Label: "Download Photo" / "No photo" (disabled, opacity 0.4 if no photo)
- On click: fetch Cloudinary URL as blob → create anchor → download
- GSAP during fetch: spinner replaces icon, GSAP rotate `gsap.to(spinnerEl, { rotation: 360, duration: 0.7, repeat: -1, ease: 'none' })`; on complete, icon reappears with GSAP scale bounce `gsap.from(iconEl, { scale: 0, duration: 0.3, ease: 'back.out(2)' })`

**Button 2: Copy Name**
- bg `--bg-canvas-dim`, border `1px solid --border-subtle`, color `--text-primary`
- Icon: `User` (18px)
- Label: "Copy Name"
- On click: clipboard copy → GSAP `flashGold(btnRef, 'Copy Name', reset)` → label swaps to "Copied!" for 1.5s → reverts

**Button 3: Copy Caption**
- bg `--bg-canvas-dim`, border `1px solid --border-subtle`, color `--text-primary`
- Icon: `Copy` (18px)
- Label: "Copy Caption"
- Caption format: `"Happy Birthday {Full Name}! | {Subgroup} | {Member / Alumni}"`
- Same GSAP flash behavior as Copy Name

**Button 4: Copy Edit Link**
- bg `--bg-canvas-dim`, border `1px solid --border-subtle`, color `--text-primary`
- Icon: `Link` (18px)
- Label: "Copy Edit Link"
- Same GSAP flash behavior

**Below grid:** Full-width "Edit Member →" link-style button:
- `ghost` variant, `body` weight 600, `--text-secondary`, centered, `Pencil` icon (14px) left
- On click: modal content transitions to Edit Member form (replaces photo zone + info row with form fields). Back button `← Back to profile` in header.

### 9.5 Modal GSAP Transitions

**Open:**
```js
gsap.from(backdropRef, { opacity: 0, duration: 0.2 });
gsap.from(modalPanelRef, { scale: 0.92, opacity: 0, y: 24, duration: 0.38, ease: 'back.out(1.4)' });
```
**Photo zone image load:** `gsap.from(imgEl, { opacity: 0, scale: 1.04, duration: 0.5, ease: 'power2.out' })`

**Info rows stagger:** `gsap.from(infoRowChildren, { opacity: 0, y: 8, stagger: 0.07, duration: 0.3, delay: 0.2 })`

**Button grid stagger:** `gsap.from(btnEls, { opacity: 0, y: 12, stagger: 0.06, duration: 0.3, delay: 0.35 })`

**Close:**
```js
gsap.to(backdropRef, { opacity: 0, duration: 0.18 });
gsap.to(modalPanelRef, { scale: 0.94, opacity: 0, y: 16, duration: 0.25, ease: 'power2.in', onComplete: closeModal });
```

**Edit transition:**
```js
// Collapse photo zone, expand form
gsap.to(photoZoneRef, { height: 80, duration: 0.35, ease: 'power2.inOut' });
gsap.from(formContentRef, { opacity: 0, y: 16, duration: 0.3, delay: 0.2 });
```

---

## 10. EMPTY STATES

Every data view has a designed empty state. Never show a blank container.

**Pattern:** centered vertically in their container, max-width `360px`, `mx-auto`, `py-16`

- Icon: relevant Lucide icon, `64px`, color `--border-subtle`
- Heading: `heading-2`, `--text-secondary`
- Body: `body`, `--text-muted`, centered
- CTA button (where applicable): `primary` variant

| View | Icon | Heading | Body | CTA |
|------|------|---------|------|-----|
| Upcoming birthdays | `Gift` | "No upcoming birthdays" | "No one in the registry has a birthday in the next 7 days." | — |
| Members table | `Users` | "No members yet" | "Start by adding the first member or importing a CSV." | "Add Member" |
| Filtered members | `SearchX` | "No results found" | "Try adjusting your search or filters." | "Clear filters" |
| Notification log | `ScrollText` | "No notifications sent" | "Run the scheduler or configure settings to start sending alerts." | "Go to Settings" |

---

## 11. RESPONSIVE BREAKPOINTS SUMMARY

| Breakpoint | px | Layout changes |
|------------|-----|----------------|
| `sm` | 640px | Registration card adds side padding |
| `md` | 768px | Table → card list collapses; bento 2-col |
| `lg` | 1024px | Sidebar appears; full bento grid; table visible |
| `xl` | 1280px | Sidebar + content max-width caps at 1440px |

**Mobile nav (< 1024px):** Bottom tab bar, 4 tabs: Home, Members, Settings, Log. Each tab: `flex flex-col items-center gap-0.5`. Icon 22px. Label `caption` 10px. Active: `--surface-gold` color. bg `--surface-white`, border-top `1px solid --border-subtle`. Height `64px`. Safe-area-inset padding bottom for iOS.

---

## 12. LOADING & TRANSITION STATES

### Route Transition
On every route change via React Router:
```js
// In a wrapper component using useLocation
useEffect(() => {
  gsap.from(pageWrapperRef.current, {
    opacity: 0, y: 10, duration: 0.35, ease: 'power2.out',
    clearProps: 'all'
  });
}, [location.pathname]);
```

### Data Fetch Skeleton Timing
- Skeletons appear immediately (no spinner delay)
- Minimum display time 400ms (avoid flash of skeleton on fast connections)
- GSAP shimmer: continuous loop on all skeleton elements

### Form Submission Flow
1. User clicks submit → button enters loading state (spinner + disabled)
2. API response:
   - Success → GSAP success state (green flash, success content)
   - Error → GSAP shake + toast error

---

## 13. GSAP REFERENCE CHEATSHEET FOR AGENT

```js
// ===== IMPORT =====
import { gsap } from 'gsap';

// ===== PAGE ENTER =====
gsap.from(ref.current, { opacity: 0, y: 14, duration: 0.4, ease: 'power2.out' });

// ===== STAGGER LIST REVEAL =====
gsap.from(ref.current.querySelectorAll('.item'), {
  opacity: 0, y: 18, stagger: 0.07, duration: 0.35, ease: 'power2.out'
});

// ===== CARD HOVER LIFT =====
element.addEventListener('mouseenter', () => gsap.to(el, { y: -6, duration: 0.25, ease: 'power2.out' }));
element.addEventListener('mouseleave', () => gsap.to(el, { y: 0, duration: 0.25, ease: 'power2.out' }));

// ===== MODAL OPEN =====
gsap.from(backdrop, { opacity: 0, duration: 0.2 });
gsap.from(panel, { scale: 0.92, opacity: 0, y: 24, duration: 0.38, ease: 'back.out(1.4)' });

// ===== COPY BUTTON GOLD FLASH =====
const origBg = el.style.background;
const origLabel = labelState;
gsap.timeline()
  .to(el, { backgroundColor: '#EBB736', color: '#1A1C3B', duration: 0.15 })
  .call(() => setLabel('Copied!'))
  .to(el, { backgroundColor: origBg, color: origColor, duration: 0.3, delay: 1.4 })
  .call(() => setLabel(origLabel));

// ===== NUMBER COUNT-UP =====
const obj = { val: 0 };
gsap.to(obj, { val: targetNumber, duration: 1.2, ease: 'power2.out',
  onUpdate: () => { el.textContent = Math.round(obj.val); }
});

// ===== TOGGLE SWITCH =====
gsap.to(thumb, { x: isOn ? 20 : 0, duration: 0.2, ease: 'power2.out' });
gsap.to(track, { backgroundColor: isOn ? '#1A1C3B' : '#CBD5E1', duration: 0.2 });

// ===== TOAST ENTER =====
gsap.from(toast, { x: 80, opacity: 0, duration: 0.35, ease: 'back.out(1.4)' });

// ===== TOAST EXIT =====
gsap.to(toast, { x: 80, opacity: 0, duration: 0.25, ease: 'power2.in',
  onComplete: () => toast.remove()
});

// ===== FORM ERROR SHAKE =====
gsap.to(form, { keyframes: { x: [-8, 8, -6, 6, -4, 4, 0] }, duration: 0.45, ease: 'power2.out' });

// ===== SKELETON SHIMMER =====
gsap.to(shimmerEl, { x: '200%', duration: 1.4, repeat: -1, ease: 'none',
  // shimmerEl is an absolutely positioned overlay with gradient
});

// ===== SUCCESS CHECKMARK DRAW =====
gsap.fromTo(circlePath, { strokeDashoffset: circumference }, 
  { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' });
gsap.from(checkPath, { opacity: 0, scale: 0, duration: 0.3, delay: 0.5,
  transformOrigin: 'center', ease: 'back.out(2)' });
```

---

## 14. FILE/FOLDER STRUCTURE RECOMMENDATION

```
src/
├── assets/
│   └── nlcf-logo.png
├── components/
│   ├── ui/
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Select.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Toggle.jsx
│   │   └── Toast.jsx
│   ├── layout/
│   │   ├── AdminShell.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   └── features/
│       ├── BirthdayCard.jsx          ← mini card in scroll row
│       ├── BirthdayProfileModal.jsx  ← THE core modal
│       ├── MemberRow.jsx             ← table row
│       ├── MemberCard.jsx            ← mobile card view
│       ├── AddEditMemberModal.jsx
│       ├── CSVImportModal.jsx
│       ├── FilterBar.jsx
│       └── SchedulerLogTable.jsx
├── pages/
│   ├── MemberRegistrationPage.jsx
│   ├── MemberSelfEditPage.jsx
│   ├── AdminLoginPage.jsx
│   ├── AdminDashboardPage.jsx
│   ├── AdminMembersPage.jsx
│   ├── AdminSettingsPage.jsx
│   └── AdminNotificationLogPage.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useMembers.js
│   ├── useToast.js
│   └── useClipboard.js
├── lib/
│   ├── api.js          ← axios instance, interceptors, refresh logic
│   ├── gsap.js         ← GSAP helpers (pageEnter, staggerReveal, etc.)
│   └── utils.js        ← formatBirthday, buildCaption, daysUntil, etc.
├── styles/
│   └── globals.css     ← CSS custom properties, font imports, base resets
├── App.jsx             ← Router, route protection
└── main.jsx            ← mount, GSAP register
```

---

## 15. KEY IMPLEMENTATION NOTES FOR AGENT

1. **Access token management:** Store in React context/memory only — never `localStorage`. On 401 response, auto-call `POST /auth/refresh` (refresh token in httpOnly cookie auto-sent). On refresh fail, redirect to `/admin/login`.

2. **Photo upload sequence:** `POST /upload/photo` first → get `photo_url` + `photo_public_id` → include in member create/update payload. Do NOT send photo as part of member form body.

3. **Birthday display format:** API stores `DATE` with year `1900`. Frontend should format as `DD MMM` (e.g., "14 Mar") using `new Date(birthday).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })`.

4. **Days until birthday calculation (frontend):** Extract month+day from birthday, construct next occurrence date (this year or next year if already passed), compute `Math.ceil((nextOccurrence - today) / 86400000)`.

5. **Caption format:** `"Happy Birthday {full_name}! | {subgroup} | {member_type === 'active' ? 'Member' : 'Alumni'}"`. Built client-side; no API call.

6. **GSAP and React:** Use `useRef` + `useEffect` (with `[]` dependency for mount-only animations). Clean up with `return () => gsap.killTweensOf(ref.current)` in effect cleanup.

7. **Tailwind + CSS variables:** Set CSS custom properties in `globals.css` `:root`. In Tailwind classes use `bg-[--surface-navy]` syntax (arbitrary value).

8. **Scroll snap on birthday cards:** Add `scroll-snap-type: x mandatory` to scroll container and `scroll-snap-align: start` to each card for smooth mobile swipe behavior.

9. **Debounce on search:** 300ms debounce on the name search field. Update URL query params (`?search=value`) for shareable state via `useSearchParams`.

10. **Optimistic UI on copy:** Don't await anything — clipboard write is synchronous enough. Flash immediately on click.
```

---

*NLCFHUB Frontend Specification v1.0 — NLCF Media Team*
*React + Vite + Tailwind CSS + GSAP · Deep Navy #1A1C3B · Gold #EBB736*