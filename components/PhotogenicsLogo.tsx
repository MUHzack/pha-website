'use client'

interface LogoProps {
  color?: string
  size?: string
}

export function PhotogenicsLogo({
  color = '#ffffff',
  size = '1.1rem',
}: LogoProps) {
  return (
    <span
      style={{
        color,
        fontSize: size,
        letterSpacing: '0.04em',
        fontWeight: 600,
        fontFamily: 'var(--font-outfit, sans-serif)',
        display: 'inline-flex',
        alignItems: 'baseline',
        userSelect: 'none',
      }}
    >
      phot
      {/* The iconic "o" with a center dot — camera lens motif */}
      <span style={{ position: 'relative', display: 'inline-block' }}>
        o
        <span
          style={{
            position: 'absolute',
            top: '46%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '0.2em',
            height: '0.2em',
            background: color,
            borderRadius: '50%',
            display: 'block',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      </span>
      genics
    </span>
  )
}