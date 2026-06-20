# ONEREIGN — Hero Section Build Prompt
### For: Antigravity Agentic Coding Tool
### Stack: Next.js 14 · Tailwind CSS · Framer Motion · @react-three/fiber · @react-three/drei

---

## AGENT INSTRUCTIONS

Before writing any code, create two files in the project root:
- `LOG.md` — append a timestamped entry for every file you create or modify
- `TODO.md` — maintain four sections: Done / In Progress / To Do / Blocked

Update both files after completing each task below. Never delete previous LOG entries.

---

## OVERVIEW

Build the hero section and scroll transition for the OneReign portfolio website.

The hero has a 3D logo (`/public/models/logo.glb`) that:
1. Rotates continuously on the Y-axis in a large centered hero state on a white background
2. Reacts to mouse movement with subtle parallax
3. Scroll-transitions downward through a diagonal cut into a dark section
4. Splits visually at the cut line using CSS `mix-blend-mode: difference` — no two separate images
5. Docks permanently into the "Our Work" section header, continuing to rotate at small scale

The experience must feel like a single continuous object traveling through space — never two competing elements.

---

## TASK 1 — PROJECT SETUP & DEPENDENCIES

Install the following if not already present:

```bash
npm install @react-three/fiber @react-three/drei three
npm install framer-motion
npm install @types/three
```

Confirm Tailwind CSS is configured. If `tailwind.config.js` does not exist, initialise it.

In `tailwind.config.js`, extend the theme:

```js
theme: {
  extend: {
    fontFamily: {
      display: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
    colors: {
      brand: {
        black: '#0A0A0A',
        white: '#FFFFFF',
        muted: '#AAAAAA',
        ghost: '#E8E8E8',
      }
    }
  }
}
```

In `app/layout.tsx` (or `pages/_app.tsx`), set the global body background to white and default text to `#0A0A0A`.

---

## TASK 2 — FILE STRUCTURE

Create the following files (do not write code yet, just scaffold):

```
components/
  hero/
    HeroSection.tsx        ← full hero orchestrator
    LogoCanvas.tsx         ← R3F canvas with the 3D logo
    HeroText.tsx           ← ONEREIGN backdrop + tagline
    NavBar.tsx             ← top navigation
  transition/
    DiagonalCut.tsx        ← the diagonal split SVG/div
    ScrollLogoTracker.tsx  ← scroll-driven logo position manager
  work/
    WorkSection.tsx        ← dark "Our Work" section with docked logo
```

---

## TASK 3 — NAVBAR (`components/hero/NavBar.tsx`)

Build a fixed top navigation bar.

**Specs:**
- Position: `fixed`, `top-0`, `left-0`, `w-full`, `z-50`
- Background: transparent — no background color at any scroll position
- Left: "OneReign" wordmark — `font-size: 15px`, `font-weight: 500`, `letter-spacing: 0.02em`, black `#0A0A0A`
- Right: nav links — Work · Studio · Services · Contact — `font-size: 13px`, `font-weight: 400`, `letter-spacing: 0.08em`, uppercase, `gap: 40px`
- No underlines, no hover underlines — on hover: opacity drops to 0.5, transition 200ms
- No border, no background, no backdrop blur
- Padding: `24px 40px`

---

## TASK 4 — 3D LOGO CANVAS (`components/hero/LogoCanvas.tsx`)

This is the centerpiece of the entire site. Build with extreme care.

### Canvas setup

```tsx
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { useRef } from 'react'
```

- Canvas background: `transparent` (`alpha: true` in gl props)
- Camera: `fov: 35`, `position: [0, 0, 5]`
- The Canvas div should be `width: 100%`, `height: 100%`, `position: absolute`, `inset: 0`
- `style={{ background: 'transparent' }}`

### Logo component (inside canvas)

```tsx
function Logo({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF('/models/logo.glb')
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!meshRef.current) return
    // Continuous Y-axis rotation — unconditional, never stops
    meshRef.current.rotation.y += delta * 0.4
    // Mouse parallax — subtle tilt toward cursor
    meshRef.current.rotation.x +=
      (state.pointer.y * 0.12 - meshRef.current.rotation.x) * 0.05
  })

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={1.4}
    />
  )
}
```

**Critical rules:**
- `useFrame` rotation is UNCONDITIONAL — it runs at every frame regardless of scroll position
- The Canvas is NEVER unmounted or remounted during scroll — it stays mounted for the entire page lifecycle
- Do NOT put rotation logic inside a `useEffect` or tie it to scroll state

### Lighting

```tsx
<ambientLight intensity={0.6} />
<directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
<directionalLight position={[-5, -2, -5]} intensity={0.3} />
<Environment preset="studio" />
```

