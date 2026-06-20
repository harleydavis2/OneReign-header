'use client'
import { useRef, useEffect } from 'react'
import NavBar from './NavBar'
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
        See LogoScrollManager.tsx.
      */}
    </section>
  )
}
