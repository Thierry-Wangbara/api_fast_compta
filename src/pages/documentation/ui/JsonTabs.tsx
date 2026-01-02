// src/pages/api-docs/ui/JsonTabs.tsx

export default function JsonTabs({
  endpointKey,
  requestExample,
  responseExample,
  errorExample,
  activeTab,
  setActiveTab,
}: {
  endpointKey: string
  requestExample?: any
  responseExample?: any
  errorExample?: any
  activeTab: Record<string, string>
  setActiveTab: (v: Record<string, string>) => void
}) {
  if (!requestExample && !responseExample && !errorExample) return null

  const tab = activeTab[endpointKey] || (requestExample ? 'request' : responseExample ? 'response' : 'error')

  const Button = ({ id, label }: { id: 'request' | 'response' | 'error'; label: string }) => (
    <button
      onClick={() => setActiveTab({ ...activeTab, [endpointKey]: id })}
      style={{
        padding: '0.75rem 1.5rem',
        background: tab === id ? '#667eea' : 'transparent',
        color: tab === id ? 'white' : '#4a5568',
        border: 'none',
        borderBottom: tab === id ? '2px solid #667eea' : '2px solid transparent',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '0.875rem',
        marginBottom: '-2px',
      }}
    >
      {label}
    </button>
  )

  let json
  if (tab === 'request') json = requestExample
  else if (tab === 'response') json = responseExample
  else json = errorExample

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '1rem' }}>
        {requestExample && <Button id="request" label="Requête" />}
        {responseExample && <Button id="response" label="Réponse" />}
        {errorExample && <Button id="error" label="Erreur" />}
      </div>

      <div style={{ background: tab === 'error' ? '#2d1b1b' : '#1e1e1e', borderRadius: '8px', padding: '1.25rem', overflow: 'auto' }}>
        <pre style={{ margin: 0, color: tab === 'error' ? '#fca5a5' : '#d4d4d4', fontSize: '0.875rem', lineHeight: '1.6', textAlign: 'left', fontFamily: '"Fira Code", "Consolas", "Monaco", monospace' }}>
          <code style={{ display: 'block', textAlign: 'left' }}>{JSON.stringify(json, null, 2)}</code>
        </pre>
      </div>
    </div>
  )
}
