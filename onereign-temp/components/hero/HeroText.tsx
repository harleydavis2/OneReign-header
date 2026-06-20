'use client'
import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'

interface HeroTextProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
}

export default function HeroText({ mouseRef }: HeroTextProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // rAF loop: ONEREIGN backdrop moves opposite to mouse at 20% speed
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
          left: 0,
          right: 0,
          padding: '0 40px',
          textAlign: 'center',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <h1 style={{
          fontSize: 'clamp(20px, 3.2vw, 48px)',
          fontWeight: 700,
          color: '#0A0A0A',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '16px',
          // Allow wrapping on small screens, but clamp keeps it on one line at desktop
          whiteSpace: 'normal',
          maxWidth: '900px',
          margin: '0 auto 16px auto',
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
