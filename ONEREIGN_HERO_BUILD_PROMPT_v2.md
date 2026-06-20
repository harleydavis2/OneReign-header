# ONEREIGN — Hero Section Build Prompt v2
### For: Antigravity Agentic Coding Tool
### Stack: Next.js 14 · Tailwind CSS · Framer Motion · GSAP + ScrollTrigger · @react-three/fiber · @react-three/drei · @react-spring/three

---

## AGENT INSTRUCTIONS

Before writing any code, create two files in the project root:
- `LOG.md` — append a timestamped entry for every file you create or modify
- `TODO.md` — maintain four sections: ✅ Done / 🔄 In Progress / 📋 To Do / 🚫 Blocked

Update both files after completing each task. Never delete previous LOG entries.

---

## ANIMATION LIBRARY ROLES — READ BEFORE BUILDING

Each library has a specific, non-overlapping role. Do not use one library for another's job.

| Library | Owns | Never use it for |
|---|---|---|
| `@react-three/fiber` + `@react-three/drei` | 3D logo rendering, continuous rotation, mouse tilt | 2D DOM animation |
| `@react-spring/three` | Logo entry drop physics (spring bounce on load) | Scroll-driven movement |
| `gsap` + `ScrollTrigger` | All scroll-driven animation: logo travel path, diagonal cut shift, section reveals | 3D transforms inside Canvas |
| `framer-motion` | Nav entrance, tagline fade-in on load, page-level transitions | Anything scroll-continuous |

**Why GSAP over manual rAF for scroll:** GSAP ScrollTrigger handles scroll position normalization, mobile momentum scroll, and scrub smoothing out of the box. It produces dramatically smoother scroll-linked animation than a manual `requestAnimationFrame` loop and requires far less code to maintain.

**Why @react-spring/three over Framer Motion for the logo entry:** Framer Motion cannot animate R3F/Three.js properties directly. `@react-spring/three` integrates natively with R3F's `useFrame` cycle and produces physically-based spring motion on 3D object properties (`position`, `scale`, `rotation`).

**Why NOT Lottie:** Lottie plays pre-exported After Effects JSON animations. Every animation in OneReign is generative (driven by scroll position, physics, or real-time 3D rendering). Lottie would add ~60KB for zero benefit. Do not install it.

---

## TASK 1 — INSTALL ALL DEPENDENCIES

```bash
npm install @react-three/fiber @react-three/drei three
npm install @react-spring/three
npm install gsap
npm install framer-motion
npm install @types/three
```

Confirm versions after install. If any peer dependency conflict appears, resolve with `--legacy-peer-deps` and log it in `LOG.md`.

Register GSAP plugins immediately after install. Create `lib/gsap.ts`:

```ts
// lib/gsap.ts
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }
```

Import from this file everywhere GSAP is used — never import directly from `'gsap/ScrollTrigger'` without registering first.

---

## TASK 2 — TAILWIND CONFIG

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

In `app/globals.css`:

```css
html {
  background: #FFFFFF;
  overflow-x: hidden;
}

body {
  background: #FFFFFF;
  color: #0A0A0A;
  overflow-x: hidden;
}

/* Prevent GSAP ScrollTrigger from causing layout shifts */
.gsap-marker-start,
.gsap-marker-end {
  display: none !important;
}
```

---

## TASK 3 — FILE STRUCTURE

Scaffold these files before writing any component code:

```
lib/
  gsap.ts                         ← GSAP + ScrollTrigger registration

components/
  hero/
    HeroSection.tsx               ← Hero orchestrator
    LogoCanvas.tsx                ← R3F canvas: 3D logo, rotation, mouse tilt
    HeroText.tsx                  ← ONEREIGN backdrop + tagline + bottom bar
    NavBar.tsx                    ← Fixed navigation
  transition/
    DiagonalCut.tsx               ← Diagonal split element (GSAP-animated)
    LogoScrollManager.tsx         ← GSAP ScrollTrigger: logo travel + docking
  work/
    WorkSection.tsx               ← Dark section with docked logo landing zone
    ProjectGrid.tsx               ← 2-column sharp-edged project grid

app/
  page.tsx                        ← Page assembly
  layout.tsx                      ← Root layout with font + metadata
```

