'use client'
import dynamic from 'next/dynamic'
import NavBar from '@/components/hero/NavBar'
import HeroSection from '@/components/hero/HeroSection'
import DiagonalCut from '@/components/transition/DiagonalCut'
import WorkSection from '@/components/work/WorkSection'

// Dynamic import with ssr:false — @react-three/fiber and @react-spring/three
// access browser globals (WebGL, performance, etc.) at import time.
// This must be imported in a 'use client' page to avoid the BailoutToCSR error.
const LogoScrollManager = dynamic(
  () => import('@/components/transition/LogoScrollManager'),
  { ssr: false, loading: () => null }
)

export default function Home() {
  return (
    <main style={{ background: '#FFFFFF', position: 'relative' }}>
      <NavBar />
      <HeroSection />
      <DiagonalCut />
      <WorkSection />
      <LogoScrollManager />
    </main>
  )
}
