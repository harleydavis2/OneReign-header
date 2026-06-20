'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useRef, useEffect, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import * as THREE from 'three'

// ─── Logo Mesh (R3F inner component) ─────────────────────────────────────────
function LogoMesh({ mouseRef, prefersReducedMotion }: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
  prefersReducedMotion: boolean
}) {
  const { scene } = useGLTF('/models/logo.glb')
  const groupRef = useRef<THREE.Group>(null)

  // Auto-center and auto-scale the model on first use
  const centeredScene = useRef<THREE.Object3D | null>(null)
  if (!centeredScene.current) {
    const cloned = scene.clone()
    const box = new THREE.Box3().setFromObject(cloned)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    // Normalize to unit scale, then our spring scale controls the final size
    cloned.scale.setScalar(1 / maxDim)
    cloned.position.set(-center.x / maxDim, -center.y / maxDim, -center.z / maxDim)
    centeredScene.current = cloned
  }

  const [springs, api] = useSpring(() => ({
    position: prefersReducedMotion ? [0, 0, 0] : [0, 3, 0] as [number, number, number],
    scale: prefersReducedMotion ? [1.6, 1.6, 1.6] : [0.5, 0.5, 0.5] as [number, number, number],
    config: { mass: 1.2, tension: 80, friction: 18 },
  }))

  useEffect(() => {
    if (prefersReducedMotion) return
    const timer = setTimeout(() => {
      api.start({ position: [0, 0, 0], scale: [1.6, 1.6, 1.6] })
    }, 100)
    return () => clearTimeout(timer)
  }, [api, prefersReducedMotion])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * (prefersReducedMotion ? 0.05 : 0.4)
    if (!prefersReducedMotion) {
      const tx = mouseRef.current.y * 0.15
      const tz = mouseRef.current.x * -0.08
      groupRef.current.rotation.x += (tx - groupRef.current.rotation.x) * 0.04
      groupRef.current.rotation.z += (tz - groupRef.current.rotation.z) * 0.04
    }
  })

  return (
    <animated.group ref={groupRef} position={springs.position as unknown as [number, number, number]} scale={springs.scale as unknown as [number, number, number]}>
      <primitive object={centeredScene.current!} />
    </animated.group>
  )
}

// ─── Logo Canvas ──────────────────────────────────────────────────────────────
function LogoCanvas({ mouseRef, prefersReducedMotion }: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
  prefersReducedMotion: boolean
}) {
  return (
    <Canvas
      camera={{ fov: 35, position: [0, 0, 5], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      onCreated={({ gl, scene }) => {
        // Force WebGL canvas to be fully transparent
        scene.background = null
        gl.setClearColor(0x000000, 0)
        gl.setClearAlpha(0)
        // Also set the DOM canvas element's background explicitly
        gl.domElement.style.background = 'transparent'
      }}
      style={{
        background: 'transparent',
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} />
      <pointLight position={[0, 5, 3]} intensity={0.8} color="#ffffff" />
      <Environment preset="studio" background={false} />
      <LogoMesh mouseRef={mouseRef} prefersReducedMotion={prefersReducedMotion} />
    </Canvas>
  )
}

// Preload GLB after module is loaded (client-only context)
if (typeof window !== 'undefined') {
  useGLTF.preload('/models/logo.glb')
}

// ─── Scroll Manager (exported default) ───────────────────────────────────────
export default function LogoScrollManager() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setPrefersReducedMotion(reduced)

    if (reduced) return

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

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const vw = window.innerWidth
    const vh = window.innerHeight

    const heroSize = Math.min(Math.round(vw * 0.32), 480)
    const heroCenterX = vw / 2 - heroSize / 2
    const heroCenterY = vh * 0.38 - heroSize / 2  // slightly above center for visual balance

    const dockedSize = 44
    let dockedX = 40
    let dockedY = vh

    const updateDockedPosition = () => {
      const target = document.querySelector('[data-docked-logo]')
      if (target) {
        const rect = target.getBoundingClientRect()
        dockedX = rect.left
        dockedY = rect.top + window.scrollY + rect.height / 2 - dockedSize / 2
      }
    }

    gsap.set(wrapper, {
      position: 'fixed',
      width: heroSize,
      height: heroSize,
      left: heroCenterX,
      top: heroCenterY,
      zIndex: 50,
    })

    const scrubValue = reduced ? 0 : 1.2

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: scrubValue,
        onEnter: updateDockedPosition,
        onUpdate: (self) => {
          if (self.progress >= 0.98) {
            gsap.set(wrapper, { position: 'absolute' })
          } else {
            gsap.set(wrapper, { position: 'fixed' })
          }
        },
        onLeaveBack: () => {
          gsap.set(wrapper, { position: 'fixed' })
        },
      },
    })

    tl
      .to(wrapper, {
        left: dockedX,
        top: () => dockedY,
        width: dockedSize,
        height: dockedSize,
        ease: 'power3.inOut',
        duration: 0.6,
      })
      .to(wrapper, {
        opacity: 1,
        ease: 'none',
        duration: 0.4,
        onComplete: () => { wrapper.style.willChange = 'auto' },
      })

    if (!reduced) {
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
    }

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        zIndex: 50,
        pointerEvents: 'none',
        willChange: 'transform, width, height, opacity',
        overflow: 'hidden',
      }}
    >
      <LogoCanvas mouseRef={mouseRef} prefersReducedMotion={prefersReducedMotion} />
    </div>
  )
}