---

## TASK 4 — NAVBAR (`components/hero/NavBar.tsx`)

Use Framer Motion for the entrance animation — this is exactly what Framer Motion is for.

```tsx
'use client'
import { motion } from 'framer-motion'

export default function NavBar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 40px',
        pointerEvents: 'auto',
      }}
    >
      <span style={{
        fontSize: '15px',
        fontWeight: 500,
        letterSpacing: '0.02em',
        color: '#0A0A0A',
      }}>
        OneReign
      </span>

      <div style={{ display: 'flex', gap: '40px' }}>
        {['Work', 'Studio', 'Services', 'Contact'].map(link => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            style={{
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0A0A0A',
              textDecoration: 'none',
              transition: 'opacity 200ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.4')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {link}
          </a>
        ))}
      </div>
    </motion.nav>
  )
}
```

---

## TASK 5 — 3D LOGO CANVAS (`components/hero/LogoCanvas.tsx`)

### Library roles in this file
- `@react-three/fiber` — renders the 3D scene
- `@react-spring/three` — entry animation (spring physics on position.y + scale)
- `useFrame` (R3F) — continuous Y-axis rotation + mouse tilt (runs every frame, unconditional)
- GSAP owns NOTHING inside this file — GSAP controls the wrapper div from outside

```tsx
'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

// ─── Inner logo mesh ────────────────────────────────────────────────────────
function LogoMesh({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const { scene } = useGLTF('/models/logo.glb')
  const groupRef = useRef<THREE.Group>(null)

  // @react-spring/three: entry drop with spring physics
  const [springs, api] = useSpring(() => ({
    position: [0, 2.5, 0] as [number, number, number],
    scale: [0.6, 0.6, 0.6] as [number, number, number],
    config: { mass: 1.2, tension: 80, friction: 18 },
  }))

  useEffect(() => {
    // Trigger spring to resting position after mount
    const timer = setTimeout(() => {
      api.start({
        position: [0, 0, 0],
        scale: [1.4, 1.4, 1.4],
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [api])

  // useFrame: continuous rotation + mouse tilt
  // This is UNCONDITIONAL — runs every frame forever regardless of scroll
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Continuous Y-axis rotation
    groupRef.current.rotation.y += delta * 0.4

    // Mouse tilt — gentle X/Z lean toward cursor
    const targetX = mouseRef.current.y * 0.15
    const targetZ = mouseRef.current.x * -0.08
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.04
  })

  return (
    <animated.group
      ref={groupRef}
      position={springs.position}
      scale={springs.scale}
    >
      <primitive object={scene} />
    </animated.group>
  )
}

// ─── Canvas wrapper ──────────────────────────────────────────────────────────
interface LogoCanvasProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
}

export default function LogoCanvas({ mouseRef }: LogoCanvasProps) {
  return (
    <Canvas
      camera={{ fov: 35, position: [0, 0, 5], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, -2, -5]} intensity={0.3} />
      <Environment preset="studio" />
      <LogoMesh mouseRef={mouseRef} />
    </Canvas>
  )
}

// Preload GLB at module level — prevents pop-in on first render
useGLTF.preload('/models/logo.glb')
```

**Critical rules:**
- The Canvas div is NEVER unmounted during scroll — it lives for the full page lifecycle
- GSAP controls the outer wrapper div's position/size/opacity via refs
- `useFrame` rotation never checks scroll position — it is always running

---

## TASK 6 — HERO TEXT (`components/hero/HeroText.tsx`)

Use Framer Motion for the staggered entrance — tagline and subline fade up after the logo lands.

