'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

// ─── Inner logo mesh ────────────────────────────────────────────────────────
function LogoMesh({ mouseRef, prefersReducedMotion }: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
  prefersReducedMotion: boolean
}) {
  const { scene } = useGLTF('/models/logo.glb')
  const groupRef = useRef<THREE.Group>(null)

  // @react-spring/three: entry drop with spring physics
  const [springs, api] = useSpring(() => ({
    position: prefersReducedMotion ? [0, 0, 0] : [0, 2.5, 0] as [number, number, number],
    scale: prefersReducedMotion ? [1.4, 1.4, 1.4] : [0.6, 0.6, 0.6] as [number, number, number],
    config: { mass: 1.2, tension: 80, friction: 18 },
  }))

  useEffect(() => {
    if (prefersReducedMotion) return
    const timer = setTimeout(() => {
      api.start({
        position: [0, 0, 0],
        scale: [1.4, 1.4, 1.4],
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [api, prefersReducedMotion])

  // useFrame: continuous rotation + mouse tilt — UNCONDITIONAL, runs every frame
  useFrame((state, delta) => {
    if (!groupRef.current) return
    const rotationSpeed = prefersReducedMotion ? 0.05 : 0.4
    groupRef.current.rotation.y += delta * rotationSpeed

    if (!prefersReducedMotion) {
      const targetX = mouseRef.current.y * 0.15
      const targetZ = mouseRef.current.x * -0.08
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04
      groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.04
    }
  })

  return (
    <animated.group
      ref={groupRef}
      position={springs.position as any}
      scale={springs.scale as any}
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
    // Preload GLB after mount to avoid SSR issues
    useGLTF.preload('/models/logo.glb')
  }, [])

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
      <LogoMesh mouseRef={mouseRef} prefersReducedMotion={prefersReducedMotion} />
    </Canvas>
  )
}
