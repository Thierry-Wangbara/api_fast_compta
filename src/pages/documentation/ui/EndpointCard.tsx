// src/pages/api-docs/ui/EndpointCard.tsx
import React from 'react'
import { Endpoint } from '../types'
import MethodBadge from './MethodBadge'
import JsonTabs from './JsonTabs'
import FieldsList from './FieldsList'

export default function EndpointCard({
  endpoint,
  endpointKey,
  expandedEndpoint,
  setExpandedEndpoint,
  activeTab,
  setActiveTab,
}: {
  endpoint: Endpoint
  endpointKey: string
  expandedEndpoint: string | null
  setExpandedEndpoint: (v: string | null) => void
  activeTab: Record<string, string>
  setActiveTab: (v: Record<string, string>) => void
}) {
  const isExpanded = expandedEndpoint === endpointKey

  function toggle() {
    const nowOpen = !isExpanded
    setExpandedEndpoint(nowOpen ? endpointKey : null)

    if (nowOpen && !activeTab[endpointKey]) {
      if (endpoint.requestExample) setActiveTab({ ...activeTab, [endpointKey]: 'request' })
      else if (endpoint.responseExample) setActiveTab({ ...activeTab, [endpointKey]: 'response' })
    }
  }

  return (
    <div
      style={{
        marginBottom: '1rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <div
        style={{
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          background: isExpanded ? '#f8f9fa' : 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
        onClick={toggle}
      >
        <MethodBadge method={endpoint.method} />
        <code style={{ fontSize: '0.95rem', fontFamily: 'monospace', color: '#2d3748', fontWeight: 500, flex: 1 }}>
          {endpoint.path}
        </code>
        <span style={{ fontSize: '0.875rem', color: '#718096', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
      </div>

      {isExpanded && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '1.5rem', background: '#fafbfc' }}>
          <p style={{ color: '#4a5568', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {endpoint.description}
          </p>

          <JsonTabs
            endpointKey={endpointKey}
            requestExample={endpoint.requestExample}
            responseExample={endpoint.responseExample}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <FieldsList title="Paramètres d'URL" items={endpoint.params || []} />
          <FieldsList title="Paramètres de requête" items={endpoint.query || []} isQuery />
          <FieldsList title="Corps de la requête" items={endpoint.body || []} />
        </div>
      )}
    </div>
  )
}
