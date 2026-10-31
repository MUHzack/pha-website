import { Fragment, type CSSProperties } from 'react'

const STEPS = ['Review', 'Voucher Gratis', 'Download Softfile'] as const

interface Props {
  // Index of the active step: 0 = Review, 1 = Voucher Gratis, 2 = Download Softfile
  current: 0 | 1 | 2
}

export function FlowStepper({ current }: Props) {
  return (
    <nav aria-label="Langkah" style={wrapStyle}>
      <ol style={listStyle}>
        {STEPS.map((label, index) => {
          const done = index < current
          const active = index === current
          return (
            <Fragment key={label}>
              {index > 0 && (
                <li aria-hidden="true" style={{ ...connectorStyle, background: index <= current ? '#b78a52' : '#ded8cf' }} />
              )}
              <li aria-current={active ? 'step' : undefined} style={stepStyle}>
                <span
                  style={{
                    ...circleStyle,
                    background: done ? '#b78a52' : active ? '#171512' : '#fff',
                    color: done || active ? '#fff' : '#a69c8f',
                    border: done || active ? '1px solid transparent' : '1px solid #ded8cf',
                    boxShadow: active ? '0 0 0 4px rgba(183,138,82,0.18)' : 'none',
                  }}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  ) : index + 1}
                </span>
                <span
                  style={{
                    ...labelStyle,
                    color: active ? '#211d18' : done ? '#72522d' : '#a69c8f',
                    fontWeight: active ? 700 : 600,
                  }}
                >
                  {label}
                </span>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

const wrapStyle: CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  marginBottom: '1.5rem',
  padding: '0.95rem clamp(0.75rem, 4vw, 1.5rem)',
  background: 'rgba(255,255,255,0.94)',
  border: '1px solid rgba(102,83,59,0.12)',
  borderRadius: '20px',
  boxShadow: '0 12px 40px rgba(54,42,27,0.08)',
  animation: 'fadeUp 0.6s ease 0.05s both',
}

const listStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  listStyle: 'none',
}

const stepStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.45rem',
  flex: '0 0 auto',
  width: 'clamp(72px, 22vw, 104px)',
}

const circleStyle: CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  fontSize: '0.85rem',
  fontWeight: 700,
  transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
}

const labelStyle: CSSProperties = {
  fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
  lineHeight: 1.3,
  textAlign: 'center',
}

const connectorStyle: CSSProperties = {
  flex: 1,
  height: '2px',
  marginTop: '15px',
  borderRadius: '2px',
  transition: 'background 0.2s ease',
}
