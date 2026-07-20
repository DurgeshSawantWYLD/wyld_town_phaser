/**
 * App.jsx — Root application shell.
 * Placeholder for US-01. Full implementation in US-06.
 */

export default function App() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 40%, #e8f6ff 0%, #b8d8f0 55%, #8fc4e8 100%)',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <h1
        style={{
          fontSize: '64px',
          fontWeight: 900,
          letterSpacing: '-2px',
          background: 'linear-gradient(135deg, #1a7f5a, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        WYLD TOWN
      </h1>
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#5a85a8',
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}
      >
        React scaffold ready ✓
      </p>
    </div>
  )
}