```tsx
'use client'
import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'

interface HeroTextProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
}

export default function HeroText({ mouseRef }: HeroTextProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // rAF loop: ONEREIGN backdrop moves opposite to mouse at 20% speed
  // Small enough to use rAF directly — not worth a GSAP timeline
  useEffect(() => {
    let rafId: number
    const animate = () => {
      if (backdropRef.current) {
        const { x, y } = mouseRef.current
        backdropRef.current.style.transform =
          `translate(calc(-50% + ${-x * 0.2}px), calc(-50% + ${-y * 0.2}px))`
      }
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [mouseRef])

  return (
    <>
      {/* ONEREIGN backdrop — z-index 0, behind everything */}
      <div
        ref={backdropRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(72px, 18vw, 200px)',
          fontWeight: 100,
          color: '#E8E8E8',
          letterSpacing: '0.1em',
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 0,
          willChange: 'transform',
        }}
      >
        ONEREIGN
      </div>

      {/* Tagline — fades in after logo entry (delay 1.0s) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <h1 style={{
          fontSize: 'clamp(24px, 3.6vw, 52px)',
          fontWeight: 700,
          color: '#0A0A0A',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '16px',
          whiteSpace: 'nowrap',
        }}>
          We build what others only imagine.
        </h1>
        <p style={{
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.2em',
          color: '#AAAAAA',
          textTransform: 'uppercase',
        }}>
          Creative Studio · Digital Experiences · Brand Identity
        </p>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        style={{
          position: 'absolute',
          bottom: '28px',
          left: '40px',
          right: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: '11px', color: '#AAAAAA', letterSpacing: '0.1em' }}>Scroll ↓</span>
        <span style={{ fontSize: '11px', color: '#AAAAAA', letterSpacing: '0.1em' }}>Est. 2024 · Global</span>
      </motion.div>
    </>
  )
}
```

---

## TASK 7 — HERO SECTION (`components/hero/HeroSection.tsx`)

```tsx
'use client'
import { useRef, useEffect } from 'react'
import NavBar from './NavBar'
import LogoCanvas from './LogoCanvas'
import HeroText from './HeroText'

export default function HeroSection() {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,   // -1 to +1
        y: (e.clientY / window.innerHeight - 0.5) * 2,  // -1 to +1
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* ONEREIGN backdrop + tagline + bottom bar */}
      <HeroText mouseRef={mouseRef} />

      {/* 
        LogoCanvas is NOT rendered here.
        It is rendered inside LogoScrollManager as a fixed overlay
        so GSAP can control its position across the full page scroll range.
        See Task 8.
      */}
    </section>
  )
}
```

---

## TASK 8 — GSAP SCROLL MANAGER (`components/transition/LogoScrollManager.tsx`)

This is the most important file. GSAP ScrollTrigger drives everything scroll-related.

```tsx
'use client'
import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import LogoCanvas from '@/components/hero/LogoCanvas'

export default function LogoScrollManager() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    // Measure hero dimensions
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Hero state: large, centered
    const heroSize = Math.min(Math.round(vw * 0.32), 480)
    const heroCenterX = vw / 2 - heroSize / 2
    const heroCenterY = vh * 0.42 - heroSize / 2

    // Docked state: small, left-aligned in WorkSection header
    // Measure the docked target on first scroll pass
    const dockedSize = 44
    let dockedX = 40
    let dockedY = vh  // will be updated before animation runs

    const updateDockedPosition = () => {
      const target = document.querySelector('[data-docked-logo]')
      if (target) {
        const rect = target.getBoundingClientRect()
        dockedX = rect.left
        dockedY = rect.top + window.scrollY + rect.height / 2 - dockedSize / 2
      }
    }

    // Set initial state
    gsap.set(wrapper, {
      position: 'fixed',
      width: heroSize,
      height: heroSize,
      left: heroCenterX,
      top: heroCenterY,
      zIndex: 50,
    })

    // Main scroll timeline
    // scrub: 1.2 = smooth 1.2s lag behind scroll — feels weighty, not instant
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
        onEnter: updateDockedPosition,
        onUpdate: (self) => {
          // Switch to absolute positioning when fully docked
          if (self.progress >= 0.98) {
            gsap.set(wrapper, { position: 'absolute' })
          } else {
            gsap.set(wrapper, { position: 'fixed' })
          }
        },
      },
    })

    tl
      // Phase 1 (0% → 60% scroll): logo travels from hero center toward docked position
      .to(wrapper, {
        left: dockedX,
        top: () => dockedY,
        width: dockedSize,
        height: dockedSize,
        ease: 'power3.inOut',
        duration: 0.6,
      })
      // Phase 2 (60% → 100% scroll): logo locks into docked position, WorkSection reveals
      .to(wrapper, {
        opacity: 1, // stays fully visible when docked
        ease: 'none',
        duration: 0.4,
      })

    // Mix-blend-mode: difference — activates as logo crosses diagonal cut
    // Diagonal cut is at approximately 75–85% of hero height = 15–25% of scroll
    ScrollTrigger.create({
      trigger: '#diagonal-cut',
      start: 'top 80%',
      end: 'top 20%',
      scrub: true,
      onUpdate: (self) => {
        if (self.progress > 0.1 && self.progress < 0.9) {
          wrapper.style.mixBlendMode = 'difference'
          wrapper.style.filter = 'invert(1)'
        } else {
          wrapper.style.mixBlendMode = 'normal'
          wrapper.style.filter = 'none'
        }
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        zIndex: 50,
        pointerEvents: 'none',
        willChange: 'transform, width, height',
      }}
    >
      <LogoCanvas mouseRef={mouseRef} />
    </div>
  )
}
```

