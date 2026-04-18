# Accessibility Audit: Landing Page (`/en`)

**Standard:** WCAG 2.1 AA  **Date:** 2026-04-18
**URL tested:** http://localhost:3001/en
**Tooling:** axe-core 4.10.0 + manual DOM inspection via Playwright MCP
**Source:** [dashboard/app/\[locale\]/page.tsx](dashboard/app/[locale]/page.tsx) + [dashboard/components/landing/](dashboard/components/landing)

---

## Summary

| Metric | Count |
|---|---|
| Axe violations | **9 rules / 45 nodes** |
| 🔴 Critical (blocks users) | 2 rules (skip-link broken, unnamed links) |
| 🟠 Serious (WCAG 2.1 AA fail) | 2 rules (contrast × 34, link-name × 3) |
| 🟡 Moderate (best-practice / structural) | 5 rules (landmarks × 4, heading-order) |
| Passed rules | 36 |
| Incomplete (manual review needed) | 1 (color-contrast on gradients, 26 nodes) |

**Headline risks:** screen-reader users cannot skip the navbar (target missing), low-vision users can't read the in-hero mockup text (ratios as low as **1.01:1** on `#f7f7f3` over `#f5f5f0`), three social/footer links are unnamed, and the hero waitlist email input has no programmatic label.

---

## Findings

### 🔴 Perceivable — 1.4.3 Contrast (Minimum) · WCAG 2 AA

34 text nodes fail the 4.5:1 minimum (7 distinct foreground/background pairs). Several are in the decorative in-hero "mockup" section — still a WCAG failure because the text is real DOM, readable by AT, and not marked `aria-hidden`.

| # | Foreground | Background | Ratio | Required | Nodes | Where | Severity |
|---|---|---|---|---|---|---|---|
| 1 | `#f7f7f3` | `#f5f5f0` | **1.01:1** | 4.5:1 | 4 | Mockup micro-labels (inside hero `<InteractiveMockup>`) | 🔴 Critical |
| 2 | `#b4b4b0` | `#f5f5f0` | **1.9:1** | 4.5:1 | 11 | Mockup secondary text | 🔴 Critical |
| 3 | `#9f9f9b` | `#f5f5f0` | 2.42:1 | 4.5:1 | 3 | Mockup body text | 🟠 Serious |
| 4 | `#9ca3af` | `#f7f8f7` | 2.38:1 | 4.5:1 | 5 | Sidebar "OVERVIEW", "My Workspace" | 🟠 Serious |
| 5 | `#9ca3af` | `#ffffff` | 2.53:1 | 4.5:1 | 7 | URL bar chip `flow.app/dashboard`, metrics subtitles | 🟠 Serious |
| 6 | `#059669` | `#ffffff` | 3.76:1 | 4.5:1 | 3 | Green "↑ 12%" deltas on stat cards | 🟠 Serious |
| 7 | `#ea580c` | `#ffedd5` | 3.1:1 | 4.5:1 | 1 | Orange accent pill (small text, 6.8pt) | 🟠 Serious |

**Recommendation.** Either (a) darken the tokens: `gray-400 → gray-600`, `#b4b4b0 → ~#6B6B65`, `#9f9f9b → ~#5A5A55`, `#059669 → #047857`; or (b) add `aria-hidden="true"` + `role="img"` with an `aria-label` summarizing the mockup to the whole `<InteractiveMockup>` wrapper if it's truly decorative. Option (a) is preferred because the mockup text is visually legible for most users and AT exposure helps low-vision/SR users understand the product.

---

### 🔴 Operable — skip-link target missing · 2.4.1 Bypass Blocks

```html
<a href="#main-content" class="sr-only focus:not-sr-only …">Skip to main content</a>
```

Target `id="main-content"` does **not exist** on the page. Pressing Enter on the skip link does nothing (URL changes, focus stays).

- Found in: global layout [dashboard/app/\[locale\]/layout.tsx](dashboard/app/[locale]/layout.tsx)
- Landing root in [dashboard/app/\[locale\]/page.tsx](dashboard/app/[locale]/page.tsx) renders `<main>` with no id.

