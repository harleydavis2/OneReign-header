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
          whileHover={{ borderColor: 'rgba(255,255,255,0.18)' } as any}
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
