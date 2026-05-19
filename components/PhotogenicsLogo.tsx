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

  return (
    <Image
      src="/photogenics-logo.png"
      alt="Photogenics"
      width={248}
      height={56}
      priority
      style={{
        display: 'block',
        width: 'auto',
        height: size,
        opacity,
        userSelect: 'none',
      }}
    />
  )
}