**Fix:** add `id="main-content"` (and `tabIndex={-1}` so focus can land there) to the `<main>` in `page.tsx`.

---

### 🟠 Robust — link-name · 4.1.2 / 2.4.4

3 anchors in the footer are icon-only with no text and no `aria-label`:

```html
<a href="#" class="w-8 h-8 … flex items-center justify-center …"> [icon] </a>
```

- Found in: [dashboard/components/landing/Footer.tsx](dashboard/components/landing/Footer.tsx) (social icons row).
- Also: `href="#"` — dead links. Either wire them up or remove.

**Fix:** `aria-label="Twitter"` / `"GitHub"` / `"LinkedIn"` etc. on each anchor; point `href` at real URLs or remove.

---

### 🟠 Understandable — 3.3.2 Labels or Instructions (form input)

Two hero waitlist inputs:

```html
<input type="email" placeholder="Enter your email" … />
```

- No `<label>`, no `aria-label`, no `id`/`name`.
- Placeholder is **not a substitute** for a label (disappears on focus, low contrast `#9ca3af`, breaks autofill).
- Found in: [dashboard/components/landing/Hero.tsx](dashboard/components/landing/Hero.tsx) and [dashboard/components/landing/WaitlistForm.tsx](dashboard/components/landing/WaitlistForm.tsx) (two waitlist surfaces render both).

**Fix:** add visually hidden label + id/name:
```tsx
<label htmlFor="waitlist-email" className="sr-only">Email address</label>
<input id="waitlist-email" name="email" type="email" autoComplete="email" required … />
```

---

### 🟡 Moderate — landmark structure

Four related axe violations all stem from one cause: the hero contains a decorative **dashboard mockup** ([InteractiveMockup.tsx](dashboard/components/landing/InteractiveMockup.tsx)) that renders its own full page chrome (`<aside>`, `<nav>`, `<main>`) **inside** the landing's `<main>`.

| Rule | Finding |
|---|---|
| `landmark-no-duplicate-main` | 2 × `<main>` on the page (outer + mockup) |
| `landmark-main-is-top-level` | mockup's `<main>` is nested inside the landing's `<main>` |
| `landmark-complementary-is-top-level` | mockup's `<aside>` is inside another landmark |
| `landmark-unique` | 2 × `<nav>` (navbar + mockup nav) with no distinguishing `aria-label` |

**Fix (one change):** in `InteractiveMockup.tsx`, replace semantic landmarks with plain `<div>`s and wrap the whole component in `role="img"` with an `aria-label` like `"Dashboard preview"` (or `aria-hidden="true"` if the text content isn't meant to be parsed by AT). Additionally give the real navbar `aria-label="Primary"` (it's fine to have one `<nav>` unlabeled, but once there are two they must be distinguished).

---

### 🟡 Moderate — heading-order · 1.3.1

```html
<h4 class="text-xs font-bold uppercase …">Product</h4>
```
- In [Footer.tsx](dashboard/components/landing/Footer.tsx): `<h4>` with no preceding `<h3>`. Likely should be `<h2>` (footer column heading).

**Fix:** change footer column headers to `<h2>` (or `<h3>` if nested under a section heading).

---

### 🟡 Moderate — region · all content must be in landmarks

The skip link itself is rendered outside any landmark. Low priority — moving the skip link *just before* `<main>` (inside `<body>` but not inside a region) is accepted practice; this warning clears once the duplicate-main issue is fixed.

---

## Color-contrast summary (automated pairs)

| Pair | Ratio | Required | Pass? |
|---|---|---|---|
| `#f7f7f3` on `#f5f5f0` | 1.01 | 4.5 | ❌ |
| `#b4b4b0` on `#f5f5f0` | 1.90 | 4.5 | ❌ |
| `#9f9f9b` on `#f5f5f0` | 2.42 | 4.5 | ❌ |
| `#9ca3af` on `#f7f8f7` | 2.38 | 4.5 | ❌ |
| `#9ca3af` on `#ffffff` | 2.53 | 4.5 | ❌ |
| `#ea580c` on `#ffedd5` (6.8pt) | 3.10 | 4.5 | ❌ |
| `#059669` on `#ffffff` (7.5pt) | 3.76 | 4.5 | ❌ |

