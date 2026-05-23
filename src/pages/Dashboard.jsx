import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Background from '../components/Background'
import { getUsage } from '../lib/api'
import { signOut } from '../lib/supabase'

const G='#00E5A0',B='#00C4F4',O='#FFB347',P='#C77DFF',R='#FF6B6B'
const CARD='#0D1829',BORDER='#142030',MUTED='#4A6080'
const F="'Syne',sans-serif",M="'JetBrains Mono',monospace"

export default function Dashboard({user}){
  const nav=useNavigate()
  const [usage,setUsage]=useState(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    getUsage().then(d=>{setUsage(d);setLoading(false)}).catch(()=>setLoading(false))
  },[])

  const plan=usage?.plan||'free'
  const used=usage?.used||0
  const limit=usage?.limit||10
  const pct=Math.min((used/limit)*100,100)

  const Stat=({icon,label,value,color,sub})=>(
    <div style={{padding:20,borderRadius:14,background:CARD,border:`1px solid ${BORDER}`}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{width:38,height:38,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div>
        <span style={{fontSize:10,color:MUTED,fontFamily:M,letterSpacing:1}}>{label}</span>
      </div>
      <div style={{fontSize:28,fontWeight:800,color}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:MUTED,marginTop:4}}>{sub}</div>}
    </div>
  )

  return(
    <div style={{minHeight:'100vh',position:'relative',fontFamily:F,color:'#E8F4F8'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes glow{0%,100%{box-shadow:0 0 20px #00E5A030}50%{box-shadow:0 0 40px #00E5A060}}`}</style>
      <Background/>
      <Navbar user={user}/>
      <div style={{position:'relative',zIndex:5,maxWidth:900,margin:'0 auto',padding:'32px 16px 80px'}}>

        <div style={{marginBottom:32,animation:'fadeUp .6s ease'}}>
          <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:8,fontFamily:M}}>DASHBOARD</div>
          <h1 style={{fontSize:28,fontWeight:800,marginBottom:4}}>Namaste, {user?.user_metadata?.full_name?.split(' ')[0]||'Bhai'} 👋</h1>
          <div style={{fontSize:13,color:MUTED}}>{user?.email}</div>
        </div>

        <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'10px 18px',borderRadius:12,marginBottom:28,background:plan==='pro'?`${G}15`:`${O}15`,border:`1px solid ${plan==='pro'?G+'40':O+'40'}`}}>
          <span style={{fontSize:18}}>{plan==='pro'?'⚡':'🆓'}</span>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:plan==='pro'?G:O}}>{plan==='pro'?'Pro Plan':plan==='business'?'Business Plan':'Free Plan'}</div>
            <div style={{fontSize:11,color:MUTED}}>{plan==='free'?`${used}/${limit} files used this month`:'Unlimited access'}</div>
          </div>
          {plan==='free'&&<button onClick={()=>nav('/pricing')}
            style={{marginLeft:12,padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:700,background:`linear-gradient(135deg,${G},${B})`,color:'#050A14',border:'none',cursor:'pointer',fontFamily:F}}>
            Upgrade ⚡
          </button>}
        </div>

        {loading?<div style={{textAlign:'center',padding:40,color:MUTED}}>Loading...</div>:<>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:28}}>
            <Stat icon="📁" label="FILES PROCESSED" value={used} color={G} sub="This month"/>
            <Stat icon="⚡" label="TOTAL OPERATIONS" value={usage?.operations||0} color={B} sub="All time"/>
            <Stat icon="💾" label="PLAN LIMIT" value={plan==='free'?limit:'∞'} color={O} sub={plan==='free'?'Per month':'Unlimited'}/>
            <Stat icon="📅" label="MEMBER SINCE" value={new Date(user?.created_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'})} color={P} sub="Welcome!"/>
          </div>

          {plan==='free'&&<div style={{padding:20,borderRadius:14,background:CARD,border:`1px solid ${BORDER}`,marginBottom:28}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
              <span style={{fontSize:13,fontWeight:700}}>Monthly Usage</span>
              <span style={{fontSize:12,color:MUTED,fontFamily:M}}>{used}/{limit} files</span>
            </div>
            <div style={{height:8,borderRadius:4,background:BORDER,overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:4,width:`${pct}%`,background:pct>80?`linear-gradient(90deg,${R},#FF4444)`:`linear-gradient(90deg,${G},${B})`,transition:'width 1s ease'}}/>
            </div>
            {pct>80&&<div style={{fontSize:11,color:R,marginTop:8}}>⚠️ Almost full! Upgrade karo unlimited ke liye.</div>}
          </div>}
        </>}

        <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:14,fontFamily:M}}>QUICK ACTIONS</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginBottom:32}}>
          {[
            {icon:'🚀',label:'New File Process',desc:'Upload karke process karo',action:()=>nav('/'),color:G},
            {icon:'✨',label:'Scratch Se Banao',desc:'Bina file ke Excel banao',action:()=>nav('/'),color:B},
            {icon:'💎',label:'Pro Upgrade',desc:'Unlimited access lo',action:()=>nav('/pricing'),color:O},
          ].map((item,i)=>(
            <div key={i} onClick={item.action}
              style={{padding:18,borderRadius:14,background:CARD,border:`1px solid ${BORDER}`,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:42,height:42,borderRadius:11,background:`${item.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{item.icon}</div>
              <div><div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{item.label}</div><div style={{fontSize:11,color:MUTED}}>{item.desc}</div></div>
            </div>
          ))}
        </div>

        <div style={{padding:20,borderRadius:14,background:CARD,border:`1px solid ${BORDER}`}}>
          <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:16,fontFamily:M}}>ACCOUNT INFO</div>
          {[['👤 Naam',user?.user_metadata?.full_name||'N/A'],['📧 Email',user?.email],['🎯 Plan',plan.toUpperCase()],['🔐 Login',user?.app_metadata?.provider||'email']].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${BORDER}`}}>
              <span style={{fontSize:13,color:MUTED}}>{k}</span>
              <span style={{fontSize:13,fontWeight:600,fontFamily:M}}>{v}</span>
            </div>
          ))}
          <button onClick={()=>{signOut();nav('/')}}
            style={{width:'100%',marginTop:16,padding:11,borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',background:'transparent',border:`1px solid ${BORDER}`,color:MUTED,fontFamily:F}}>
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
