export default function DebugInfo() {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#000',
      color: '#0f0',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999
    }}>
      <div>✅ React is working</div>
      <div>📍 Location: {window.location.href}</div>
      <div>🕐 Time: {new Date().toLocaleTimeString()}</div>
    </div>
  )
}