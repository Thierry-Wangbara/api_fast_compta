// src/pages/api-docs/ui/MethodBadge.tsx
import React from 'react'

export function getMethodColor(method: string) {
  switch (method) {
    case 'GET': return { bg: '#e3f2fd', text: '#1976d2', border: '#1976d2' }
    case 'POST': return { bg: '#e8f5e9', text: '#388e3c', border: '#388e3c' }
    case 'PUT': return { bg: '#fff3e0', text: '#f57c00', border: '#f57c00' }
    case 'DELETE': return { bg: '#ffebee', text: '#d32f2f', border: '#d32f2f' }
    default: return { bg: '#f5f5f5', text: '#666', border: '#666' }
  }
}

export default function MethodBadge({ method }: { method: string }) {
  const c = getMethodColor(method)
  return (
    <span
      style={{
        padding: '0.35rem 0.75rem',
        borderRadius: '6px',
        color: c.text,
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        fontWeight: 600,
        fontSize: '0.75rem',
        minWidth: 60,
        textAlign: 'center',
      }}
    >
      {method}
    </span>
  )
}