### Entry animation

On first mount, animate the logo dropping in from `y: 1.5` to `y: 0` with a spring:
- Use Framer Motion's `useSpring` or a simple `useFrame` lerp over the first 1.2 seconds
- Ease: gentle overshoot (spring stiffness 80, damping 12)
- After entry completes, switch to the continuous rotation only

---

## TASK 5 — HERO TEXT LAYER (`components/hero/HeroText.tsx`)

This is a pure HTML/CSS layer that sits in absolute position over the canvas.

### ONEREIGN backdrop text

```tsx
<div
  style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 'clamp(80px, 18vw, 200px)',
    fontWeight: 100,
    color: '#E8E8E8',
    letterSpacing: '0.08em',
    userSelect: 'none',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    zIndex: 0,
  }}
>
  ONEREIGN
</div>
```

**This text is a texture, not a headline.** It must be behind the logo (`z-index: 0`). The logo canvas sits at `z-index: 1`.

**Mouse parallax on the backdrop text:**
Track `mousemove` on the hero section. Move the ONEREIGN text in the OPPOSITE direction of the cursor at 20% of cursor speed — it should feel like it's on a plane behind the logo.

```tsx
// In the hero orchestrator, track mouse and pass offset
const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

// Apply to ONEREIGN text:
transform: `translate(calc(-50% + ${-mouseOffset.x * 0.2}px), calc(-50% + ${-mouseOffset.y * 0.2}px))`
```

### Tagline block

Positioned below the logo area:

```tsx
<div style={{ position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
  <h1 style={{
    fontSize: 'clamp(28px, 4vw, 52px)',
    fontWeight: 700,
    color: '#0A0A0A',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    marginBottom: '16px'
  }}>
    We build what others only imagine.
  </h1>
  <p style={{
    fontSize: '11px',
    fontWeight: 400,
    letterSpacing: '0.2em',
    color: '#AAAAAA',
    textTransform: 'uppercase'
  }}>
    Creative Studio · Digital Experiences · Brand Identity
  </p>
</div>
```

### Bottom bar

```tsx
<div style={{ position: 'absolute', bottom: '28px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between' }}>
  <span style={{ fontSize: '11px', color: '#AAAAAA', letterSpacing: '0.1em' }}>Scroll ↓</span>
  <span style={{ fontSize: '11px', color: '#AAAAAA', letterSpacing: '0.1em' }}>Est. 2024 · Global</span>
</div>
```

---

## TASK 6 — SCROLL SYSTEM (`components/transition/ScrollLogoTracker.tsx`)

This is the most technically critical component. Read every line carefully.

### Scroll progress calculation

```tsx
useEffect(() => {
  const handleScroll = () => {
    const scrollY = window.scrollY
    const heroHeight = window.innerHeight
    // scrollProgress: 0 = top of page, 1 = logo fully docked
    const progress = Math.min(scrollY / heroHeight, 1)
    scrollProgressRef.current = progress
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

**Use a `ref` for scroll progress, NOT `useState`.** Direct DOM mutation only — no React re-renders on scroll.

### Logo wrapper — scroll-driven position

The logo canvas wrapper is positioned `fixed` during scroll and switches to `absolute` when docked.

```tsx
// Logo wrapper DOM ref
const logoWrapperRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  let rafId: number

  const animate = () => {
    const p = scrollProgressRef.current
    const wrapper = logoWrapperRef.current
    if (!wrapper) { rafId = requestAnimationFrame(animate); return }

    // Hero state: large, centered, fixed
    const heroSize = Math.round(window.innerWidth * 0.32) // ~32vw, max 480px
    const dockedSize = 44 // px when docked next to "Our Work"

    // Interpolate size
    const currentSize = heroSize + (dockedSize - heroSize) * easeOutQuint(p)

    // Hero center position (fixed)
    const heroCenterX = window.innerWidth / 2
    const heroCenterY = window.innerHeight * 0.42

    // Docked position — will be measured from WorkSection ref
    // For now, target: left edge of "Our Work" heading, vertically centered on text
    const dockedX = 40 + dockedSize / 2  // 40px left margin
    const dockedY = window.innerHeight   // Will be updated when WorkSection mounts

    const currentX = heroCenterX + (dockedX - heroCenterX) * easeOutQuint(p)
    const currentY = heroCenterY + (dockedY - heroCenterY) * easeOutQuint(p)

    // Apply styles directly to DOM
    wrapper.style.width = `${currentSize}px`
    wrapper.style.height = `${currentSize}px`
    wrapper.style.left = `${currentX - currentSize / 2}px`
    wrapper.style.top = `${currentY - currentSize / 2}px`

    // Switch from fixed to absolute when fully docked
    if (p >= 1) {
      wrapper.style.position = 'absolute'
    } else {
      wrapper.style.position = 'fixed'
    }

    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}, [])
