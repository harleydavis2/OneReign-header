/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile three.js packages so they work correctly with Next.js SSR
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-spring/three',
    '@react-spring/core',
  ],
}

export default nextConfig
