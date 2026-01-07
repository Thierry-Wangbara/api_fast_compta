import React from 'react'
import type { Endpoint } from '../types.ts'
import EndpointCard from './EndpointCard'

export default function SectionBlock({
  section,
  endpoints,
  expandedSection,
  setExpandedSection,
  expandedEndpoint,
  setExpandedEndpoint,
  activeTab,
  setActiveTab,
}: {
  section: string
  endpoints: Endpoint[]
  expandedSection: string | null
  setExpandedSection: (v: string | null) => void
  expandedEndpoint: string | null
  setExpandedEndpoint: (v: string | null) => void
  activeTab: Record<string, string>
  setActiveTab: (v: Record<string, string>) => void
}) {
  const isOpen = expandedSection === section

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '1.5rem',
          background: isOpen ? '#f8f9fa' : 'white',
          cursor: 'pointer',
          borderBottom: isOpen ? '2px solid #667eea' : 'none',
        }}
        onClick={() => setExpandedSection(isOpen ? null : section)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#2d3748', fontWeight: 600 }}>{section}</h2>
          <span
            style={{
              fontSize: '1.2rem',
              color: '#667eea',
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            ▶
          </span>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          {endpoints.map((endpoint, idx) => {
            const endpointKey = `${section}-${idx}`
            return (
              <EndpointCard
                key={endpointKey}
                endpoint={endpoint}
                endpointKey={endpointKey}
                expandedEndpoint={expandedEndpoint}
                setExpandedEndpoint={setExpandedEndpoint}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
