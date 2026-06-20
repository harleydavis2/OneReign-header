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
