import { useState } from 'react'
import { endpointsBySection } from './documentation/data'
import MethodBadge from './documentation/ui/MethodBadge'
import JsonTabs from './documentation/ui/JsonTabs'
import FieldsList from './documentation/ui/FieldsList'

export default function Documentation() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Record<string, string>>({})

  const sections = Object.keys(endpointsBySection)
  const defaultSection = sections[0] || null

  const currentSection = activeSection || defaultSection
  const currentEndpoints = currentSection ? endpointsBySection[currentSection] : []

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: '1.5rem 2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#1a202c' }}>
              📚 Documentation API
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#718096', margin: '0.25rem 0 0' }}>
              API REST Fast Compta
            </p>
          </div>
          <div
            style={{
              padding: '0.5rem 1rem',
              background: '#f7fafc',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#718096', marginRight: '0.5rem' }}>Base URL:</span>
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: '#2d3748',
                fontWeight: 500,
              }}
            >
              http://localhost:3001/api
            </code>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div
          style={{
            width: '280px',
            background: 'white',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            padding: '1.5rem 0',
          }}
        >
          <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem 0' }}>
              Sections
            </h2>
          </div>
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                background: currentSection === section ? '#edf2f7' : 'transparent',
                border: 'none',
                borderLeft: currentSection === section ? '3px solid #667eea' : '3px solid transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: currentSection === section ? '#2d3748' : '#4a5568',
                fontWeight: currentSection === section ? 600 : 400,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{section}</span>
              <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>
                {endpointsBySection[section].length}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            background: '#f8fafc',
          }}
        >
          {currentSection && (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a202c', margin: '0 0 0.5rem 0' }}>
                  {currentSection}
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#718096', margin: 0 }}>
                  {currentEndpoints.length} endpoint{currentEndpoints.length > 1 ? 's' : ''} disponible{currentEndpoints.length > 1 ? 's' : ''}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {currentEndpoints.map((endpoint, idx) => {
                  const endpointKey = `${currentSection}-${idx}`
                  return (
                    <div
                      key={endpointKey}
                      style={{
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Endpoint Header */}
                      <div
                        style={{
                          padding: '1.25rem 1.5rem',
                          borderBottom: '1px solid #e2e8f0',
                          background: '#fafbfc',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                          <MethodBadge method={endpoint.method} />
                          <code
                            style={{
                              fontSize: '0.95rem',
                              fontFamily: 'monospace',
                              color: '#2d3748',
                              fontWeight: 500,
                            }}
                          >
                            {endpoint.path}
                          </code>
                        </div>
                        <p style={{ color: '#4a5568', margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>
                          {endpoint.description}
                        </p>
                      </div>

                      {/* Endpoint Content */}
                      <div style={{ padding: '1.5rem' }}>
                        {/* JSON Examples */}
                        {(endpoint.requestExample || endpoint.responseExample || endpoint.errorExample) && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <JsonTabs
                              endpointKey={endpointKey}
                              requestExample={endpoint.requestExample}
                              responseExample={endpoint.responseExample}
                              errorExample={endpoint.errorExample}
                              activeTab={activeTab}
                              setActiveTab={setActiveTab}
                            />
                          </div>
                        )}

                        {/* Parameters */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          {endpoint.params && endpoint.params.length > 0 && (
                            <FieldsList title="Paramètres d'URL" items={endpoint.params} />
                          )}
                          {endpoint.query && endpoint.query.length > 0 && (
                            <FieldsList title="Paramètres de requête" items={endpoint.query} isQuery />
                          )}
                          {endpoint.body && endpoint.body.length > 0 && (
                            <FieldsList title="Corps de la requête" items={endpoint.body} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
