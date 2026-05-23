import { Link, useNavigate } from 'react-router-dom'
import { signOut } from '../lib/supabase'

export default function Navbar({ user }) {
  const nav = useNavigate()
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: 'rgba(5,10,20,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #142030' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#00E5A0,#00C4F4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⚡</div>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.5 }}>Row<span style={{ color: '#00E5A0' }}>matic</span></div>
          <div style={{ fontSize: 9, color: '#4A6080', letterSpacing: 2, fontFamily: 'JetBrains Mono,monospace' }}>AUTOMATE EVERY ROW</div>
        </div>
      </Link>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link to="/pricing" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#4A6080', textDecoration: 'none' }}>Pricing</Link>
        {user ? (
          <>
            <Link to="/dashboard" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#00E5A018', color: '#00E5A0', textDecoration: 'none', border: '1px solid #00E5A030' }}>Dashboard</Link>
            <button onClick={() => { signOut(); nav('/') }} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, background: 'transparent', color: '#4A6080', border: '1px solid #142030', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontWeight: 600 }}>Sign Out</button>
          </>
        ) : (
          <Link to="/auth" style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 800, background: 'linear-gradient(135deg,#00E5A0,#00C4F4)', color: '#050A14', textDecoration: 'none' }}>Get Started</Link>
        )}
      </div>
    </nav>
  )
}
