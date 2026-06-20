# OneReign TODO

## ✅ Done
- [x] Install all dependencies (R3F, Drei, Three, @react-spring/three, GSAP, Framer Motion, @types/three)
- [x] `lib/gsap.ts` — GSAP + ScrollTrigger registration with SSR guard
- [x] `tailwind.config.ts` — brand colors + display font
- [x] `app/globals.css` — base reset, zero border-radius, GSAP marker suppression, canvas transparency
- [x] `components/hero/NavBar.tsx` — fixed nav with Framer Motion entrance
- [x] `components/hero/HeroText.tsx` — ghost backdrop parallax + Framer Motion tagline (fixed overflow)
- [x] `components/hero/HeroSection.tsx` — hero orchestrator with mouse tracking
- [x] `components/transition/DiagonalCut.tsx` — GSAP clip-path scroll animation
- [x] `components/transition/LogoScrollManager.tsx` — merged canvas + GSAP ScrollTrigger, ssr:false
- [x] `components/work/WorkSection.tsx` — dark section with data-docked-logo sentinel
- [x] `components/work/ProjectGrid.tsx` — 2-col sharp-edge grid with stagger reveal
- [x] `app/page.tsx` — 'use client' page, dynamic import LogoScrollManager with ssr:false
- [x] `app/layout.tsx` — root layout with SEO metadata + Inter font
- [x] `next.config.mjs` — transpilePackages for three.js ecosystem
- [x] Copy logo.glb and logo.obj to `/public/models/`
- [x] SSR safety — next/dynamic ssr:false, 'use client' page, no module-level browser globals
- [x] Package version fix — three@0.169, @react-three/fiber@8.17.10, @react-three/drei@9.122
- [x] Canvas transparency — onCreated setClearAlpha, Environment background={false}, CSS override
- [x] GLB model auto-centering — Box3 bounding box normalization
- [x] Tagline overflow fix — full-width layout with padding
- [x] prefers-reduced-motion support
- [x] ScrollTrigger cleanup on unmount
- [x] LOG.md and TODO.md maintained throughout

## 🔄 In Progress
- Nothing — build complete

## 📋 To Do
- [ ] Test at 375px (iPhone SE), 768px (tablet), 1440px (desktop), 1920px (large)
- [ ] Fine-tune logo docking position in WorkSection (pixel-perfect alignment)
- [ ] Consider adding mix-blend-mode effect when logo crosses diagonal cut

## 🚫 Blocked
- Nothing blocked
