import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Background from '../components/Background'
import { createOrder, verifyPayment } from '../lib/api'

const G='#00E5A0',B='#00C4F4',O='#FFB347',CARD='#0D1829',BORDER='#142030',MUTED='#4A6080'
const F="'Syne',sans-serif",M="'JetBrains Mono',monospace"

const PLANS=[
  {id:'free',name:'Free',price:0,color:MUTED,icon:'🆓',
    features:['10 files per month','5 MB file size limit','All 7 file types','8 quick action categories','12 ready templates','Excel + CSV download','Hindi + English support'],
    missing:['Unlimited files','50MB file size','Priority AI','API access','Team seats']},
  {id:'pro',name:'Pro',price:299,color:G,icon:'⚡',popular:true,
    features:['Unlimited files','50 MB file size limit','All 7 file types','8 quick action categories','12 ready templates','Excel + CSV download','Hindi + English support','Priority AI processing','History & analytics','Email support'],
    missing:['API access','Team seats']},
  {id:'business',name:'Business',price:999,color:O,icon:'🏢',
    features:['Unlimited files','200 MB file size limit','All 7 file types','8 quick action categories','12 ready templates','Excel + CSV download','Hindi + English support','Priority AI processing','History & analytics','API access (10k/mo)','5 team seats','Priority support','Custom branding'],
    missing:[]},
]

const FAQS=[
  ['Kya free plan mein card chahiye?','Bilkul nahi! Free mein koi card nahi lagta.'],
  ['Kya refund milta hai?','Haan! 7 din ke andar full refund. support@rowmatic.io pe email karo.'],
  ['Payment kaise hoga?','Razorpay se — UPI, Card, NetBanking sab accept karta hai.'],
  ['Kaunse AI providers supported hain?','Gemini, Nvidia NIM, Groq, OpenAI, Mistral, Claude — 6 options!'],
  ['API kya hai Business mein?','REST API milti hai apne app mein Rowmatic integrate karne ke liye.'],
  ['Plan cancel kar sakte hain?','Haan, kabhi bhi. Next billing cycle se charge nahi hoga.'],
]

export default function Pricing({user}){
  const nav=useNavigate()
  const [loading,setLoading]=useState('')

  const handleBuy=async(plan)=>{
    if(!user)return nav('/auth')
    if(plan.id==='free')return nav('/dashboard')
    setLoading(plan.id)
    try{
      const order=await createOrder(plan.id)
      const options={
        key:import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:order.amount,currency:'INR',
        name:'Rowmatic',description:`${plan.name} Plan`,
        order_id:order.id,
        handler:async(response)=>{
          await verifyPayment({...response,plan:plan.id})
          nav('/dashboard')
        },
        prefill:{email:user?.email,name:user?.user_metadata?.full_name},
        theme:{color:G}
      }
      const rzp=new window.Razorpay(options)
      rzp.open()
    }catch(e){alert('Payment error: '+e.message)}
    finally{setLoading('')}
  }

  return(
    <div style={{minHeight:'100vh',position:'relative',fontFamily:F,color:'#E8F4F8'}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px #00E5A030}50%{box-shadow:0 0 40px #00E5A060}}
      `}</style>
      <script src="https://checkout.razorpay.com/v1/checkout.js"/>
      <Background/>
      <Navbar user={user}/>
      <div style={{position:'relative',zIndex:5,maxWidth:1000,margin:'0 auto',padding:'48px 16px 80px'}}>

        <div style={{textAlign:'center',marginBottom:56,animation:'fadeUp .6s ease'}}>
          <div style={{fontSize:12,color:G,letterSpacing:2,marginBottom:12,fontFamily:M}}>PRICING</div>
          <h1 style={{fontSize:'clamp(32px,6vw,52px)',fontWeight:800,marginBottom:14}}>Simple, Transparent Pricing</h1>
          <p style={{fontSize:15,color:MUTED,maxWidth:440,margin:'0 auto'}}>Shuru karo free mein. Upgrade karo jab ready ho. Koi hidden charges nahi.</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginBottom:60}}>
          {PLANS.map(plan=>(
            <div key={plan.id} style={{padding:'28px 24px',borderRadius:20,background:CARD,border:`2px solid ${plan.popular?plan.color+'60':BORDER}`,position:'relative',transition:'all .3s'}}>
              {plan.popular&&<div style={{position:'absolute',top:-13,left:'50%',transform:'translateX(-50%)',padding:'4px 16px',borderRadius:20,background:`linear-gradient(135deg,${G},${B})`,color:'#050A14',fontSize:11,fontWeight:800,letterSpacing:1,whiteSpace:'nowrap'}}>⭐ MOST POPULAR</div>}
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                <div style={{width:42,height:42,borderRadius:11,background:`${plan.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{plan.icon}</div>
                <div>
                  <div style={{fontSize:18,fontWeight:800}}>{plan.name}</div>
                  <div style={{fontSize:11,color:MUTED,fontFamily:M}}>{plan.id==='free'?'Forever free':'Per month'}</div>
                </div>
              </div>
              <div style={{marginBottom:24}}>
                <span style={{fontSize:42,fontWeight:800,color:plan.color}}>{plan.price===0?'₹0':`₹${plan.price}`}</span>
                {plan.price>0&&<span style={{fontSize:14,color:MUTED}}>/month</span>}
              </div>
              <button onClick={()=>handleBuy(plan)} disabled={loading===plan.id}
                style={{width:'100%',padding:13,borderRadius:12,fontSize:14,fontWeight:800,cursor:'pointer',border:'none',fontFamily:F,marginBottom:24,transition:'all .3s',background:plan.popular?`linear-gradient(135deg,${G},${B})`:`${plan.color}18`,color:plan.popular?'#050A14':plan.color,animation:plan.popular?'glow 2s ease-in-out infinite':'none'}}>
                {loading===plan.id?'⏳ Wait...':plan.price===0?'Start Free →':`Get ${plan.name} ⚡`}
              </button>
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                {plan.features.map(f=>(
                  <div key={f} style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
                    <span style={{color:G,fontSize:15,flexShrink:0}}>✓</span><span>{f}</span>
                  </div>
                ))}
                {plan.missing.map(f=>(
                  <div key={f} style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
                    <span style={{color:MUTED,fontSize:15,flexShrink:0}}>✗</span><span style={{color:MUTED}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{maxWidth:640,margin:'0 auto'}}>
          <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:20,textAlign:'center',fontFamily:M}}>FAQ</div>
          {FAQS.map(([q,a])=>(
            <div key={q} style={{padding:18,borderRadius:12,background:CARD,border:`1px solid ${BORDER}`,marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>❓ {q}</div>
              <div style={{fontSize:13,color:MUTED,lineHeight:1.6}}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