26 additional nodes flagged as "incomplete" (axe couldn't compute a confident ratio — gradient/blurred backgrounds). These need manual spot-check, likely in `<Hero>` gradient text and CTA section.

---

## Keyboard navigation (manual pass)

- **Focusable elements found:** 43 in tab order.
- **Skip link:** present but **target missing** — reaches focus, visually appears, Enter does nothing.
- **First 7 focusables:** Skip → Features → Pricing → About → Theme toggle → Log in → Get started → (email input, unlabeled) → Join Waitlist → Or sign up free. Tab order is logical, matches visual flow.
- **Focus indicator:** Tailwind defaults used; not visually verified on every element. Spot-check the dark mode ring.
- **Touch targets < 24×24 CSS px:** 20 elements flagged (2.5.5 at AA is 24×24 in WCAG 2.2; 2.1 AA has no enforceable minimum, but it's best-practice). Nav links "Features / Pricing / About / Log in" are 20px tall. **Fix:** add `py-2` or increase hit area via wrapping padding.

---

## Priority Fixes

1. **🔴 Add `id="main-content"` to the landing's `<main>`** — [dashboard/app/\[locale\]/page.tsx:17](dashboard/app/[locale]/page.tsx) — unblocks skip link.
2. **🔴 Fix the mockup's `<h1>`-to-text contrast** — [dashboard/components/landing/InteractiveMockup.tsx](dashboard/components/landing/InteractiveMockup.tsx) — darken gray tokens or wrap mockup in `role="img"` + `aria-label`.
3. **🟠 Label the waitlist email input** — [dashboard/components/landing/Hero.tsx](dashboard/components/landing/Hero.tsx), [WaitlistForm.tsx](dashboard/components/landing/WaitlistForm.tsx) — add `<label className="sr-only">` + `id`/`name`/`autoComplete="email"`.
4. **🟠 Name the footer social links** — [dashboard/components/landing/Footer.tsx](dashboard/components/landing/Footer.tsx) — add `aria-label` and real `href`s.
5. **🟠 Darken text tokens to hit 4.5:1** — global Tailwind config: `gray-400` usages (7 + 5 + 11 = 23 nodes) should step up to `gray-600`; deltas `emerald-600 → emerald-700`; orange pill needs larger font or `#C05A22` (already a token in the palette).
6. **🟡 De-semantic the mockup** — replace `<main>`/`<aside>`/`<nav>` inside InteractiveMockup with plain `<div>`s.
7. **🟡 Label the primary `<nav>`** — [dashboard/components/landing/Navbar.tsx](dashboard/components/landing/Navbar.tsx) — `aria-label="Primary"`.
8. **🟡 Fix heading order** — `<h4>Product</h4>` → `<h2>` in Footer.
9. **🟡 Raise small touch targets** to 24×24 minimum for nav links.

---

## Verification (after fixes)

1. Re-run axe at `/en` — target: 0 serious/critical, <3 moderate best-practice remaining.
2. Tab from the very top of the page — skip link must jump focus into the `<main>` content.
3. VoiceOver rotor → Landmarks: expect 1 navigation, 1 main, 1 contentinfo (footer). Mockup's inner landmarks should not appear.
4. VoiceOver forms: email input must be announced as "Email address, edit text".
5. Zoom to 200% — layout must not clip text (not tested in this pass; re-test after contrast fix).

---

## Not yet reviewed (out of scope for this run)

- Dark theme contrast (page toggled to light by default; dark-mode tokens `text-white/50` etc. likely have the same issue).
- Reduced-motion behavior on `<Hero>` gradient animation.
- Other locales (`/sk`, `/cs`, etc.) — `lang` attr is set correctly for `/en`, verify per-locale.
- The dashboard app itself (authenticated routes) — Stage 2 of the audit plan.
