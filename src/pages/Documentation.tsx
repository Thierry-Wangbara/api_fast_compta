// src/pages/api-docs/Documentation.tsx
import { useState } from 'react'
import { endpointsBySection } from './documentation/data'
import SectionBlock from './documentation/ui/SectionBlock'

export default function Documentation() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Record<string, string>>({})

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '3rem 2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>📚 Documentation API</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: '0.5rem 0 0' }}>
            Documentation complète de l'API REST Fast Compta
          </p>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <strong>Base URL:</strong>
            <code
              style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.75rem',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
              }}
            >
              http://localhost:3001/api
            </code>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {Object.entries(endpointsBySection).map(([section, sectionEndpoints]) => (
          <SectionBlock
            key={section}
            section={section}
            endpoints={sectionEndpoints}
            expandedSection={expandedSection}
            setExpandedSection={(v) => {
              setExpandedSection(v)
              setExpandedEndpoint(null) // reset endpoint quand on change de section
            }}
            expandedEndpoint={expandedEndpoint}
            setExpandedEndpoint={setExpandedEndpoint}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
      </div>
    </div>
  )
}
