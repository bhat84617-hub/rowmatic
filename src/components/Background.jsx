export default function Background() {
  return (
    <>
      <style>{`
        @keyframes gridPan{from{transform:translate(0,0)}to{transform:translate(48px,48px)}}
        @keyframes orb1{0%,100%{transform:translate(0,0) scale(1);opacity:.5}50%{transform:translate(30px,-20px) scale(1.1);opacity:.8}}
        @keyframes orb2{0%,100%{transform:translate(0,0);opacity:.4}50%{transform:translate(-20px,30px);opacity:.7}}
      `}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', background: 'linear-gradient(135deg,#050A14 0%,#071220 60%,#050C18 100%)' }}>
        <div style={{ position: 'absolute', inset: -48, backgroundImage: 'linear-gradient(rgba(0,229,160,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,0.03) 1px,transparent 1px)', backgroundSize: '48px 48px', animation: 'gridPan 25s linear infinite' }} />
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', top: -250, right: -150, background: 'radial-gradient(circle,rgba(0,196,244,0.08) 0%,transparent 65%)', animation: 'orb1 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', bottom: -200, left: -150, background: 'radial-gradient(circle,rgba(0,229,160,0.07) 0%,transparent 65%)', animation: 'orb2 15s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: '45%', left: '45%', background: 'radial-gradient(circle,rgba(199,125,255,0.04) 0%,transparent 65%)', animation: 'orb1 20s ease-in-out infinite reverse' }} />
      </div>
    </>
  )
}
