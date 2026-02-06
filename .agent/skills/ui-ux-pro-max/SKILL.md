---
name: ui-ux-pro-max
description: UI/UX design intelligence. 50 styles, 21 palettes, 50 font pairings, 20 charts, 9 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, check UI/UX code.
---

# UI/UX Pro Max - Design Intelligence

Comprehensive design guide for web and mobile applications. Contains 50+ styles, 97 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 9 technology stacks.

## When to Apply
Reference these guidelines when:
- Designing new UI components or pages
- Choosing color palettes and typography
- Reviewing code for UX issues
- Building landing pages or dashboards
- Implementing accessibility requirements

## Rule Categories by Priority
1. **Accessibility (CRITICAL)**: color-contrast (4.5:1), focus-states, alt-text, aria-labels, keyboard-nav.
2. **Touch & Interaction (CRITICAL)**: 44x44px targets, loading-buttons, error-feedback.
3. **Performance (HIGH)**: image-optimization, reduced-motion, content-jumping.
4. **Layout & Responsive (HIGH)**: viewport-meta, readable-font-size (16px), z-index-scale.
5. **Typography & Color (MEDIUM)**: line-height (1.5-1.75), line-length (65-75ch), font-pairing.
6. **Animation (MEDIUM)**: 150-300ms duration, transform/opacity over width/height.
7. **Style Selection (MEDIUM)**: consistency, no-emoji-icons (use SVGs).
8. **Charts & Data (LOW)**: chart-type matching, data-table alternatives.

## How to Use This Skill
1. **Analyze Requirements**: Product type, style keywords, industry, stack.
2. **Generate Design System (REQUIRED)**: 
   `python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system`
3. **Supplement with Detailed Searches**: 
   `python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain>` (Domains: product, style, typography, color, landing, chart, ux, react, web)
4. **Stack Guidelines**:
   `python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack <stack_name>`

## Pre-Delivery Checklist
- [ ] No emojis used as icons (use Lucide/Heroicons)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Transitions are 150-300ms
- [ ] Responsive at 375px, 768px, 1440px
- [ ] Accessibility: alt text, form labels, 4.5:1 contrast