### Why `scrub: 1.2`
GSAP's `scrub` adds a smooth lag between the user's scroll position and the animation. At `1.2`, the logo feels like it has physical mass — it trails the scroll slightly and catches up, like a real object moving through space. Values below `0.5` feel instant/cheap; values above `2` feel sluggish.

---

## TASK 9 — DIAGONAL CUT (`components/transition/DiagonalCut.tsx`)

GSAP animates the cut angle as the logo passes through it.

```tsx
'use client'
import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

export default function DiagonalCut() {
  const blackZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = blackZoneRef.current
    if (!el) return

    // Diagonal shifts as logo passes through — logo appears to pull the boundary
    gsap.fromTo(
      el,
      { clipPath: 'polygon(0 90%, 100% 74%, 100% 100%, 0 100%)' },
      {
        clipPath: 'polygon(0 82%, 100% 66%, 100% 100%, 0 100%)',
        ease: 'none',
        scrollTrigger: {
          trigger: '#diagonal-cut',
          start: 'top 60%',
          end: 'top -20%',
          scrub: 1.5,
        },
      }
    )

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <div
      id="diagonal-cut"
      style={{
        position: 'relative',
        width: '100%',
        height: '60vh',
        overflow: 'hidden',
      }}
    >
      {/* White upper zone — no clip needed, it's the page background */}

      {/* Black lower zone — GSAP animates the clipPath */}
      <div
        ref={blackZoneRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0A0A0A',
          clipPath: 'polygon(0 90%, 100% 74%, 100% 100%, 0 100%)',
          willChange: 'clip-path',
        }}
      />
    </div>
  )
}
```

---

## TASK 10 — WORK SECTION (`components/work/WorkSection.tsx`)

```tsx
'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import ProjectGrid from './ProjectGrid'

const projects = [
  { name: 'Project Alpha' },
  { name: 'Project Beta' },
  { name: 'Project Gamma' },
  { name: 'Project Delta' },
]

export default function WorkSection() {
  return (
    <section
      id="work"
      style={{
        background: '#0A0A0A',
        padding: '80px 40px 120px',
        minHeight: '100vh',
      }}
    >
      {/* Section header — logo docks to the left of this heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '64px' }}>

        {/* 
          DOCKED LOGO LANDING ZONE
          The LogoScrollManager measures this element's position
          and flies the logo to exactly this spot.
          This div itself is invisible — the travelling logo covers it.
        */}
        <div
          data-docked-logo="true"
          style={{
            width: '44px',
            height: '44px',
            flexShrink: 0,
            // Invisible placeholder — real logo arrives via scroll animation
          }}
        />

        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Our Work
        </motion.h2>
      </div>

      <ProjectGrid projects={projects} />
    </section>
  )
}
```