```

### Easing function

```ts
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5)
}
```

---

## TASK 7 — MIX-BLEND-MODE LOGO SPLIT

This creates the live color inversion as the logo crosses the diagonal cut. No two separate logo images.

### Setup

The logo wrapper div gets `mix-blend-mode: difference` applied when it enters the transition zone (`scrollProgress` between 0.3 and 0.8):

```tsx
// Inside the rAF loop:
if (p > 0.25 && p < 0.85) {
  wrapper.style.mixBlendMode = 'difference'
  wrapper.style.filter = 'invert(1)'
} else {
  wrapper.style.mixBlendMode = 'normal'
  wrapper.style.filter = 'none'
}
```

**How this works:** When the logo wrapper crosses the diagonal boundary (which is a `background: #0A0A0A` div), `mix-blend-mode: difference` + `invert(1)` causes the part of the logo over the dark background to render as white, and the part over the white background to render as dark. The split happens naturally at the exact boundary — no masking required.

### Smooth transition in/out of blend mode

Apply opacity crossfade on the blend mode activation:

```tsx
const blendOpacity = p > 0.25 ? Math.min((p - 0.25) / 0.1, 1) : 0
const blendExitOpacity = p < 0.85 ? 1 : Math.max(1 - (p - 0.85) / 0.1, 0)
```

---

## TASK 8 — DIAGONAL CUT (`components/transition/DiagonalCut.tsx`)

The diagonal boundary between the white hero world and the dark work section.

### Structure

```tsx
<div style={{ position: 'relative', width: '100%', height: '100vh' }}>
  {/* White upper zone */}
  <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', clipPath: 'polygon(0 0, 100% 0, 100% 72%, 0 88%)' }} />
  {/* Black lower zone */}
  <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', clipPath: 'polygon(0 88%, 100% 72%, 100% 100%, 0 100%)' }} />
</div>
```

**The diagonal angle:** `polygon(0 88%, 100% 72%)` creates a left-to-right descending cut at approximately 10–12 degrees. Adjust the percentages to taste — the cut should feel bold and intentional, not accidental.

### Scroll-reactive diagonal

The cut angle shifts slightly as the user scrolls through it — the boundary moves ~4% vertically with scroll:

```tsx
// In rAF loop, update clipPath
const cutTop = 88 - (scrollProgress * 4)
const cutBottom = 72 - (scrollProgress * 4)
diagonalRef.current.style.clipPath =
  `polygon(0 ${cutTop}%, 100% ${cutBottom}%, 100% 100%, 0 100%)`
```

This gives the impression the logo is pulling the boundary down as it descends.

---

## TASK 9 — WORK SECTION (`components/work/WorkSection.tsx`)

The dark section where the logo docks.

### Section header

```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
  {/* Logo placeholder — the real logo travels here via scroll animation */}
  <div
    ref={dockedLogoRef}
    style={{ width: '44px', height: '44px', flexShrink: 0 }}
    data-docked-logo-target="true"
  />
  <h2 style={{
    fontSize: 'clamp(32px, 5vw, 56px)',
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '-0.02em',
    margin: 0
  }}>
    Our Work
  </h2>
</div>
```

**The `data-docked-logo-target` div is the landing zone.** On mount, measure its `getBoundingClientRect()` and pass those coordinates to the scroll system so the logo knows exactly where to fly to.

```tsx
// In ScrollLogoTracker, after WorkSection mounts:
useEffect(() => {
  const target = document.querySelector('[data-docked-logo-target]')
  if (target) {
    const rect = target.getBoundingClientRect()
    dockedPositionRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2 + window.scrollY
    }
  }
}, [])
```

### Project grid

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
  {projects.map((project, i) => (
    <div
      key={i}
      style={{
        background: '#111111',
        aspectRatio: '4/3',
        position: 'relative',
        border: i === 0 ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'border-color 300ms',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
    >
      <span style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        fontSize: '12px',
        color: '#FFFFFF',
        letterSpacing: '0.05em',
        fontWeight: 400
      }}>
        {project.name}
      </span>
    </div>
  ))}
