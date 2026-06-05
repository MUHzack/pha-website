'use client'

import Image from 'next/image'

interface LogoProps {
  color?: string
  size?: string
}

export function PhotogenicsLogo({
  color = '#0a0a0a',
  size = '1.1rem',
}: LogoProps) {
  const opacityMatch = color.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)
  const opacity = opacityMatch ? Number(opacityMatch[1]) : 1
  const filter = color.includes('255') || color.toLowerCase() === '#ffffff'
    ? 'invert(1)'
    : undefined

  return (
    <Image
      src="/Photogenics.png"
      alt="Photogenics"
      width={248}
      height={56}
      priority
      style={{
        display: 'block',
        width: `min(90vw, calc(${size} * 8.5))`,
        height: 'auto',
        opacity,
        filter,
        userSelect: 'none',
      }}
    />
  )
}
