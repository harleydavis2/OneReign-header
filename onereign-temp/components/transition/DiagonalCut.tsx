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
