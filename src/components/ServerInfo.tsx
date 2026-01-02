import { useState, useEffect } from 'react'

export default function ServerInfo() {
  const [frontendUrl, setFrontendUrl] = useState('http://localhost:5173')
  const [backendUrl, setBackendUrl] = useState('http://localhost:3001')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    // Détecter l'URL actuelle du frontend
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.origin
      setFrontendUrl(currentUrl)
      
      // Sur Vercel ou en production, l'API est sur le même domaine avec /api
      // En développement local, utiliser le port 3001
      if (currentUrl.includes('vercel.app') || currentUrl.includes('localhost:5173') || currentUrl.includes('localhost:3000')) {
        // En production Vercel, l'API est sur le même domaine
        setBackendUrl(currentUrl + '/api')
      } else {
        // En développement, utiliser le serveur séparé
        setBackendUrl('http://localhost:3001/api')
      }
    }
  }, [])

  const handleCopy = async (url: string, type: 'frontend' | 'backend') => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>🚀 Application démarrée</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Frontend:</span>
            <code
              style={{
                background: copied === 'frontend' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid transparent',
              }}
              onClick={() => handleCopy(frontendUrl, 'frontend')}
              onMouseEnter={(e) => {
                if (copied !== 'frontend') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (copied !== 'frontend') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                }
              }}
              title="Cliquer pour copier"
            >
              {copied === 'frontend' ? '✓ Copié !' : frontendUrl}
            </code>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Backend:</span>
            <code
              style={{
                background: copied === 'backend' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid transparent',
              }}
              onClick={() => handleCopy(backendUrl, 'backend')}
              onMouseEnter={(e) => {
                if (copied !== 'backend') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (copied !== 'backend') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                }
              }}
              title="Cliquer pour copier"
            >
              {copied === 'backend' ? '✓ Copié !' : backendUrl}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

