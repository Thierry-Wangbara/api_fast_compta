import React from 'react'
import type { FieldParam, FieldQuery } from '../types.ts'

export default function FieldsList({
  title,
  items,
  isQuery,
}: {
  title: string
  items: any[]
  isQuery?: boolean
}) {
  if (!items || items.length === 0) return null

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h4 style={{ color: '#2d3748', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>{title}</h4>

      <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.75rem 1rem',
              borderBottom: idx < items.length - 1 ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <code style={{ color: '#667eea', fontWeight: 600, fontSize: '0.875rem', minWidth: 120 }}>{it.name}</code>

            <span
              style={{
                padding: '0.25rem 0.5rem',
                background: '#f0f4f8',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#4a5568',
                fontFamily: 'monospace',
              }}
            >
              {it.type}
            </span>

            {!isQuery && it.required && (
              <span
                style={{
                  padding: '0.125rem 0.5rem',
                  background: '#fee',
                  color: '#c53030',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                REQUIS
              </span>
            )}

            <span style={{ color: '#718096', fontSize: '0.875rem', marginLeft: 'auto' }}>{it.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
