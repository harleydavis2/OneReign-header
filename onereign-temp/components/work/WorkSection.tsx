'use client'
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
