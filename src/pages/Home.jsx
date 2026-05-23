import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Background from '../components/Background'
import { extractFileData, buildWorkbook, downloadWb } from '../lib/fileProcessor'
import { processFile, createExcel } from '../lib/api'

const G='#00E5A0',B='#00C4F4',CARD='#0D1829',BORDER='#142030',MUTED='#4A6080'
const CSS=`
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px #00E5A030}50%{box-shadow:0 0 40px #00E5A060}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.rm-hover:hover{background:rgba(0,229,160,0.04)!important}
.rm-card:hover{border-color:rgba(0,229,160,0.3)!important;transform:translateY(-2px)}
.rm-btn:hover{filter:brightness(1.15);transform:translateY(-1px)}
.rm-chip:hover{transform:translateY(-1px);filter:brightness(1.2)}
`
const TEMPLATES=[
  {icon:'🎓',label:'Marksheet',color:'#00E5A0',p:'10 students ki detailed marksheet banao jisme naam, roll no, Math, Science, English, Hindi, Social Science ke marks hon, total, percentage, grade aur pass/fail bhi ho'},
  {icon:'💰',label:'Salary Sheet',color:'#00C4F4',p:'10 employees ki salary sheet banao jisme naam, designation, department, basic salary, HRA 40%, DA 20%, TA, PF 12% deduction, gross salary, net salary ho'},
  {icon:'📦',label:'Inventory',color:'#FFB347',p:'20 products ki inventory sheet banao jisme product name, SKU, category, quantity, unit, buying price, selling price, total value, reorder level, supplier ho'},
  {icon:'💳',label:'Expense Tracker',color:'#C77DFF',p:'January se December tak monthly expense tracker banao jisme rent, food, transport, electricity, entertainment, medical, savings, monthly total, yearly summary ho'},
  {icon:'📊',label:'Sales Report',color:'#FF6B6B',p:'Q1 sales report banao jisme product, Jan Feb Mar sales, Q1 total, last year comparison, growth %, target, achievement %, status ho'},
  {icon:'📅',label:'Attendance',color:'#4ECDC4',p:'25 employees ki January monthly attendance sheet banao jisme naam, employee ID, har din P/A/H/L, total present, absent, leave, attendance % ho'},
  {icon:'🏠',label:'EMI Table',color:'#FF8C69',p:'Home loan EMI table banao 40 lakh loan, 8.5% annual interest, 20 saal tenure. Month number, EMI, principal, interest, outstanding balance dikhao'},
  {icon:'📝',label:'Invoice',color:'#56CFE1',p:'Professional invoice banao jisme company details, client details, invoice no, date, 10 items with qty/rate/amount, subtotal, GST 18%, grand total ho'},
  {icon:'🎯',label:'Project Tracker',color:'#FFD93D',p:'15 tasks ka project tracker banao jisme task ID, naam, assignee, start date, due date, priority, status (Todo/In Progress/Done), progress % ho'},
  {icon:'📚',label:'Timetable',color:'#6BCB77',p:'Class 10th school weekly timetable banao Monday to Saturday, 8 periods, subjects: Math, Science, English, Hindi, Social Science, Computer, PE, Art'},
  {icon:'🏥',label:'Patient Records',color:'#FF6B9D',p:'20 patients ka hospital record banao jisme patient ID, naam, age, gender, blood group, diagnosis, doctor, admission date, discharge date, bill amount ho'},
  {icon:'🚗',label:'Vehicle Log',color:'#A8E6CF',p:'Company vehicle log book banao January ke liye jisme date, vehicle number, driver naam, odometer readings, km driven, fuel filled, fuel cost, purpose ho'},
]
const QACTIONS=[
  {icon:'🧹',label:'Clean',color:'#00E5A0',actions:['Duplicate rows hatao','Empty rows remove karo','Extra spaces trim karo','Text Proper Case karo','Special characters remove karo','Number-as-text fix karo']},
  {icon:'🔃',label:'Sort',color:'#00C4F4',actions:['A-Z sort karo','Z-A sort karo','Number ascending sort','Number descending sort','Date newest first','Date oldest first']},
  {icon:'🧮',label:'Formula',color:'#FF6B6B',actions:['SUM column add karo','AVERAGE nikalo','Running total add karo','Percentage calculate karo','Rank column add karo','MIN MAX row add karo']},
  {icon:'💰',label:'Finance',color:'#FFB347',actions:['GST 18% add karo','Discount 10% calculate karo','Profit Loss nikalo','EMI calculate karo','Invoice total nikalo','Tax calculate karo']},
  {icon:'📅',label:'Date',color:'#C77DFF',actions:['Age calculate karo DOB se','Days difference nikalo','DD/MM/YYYY format karo','Month name add karo','Quarter add karo','Weekday add karo']},
  {icon:'✅',label:'Validate',color:'#4ECDC4',actions:['Missing values find karo','Duplicate values find karo','Negative numbers find karo','Email format check karo','Data quality report do','Outliers detect karo']},
  {icon:'🔄',label:'Transform',color:'#FF8C69',actions:['Rows columns transpose karo','Columns reorder karo','Headers rename karo','Serial numbers add karo','Columns merge karo','Data normalize karo']},
  {icon:'📊',label:'Analyze',color:'#56CFE1',actions:['Summary statistics nikalo','Category wise total karo','Top 10 rows dikhao','Bottom 10 rows dikhao','Insights do','Trend analyze karo']},
]
const PROC=['📖 File padh raha hu...','🧠 Data samajh raha hu...','🤖 AI se baat kar raha hu...','⚡ Excel bana raha hu...','✨ Final touches...']