---

## TASK 11 — PROJECT GRID (`components/work/ProjectGrid.tsx`)

```tsx
'use client'
import { motion } from 'framer-motion'

interface Project { name: string }

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2px',
      }}
    >
      {projects.map((project, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
            delay: i * 0.08,
          }}
          style={{
            background: '#111111',
            aspectRatio: '4 / 3',
            position: 'relative',
            cursor: 'pointer',
            borderRadius: 0,           // ZERO border-radius — non-negotiable
            border: '1px solid transparent',
            transition: 'border-color 300ms ease',
          }}
          whileHover={{ borderColor: 'rgba(255,255,255,0.18)' }}
        >
          <span
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              fontSize: '12px',
              color: '#FFFFFF',
              letterSpacing: '0.05em',
              fontWeight: 400,
            }}
          >
            {project.name}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
```

---

## TASK 12 — PAGE ASSEMBLY (`app/page.tsx`)

```tsx
import NavBar from '@/components/hero/NavBar'
import HeroSection from '@/components/hero/HeroSection'
import DiagonalCut from '@/components/transition/DiagonalCut'
import LogoScrollManager from '@/components/transition/LogoScrollManager'
import WorkSection from '@/components/work/WorkSection'

export default function Home() {
  return (
    <main style={{ background: '#FFFFFF', position: 'relative' }}>
      <NavBar />
      <HeroSection />
      <DiagonalCut />
      <WorkSection />

      {/*
        LogoScrollManager renders last so it sits above all other elements.
        It owns the Canvas and the fixed logo wrapper.
        It is the single source of truth for the logo's position at all times.
      */}
      <LogoScrollManager />
    </main>
  )
}
```

---

## TASK 13 — GSAP + NEXT.JS SSR SAFETY

GSAP and ScrollTrigger access `window` and `document` — they crash on the server. Apply these rules everywhere GSAP is used:

### Rule 1: Always guard with `typeof window !== 'undefined'`
Already handled in `lib/gsap.ts`. Never import raw from `'gsap/ScrollTrigger'` elsewhere.

### Rule 2: All GSAP code lives inside `useEffect`
```tsx
// ✅ Correct
useEffect(() => {
  gsap.to(ref.current, { opacity: 1 })
}, [])

// ❌ Wrong — runs on server
gsap.to(ref.current, { opacity: 1 })
```

### Rule 3: Use `'use client'` directive on every component that uses GSAP, R3F, or Framer Motion
Every component in this build requires `'use client'` at the top.

### Rule 4: Clean up all ScrollTriggers on unmount
```tsx
return () => {
  ScrollTrigger.getAll().forEach(t => t.kill())
}
```

---

## TASK 14 — PERFORMANCE & ACCESSIBILITY

### Reduced motion
```tsx
// At the top of LogoCanvas.tsx and LogoScrollManager.tsx:
const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

// If true:
// - Skip spring entry animation (set final position immediately)
// - Slow Y rotation to delta * 0.05
// - Disable mouse parallax (keep mouseRef at {x:0, y:0})
// - Set GSAP scrub to 0 (instant, no lag)
// - Freeze diagonal cut (no scroll-reactive angle change)
```

### `will-change` — apply only to actively animating elements
```tsx
// Logo wrapper
willChange: 'transform, width, height, opacity'

// ONEREIGN backdrop
willChange: 'transform'

// Diagonal cut black zone
willChange: 'clip-path'
```

Remove `will-change` after animations complete to free GPU memory:
```tsx
// In GSAP onComplete callbacks:
wrapper.style.willChange = 'auto'
```

### Viewport safety
- All font sizes use `clamp(min, preferred, max)`
- No fixed pixel widths on text containers
- Test at 375px (iPhone SE), 768px (tablet), 1440px (desktop), 1920px (large)

### Canvas pixel ratio cap
```tsx
dpr={[1, 2]}  // never exceed 2x — prevents GPU overload on high-DPI screens
performance={{ min: 0.5 }}  // R3F drops to 0.5x DPR under load
```

