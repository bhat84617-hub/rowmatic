import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/supabase'

const G='#00E5A0',B='#00C4F4',CARD='#0D1829',BORDER='#142030',MUTED='#4A6080'
const F="'Syne',sans-serif",M="'JetBrains Mono',monospace"

export default function Auth(){
  const nav=useNavigate()
  const [tab,setTab]=useState('login')
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [name,setName]=useState('')
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const [ok,setOk]=useState('')

  const handleGoogle=async()=>{
    setLoading(true);setErr('')
    const {error}=await signInWithGoogle()
    if(error){setErr(error.message);setLoading(false)}
  }

  const handleSubmit=async()=>{
    if(!email||!pass)return setErr('Email aur password required hai')
    setLoading(true);setErr('')
    try{
      if(tab==='login'){
        const {error}=await signInWithEmail(email,pass)
        if(error)throw error
        nav('/dashboard')
      }else{
        if(!name)return setErr('Naam required hai')
        const {error}=await signUpWithEmail(email,pass,name)
        if(error)throw error
        setOk('✅ Email verify karo, phir login karo!')
      }
    }catch(e){setErr(e.message)}
    finally{setLoading(false)}
  }

  const inp={width:'100%',background:'#080F1E',border:`1px solid ${BORDER}`,borderRadius:10,color:'#E8F4F8',fontSize:14,padding:'12px 14px',outline:'none',fontFamily:F,transition:'border-color .2s'}

  return(
    <div style={{minHeight:'100vh',position:'relative',fontFamily:F,color:'#E8F4F8',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Background/>
      <div style={{position:'relative',zIndex:5,width:'100%',maxWidth:420,padding:'0 16px',animation:'fadeUp .6s ease'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:10,marginBottom:8}}>
            <div style={{width:42,height:42,borderRadius:11,background:`linear-gradient(135deg,${G},${B})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>⚡</div>
            <div style={{fontSize:26,fontWeight:800}}>Row<span style={{color:G}}>matic</span></div>
          </div>
          <div style={{fontSize:12,color:MUTED,letterSpacing:2,fontFamily:M}}>AUTOMATE EVERY ROW</div>
        </div>

        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:20,padding:'28px 24px'}}>
          <div style={{display:'flex',background:'#080F1E',borderRadius:10,padding:4,marginBottom:24}}>
            {['login','signup'].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setErr('');setOk('')}}
                style={{flex:1,padding:'9px',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',fontFamily:F,background:tab===t?CARD:'transparent',color:tab===t?'#E8F4F8':MUTED,transition:'all .2s'}}>
                {t==='login'?'🔑 Login':'✨ Sign Up'}
              </button>
            ))}
          </div>

          <button onClick={handleGoogle} disabled={loading}
            style={{width:'100%',padding:'12px',borderRadius:11,fontSize:14,fontWeight:700,cursor:'pointer',border:`1px solid ${BORDER}`,background:'#080F1E',color:'#E8F4F8',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:20,transition:'all .2s'}}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google se {tab==='login'?'Login':'Sign Up'} Karo
          </button>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div style={{flex:1,height:1,background:BORDER}}/><span style={{fontSize:12,color:MUTED}}>ya email se</span><div style={{flex:1,height:1,background:BORDER}}/>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {tab==='signup'&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Tumhara naam" style={inp} onFocus={e=>e.target.style.borderColor=G+'60'} onBlur={e=>e.target.style.borderColor=BORDER}/>}
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" style={inp} onFocus={e=>e.target.style.borderColor=G+'60'} onBlur={e=>e.target.style.borderColor=BORDER}/>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" style={inp} onFocus={e=>e.target.style.borderColor=G+'60'} onBlur={e=>e.target.style.borderColor=BORDER} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          </div>

          {err&&<div style={{marginTop:12,padding:'10px 14px',borderRadius:8,background:'#1F0A0A',border:'1px solid #7F1D1D',color:'#FCA5A5',fontSize:12}}>⚠️ {err}</div>}
          {ok&&<div style={{marginTop:12,padding:'10px 14px',borderRadius:8,background:`${G}10`,border:`1px solid ${G}40`,color:G,fontSize:12}}>{ok}</div>}

          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',marginTop:16,padding:'13px',borderRadius:11,fontSize:14,fontWeight:800,cursor:loading?'not-allowed':'pointer',border:'none',fontFamily:F,background:loading?BORDER:`linear-gradient(135deg,${G},${B})`,color:loading?MUTED:'#050A14',transition:'all .3s'}}>
            {loading?'⏳ Wait karo...':tab==='login'?'🔑 Login Karo':'✨ Account Banao'}
          </button>
        </div>
        <div style={{textAlign:'center',marginTop:16,fontSize:12,color:MUTED}}>
          Sign up karke tum hamare <span style={{color:G,cursor:'pointer'}}>Terms</span> se agree karte ho
        </div>
      </div>
    </div>
  )
}