export default function Home({user}){
  const nav=useNavigate()
  const [mode,setMode]=useState('home')
  const [file,setFile]=useState(null)
  const [fd,setFd]=useState(null)
  const [ins,setIns]=useState('')
  const [result,setResult]=useState(null)
  const [err,setErr]=useState('')
  const [drag,setDrag]=useState(false)
  const [cat,setCat]=useState(0)
  const [tab,setTab]=useState(0)
  const [pm,setPm]=useState(0)
  const [hist,setHist]=useState([])
  const ref=useRef()

  const handleFile=async(f)=>{
    if(!f)return
    setFile(f);setErr('')
    const data=await extractFileData(f).catch(e=>{setErr(e.message);return null})
    if(data){setFd(data);setMode('upload')}
  }
  const onDrop=useCallback((e)=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])},[])
  const process=async(instruction,m)=>{
    const i=instruction||ins
    if(!i.trim())return
    if(!user)return nav('/auth')
    setErr('');setMode('proc')
    let idx=0;const iv=setInterval(()=>setPm(idx++%PROC.length),900)
    try{
      const parsed=m==='create'?await createExcel(i):await processFile(fd?.text?.substring(0,8000),i,fd?.type)
      const wb=buildWorkbook(parsed.sheets)
      setResult({...parsed,wb,ins:i})
      setHist(h=>[{ins:i,sum:parsed.summary,time:new Date().toLocaleTimeString(),rows:(parsed.sheets[0]?.data?.length||1)-1},...h.slice(0,4)])
      setMode('result');setTab(0)
    }catch(e){
      if(e.message?.includes('limit'))nav('/pricing')
      else setErr(e.message)
      setMode(file?'upload':'create')
    }finally{clearInterval(iv)}
  }
  const reset=()=>{setFile(null);setFd(null);setIns('');setResult(null);setErr('');setMode('home')}
  const F="'Syne',sans-serif",M="'JetBrains Mono',monospace"

  return(
    <div style={{minHeight:'100vh',position:'relative',fontFamily:F,color:'#E8F4F8'}}>
      <style>{CSS}</style>
      <Background/>
      <Navbar user={user}/>
      <div style={{position:'relative',zIndex:5}}>

        {mode==='home'&&<div style={{maxWidth:920,margin:'0 auto',padding:'0 16px 80px'}}>
          <div style={{textAlign:'center',padding:'60px 0 48px',animation:'fadeUp .8s ease'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',borderRadius:20,background:`${G}12`,border:`1px solid ${G}28`,fontSize:11,color:G,fontWeight:700,letterSpacing:2,marginBottom:24,fontFamily:M}}>
              <span style={{animation:'pulse 2s ease-in-out infinite'}}>●</span> AI POWERED • HINDI + ENGLISH • FREE TO START
            </div>
            <h1 style={{fontSize:'clamp(40px,8vw,80px)',fontWeight:800,lineHeight:1.0,marginBottom:18,background:`linear-gradient(135deg,#fff 0%,${G} 45%,${B} 100%)`,backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 5s linear infinite'}}>
              Automate<br/>Every Row.
            </h1>
            <p style={{fontSize:15,color:MUTED,maxWidth:500,margin:'0 auto 40px',lineHeight:1.8}}>Koi bhi file do ya scratch se banao. Hindi ya English mein bolo kya karna hai. AI perfect Excel de dega. ⚡</p>
            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:48}}>
              {[['7+','File Types'],['100+','Operations'],['₹0','Cost'],['6','AI Options'],['Hindi','Support']].map(([v,l])=>(
                <div key={l} style={{padding:'10px 18px',borderRadius:12,background:CARD,border:`1px solid ${BORDER}`,textAlign:'center'}}>
                  <div style={{fontSize:22,fontWeight:800,color:G}}>{v}</div>
                  <div style={{fontSize:10,color:MUTED,letterSpacing:1,fontFamily:M}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:48}}>
            <div className="rm-card" onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop}
              style={{padding:'36px 24px',borderRadius:20,background:CARD,border:`2px dashed ${drag?G:BORDER}`,cursor:'pointer',transition:'all .3s',textAlign:'center',transform:drag?'scale(1.02)':'scale(1)'}}>
              <div style={{fontSize:48,marginBottom:16,animation:'bounce 3s ease-in-out infinite'}}>📂</div>
              <div style={{fontSize:18,fontWeight:800,marginBottom:8}}>File Upload Karo</div>
              <div style={{fontSize:12,color:MUTED,lineHeight:1.8,marginBottom:16}}>Excel, CSV, HTML, DOC, TXT, JSON</div>
              <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap'}}>
                {['.xlsx','.csv','.html','.json','.txt','.doc'].map(e=>(
                  <span key={e} style={{padding:'3px 8px',borderRadius:6,fontSize:10,background:BORDER,color:MUTED,fontFamily:M}}>{e}</span>
                ))}
              </div>
              <input ref={ref} type="file" accept=".xlsx,.xls,.csv,.html,.htm,.doc,.docx,.txt,.json" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
            </div>
            <div className="rm-card" onClick={()=>setMode('create')}
              style={{padding:'36px 24px',borderRadius:20,background:CARD,border:`2px solid ${BORDER}`,cursor:'pointer',transition:'all .3s',textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:16,animation:'bounce 3s ease-in-out infinite .5s'}}>✨</div>
              <div style={{fontSize:18,fontWeight:800,marginBottom:8}}>Scratch Se Banao</div>
              <div style={{fontSize:12,color:MUTED,lineHeight:1.8,marginBottom:16}}>File nahi hai? Koi baat nahi.<br/>Bol do — AI banayega</div>
              <div style={{padding:'8px 16px',borderRadius:20,background:`${G}18`,border:`1px solid ${G}30`,fontSize:11,color:G,fontFamily:M,display:'inline-block'}}>"Marksheet banao" → Done ✓</div>
            </div>
          </div>
          <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:16,fontFamily:M}}>⚡ ONE-CLICK TEMPLATES</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
            {TEMPLATES.map((t,i)=>(
              <div key={i} className="rm-card rm-btn" onClick={()=>process(t.p,'create')}
                style={{padding:'14px 16px',borderRadius:12,background:CARD,border:`1px solid ${BORDER}`,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:`${t.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{t.icon}</div>
                <div><div style={{fontSize:13,fontWeight:700}}>{t.label}</div><div style={{fontSize:10,color:MUTED}}>1-click</div></div>
              </div>
            ))}
          </div>
        </div>}

        {mode==='create'&&<div style={{maxWidth:800,margin:'0 auto',padding:'32px 16px 80px',animation:'fadeUp .5s ease'}}>
          <div style={{padding:20,borderRadius:16,background:CARD,border:`1px solid ${BORDER}`,marginBottom:20}}>
            <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:12,fontFamily:M}}>✨ SCRATCH SE EXCEL BANAO</div>
            <textarea value={ins} onChange={e=>setIns(e.target.value)} placeholder="Jaise: '10 students ki marksheet banao' ya 'monthly expense tracker banao' ya '20 employees ki salary sheet'..."
              style={{width:'100%',minHeight:120,background:'#080F1E',border:`1px solid ${BORDER}`,borderRadius:10,color:'#E8F4F8',fontSize:14,padding:14,resize:'vertical',outline:'none',fontFamily:F,lineHeight:1.7}}
              onFocus={e=>e.target.style.borderColor='#00E5A050'} onBlur={e=>e.target.style.borderColor=BORDER}/>
            <button onClick={()=>process(ins,'create')} disabled={!ins.trim()} className="rm-btn"
              style={{width:'100%',marginTop:14,padding:14,borderRadius:12,fontSize:15,fontWeight:800,cursor:ins.trim()?'pointer':'not-allowed',border:'none',fontFamily:F,background:ins.trim()?`linear-gradient(135deg,${G},${B})`:BORDER,color:ins.trim()?'#050A14':MUTED,transition:'all .3s',animation:ins.trim()?'glow 2s ease-in-out infinite':'none'}}>
              ✨ Excel Banao
            </button>
          </div>
          <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:12,fontFamily:M}}>🎯 YA TEMPLATE CHOOSE KARO</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
            {TEMPLATES.map((t,i)=>(
              <div key={i} className="rm-card rm-btn" onClick={()=>process(t.p,'create')}
                style={{padding:'12px 14px',borderRadius:12,background:CARD,border:`1px solid ${BORDER}`,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:`${t.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{t.icon}</div>
                <div style={{fontSize:12,fontWeight:700}}>{t.label}</div>
              </div>
            ))}
          </div>
          {err&&<div style={{marginTop:16,padding:'12px 16px',borderRadius:10,background:'#1F0A0A',border:'1px solid #7F1D1D',color:'#FCA5A5',fontSize:13}}>{err}</div>}
        </div>}

        {mode==='upload'&&<div style={{maxWidth:800,margin:'0 auto',padding:'24px 16px 80px',animation:'fadeUp .5s ease'}}>
          <div style={{padding:'14px 18px',borderRadius:12,marginBottom:20,background:`${G}10`,border:`1px solid ${G}30`,display:'flex',alignItems:'center',gap:12}}>
            <div style={{fontSize:22}}>📄</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{file?.name}</div><div style={{fontSize:11,color:MUTED,fontFamily:M}}>{(file?.size/1024).toFixed(1)} KB • {fd?.type?.toUpperCase()}</div></div>
            <button onClick={reset} style={{background:'transparent',border:'none',color:MUTED,cursor:'pointer',fontSize:18}}>✕</button>
          </div>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:18,marginBottom:20}}>
            <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:14,fontFamily:M}}>⚡ QUICK ACTIONS</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
              {QACTIONS.map((c,i)=>(
                <button key={i} className="rm-btn" onClick={()=>setCat(i)}
                  style={{padding:'6px 12px',borderRadius:8,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F,transition:'all .2s',background:cat===i?`${c.color}20`:'transparent',border:`1px solid ${cat===i?c.color+'50':BORDER}`,color:cat===i?c.color:MUTED}}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {QACTIONS[cat].actions.map((a,i)=>(
                <button key={i} className="rm-chip rm-btn" onClick={()=>setIns(a)}
                  style={{padding:'7px 13px',borderRadius:20,fontSize:11,cursor:'pointer',fontFamily:F,transition:'all .2s',background:ins===a?`${QACTIONS[cat].color}20`:`${BORDER}60`,border:`1px solid ${ins===a?QACTIONS[cat].color+'50':BORDER}`,color:ins===a?QACTIONS[cat].color:MUTED}}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:18,marginBottom:20}}>
            <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:12,fontFamily:M}}>💬 YA APNI INSTRUCTION LIKHO (HINDI / ENGLISH)</div>
            <textarea value={ins} onChange={e=>setIns(e.target.value)} placeholder="Jaise: 'Name A-Z sort karo' ya 'Amount > 5000 filter karo' ya 'GST 18% add karo'..."
              style={{width:'100%',minHeight:90,background:'#080F1E',border:`1px solid ${BORDER}`,borderRadius:10,color:'#E8F4F8',fontSize:14,padding:'12px 14px',resize:'vertical',outline:'none',fontFamily:F,lineHeight:1.6}}
              onFocus={e=>e.target.style.borderColor='#00E5A050'} onBlur={e=>e.target.style.borderColor=BORDER}/>
          </div>
          <button onClick={()=>process(ins,'upload')} disabled={!ins.trim()} className="rm-btn"
            style={{width:'100%',padding:15,borderRadius:14,fontSize:15,fontWeight:800,cursor:ins.trim()?'pointer':'not-allowed',border:'none',fontFamily:F,background:ins.trim()?`linear-gradient(135deg,${G},${B})`:BORDER,color:ins.trim()?'#050A14':MUTED,transition:'all .3s',animation:ins.trim()?'glow 2s ease-in-out infinite':'none'}}>
            🚀 Process Karo & Excel Banao
          </button>
          {err&&<div style={{marginTop:16,padding:'12px 16px',borderRadius:10,background:'#1F0A0A',border:'1px solid #7F1D1D',color:'#FCA5A5',fontSize:13}}>{err}</div>}
          {hist.length>0&&<div style={{marginTop:24}}>
            <div style={{fontSize:12,color:MUTED,letterSpacing:2,marginBottom:10,fontFamily:M}}>🕑 RECENT</div>
            {hist.map((h,i)=>(
              <div key={i} className="rm-hover" onClick={()=>setIns(h.ins)}
                style={{padding:'10px 14px',borderRadius:10,marginBottom:8,background:`${CARD}80`,border:`1px solid ${BORDER}`,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all .15s'}}>
                <div><div style={{fontSize:12,fontWeight:600}}>{h.ins}</div><div style={{fontSize:11,color:MUTED,marginTop:2}}>{h.sum}</div></div>
                <div style={{fontSize:10,color:MUTED,fontFamily:M,flexShrink:0,marginLeft:12}}>{h.rows}r•{h.time}</div>
              </div>
            ))}
          </div>}
        </div>}

        {mode==='proc'&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'65vh',animation:'fadeIn .5s ease'}}>
          <div style={{width:90,height:90,borderRadius:'50%',background:`${G}15`,border:`2px solid ${G}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,marginBottom:28,animation:'spin 2s linear infinite'}}>⚙️</div>
          <div style={{fontSize:18,fontWeight:700,marginBottom:8,animation:'pulse 1.5s ease-in-out infinite'}}>{PROC[pm]}</div>
          <div style={{fontSize:13,color:MUTED,marginBottom:24}}>Thoda wait karo...</div>
          <div style={{display:'flex',gap:8}}>
            {PROC.map((_,i)=>(
              <div key={i} style={{width:8,height:8,borderRadius:'50%',background:i===pm?G:BORDER,transition:'all .3s',transform:i===pm?'scale(1.5)':'scale(1)'}}/>
            ))}
          </div>
        </div>}

        {mode==='result'&&result&&<div style={{maxWidth:920,margin:'0 auto',padding:'24px 16px 80px',animation:'fadeUp .5s ease'}}>
          <div style={{padding:'16px 20px',borderRadius:14,marginBottom:20,background:`${G}10`,border:`1px solid ${G}35`,display:'flex',gap:12,alignItems:'flex-start'}}>
            <div style={{fontSize:24,flexShrink:0}}>✅</div>
            <div><div style={{fontSize:14,fontWeight:800,color:G,marginBottom:4}}>Kaam Ho Gaya!</div><div style={{fontSize:13,color:MUTED,lineHeight:1.5}}>{result.summary}</div></div>
          </div>
          {result.sheets?.length>1&&<div style={{display:'flex',gap:8,marginBottom:16,overflowX:'auto'}}>
            {result.sheets.map((s,i)=>(
              <button key={i} onClick={()=>setTab(i)} className="rm-btn"
                style={{padding:'8px 16px',borderRadius:10,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,background:tab===i?`${G}18`:CARD,border:`1px solid ${tab===i?G+'40':BORDER}`,color:tab===i?G:MUTED,flexShrink:0,transition:'all .2s'}}>
                📊 {s.name}
              </button>
            ))}
          </div>}
          {result.sheets?.[tab]&&<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,marginBottom:20,overflow:'hidden'}}>
            <div style={{padding:'12px 18px',borderBottom:`1px solid ${BORDER}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:14,fontWeight:700}}>{result.sheets[tab].name}</span>
              <span style={{fontSize:11,color:MUTED,fontFamily:M,background:BORDER,padding:'3px 8px',borderRadius:6}}>{(result.sheets[tab].data.length||1)-1}r × {result.sheets[tab].data[0]?.length||0}c</span>
            </div>
            <div style={{overflowX:'auto',maxHeight:420,overflowY:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead><tr>
                  <th style={{padding:'9px 12px',background:`${G}10`,color:MUTED,fontWeight:700,borderBottom:`1px solid ${BORDER}`,textAlign:'center',fontFamily:M,width:36,position:'sticky',top:0}}>#</th>
                  {result.sheets[tab].data[0]?.map((h,i)=>(
                    <th key={i} style={{padding:'9px 14px',background:`${G}10`,color:G,fontWeight:700,borderBottom:`1px solid ${G}20`,textAlign:'left',whiteSpace:'nowrap',fontFamily:M,position:'sticky',top:0}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {result.sheets[tab].data.slice(1).map((row,ri)=>(
                    <tr key={ri} className="rm-hover" style={{transition:'background .15s'}}>
                      <td style={{padding:'7px 12px',borderBottom:`1px solid ${BORDER}`,color:MUTED,textAlign:'center',fontFamily:M,fontSize:11}}>{ri+1}</td>
                      {row.map((cell,ci)=>(
                        <td key={ci} style={{padding:'8px 14px',borderBottom:`1px solid ${BORDER}`,color:'#C8D8E8',whiteSpace:'nowrap',fontFamily:M}}>{String(cell??'')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:12,marginBottom:12}}>
            <button className="rm-btn" onClick={()=>downloadWb(result.wb,(file?.name?.split('.')[0]||'rowmatic')+'_output')}
              style={{padding:13,borderRadius:12,fontSize:14,fontWeight:800,cursor:'pointer',border:'none',fontFamily:F,background:`linear-gradient(135deg,${G},${B})`,color:'#050A14',display:'flex',alignItems:'center',justifyContent:'center',gap:8,animation:'glow 2s ease-in-out infinite',transition:'all .2s'}}>
              ⬇️ Excel Download
            </button>
            <button className="rm-btn" onClick={()=>downloadWb(result.wb,(file?.name?.split('.')[0]||'rowmatic')+'_output','csv')}
              style={{padding:13,borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer',background:'transparent',border:`1px solid ${BORDER}`,color:'#E8F4F8',fontFamily:F,transition:'all .2s'}}>📄 CSV</button>
            <button className="rm-btn" onClick={()=>{setIns('');setMode(file?'upload':'create')}}
              style={{padding:13,borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer',background:'transparent',border:`1px solid ${BORDER}`,color:MUTED,fontFamily:F,transition:'all .2s'}}>🔄 Aur Karo</button>
          </div>
          <button className="rm-btn" onClick={reset}
            style={{width:'100%',padding:12,borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer',background:'transparent',border:`1px solid ${BORDER}`,color:MUTED,fontFamily:F,transition:'all .2s'}}>
            + New File / New Project
          </button>
        </div>}
      </div>
      <div style={{position:'relative',zIndex:5,textAlign:'center',padding:18,borderTop:`1px solid ${BORDER}`,background:'rgba(5,10,20,.85)'}}>
        <div style={{fontSize:11,color:MUTED,fontFamily:M}}>⚡ <span style={{color:G,fontWeight:700}}>ROWMATIC</span> • AI Excel Automation • Made with ❤️ in India</div>
      </div>
    </div>
  )
}