---

## TASK 15 — FINAL VERIFICATION CHECKLIST

Before marking the build complete, verify every item:

**3D Logo**
- [ ] Logo loads from `/public/models/logo.glb` without error
- [ ] Continuous Y-axis rotation from page load — never pauses at any scroll position
- [ ] Mouse movement causes gentle X/Z tilt (not jerky — lerp factor 0.04)
- [ ] Entry animation: drops from above with spring overshoot, settles at center
- [ ] Canvas never remounts during scroll (check React DevTools)

**ONEREIGN Backdrop**
- [ ] Visible as a ghost texture behind the logo (color: #E8E8E8)
- [ ] Moves opposite to cursor at 20% speed — feels like a receding plane
- [ ] Never clips or overflows the viewport horizontally

**Scroll Animation (GSAP)**
- [ ] Logo travels smoothly from hero center to WorkSection header on scroll
- [ ] `scrub: 1.2` — logo lags behind scroll slightly, feels weighted
- [ ] Logo size interpolates from `~32vw` (hero) to `44px` (docked)
- [ ] At `progress >= 0.98`: wrapper switches from `fixed` to `absolute`
- [ ] Docked logo continues rotating at small scale

**Diagonal Cut**
- [ ] Diagonal angle is bold and intentional (~12–16 degrees)
- [ ] Angle shifts 8% during scroll as logo passes through (GSAP scrub)
- [ ] Mix-blend-mode activates as logo crosses cut: part on white = dark, part on black = white

**Work Section**
- [ ] `data-docked-logo` element is measured correctly — logo lands at exact position
- [ ] Project cards: zero border-radius, sharp edges
- [ ] Hover state: thin white border outline appears smoothly
- [ ] Cards stagger-reveal on scroll with Framer Motion `whileInView`

**Global**
- [ ] Zero horizontal overflow at all viewport widths
- [ ] Zero border-radius anywhere on the page
- [ ] Pure black (#0A0A0A) and white (#FFFFFF) only — no color accents
- [ ] `prefers-reduced-motion` respected
- [ ] All GSAP ScrollTriggers cleaned up on unmount
- [ ] `LOG.md` and `TODO.md` fully up to date

---

## ASSET REFERENCE

| Asset | Path | Usage |
|---|---|---|
| 3D Logo (GLB) | `/public/models/logo.glb` | Primary — use this |
| 3D Logo (OBJ) | `/public/models/logo.obj` | Fallback only if GLB fails |

---

## ANIMATION LIBRARY QUICK REFERENCE

| What you're animating | Library to use | Why |
|---|---|---|
| Logo Y-axis rotation (continuous) | `useFrame` (R3F) | Lives inside Canvas, runs every frame |
| Logo mouse tilt (X/Z) | `useFrame` (R3F) | Same — needs access to Three.js object |
| Logo entry drop | `@react-spring/three` | Spring physics on Three.js position |
| Logo scroll travel (position, size) | GSAP ScrollTrigger | Scroll-scrubbed, smooth lag, precise |
| Diagonal cut angle shift | GSAP ScrollTrigger | Scroll-scrubbed |
| Mix-blend-mode activation | GSAP ScrollTrigger `onUpdate` | Keyed to scroll progress |
| Nav entrance | Framer Motion | Component-level, one-time |
| Tagline fade-in | Framer Motion | Component-level, one-time, delayed |
| Project cards reveal | Framer Motion `whileInView` | Viewport-triggered, once |
| ONEREIGN backdrop parallax | Manual rAF | Tiny loop, not worth GSAP overhead |

---

## LOG.md TEMPLATE

```md
# OneReign Build Log

## [Task N] — [Component Name] — [Timestamp]
- Created: [files]
- Modified: [files]
- Notes: [decisions, blockers, deviations]
```

## TODO.md TEMPLATE

```md
# OneReign TODO

## ✅ Done

## 🔄 In Progress

## 📋 To Do

## 🚫 Blocked
```