</div>
```

**Zero border-radius anywhere in this section.** Sharp, architectural edges only.

---

## TASK 10 — HERO ORCHESTRATOR (`components/hero/HeroSection.tsx`)

Wire everything together.

```tsx
export default function HeroSection() {
  const mouseOffsetRef = useRef({ x: 0, y: 0 })
  const backdropRef = useRef<HTMLDivElement>(null)

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      mouseOffsetRef.current = { x: e.clientX - cx, y: e.clientY - cy }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // rAF loop for backdrop parallax
  useEffect(() => {
    let rafId: number
    const animate = () => {
      if (backdropRef.current) {
        const { x, y } = mouseOffsetRef.current
        backdropRef.current.style.transform =
          `translate(calc(-50% + ${-x * 0.2}px), calc(-50% + ${-y * 0.2}px))`
      }
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* LAYER 0: ONEREIGN backdrop text */}
      <div
        ref={backdropRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(80px, 18vw, 200px)',
          fontWeight: 100,
          color: '#E8E8E8',
          letterSpacing: '0.08em',
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 0,
        }}
      >
        ONEREIGN
      </div>

      {/* LAYER 1: 3D Logo Canvas (fixed, scroll-tracked externally) */}
      {/* LogoCanvas is rendered in a fixed div managed by ScrollLogoTracker */}

      {/* LAYER 2: Tagline + bottom bar */}
      <HeroText />

      {/* LAYER 3: NavBar */}
      <NavBar />
    </section>
  )
}
```

---

## TASK 11 — PAGE ASSEMBLY (`app/page.tsx`)

```tsx
import NavBar from '@/components/hero/NavBar'
import HeroSection from '@/components/hero/HeroSection'
import DiagonalCut from '@/components/transition/DiagonalCut'
import ScrollLogoTracker from '@/components/transition/ScrollLogoTracker'
import WorkSection from '@/components/work/WorkSection'

export default function Home() {
  return (
    <main style={{ background: '#FFFFFF' }}>
      <NavBar />
      <HeroSection />
      <DiagonalCut />
      <WorkSection />
      {/* ScrollLogoTracker renders the fixed logo canvas and manages all scroll logic */}
      <ScrollLogoTracker />
    </main>
  )
}
```

`ScrollLogoTracker` is the single source of truth for the logo's position, size, blend mode, and docking state. It renders the `LogoCanvas` inside a `div` that it fully controls via direct DOM refs.

---

## TASK 12 — PERFORMANCE & POLISH

### Reduced motion

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// If true:
// - Skip the entry drop animation
// - Slow Y-axis rotation to delta * 0.1
// - Disable mouse parallax
// - Disable diagonal cut scroll reactivity
```

### Viewport containment

All typography uses `clamp()`. No element should ever cause horizontal overflow:

```css
body { overflow-x: hidden; }
```

Test at 320px, 768px, 1280px, and 1920px viewport widths.

### Canvas performance

```tsx
<Canvas
  gl={{ antialias: true, alpha: true }}
  dpr={[1, 2]}
  performance={{ min: 0.5 }}
>
```

`dpr={[1, 2]}` caps pixel ratio at 2. `performance={{ min: 0.5 }}` allows R3F to drop resolution under load.

### useGLTF preload

Add at the bottom of `LogoCanvas.tsx`:

```tsx
useGLTF.preload('/models/logo.glb')
```

---

## TASK 13 — FINAL CHECKLIST

Before marking complete, verify:

- [ ] Logo rotates continuously on Y-axis from page load — never stops at any scroll position
- [ ] Mouse movement causes subtle parallax on both the logo (X tilt) and the ONEREIGN backdrop text (opposite direction)
- [ ] Entry animation: logo drops in from above on first load, then transitions to continuous rotation
- [ ] Scroll from 0→1: logo travels from large centered hero to small docked position in WorkSection header
- [ ] At the diagonal boundary: logo visually splits — dark on white, light on dark — via mix-blend-mode, no masking
- [ ] Diagonal cut angle shifts slightly during scroll (logo appears to pull the boundary)
- [ ] At `scrollProgress >= 1`: logo position switches from `fixed` to `absolute`, permanently docked
- [ ] Docked logo continues rotating at small scale
- [ ] Zero border-radius anywhere on the page
- [ ] No color accents — strict black (#0A0A0A) and white (#FFFFFF) only
- [ ] No horizontal overflow at any viewport width
- [ ] `prefers-reduced-motion` respected
- [ ] `LOG.md` and `TODO.md` are up to date

---

## ASSET REFERENCE

| Asset | Path |
|-------|------|
| 3D Logo (GLB) | `/public/models/logo.glb` |
| 3D Logo (OBJ) | `/public/models/logo.obj` |

Use `logo.glb` as primary. Fall back to `logo.obj` only if GLB fails to load.

---

## LOG.md TEMPLATE

```md
# OneReign Build Log

## [Task N] — [Component Name] — [Date/Time]
- Created: [list files]
- Modified: [list files]
- Notes: [any decisions or blockers]
```

## TODO.md TEMPLATE

```md
# OneReign TODO

## ✅ Done
- 

## 🔄 In Progress
- 

## 📋 To Do
- 

## 🚫 Blocked
- 
```
