function Api() {
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        marginBottom: '1rem',
        color: '#333'
      }}>
        🔌 API
      </h1>
      <div style={{
        background: '#f5f5f5',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.6' }}>
          Bienvenue sur l'interface API de Fast Compta.
        </p>
        <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.6', marginTop: '1rem' }}>
          Cette page contiendra l'interface et les endpoints de l'API.
        </p>
      </div>
    </div>
  )
}

export default Api

